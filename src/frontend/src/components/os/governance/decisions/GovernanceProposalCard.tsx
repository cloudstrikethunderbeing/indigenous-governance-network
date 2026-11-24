import { Clock, FileText, ShieldAlert } from "lucide-react";

import type { GovernanceProposal } from "@/backend";
import VoteTally from "@/components/os/governance/VoteTally";
import {
  PROPOSAL_OUTCOME_LABELS,
  PROPOSAL_STATUS_LABELS,
  classificationLabel,
  needsExtraAuthorization,
  periodLabel,
} from "@/components/os/governance/decisions/executionCopy";

/**
 * One governance proposal shown in plain language: what it is, how it is
 * classified, how long people have to review and discuss it, and the current
 * tally. A high-risk classification is called out so a member can see that it
 * will need extra authorization before it can ever run.
 */
export default function GovernanceProposalCard({
  proposal,
  index,
}: {
  proposal: GovernanceProposal;
  index: number;
}) {
  const highRisk = needsExtraAuthorization(proposal.classification);

  return (
    <article
      data-ocid={`os.governance.decision.${index + 1}`}
      className="shell-panel space-y-4 p-4"
    >
      <header className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="min-w-0 font-display text-base font-medium text-foreground">
            {proposal.title}
          </h3>
          <span
            data-ocid={`os.governance.decision_status.${index + 1}`}
            className="text-stamp inline-flex shrink-0 items-center rounded-sm border border-border bg-muted px-2 py-1 text-muted-foreground"
          >
            {PROPOSAL_STATUS_LABELS[proposal.status]}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {proposal.summary}
        </p>
      </header>

      <dl className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="min-w-0">
          <dt className="text-stamp text-muted-foreground">Type of decision</dt>
          <dd className="text-sm font-medium text-foreground">
            {classificationLabel(proposal.classification)}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-stamp text-muted-foreground">Review period</dt>
          <dd className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Clock
              className="size-3.5 text-muted-foreground"
              aria-hidden="true"
            />
            {periodLabel(proposal.reviewPeriodDays)}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-stamp text-muted-foreground">
            Discussion period
          </dt>
          <dd className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Clock
              className="size-3.5 text-muted-foreground"
              aria-hidden="true"
            />
            {periodLabel(proposal.discussionPeriodDays)}
          </dd>
        </div>
      </dl>

      <section aria-label="Current tally" className="space-y-2">
        <p className="text-stamp text-muted-foreground">Current tally</p>
        <VoteTally
          votesInFavor={proposal.votesInFavor}
          votesAgainst={proposal.votesAgainst}
          votesAbstain={proposal.votesAbstain}
        />
      </section>

      {proposal.outcome ? (
        <p
          data-ocid={`os.governance.decision_outcome.${index + 1}`}
          className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-foreground"
        >
          <FileText
            className="size-4 text-muted-foreground"
            aria-hidden="true"
          />
          Result: {PROPOSAL_OUTCOME_LABELS[proposal.outcome]}
        </p>
      ) : null}

      {highRisk ? (
        <p
          data-ocid={`os.governance.decision_high_risk.${index + 1}`}
          className="flex items-start gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
        >
          <ShieldAlert
            className="mt-0.5 size-4 shrink-0 text-accent"
            aria-hidden="true"
          />
          This kind of decision needs extra authorization before it can be
          carried out.
        </p>
      ) : null}
    </article>
  );
}
