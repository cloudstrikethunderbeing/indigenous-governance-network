import { Check, Clock, Copy, Link2, ShieldCheck, UserPlus } from "lucide-react";
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

/** One authority row: its label, state and — while pending — its secure link. */
function AuthorityRow({
  appointment,
  seat,
  nation,
  index,
  onConfirm,
  confirming,
}: {
  appointment: FoundingAppointment;
  seat: FoundingSeatSummary | null;
  nation: NationId;
  index: number;
  onConfirm: (appointmentId: bigint) => void;
  confirming: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const accepted = appointment.status === FoundingAppointmentStatus.accepted;
  const pending = appointment.status === FoundingAppointmentStatus.pending;
  const heldByCaller = seat?.heldByCaller ?? false;
  const link = invitationLink(nation, appointment.invitationToken);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <li
      data-ocid={`os.launcher.founding.authority.${index}`}
      className={`min-w-0 rounded-lg border p-3 ${
        heldByCaller
          ? "border-primary/50 bg-primary/5"
          : "border-border bg-card"
      }`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span
          aria-hidden="true"
          className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full ${
            accepted
              ? "bg-success text-success-foreground"
              : heldByCaller
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
          }`}
        >
          {accepted ? (
            <Check className="size-4" />
          ) : (
            <Clock className="size-4" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <p className="min-w-0 truncate text-sm font-medium text-foreground">
              {appointment.appointmentLabel}
            </p>
            {heldByCaller ? (
              <span
                data-ocid={`os.launcher.founding.authority_you.${index}`}
                className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground"
              >
                You
              </span>
            ) : null}
          </div>
          <p
            data-ocid={`os.launcher.founding.authority_state.${index}`}
            className={`text-xs ${
              accepted
                ? "text-success"
                : heldByCaller
                  ? "text-primary"
                  : "text-muted-foreground"
            }`}
          >
            {appointmentStateLabel(appointment.status)}
          </p>
        </div>
      </div>

      {pending && heldByCaller && seat ? (
        <button
          type="button"
          data-ocid={`os.launcher.founding.confirm_button.${index}`}
          disabled={confirming}
          onClick={() => onConfirm(seat.appointmentId)}
          className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
        >
          <Check className="size-4" aria-hidden="true" />
          {confirming ? "Confirming…" : "Confirm my seat"}
        </button>
      ) : null}

      {pending && !heldByCaller ? (
        <div className="mt-3 space-y-2">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Share this private link. It works once, for the first person who
            signs in with Internet Identity.
          </p>
          <div className="flex min-w-0 items-center gap-2">
            <input
              readOnly
              value={link}
              aria-label={`Invitation link for ${appointment.appointmentLabel}`}
              data-ocid={`os.launcher.founding.link_input.${index}`}
              onFocus={(event) => event.currentTarget.select()}
              className="min-h-[44px] min-w-0 flex-1 rounded-lg border border-input bg-muted/40 px-3 py-2 font-mono text-xs text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
            <button
              type="button"
              data-ocid={`os.launcher.founding.copy_button.${index}`}
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
        </div>
      ) : null}
    </li>
  );
}

/**
 * The founding acceptance panel shown after a Nation launches. It reports the
 * live 0/3 → 3/3 progress, marks which seat the signed-in account already
 * holds, lists each founding authority with its label and state, and — for
 * every authority still waiting — shows the secure single-use invitation link
 * the founding authority shares. The founding authority may appoint the
 * remaining authorities by principal ID here; a principal that already holds a
 * seat is reported as already seated.
 */
export default function FoundingProgressPanel({
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

  const [principalText, setPrincipalText] = useState("");
  const [labelText, setLabelText] = useState("");
  const [appointError, setAppointError] = useState<string | null>(null);

  const accepted = status.data?.accepted ?? 0;
  const required = status.data?.required ?? REQUIRED_AUTHORITIES;
  const activated = status.data?.activated ?? false;
  const acceptedCount = Number(accepted);
  const requiredCount = Number(required);

  const liveAppointments = (appointments.data ?? []).filter((appointment) =>
    isLive(appointment.status),
  );
  const pendingAppointments = liveAppointments.filter(
    (appointment) => appointment.status === FoundingAppointmentStatus.pending,
  );
  const canAppointMore = liveAppointments.length < requiredCount;

  const callerSeats = launch.data?.callerSeats ?? [];
  const awaitingOtherSeats = launch.data?.awaitingOtherSeats ?? [];
  const seatByAppointment = new Map<string, FoundingSeatSummary>();
  for (const seat of [...callerSeats, ...awaitingOtherSeats]) {
    seatByAppointment.set(seat.appointmentId.toString(), seat);
  }
  const heldSeatCount = callerSeats.length;

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

  return (
    <section
      data-ocid="os.launcher.founding_panel"
      className="shell-panel min-w-0 space-y-5 p-4 md:p-6"
    >
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-stamp text-accent">Founding setup</p>
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
          data-ocid="os.launcher.founding.progress"
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

      <div
        aria-hidden="true"
        className="flex gap-1.5"
        data-ocid="os.launcher.founding.progress_bar"
      >
        {Array.from(
          { length: requiredCount },
          (_, index) => `slot-${index}`,
        ).map((slot, index) => (
          <span
            key={slot}
            className={`h-1.5 flex-1 rounded-full ${
              index < acceptedCount ? "bg-success" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {heldSeatCount > 0 ? (
        <p
          data-ocid="os.launcher.founding.you_state"
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
          data-ocid="os.launcher.founding.loading_state"
          className="text-sm text-muted-foreground"
        >
          Loading founding authorities…
        </p>
      ) : liveAppointments.length > 0 ? (
        <ul className="space-y-2">
          {liveAppointments.map((appointment, index) => (
            <AuthorityRow
              key={appointment.id.toString()}
              appointment={appointment}
              seat={seatByAppointment.get(appointment.id.toString()) ?? null}
              nation={nation}
              index={index + 1}
              onConfirm={confirmMySeat}
              confirming={confirmSeat.isPending}
            />
          ))}
        </ul>
      ) : (
        <p
          data-ocid="os.launcher.founding.empty_state"
          className="text-sm text-muted-foreground"
        >
          No founding authorities are recorded yet.
        </p>
      )}

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
            invitation link above.
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
                data-ocid="os.launcher.founding.principal_input"
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
                data-ocid="os.launcher.founding.label_input"
                className="min-h-[44px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground transition-smooth placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              />
            </label>
          </div>
          {appointError ? (
            <p
              role="alert"
              data-ocid="os.launcher.founding.appoint_error_state"
              className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive"
            >
              {appointError}
            </p>
          ) : null}
          <button
            type="button"
            data-ocid="os.launcher.founding.appoint_button"
            disabled={appoint.isPending || principalText.trim().length === 0}
            onClick={submitPrincipal}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50 sm:w-auto"
          >
            <UserPlus className="size-4" aria-hidden="true" />
            {appoint.isPending ? "Appointing…" : "Appoint authority"}
          </button>
        </div>
      ) : null}

      {!activated && pendingAppointments.length > 0 ? (
        <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <Link2 className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          Each link is single-use and bound to the first principal that accepts
          it. A declined or expired appointment can be replaced by appointing a
          new authority.
        </p>
      ) : null}
    </section>
  );
}
