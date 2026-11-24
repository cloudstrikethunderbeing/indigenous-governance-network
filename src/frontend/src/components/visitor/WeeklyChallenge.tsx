import {
  useStartChallenge,
  useSubmitChallengeResponse,
  useWeeklyChallenge,
} from "@/hooks/useQueries";
import { CalendarClock, CheckCircle2, Loader2 } from "lucide-react";
import { type FormEvent, useRef, useState } from "react";

const SESSION_KEY = "sovereign.visitor.session";

/** A per-session identifier for anonymous participation. Local UI state only. */
function getVisitorSessionId(): string {
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const generated =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `s-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.sessionStorage.setItem(SESSION_KEY, generated);
    return generated;
  } catch {
    return `s-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

/**
 * The DAO Challenge of the Week.
 *
 * Reads the current administrator-configured challenge through the existing
 * hook and lets a visitor answer its question with one of its options. The
 * challenge is shown only when the backend returns a configured challenge; an
 * honest empty state is shown otherwise. No tally or participation figure is
 * ever fabricated.
 */
export default function WeeklyChallenge() {
  const { data: challenge, isLoading } = useWeeklyChallenge();

  const [selectedOptionId, setSelectedOptionId] = useState<bigint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const startRecorded = useRef(false);

  const startChallenge = useStartChallenge();
  const submitResponse = useSubmitChallengeResponse();

  function handleSelect(optionId: bigint) {
    setSelectedOptionId(optionId);
    setError(null);
    if (!startRecorded.current) {
      startRecorded.current = true;
      startChallenge.mutate(getVisitorSessionId());
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (selectedOptionId === null) {
      setError("Please choose one option before submitting.");
      return;
    }

    submitResponse.mutate(
      {
        sessionId: getVisitorSessionId(),
        optionId: selectedOptionId,
        reasoning: null,
      },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "ok") {
            setSubmitted(true);
            return;
          }
          if (result.err === "unknownOption") {
            setError(
              "That option is no longer available. Please choose again.",
            );
          } else if (result.err === "missingSessionId") {
            setError("Your session expired. Please reload and try again.");
          } else {
            setError("We could not record your answer. Please try again.");
          }
        },
        onError: () => {
          setError("Something went wrong. Please try again.");
        },
      },
    );
  }

  return (
    <section
      data-ocid="weekly.panel"
      aria-labelledby="weekly-challenge-heading"
      className="shell-panel flex flex-col p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="badge-stage-demo">Demonstration</span>
        <span className="text-stamp text-muted-foreground">
          DAO Challenge of the Week
        </span>
      </div>

      {isLoading ? (
        <div
          data-ocid="weekly.loading_state"
          className="mt-4 space-y-3"
          aria-hidden="true"
        >
          <div className="h-6 w-3/4 rounded bg-muted" />
          <div className="h-12 w-full rounded bg-muted" />
          <div className="h-12 w-full rounded bg-muted" />
        </div>
      ) : challenge ? (
        <>
          <h3
            id="weekly-challenge-heading"
            className="mt-3 font-display text-xl font-medium tracking-tight text-foreground sm:text-2xl"
          >
            {challenge.question}
          </h3>
          <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarClock
              className="size-4 shrink-0 text-accent"
              aria-hidden="true"
            />
            <span className="text-stamp">{challenge.weekKey}</span>
          </p>

          {submitted ? (
            <output
              data-ocid="weekly.success_state"
              className="mt-6 flex items-start gap-3 rounded-lg border border-primary/40 bg-primary/5 px-5 py-4"
            >
              <CheckCircle2
                className="mt-0.5 size-5 shrink-0 text-primary"
                aria-hidden="true"
              />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Thank you — your answer was recorded.
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  This is a demonstration, not an official or binding Nation
                  vote.
                </p>
              </div>
            </output>
          ) : (
            <form
              data-ocid="weekly.form"
              onSubmit={handleSubmit}
              noValidate
              className="mt-6 space-y-4"
            >
              <fieldset className="space-y-2">
                <legend className="text-stamp mb-2 text-muted-foreground">
                  Choose one answer
                </legend>
                <div className="grid gap-2">
                  {challenge.options.map((option) => {
                    const isSelected = selectedOptionId === option.optionId;
                    return (
                      <button
                        key={option.optionId.toString()}
                        type="button"
                        data-ocid={`weekly.option.${option.optionId.toString()}`}
                        aria-pressed={isSelected}
                        onClick={() => handleSelect(option.optionId)}
                        className={`challenge-option ${
                          isSelected ? "challenge-option-selected" : ""
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                            isSelected
                              ? "border-current"
                              : "border-muted-foreground/50"
                          }`}
                        >
                          {isSelected ? (
                            <span className="size-2.5 rounded-full bg-current" />
                          ) : null}
                        </span>
                        <span className="min-w-0 text-sm font-medium">
                          {option.labelText}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {error ? (
                <p
                  data-ocid="weekly.error_state"
                  role="alert"
                  className="text-sm font-medium text-destructive"
                >
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                data-ocid="weekly.submit_button"
                disabled={submitResponse.isPending || selectedOptionId === null}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-smooth hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {submitResponse.isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : null}
                Submit answer
              </button>
            </form>
          )}
        </>
      ) : (
        <div
          data-ocid="weekly.empty_state"
          className="mt-4 rounded-lg border border-dashed border-border bg-secondary/40 px-5 py-6 text-center"
        >
          <CalendarClock
            className="mx-auto size-6 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="mt-3 text-sm font-medium text-foreground">
            No challenge is running this week.
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            A new DAO Challenge of the Week will appear here once it is
            configured. Check back soon.
          </p>
        </div>
      )}
    </section>
  );
}
