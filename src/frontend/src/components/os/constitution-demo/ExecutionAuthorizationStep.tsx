import { Check, Gavel, KeyRound } from "lucide-react";

import { passedProposal } from "@/components/os/constitution-demo/demoScenarios";

/**
 * Step 3 — A passed proposal awaiting execution authorization.
 *
 * A fictional proposal has passed the vote but cannot act until a member with
 * execution authority authorizes it. The visitor can authorize it to see the
 * decision move forward. Nothing is saved.
 */
export default function ExecutionAuthorizationStep({
  authorized,
  onAuthorize,
}: {
  authorized: boolean;
  onAuthorize: () => void;
}) {
  const totalVotes = passedProposal.votesInFavor + passedProposal.votesAgainst;
  const inFavorPercent = Math.round(
    (passedProposal.votesInFavor / totalVotes) * 100,
  );

  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <p className="text-stamp text-accent">Step 3 · Approved decision</p>
        <h3 className="font-display text-xl font-medium tracking-tight text-foreground md:text-2xl">
          A decision that passed, waiting to act
        </h3>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Passing a vote is not the same as acting on it. A decision waits until
          someone with the right permission authorizes it.
        </p>
      </header>

      <article
        data-ocid="constitution_demo.execution.proposal"
        className="gov-constitution space-y-4 p-5"
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="gov-seal flex size-11 shrink-0 items-center justify-center rounded-full"
          >
            <Gavel className="size-5" />
          </span>
          <div className="min-w-0 space-y-1">
            <h4 className="font-display text-lg font-medium text-foreground">
              {passedProposal.title}
            </h4>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {passedProposal.summary}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className="text-muted-foreground">Votes in favour</span>
            <span className="text-tabular font-semibold text-foreground">
              {passedProposal.votesInFavor} of {totalVotes}
            </span>
          </div>
          <div className="gov-progress-track" aria-hidden="true">
            <div
              className="gov-progress-fill"
              style={{ width: `${inFavorPercent}%` }}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <span
            data-ocid="constitution_demo.execution.state"
            className={`status-chip ${
              authorized ? "gov-execution-done" : "gov-execution-pending"
            }`}
          >
            {authorized
              ? "Authorized — ready to carry out"
              : passedProposal.executionState}
          </span>
          <span className="text-xs text-muted-foreground">
            Needs: {passedProposal.requiredPermission}
          </span>
        </div>
      </article>

      <div className="space-y-3">
        {authorized ? (
          <output
            data-ocid="constitution_demo.execution.authorized"
            className="flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-foreground"
          >
            <Check className="size-4 text-primary" aria-hidden="true" />
            The decision was authorized and can now be carried out. This is a
            demonstration — nothing was saved.
          </output>
        ) : (
          <button
            type="button"
            data-ocid="constitution_demo.execution.authorize_button"
            onClick={onAuthorize}
            className="os-focus-ring inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 sm:w-auto"
          >
            <KeyRound className="size-4" aria-hidden="true" />
            Authorize the decision
          </button>
        )}
      </div>
    </div>
  );
}
