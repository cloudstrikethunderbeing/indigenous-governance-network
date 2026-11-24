import { Check, Clock, Copy, ShieldCheck, UserPlus } from "lucide-react";
import { useState } from "react";

import { Principal } from "@icp-sdk/core/principal";

import {
  type FoundingAppointment,
  FoundingAppointmentStatus,
  type FoundingSeatSummary,
  type NationId,
} from "@/backend";
import {
  useConfirmFoundingSeat,
  useFoundingInvitations,
  useFoundingStatus,
  useLaunchStatus,
  useResumeLaunch,
} from "@/hooks/useGovernanceEnforcement";
import { useAppointFoundingAuthority } from "@/hooks/useSovereign";

/** The number of distinct founding authorities a Nation needs to activate. */
const REQUIRED_AUTHORITIES = 3;

/** A plain-language label for an appointment's state. */
function appointmentStateLabel(status: FoundingAppointmentStatus): string {
  switch (status) {
    case FoundingAppointmentStatus.accepted:
      return "Accepted";
    case FoundingAppointmentStatus.pending:
      return "Waiting to accept";
    case FoundingAppointmentStatus.declined:
      return "Declined";
    case FoundingAppointmentStatus.expired:
      return "Expired";
    case FoundingAppointmentStatus.replaced:
      return "Replaced";
    default:
      return "Waiting to accept";
  }
}

/** Whether an appointment still counts toward the founding requirement. */
function isLive(status: FoundingAppointmentStatus): boolean {
  return (
    status === FoundingAppointmentStatus.accepted ||
    status === FoundingAppointmentStatus.pending
  );
}

/** The absolute invitation link for an appointment's single-use token. */
function invitationLink(nation: NationId, token: string): string {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return `${origin}/os/founding?nation=${nation.toString()}&token=${encodeURIComponent(token)}`;
}

/** One founding seat: its number, holder, state and what is still required. */
function SeatCard({
  seatNumber,
  appointment,
  seat,
  nation,
  index,
  onConfirm,
  confirming,
}: {
  seatNumber: number;
  appointment: FoundingAppointment | null;
  seat: FoundingSeatSummary | null;
  nation: NationId;
  index: number;
  onConfirm: (appointmentId: bigint) => void;
  confirming: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const accepted = appointment?.status === FoundingAppointmentStatus.accepted;
  const pending = appointment?.status === FoundingAppointmentStatus.pending;
  const heldByCaller = seat?.heldByCaller ?? false;
  const link = appointment
    ? invitationLink(nation, appointment.invitationToken)
    : "";

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(false);
    }
  }

  const requirement = accepted
    ? heldByCaller
      ? "This is your seat. Nothing more is needed from you."
      : "Nothing — this seat is confirmed."
    : pending
      ? heldByCaller
        ? "This is your seat. Confirm it to count toward activation."
        : "Waiting for this person to accept with Internet Identity."
      : "Appoint someone to this seat.";

  return (
    <li
      data-ocid={`os.launcher.council.seat.${index}`}
      className={`min-w-0 rounded-lg border p-3 ${
        heldByCaller
          ? "border-primary/50 bg-primary/5"
          : "border-border bg-card"
      }`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span
          aria-hidden="true"
          className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold ${
            accepted
              ? "bg-success text-success-foreground"
              : heldByCaller
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
          }`}
        >
          {accepted ? <Check className="size-4" /> : seatNumber}
        </span>
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <p className="min-w-0 truncate text-sm font-medium text-foreground">
              {appointment?.appointmentLabel ?? `Founding seat #${seatNumber}`}
            </p>
            {heldByCaller ? (
              <span
                data-ocid={`os.launcher.council.seat_you.${index}`}
                className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground"
              >
                You
              </span>
            ) : null}
          </div>
          <p
            data-ocid={`os.launcher.council.seat_state.${index}`}
            className={`text-xs font-medium ${
              accepted
                ? "text-success"
                : heldByCaller
                  ? "text-primary"
                  : "text-muted-foreground"
            }`}
          >
            {appointment
              ? appointmentStateLabel(appointment.status)
              : "Not appointed"}
          </p>
          <p className="break-all font-mono text-[11px] text-muted-foreground">
            {appointment
              ? appointment.authority.toString()
              : "No principal recorded"}
          </p>
        </div>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        {requirement}
      </p>

      {pending && heldByCaller && seat ? (
        <button
          type="button"
          data-ocid={`os.launcher.council.confirm_button.${index}`}
          disabled={confirming}
          onClick={() => onConfirm(seat.appointmentId)}
          className="mt-2 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
        >
          <Check className="size-4" aria-hidden="true" />
          {confirming ? "Confirming…" : "Confirm my seat"}
        </button>
      ) : null}

      {pending && !heldByCaller ? (
        <div className="mt-2 flex min-w-0 items-center gap-2">
          <input
            readOnly
            value={link}
            aria-label={`Invitation link for ${appointment.appointmentLabel}`}
            data-ocid={`os.launcher.council.link_input.${index}`}
            onFocus={(event) => event.currentTarget.select()}
            className="min-h-[44px] min-w-0 flex-1 rounded-lg border border-input bg-muted/40 px-3 py-2 font-mono text-xs text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
          <button
            type="button"
            data-ocid={`os.launcher.council.copy_button.${index}`}
            onClick={() => {
              void copyLink();
            }}
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 rounded-full border border-border bg-card px-4 text-xs font-semibold text-foreground transition-smooth hover:border-primary/50 hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {copied ? (
              <Check className="size-3.5" aria-hidden="true" />
            ) : (
              <Copy className="size-3.5" aria-hidden="true" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      ) : null}
    </li>
  );
}

/**
 * The founding council dashboard shown after a Nation is created. It marks
 * which founding seat the signed-in account already holds, shows the remaining
 * seats as awaiting other people, and lets the founding authority appoint the
 * remaining seats by principal ID. A principal that already holds a seat is
 * reported as already seated instead of being appointed twice. Activation is
 * automatic once three distinct authorities accept — there is no manual bypass.
 */
export default function FoundingCouncilPanel({
  nation,
  nationName,
}: {
  nation: NationId;
  nationName: string;
}) {
  const status = useFoundingStatus(nation);
  const appointments = useFoundingInvitations(nation);
  const launch = useLaunchStatus(nation);
  const appoint = useAppointFoundingAuthority();
  const confirmSeat = useConfirmFoundingSeat();
  const resume = useResumeLaunch();

  const [principalText, setPrincipalText] = useState("");
  const [labelText, setLabelText] = useState("");
  const [appointError, setAppointError] = useState<string | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);

  const acceptedCount = Number(status.data?.accepted ?? 0n);
  const requiredCount = Number(status.data?.required ?? REQUIRED_AUTHORITIES);
  const activated = status.data?.activated ?? false;

  const liveAppointments = (appointments.data ?? []).filter((appointment) =>
    isLive(appointment.status),
  );
  const canAppointMore = liveAppointments.length < requiredCount;

  const callerSeats = launch.data?.callerSeats ?? [];
  const awaitingOtherSeats = launch.data?.awaitingOtherSeats ?? [];
  const seatByAppointment = new Map<string, FoundingSeatSummary>();
  for (const seat of [...callerSeats, ...awaitingOtherSeats]) {
    seatByAppointment.set(seat.appointmentId.toString(), seat);
  }
  const heldSeatCount = callerSeats.length;
  const canResume = launch.data?.canResume ?? false;
  const blockedReason = launch.data?.blockedReason ?? "";

  const seats = Array.from({ length: requiredCount }, (_, index) => {
    const appointment = liveAppointments[index] ?? null;
    return {
      seatNumber: index + 1,
      appointment,
      seat: appointment
        ? (seatByAppointment.get(appointment.id.toString()) ?? null)
        : null,
    };
  });

  function submitPrincipal() {
    setAppointError(null);
    const trimmed = principalText.trim();
    if (trimmed.length === 0) {
      setAppointError(
        "Enter the principal ID of the person you want to appoint.",
      );
      return;
    }
    let authority: Principal;
    try {
      authority = Principal.fromText(trimmed);
    } catch {
      setAppointError(
        "That does not look like a valid principal ID. Please check it and try again.",
      );
      return;
    }
    const alreadySeated = liveAppointments.some(
      (appointment) =>
        appointment.authority.toString() === authority.toString(),
    );
    if (alreadySeated) {
      setAppointError(
        "That person already holds a founding seat. They are already seated, so there is nothing to appoint.",
      );
      return;
    }
    const label =
      labelText.trim().length > 0
        ? labelText.trim()
        : `Founding authority #${liveAppointments.length + 1}`;
    appoint.mutate(
      { nation, authority, appointmentLabel: label },
      {
        onSuccess: (result) => {
          if (result.__kind__ !== "ok") {
            setAppointError(
              "That principal could not be appointed. Check the ID and try again.",
            );
            return;
          }
          setPrincipalText("");
          setLabelText("");
        },
        onError: () => {
          setAppointError(
            "The appointment could not be saved. Please check your connection and try again.",
          );
        },
      },
    );
  }

  function confirmMySeat(appointmentId: bigint) {
    confirmSeat.mutate(
      { nation, appointment: appointmentId },
      {
        onError: () => {
          setAppointError(
            "Your seat could not be confirmed. Please check your connection and try again.",
          );
        },
      },
    );
  }

  function resumeLaunch() {
    setResumeError(null);
    resume.mutate(nation, {
      onSuccess: (result) => {
        if (result.__kind__ !== "ok") {
          setResumeError(
            "Your launch could not continue yet. Please try again in a moment.",
          );
        }
      },
      onError: () => {
        setResumeError(
          "Your launch could not continue. Please check your connection and try again.",
        );
      },
    });
  }

  return (
    <section
      data-ocid="os.launcher.council_panel"
      className="shell-panel min-w-0 space-y-5 p-4 md:p-6"
    >
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-stamp text-accent">Founding council</p>
          <h3 className="font-display text-xl font-medium tracking-tight text-foreground">
            {activated
              ? `${nationName} is active`
              : `${nationName} is pending activation`}
          </h3>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            {activated
              ? "All three founding authorities have accepted and your constitution is in force."
              : "Your Nation activates automatically the moment three distinct founding authorities accept and your constitution is confirmed."}
          </p>
        </div>
        <div
          data-ocid="os.launcher.council.progress"
          className={`flex shrink-0 items-center gap-2 self-start rounded-full border px-4 py-2 ${
            activated
              ? "border-success/40 bg-success/10 text-success"
              : "border-warning/40 bg-warning/10 text-warning"
          }`}
        >
          <ShieldCheck className="size-4" aria-hidden="true" />
          <span className="font-mono text-sm font-semibold">
            {acceptedCount}/{requiredCount}
          </span>
          <span className="text-xs font-medium">
            {activated ? "Active" : "Accepted"}
          </span>
        </div>
      </div>

      {heldSeatCount > 0 ? (
        <p
          data-ocid="os.launcher.council.you_state"
          className="flex items-start gap-2 rounded-lg border border-primary/40 bg-primary/5 px-3 py-2.5 text-sm leading-relaxed text-foreground"
        >
          <Check
            className="mt-0.5 size-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          <span>
            You hold {heldSeatCount} of {requiredCount} founding seats. The
            remaining {Math.max(requiredCount - heldSeatCount, 0)} are awaiting
            other people.
          </span>
        </p>
      ) : null}

      {appointments.isLoading ? (
        <p
          data-ocid="os.launcher.council.loading_state"
          className="text-sm text-muted-foreground"
        >
          Loading founding seats…
        </p>
      ) : (
        <ul className="grid min-w-0 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {seats.map((seat, index) => (
            <SeatCard
              key={`seat-${seat.seatNumber}`}
              seatNumber={seat.seatNumber}
              appointment={seat.appointment}
              seat={seat.seat}
              nation={nation}
              index={index + 1}
              onConfirm={confirmMySeat}
              confirming={confirmSeat.isPending}
            />
          ))}
        </ul>
      )}

      {!activated && canResume ? (
        <div className="space-y-2 rounded-lg border border-warning/40 bg-warning/10 p-3">
          <p className="text-sm font-medium text-foreground">
            Your launch stopped part-way
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {blockedReason.length > 0
              ? blockedReason
              : "We saved what you already set up. Continue to finish the remaining steps."}
          </p>
          {resumeError ? (
            <p
              role="alert"
              data-ocid="os.launcher.council.resume_error_state"
              className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive"
            >
              {resumeError}
            </p>
          ) : null}
          <button
            type="button"
            data-ocid="os.launcher.council.resume_button"
            disabled={resume.isPending}
            onClick={resumeLaunch}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50 sm:w-auto"
          >
            {resume.isPending ? "Continuing…" : "Continue my launch"}
          </button>
        </div>
      ) : null}

      {!activated && canAppointMore ? (
        <div className="space-y-3 rounded-lg border border-dashed border-border bg-muted/30 p-3">
          <div className="flex items-center gap-2">
            <UserPlus className="size-4 text-accent" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground">
              Appoint another authority
            </p>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Add a founding authority by their principal ID, or share the secure
            invitation link on a waiting seat.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="min-w-0 space-y-1">
              <span className="block text-xs font-medium text-foreground">
                Principal ID
              </span>
              <input
                type="text"
                value={principalText}
                onChange={(event) => setPrincipalText(event.target.value)}
                placeholder="e.g. 2vxsx-fae"
                data-ocid="os.launcher.council.principal_input"
                className="min-h-[44px] w-full rounded-lg border border-input bg-card px-3 py-2 font-mono text-xs text-foreground transition-smooth placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              />
            </label>
            <label className="min-w-0 space-y-1">
              <span className="block text-xs font-medium text-foreground">
                Label (optional)
              </span>
              <input
                type="text"
                value={labelText}
                onChange={(event) => setLabelText(event.target.value)}
                placeholder="e.g. Elder council"
                data-ocid="os.launcher.council.label_input"
                className="min-h-[44px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground transition-smooth placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              />
            </label>
          </div>
          {appointError ? (
            <p
              role="alert"
              data-ocid="os.launcher.council.appoint_error_state"
              className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive"
            >
              {appointError}
            </p>
          ) : null}
          <button
            type="button"
            data-ocid="os.launcher.council.appoint_button"
            disabled={appoint.isPending || principalText.trim().length === 0}
            onClick={submitPrincipal}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50 sm:w-auto"
          >
            <UserPlus className="size-4" aria-hidden="true" />
            {appoint.isPending ? "Appointing…" : "Appoint authority"}
          </button>
        </div>
      ) : null}

      {!activated ? (
        <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <Clock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          Each invitation link is single-use and bound to the first principal
          that accepts it. A declined or expired appointment can be replaced by
          appointing a new authority.
        </p>
      ) : null}
    </section>
  );
}
