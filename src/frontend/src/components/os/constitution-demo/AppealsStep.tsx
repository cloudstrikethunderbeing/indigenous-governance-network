import { FileWarning, Scale, Search } from "lucide-react";

import { appealScenario } from "@/components/os/constitution-demo/demoScenarios";

/**
 * Step 5 — Contradictory evidence entering the appeals process.
 *
 * A fictional member disagrees with a decision and files an appeal. New
 * evidence contradicts the original finding, so the decision goes under review.
 * The visitor can submit the new evidence to see the review open. Nothing is
 * saved.
 */
export default function AppealsStep({
  submitted,
  onSubmit,
}: {
  submitted: boolean;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <p className="text-stamp text-accent">Step 5 · Appeals</p>
        <h3 className="font-display text-xl font-medium tracking-tight text-foreground md:text-2xl">
          When new evidence changes the picture
        </h3>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          A member who disagrees with a decision can ask for it to be reviewed.
          If new evidence contradicts the original finding, the decision is
          reopened.
        </p>
      </header>

      <article
        data-ocid="constitution_demo.appeals.case"
        className="gov-constitution space-y-4 p-5"
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="gov-seal flex size-11 shrink-0 items-center justify-center rounded-full"
          >
            <Scale className="size-5" />
          </span>
          <div className="min-w-0 space-y-1">
            <p className="text-stamp text-muted-foreground">
              Appeal · {appealScenario.subject}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {appealScenario.summary}
            </p>
          </div>
        </div>

        <ul className="space-y-2">
          {appealScenario.evidence.map((item, index) => {
            const isContradicting = item.stance === "contradicts";
            const visible = !isContradicting || submitted;
            return (
              <li
                key={item.label}
                data-ocid={`constitution_demo.appeals.evidence.${index + 1}`}
                className={`gov-demo-impact space-y-0.5 py-1 pl-3 ${
                  isContradicting ? "gov-appeal-open" : "gov-appeal-review"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileWarning className="size-4 shrink-0" aria-hidden="true" />
                  <span className="text-sm font-medium text-foreground">
                    {item.label}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {visible
                    ? item.detail
                    : "Not yet submitted — add the new evidence to see it."}
                </p>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <span
            data-ocid="constitution_demo.appeals.state"
            className={`status-chip ${
              submitted ? "gov-appeal-open" : "gov-appeal-review"
            }`}
          >
            {submitted ? appealScenario.reviewState : "Awaiting new evidence"}
          </span>
        </div>
      </article>

      <div className="space-y-3">
        {submitted ? (
          <output
            data-ocid="constitution_demo.appeals.submitted"
            className="flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-foreground"
          >
            <Search className="size-4 text-primary" aria-hidden="true" />
            The new evidence was submitted and the decision is under review.
            This is a demonstration — nothing was saved.
          </output>
        ) : (
          <button
            type="button"
            data-ocid="constitution_demo.appeals.submit_button"
            onClick={onSubmit}
            className="os-focus-ring inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 sm:w-auto"
          >
            <FileWarning className="size-4" aria-hidden="true" />
            Submit the new evidence
          </button>
        )}
      </div>
    </div>
  );
}
