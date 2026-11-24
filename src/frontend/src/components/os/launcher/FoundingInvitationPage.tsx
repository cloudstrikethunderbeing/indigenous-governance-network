import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useSearch } from "@tanstack/react-router";
import {
  CheckCircle2,
  Loader2,
  ShieldCheck,
  UserCheck,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

import {
  FoundingAppointmentStatus,
  GovernanceError,
  type NationId,
} from "@/backend";
import { SignInButton } from "@/components/InternetIdentity";
import {
  useAcceptFoundingInvitation,
  useFoundingInvitations,
  useFoundingStatus,
  useLaunchStatus,
} from "@/hooks/useGovernanceEnforcement";

/** Parse the Nation id from the invitation link, or null when it is invalid. */
function parseNationId(raw: string | undefined): NationId | null {
  if (!raw) return null;
  try {
    const value = BigInt(raw);
    return value >= 0n ? value : null;
  } catch {
    return null;
  }
}

/** A plain-language message for each refusal the backend can return. */
function refusalMessage(error: GovernanceError): string {
  switch (error) {
    case GovernanceError.notAuthorized:
      return "This invitation is not for the account you are signed in with. Sign in with the account it was sent to.";
    case GovernanceError.unknownNation:
      return "This invitation's organization could not be found.";
    case GovernanceError.alreadyActivated:
      return "This invitation has already been used. Each link works only once.";
    case GovernanceError.setupExpired:
      return "This invitation has expired. Ask the founding authority to send a new one.";
    case GovernanceError.notInFoundingSetup:
      return "This organization is no longer accepting founding authorities.";
    default:
      return "This invitation could not be accepted. It may have been used already or expired.";
  }
}

/**
 * The page a founding authority lands on after opening their secure invitation
 * link. It reads the Nation and single-use token from the URL, asks the visitor
 * to sign in with Internet Identity, then accepts the invitation as the signed-in
 * principal. The backend binds the link to the first principal that accepts it,
 * so a link opened by a different account is refused and cannot be reused. A
 * visitor who already holds a founding seat is told so instead of being offered
 * the accept button again.
 */
export default function FoundingInvitationPage() {
  const search = useSearch({ strict: false }) as {
    nation?: string;
    token?: string;
  };
  const nation = useMemo(() => parseNationId(search.nation), [search.nation]);
  const token = typeof search.token === "string" ? search.token : "";

  const { identity, isInitializing, isLoggingIn } = useInternetIdentity();
  const signedIn = !!identity && !identity.getPrincipal().isAnonymous();
  const accept = useAcceptFoundingInvitation();
  const [error, setError] = useState<string | null>(null);

  const accepted = accept.data?.__kind__ === "ok";

  // The seat this link belongs to, the live acceptance count, and whether the
  // signed-in account already holds a founding seat in this Nation.
  const appointments = useFoundingInvitations(nation ?? 0n);
  const status = useFoundingStatus(nation ?? 0n);
  const launch = useLaunchStatus(nation ?? 0n);
  const seat = useMemo(() => {
    if (!nation || token.length === 0) return null;
    return (
      (appointments.data ?? []).find(
        (appointment) => appointment.invitationToken === token,
      ) ?? null
    );
  }, [appointments.data, nation, token]);

  const acceptedCount = Number(status.data?.accepted ?? 0n);
  const requiredCount = Number(status.data?.required ?? 3n);
  const seatAlreadyAccepted =
    seat?.status === FoundingAppointmentStatus.accepted;

  const callerSeats = launch.data?.callerSeats ?? [];
  const alreadySeated = signedIn && callerSeats.length > 0;
  const heldSeatLabel = callerSeats[0]?.appointmentLabel ?? "a founding seat";

  function handleAccept() {
    if (!nation || token.length === 0) return;
    setError(null);
    accept.mutate(
      { nation, token },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "err") {
            setError(refusalMessage(result.err));
          }
        },
        onError: () =>
          setError(
            "The invitation could not be accepted. Please check your connection and try again.",
          ),
      },
    );
  }

  return (
    <div className="mx-auto flex min-h-[70dvh] w-full max-w-lg flex-col justify-center px-4 py-10">
      <section
        data-ocid="os.founding_invitation.panel"
        aria-label="Founding authority invitation"
        className="shell-panel space-y-5 p-5 md:p-6"
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            <ShieldCheck className="size-5" />
          </span>
          <div className="min-w-0 space-y-1">
            <p className="text-stamp text-accent">Founding authority</p>
            <h1 className="font-display text-xl font-medium tracking-tight text-foreground">
              Accept your invitation
            </h1>
          </div>
        </div>

        {!nation || token.length === 0 ? (
          <p
            data-ocid="os.founding_invitation.invalid_state"
            role="alert"
            className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            This invitation link is incomplete. Ask the founding authority to
            send it again.
          </p>
        ) : accepted || seatAlreadyAccepted ? (
          <div
            data-ocid="os.founding_invitation.success_state"
            className="flex items-start gap-2 rounded-lg border border-success/40 bg-success/10 px-3 py-3 text-sm text-success"
          >
            <CheckCircle2
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <span>
              You are now a founding authority. Your acceptance has been
              recorded and counts toward the organization&apos;s activation.
            </span>
          </div>
        ) : alreadySeated ? (
          <div
            data-ocid="os.founding_invitation.already_seated_state"
            className="flex items-start gap-2 rounded-lg border border-primary/40 bg-primary/5 px-3 py-3 text-sm text-foreground"
          >
            <UserCheck
              className="mt-0.5 size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <span>
              You already hold {heldSeatLabel} in this organization, so there is
              nothing more to accept. Your seat is recorded and counts toward
              activation.
            </span>
          </div>
        ) : (
          <>
            {seat ? (
              <div
                data-ocid="os.founding_invitation.seat"
                className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2.5"
              >
                <UserCheck
                  className="size-4 shrink-0 text-accent"
                  aria-hidden="true"
                />
                <span className="min-w-0 truncate text-sm font-medium text-foreground">
                  {seat.appointmentLabel}
                </span>
              </div>
            ) : null}

            <p className="text-sm leading-relaxed text-muted-foreground">
              Sign in with Internet Identity to accept. This link works once and
              is bound to the first account that accepts it.
            </p>

            <div
              data-ocid="os.founding_invitation.progress"
              className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2"
            >
              <span className="text-xs font-medium text-muted-foreground">
                Founding authorities accepted
              </span>
              <span className="text-tabular font-mono text-sm font-semibold text-foreground">
                {acceptedCount}/{requiredCount}
              </span>
            </div>

            {isInitializing || isLoggingIn ? (
              <p
                data-ocid="os.founding_invitation.loading_state"
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Loader2
                  className="size-4 motion-safe:animate-spin"
                  aria-hidden="true"
                />
                Loading your session…
              </p>
            ) : signedIn ? (
              <button
                type="button"
                data-ocid="os.founding_invitation.accept_button"
                disabled={accept.isPending}
                onClick={handleAccept}
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
              >
                {accept.isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                )}
                {accept.isPending ? "Accepting…" : "Accept invitation"}
              </button>
            ) : (
              <SignInButton className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50" />
            )}

            {error ? (
              <p
                data-ocid="os.founding_invitation.error_state"
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              >
                <XCircle
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                <span>{error}</span>
              </p>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
