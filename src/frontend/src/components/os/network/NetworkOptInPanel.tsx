import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Globe, Lock } from "lucide-react";

import { type CollaborationState, SovereignError } from "@/backend";
import { SignInButton } from "@/components/InternetIdentity";
import { useSetNetworkOptIn } from "@/hooks/useSovereign";

/** Honest, plain-language message for each refusal the backend can return. */
function refusalMessage(error: SovereignError): string {
  switch (error) {
    case SovereignError.notAuthorized:
      return "You are not authorized to change this Nation's collaboration setting. Only the Nation's owner or a platform administrator can.";
    case SovereignError.unknownNation:
      return "This Nation could not be found, so the setting was not changed.";
    default:
      return "The change could not be saved. Please try again.";
  }
}

/**
 * The opt-in control that lets a Nation mark itself open to collaboration or
 * keep its workspace private. Off by default, and plainly optional. Changing
 * it requires a signed-in Nation member; the backend enforces the same rule
 * and any refusal is surfaced honestly.
 */
export default function NetworkOptInPanel({
  nationName,
  state,
}: {
  nationName: string;
  state: CollaborationState;
}) {
  const { identity } = useInternetIdentity();
  const principal =
    identity && !identity.getPrincipal().isAnonymous()
      ? identity.getPrincipal()
      : null;
  const setOptIn = useSetNetworkOptIn();

  const optedIn = state.optedIn;

  const errorMessage = setOptIn.isError
    ? setOptIn.error instanceof Error
      ? setOptIn.error.message
      : "The change could not be saved. Please try again."
    : setOptIn.data && setOptIn.data.__kind__ === "err"
      ? refusalMessage(setOptIn.data.err)
      : null;

  function toggle(next: boolean) {
    setOptIn.mutate({ nation: state.nation, optIn: next });
  }

  return (
    <section
      data-ocid="os.network.opt_in_panel"
      aria-label="Collaboration opt-in"
      className="shell-panel flex flex-col gap-4 p-4"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground"
        >
          {optedIn ? <Globe className="size-4" /> : <Lock className="size-4" />}
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="font-display text-lg font-medium tracking-tight text-foreground">
            {nationName} in the network
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Joining is optional. Your Nation is private by default and only
            appears to other Nations when an authorized administrator confirms
            participation.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span
          data-ocid="os.network.opt_in_status"
          className={`status-chip ${optedIn ? "status-won" : "status-closed"}`}
        >
          {state.displayLabel}
        </span>
        <span className="text-xs text-muted-foreground">
          {optedIn
            ? "Other Nations can see your short profile and interests."
            : "Your Nation does not appear in the network list."}
        </span>
      </div>

      {principal === null ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-muted-foreground">
            Sign in as a Nation member to change this setting.
          </p>
          <SignInButton className="min-h-11 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-smooth hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60" />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            data-ocid="os.network.opt_in_toggle"
            aria-pressed={optedIn}
            disabled={setOptIn.isPending}
            onClick={() => toggle(!optedIn)}
            className="min-h-11 w-full rounded-full border border-input bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-smooth hover:border-primary/50 hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60 sm:w-auto"
          >
            {setOptIn.isPending
              ? "Saving…"
              : optedIn
                ? "Leave the network"
                : "Join the network"}
          </button>
          {errorMessage && (
            <p
              role="alert"
              data-ocid="os.network.opt_in_error_state"
              className="text-xs text-destructive"
            >
              {errorMessage}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
