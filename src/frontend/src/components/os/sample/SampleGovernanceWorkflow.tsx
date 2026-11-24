import { Check, RotateCcw, Vote } from "lucide-react";
import { useState } from "react";

import { sampleProposals } from "@/data/sampleNation";

/** The three vote options offered in the demonstration workflow. */
const VOTE_OPTIONS = [
  { key: "inFavor", label: "In favour" },
  { key: "against", label: "Against" },
  { key: "abstain", label: "Abstain" },
] as const;

type VoteKey = (typeof VOTE_OPTIONS)[number]["key"];

/**
 * An interactive demonstration of a governance workflow. A visitor picks one of
 * the sample Nation's open proposals, casts a vote and sees the outcome. Nothing
 * is sent anywhere: the result is computed locally and every surface is labelled
 * as a demonstration.
 */
export default function SampleGovernanceWorkflow() {
  const openProposals = sampleProposals.filter((p) => p.status === "open");
  const [selectedId, setSelectedId] = useState<number>(
    openProposals[0]?.id ?? sampleProposals[0].id,
  );
  const [choice, setChoice] = useState<VoteKey | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const selected =
    sampleProposals.find((p) => p.id === selectedId) ?? sampleProposals[0];

  function reset() {
    setChoice(null);
    setSubmitted(false);
  }

  function selectProposal(id: number) {
    setSelectedId(id);
    reset();
  }

  return (
    <section
      data-ocid="os.sample.workflow"
      aria-label="Governance workflow demonstration"
      className="shell-panel space-y-5 p-4 md:p-5"
    >
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge-stage-demo">Demonstration</span>
          <p className="text-stamp text-accent">Try a governance workflow</p>
        </div>
        <h3 className="font-display text-lg font-medium tracking-tight text-foreground">
          Cast a sample vote
        </h3>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Pick an open proposal, choose how you would vote and submit. This is a
          demonstration only — your choice is not recorded, not counted and not
          sent anywhere.
        </p>
      </header>

      <div className="space-y-2">
        <p className="text-stamp text-muted-foreground">1. Choose a proposal</p>
        <ul className="space-y-2">
          {openProposals.map((proposal, index) => {
            const active = proposal.id === selectedId;
            return (
              <li key={proposal.id}>
                <button
                  type="button"
                  data-ocid={`os.sample.workflow.proposal.${index + 1}`}
                  aria-pressed={active}
                  onClick={() => selectProposal(proposal.id)}
                  className={`os-focus-ring flex w-full min-h-[44px] items-start gap-3 rounded-lg border p-3 text-left transition-smooth ${
                    active
                      ? "border-accent bg-accent/10"
                      : "border-border bg-card hover:border-accent/60"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${
                      active
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-input"
                    }`}
                  >
                    {active ? <Check className="size-3" /> : null}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-foreground">
                      {proposal.title}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                      {proposal.summary}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="space-y-2">
        <p className="text-stamp text-muted-foreground">2. Choose your vote</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {VOTE_OPTIONS.map((option) => {
            const active = choice === option.key;
            return (
              <button
                key={option.key}
                type="button"
                data-ocid={`os.sample.workflow.vote.${option.key}`}
                aria-pressed={active}
                disabled={submitted}
                onClick={() => setChoice(option.key)}
                className={`os-focus-ring inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-smooth disabled:cursor-not-allowed disabled:opacity-60 ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-card text-foreground hover:border-accent hover:bg-accent/10"
                }`}
              >
                {active ? (
                  <Check className="size-4" aria-hidden="true" />
                ) : null}
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-stamp text-muted-foreground">3. Submit</p>
        {submitted ? (
          <output
            data-ocid="os.sample.workflow.result"
            className="block space-y-3 rounded-lg border border-accent/50 bg-accent/10 p-4"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Vote className="size-4 text-accent" aria-hidden="true" />
              Demonstration complete
            </span>
            <span className="block text-sm leading-relaxed text-muted-foreground">
              You voted{" "}
              <strong className="font-semibold text-foreground">
                {VOTE_OPTIONS.find(
                  (o) => o.key === choice,
                )?.label.toLowerCase()}
              </strong>{" "}
              on “{selected.title}”. In a real Nation this vote would be
              recorded in the workspace and the tally would update. Here nothing
              was saved — this is an illustration of the workflow.
            </span>
            <button
              type="button"
              data-ocid="os.sample.workflow.reset_button"
              onClick={reset}
              className="os-focus-ring inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-smooth hover:border-primary/50"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Try again
            </button>
          </output>
        ) : (
          <button
            type="button"
            data-ocid="os.sample.workflow.submit_button"
            disabled={choice === null}
            onClick={() => setSubmitted(true)}
            className="os-focus-ring inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-smooth hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <Vote className="size-4" aria-hidden="true" />
            Submit sample vote
          </button>
        )}
      </div>
    </section>
  );
}
