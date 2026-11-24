import {
  useStartChallenge,
  useSubmitChallengeResponse,
} from "@/hooks/useQueries";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { type FormEvent, useId, useRef, useState } from "react";

/**
 * The five fixed allocation options for the $100,000 community development
 * challenge. The optionId values match the backend's declared option ids.
 */
const ALLOCATION_OPTIONS: { optionId: bigint; label: string; blurb: string }[] =
  [
    {
      optionId: 1n,
      label: "Education and youth",
      blurb: "Schools, training and opportunities for the next generation.",
    },
    {
      optionId: 2n,
      label: "Housing and infrastructure",
      blurb: "Homes, water, roads and community facilities.",
    },
    {
      optionId: 3n,
      label: "Language and cultural preservation",
      blurb: "Language programs, archives and cultural practice.",
    },
    {
      optionId: 4n,
      label: "Economic development",
      blurb: "Local businesses, jobs and community-owned enterprise.",
    },
    {
      optionId: 5n,
      label: "Environmental protection",
      blurb: "Land, water and stewardship of the natural world.",
    },
  ];

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
 * The interactive $100,000 Community Governance Challenge.
 *
 * A visitor selects one of five allocation options, may add an explanation and
 * submits. The challenge start is recorded when the visitor first engages and
 * the completion when the response is submitted. A confirmation is shown only
 * after a genuine successful submission; no tally or participation figure is
 * ever fabricated.
 */
export default function CommunityChallenge() {
  const reasoningId = useId();

  const [selectedOptionId, setSelectedOptionId] = useState<bigint | null>(null);
  const [reasoning, setReasoning] = useState("");
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

    const trimmedReasoning = reasoning.trim();
    submitResponse.mutate(
      {
        sessionId: getVisitorSessionId(),
        optionId: selectedOptionId,
        reasoning: trimmedReasoning === "" ? null : trimmedReasoning,
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
            setError("We could not record your response. Please try again.");
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
      data-ocid="challenge.panel"
      aria-labelledby="community-challenge-heading"
      className="shell-panel flex flex-col p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="badge-stage-demo">Demonstration</span>
        <span className="text-stamp text-muted-foreground">
          Community Governance Challenge
        </span>
      </div>

      <h3
        id="community-challenge-heading"
        className="mt-3 font-display text-xl font-medium tracking-tight text-foreground sm:text-2xl"
      >
        How would you allocate $100,000?
      </h3>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        A hypothetical community development allocation. Choose the one priority
        you would fund first, add your reasoning if you wish, and submit your
        participation.
      </p>

      {submitted ? (
        <output
          data-ocid="challenge.success_state"
          className="mt-6 flex items-start gap-3 rounded-lg border border-primary/40 bg-primary/5 px-5 py-4"
        >
          <CheckCircle2
            className="mt-0.5 size-5 shrink-0 text-primary"
            aria-hidden="true"
          />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Thank you — your participation was recorded.
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              This is a demonstration, not an official or binding Nation vote.
              No funds are allocated and no result is counted.
            </p>
          </div>
        </output>
      ) : (
        <form
          data-ocid="challenge.form"
          onSubmit={handleSubmit}
          noValidate
          className="mt-6 space-y-5"
        >
          <fieldset className="space-y-2">
            <legend className="text-stamp mb-2 text-muted-foreground">
              Choose one option
            </legend>
            <div className="grid gap-2">
              {ALLOCATION_OPTIONS.map((option) => {
                const isSelected = selectedOptionId === option.optionId;
                return (
                  <button
                    key={option.optionId.toString()}
                    type="button"
                    data-ocid={`challenge.option.${option.optionId.toString()}`}
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
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">
                        {option.label}
                      </span>
                      <span
                        className={`block text-xs leading-relaxed ${
                          isSelected ? "opacity-90" : "text-muted-foreground"
                        }`}
                      >
                        {option.blurb}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="space-y-2">
            <label
              htmlFor={reasoningId}
              className="text-stamp text-muted-foreground"
            >
              Your reasoning{" "}
              <span className="normal-case tracking-normal">(optional)</span>
            </label>
            <textarea
              id={reasoningId}
              data-ocid="challenge.reasoning_textarea"
              name="reasoning"
              rows={3}
              maxLength={600}
              value={reasoning}
              onChange={(event) => setReasoning(event.target.value)}
              placeholder="Why did you choose this priority?"
              className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-smooth focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
          </div>

          {error ? (
            <p
              data-ocid="challenge.error_state"
              role="alert"
              className="text-sm font-medium text-destructive"
            >
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            data-ocid="challenge.submit_button"
            disabled={submitResponse.isPending || selectedOptionId === null}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-smooth hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {submitResponse.isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            Submit participation
          </button>

          <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <ShieldCheck
              className="mt-0.5 size-4 shrink-0 text-accent"
              aria-hidden="true"
            />
            This is a demonstration, not an official or binding Nation vote. No
            account is required and no personal data is collected.
          </p>
        </form>
      )}
    </section>
  );
}
