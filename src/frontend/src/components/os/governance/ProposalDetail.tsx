import { Check, Loader2 } from "lucide-react";
import { useState } from "react";

import { type NationProposal, VoteChoice } from "@/backend";
import RecordAttachments from "@/components/os/attachments/RecordAttachments";
import { proposalTarget } from "@/components/os/attachments/attachmentTargets";
import { sampleAttachmentsFor } from "@/components/os/attachments/sampleAttachments";
import ProposalStatusBadge from "@/components/os/governance/ProposalStatusBadge";
import VoteTally from "@/components/os/governance/VoteTally";

/** The three vote options, in display order. */
const VOTE_OPTIONS: { choice: VoteChoice; label: string }[] = [
  { choice: VoteChoice.inFavor, label: "In favour" },
  { choice: VoteChoice.against, label: "Against" },
  { choice: VoteChoice.abstain, label: "Abstain" },
];

/**
 * The full text of one proposal with its tally and, for an open proposal, the
 * interactive sample voting workflow. A cast vote is recorded through the
 * Nation workspace API and the tally re-renders from the refreshed data.
 */
export default function ProposalDetail({
  proposal,
  nation,
  readOnly,
  onVote,
  isVoting,
  voteError,
  recordedChoice,
}: {
  proposal: NationProposal;
  nation: bigint;
  readOnly: boolean;
  onVote: (choice: VoteChoice) => void;
  isVoting: boolean;
  voteError: string | null;
  recordedChoice: VoteChoice | null;
}) {
  const [pendingChoice, setPendingChoice] = useState<VoteChoice | null>(null);
  const isOpen = proposal.status === "open";
  const target = proposalTarget(proposal.id);

  return (
    <article
      data-ocid="os.governance.proposal_detail"
      className="shell-panel space-y-5 p-5"
    >
      <header className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="min-w-0 font-display text-xl font-medium tracking-tight text-foreground">
            {proposal.title}
          </h3>
          <ProposalStatusBadge status={proposal.status} />
        </div>
        <div className="rule-accent" />
      </header>

      <section aria-label="Proposal text" className="space-y-2">
        <p className="text-stamp text-muted-foreground">Full proposal</p>
        <p className="text-sm leading-relaxed text-foreground">
          {proposal.summary}
        </p>
      </section>

      <section aria-label="Vote tally" className="space-y-3">
        <p className="text-stamp text-muted-foreground">Current tally</p>
        <VoteTally
          votesInFavor={proposal.votesInFavor}
          votesAgainst={proposal.votesAgainst}
          votesAbstain={proposal.votesAbstain}
          size="large"
        />
      </section>

      {isOpen ? (
        <section
          aria-label="Cast your vote"
          className="space-y-3 border-t border-border pt-4"
        >
          <div className="space-y-1">
            <p className="text-stamp text-accent">Cast your vote</p>
            <p className="text-sm text-muted-foreground">
              Your vote is recorded in the sample workspace and the tally above
              updates to reflect it.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {VOTE_OPTIONS.map((option) => {
              const isRecorded = recordedChoice === option.choice;
              return (
                <button
                  key={option.choice}
                  type="button"
                  data-ocid={`os.governance.vote_button.${option.choice}`}
                  disabled={isVoting}
                  onClick={() => {
                    setPendingChoice(option.choice);
                    onVote(option.choice);
                  }}
                  className={`os-focus-ring inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-smooth disabled:cursor-not-allowed disabled:opacity-60 ${
                    isRecorded
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-card text-foreground hover:border-accent hover:bg-accent/10"
                  }`}
                >
                  {isVoting && pendingChoice === option.choice ? (
                    <Loader2
                      className="size-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : isRecorded ? (
                    <Check className="size-4" aria-hidden="true" />
                  ) : null}
                  {option.label}
                </button>
              );
            })}
          </div>

          {voteError ? (
            <p
              data-ocid="os.governance.vote_error"
              role="alert"
              className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {voteError}
            </p>
          ) : recordedChoice ? (
            <output
              data-ocid="os.governance.vote_success"
              className="flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-foreground"
            >
              <Check className="size-4 text-primary" aria-hidden="true" />
              Your vote was recorded. The tally above has been updated.
            </output>
          ) : null}
        </section>
      ) : (
        <p
          data-ocid="os.governance.vote_closed"
          className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
        >
          Voting is closed for this proposal.
        </p>
      )}

      <RecordAttachments
        nation={nation}
        target={target}
        readOnly={readOnly}
        sampleAttachments={sampleAttachmentsFor(target)}
      />
    </article>
  );
}
