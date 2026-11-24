import { useRecordChallengeImpression } from "@/hooks/useQueries";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const SESSION_KEY = "sovereign.visitor.welcome.seen";

/** A per-browser-session identifier for anonymous visitor analytics. */
function getSessionId(): string {
  const existing = window.sessionStorage.getItem("sovereign.visitor.session");
  if (existing) return existing;
  const generated =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `sess-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.sessionStorage.setItem("sovereign.visitor.session", generated);
  return generated;
}

/**
 * The optional once-per-session visitor welcome popup.
 *
 * It never blocks an existing workflow, never requires sign-in and can be
 * dismissed at any time. Each display is recorded as a real impression through
 * the backend impression hook; a failed recording never shows a success state.
 */
export default function VisitorWelcomePopup() {
  const [open, setOpen] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [recordError, setRecordError] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const impression = useRecordChallengeImpression();

  // Show at most once per browser session.
  useEffect(() => {
    if (window.sessionStorage.getItem(SESSION_KEY) === "1") return;
    window.sessionStorage.setItem(SESSION_KEY, "1");
    setOpen(true);
  }, []);

  // Record the impression exactly once, when the popup first opens.
  useEffect(() => {
    if (!open || recorded) return;
    setRecorded(true);
    impression.mutate(getSessionId(), {
      onSuccess: (result) => {
        if (result.__kind__ === "err") setRecordError(true);
      },
      onError: () => setRecordError(true),
    });
  }, [open, recorded, impression]);

  const dismiss = useCallback(() => setOpen(false), []);

  // Escape closes the popup; focus moves into the dialog when it opens.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKeyDown);
    dialogRef.current?.focus();
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, dismiss]);

  if (!open) return null;

  function exploreChallenge() {
    setOpen(false);
    document.getElementById("engage")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div
      data-ocid="welcome.overlay"
      className="popup-scrim fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
    >
      <button
        type="button"
        aria-label="Dismiss welcome message"
        data-ocid="welcome.backdrop_button"
        onClick={dismiss}
        className="absolute inset-0 cursor-default"
      />
      <dialog
        ref={dialogRef}
        open
        aria-labelledby="welcome-popup-heading"
        data-ocid="welcome.modal"
        className="welcome-popup relative z-10 m-0 w-full max-w-lg p-6 sm:p-8"
      >
        <button
          type="button"
          data-ocid="welcome.close_button"
          aria-label="Dismiss welcome message"
          onClick={dismiss}
          className="absolute right-3 top-3 rounded-md p-2 text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <X className="size-4" aria-hidden="true" />
        </button>

        <p className="text-stamp text-accent">
          A demonstration, not a binding vote
        </p>
        <h2
          id="welcome-popup-heading"
          className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl"
        >
          YOUR VOICE MATTERS. EXPERIENCE A DAO.
        </h2>
        <div className="rule-accent mt-4" />
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          What would it look like for a community to participate in the
          decisions that shape its future — using technology it owns and
          controls?
        </p>

        {recordError ? (
          <p
            data-ocid="welcome.error_state"
            role="alert"
            className="mt-4 text-xs leading-relaxed text-destructive"
          >
            We could not record this visit. You can still explore the challenge
            below.
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            data-ocid="welcome.explore_button"
            onClick={exploreChallenge}
            className="inline-flex flex-1 items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-smooth hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Explore a DAO Challenge
          </button>
          <button
            type="button"
            data-ocid="welcome.later_button"
            onClick={dismiss}
            className="inline-flex flex-1 items-center justify-center rounded-md border border-border px-6 py-3 text-sm font-medium text-foreground transition-smooth hover:bg-accent/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Maybe Later
          </button>
        </div>
      </dialog>
    </div>
  );
}
