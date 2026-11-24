import { Gavel, Info, Vote } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";

import type { GovernanceProposal, NationProposal, VoteChoice } from "@/backend";
import ProposalDetail from "@/components/os/governance/ProposalDetail";
import ProposalList from "@/components/os/governance/ProposalList";
import ExecutionView from "@/components/os/governance/decisions/ExecutionView";
import GovernanceProposalCard from "@/components/os/governance/decisions/GovernanceProposalCard";
import {
  useExecutionRequests,
  useGovernanceProposals,
} from "@/components/os/governance/decisions/useGovernanceDecisions";

/** The two views inside the Decisions section. */
type DecisionsView = "discussing" | "carrying-out";

/**
 * The Decisions section body: what the organization is discussing and voting
 * on, and the separate step of carrying a passed decision out. Voting and doing
 * are kept clearly apart — passing a vote never carries out the action by
 * itself, and the section says so in one plain sentence.
 */
export default function DecisionsSection({
  isLoading,
  isError,
  onRetry,
  proposals,
  selected,
  nationId,
  readOnly,
  onSelect,
  onVote,
  isVoting,
  voteError,
  recordedChoice,
}: {
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  proposals: NationProposal[];
  selected: NationProposal | null;
  nationId: bigint;
  readOnly: boolean;
  onSelect: (id: bigint) => void;
  onVote: (choice: VoteChoice) => void;
  isVoting: boolean;
  voteError: string | null;
  recordedChoice: VoteChoice | null;
}) {
  const [view, setView] = useState<DecisionsView>("discussing");
  const governanceQuery = useGovernanceProposals(nationId);
  const executionQuery = useExecutionRequests(nationId);

  const governanceProposals = useMemo(
    () => governanceQuery.data ?? [],
    [governanceQuery.data],
  );
  const executionRequests = useMemo(
    () => executionQuery.data ?? [],
    [executionQuery.data],
  );

  return (
    <div className="space-y-5">
      <p
        data-ocid="os.governance.voting_execution_note"
        className="flex items-start gap-2 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm leading-relaxed text-foreground"
      >
        <Info
          className="mt-0.5 size-4 shrink-0 text-accent"
          aria-hidden="true"
        />
        Passing a vote never carries out the action by itself — carrying it out
        is always a separate step.
      </p>

      <div
        data-ocid="os.governance.decisions_view_tabs"
        className="flex flex-wrap gap-2"
        aria-label="Decisions views"
      >
        <DecisionsTab
          active={view === "discussing"}
          icon={<Vote className="size-4" aria-hidden="true" />}
          label="Discussing & voting"
          ocid="os.governance.decisions_tab.discussing"
          onClick={() => setView("discussing")}
        />
        <DecisionsTab
          active={view === "carrying-out"}
          icon={<Gavel className="size-4" aria-hidden="true" />}
          label="Carrying out"
          ocid="os.governance.decisions_tab.carrying_out"
          onClick={() => setView("carrying-out")}
        />
      </div>

      {view === "discussing" ? (
        <DiscussingView
          isLoading={isLoading}
          isError={isError}
          onRetry={onRetry}
          proposals={proposals}
          selected={selected}
          nationId={nationId}
          readOnly={readOnly}
          onSelect={onSelect}
          onVote={onVote}
          isVoting={isVoting}
          voteError={voteError}
          recordedChoice={recordedChoice}
          governanceProposals={governanceProposals}
          governanceLoading={governanceQuery.isLoading}
        />
      ) : (
        <ExecutionView
          requests={executionRequests}
          proposals={governanceProposals}
        />
      )}
    </div>
  );
}

/** One tab in the Decisions view switcher. */
function DecisionsTab({
  active,
  icon,
  label,
  ocid,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  ocid: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      data-ocid={ocid}
      onClick={onClick}
      className={`os-focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-smooth ${
        active
          ? "border-accent bg-accent/10 text-accent-foreground"
          : "border-input bg-card text-foreground hover:border-accent hover:bg-accent/10"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/** The discussing-and-voting view: the live proposals and the vote workflow. */
function DiscussingView({
  isLoading,
  isError,
  onRetry,
  proposals,
  selected,
  nationId,
  readOnly,
  onSelect,
  onVote,
  isVoting,
  voteError,
  recordedChoice,
  governanceProposals,
  governanceLoading,
}: {
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  proposals: NationProposal[];
  selected: NationProposal | null;
  nationId: bigint;
  readOnly: boolean;
  onSelect: (id: bigint) => void;
  onVote: (choice: VoteChoice) => void;
  isVoting: boolean;
  voteError: string | null;
  recordedChoice: VoteChoice | null;
  governanceProposals: GovernanceProposal[];
  governanceLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div
        data-ocid="os.governance.loading_state"
        className="space-y-3"
        aria-busy="true"
      >
        {Array.from({ length: 3 }, (_, i) => `skeleton-${i}`).map((id) => (
          <div
            key={id}
            className="shell-panel h-28 animate-pulse bg-muted/40"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div
        data-ocid="os.governance.error_state"
        role="alert"
        className="shell-panel space-y-3 p-5"
      >
        <p className="font-display text-base font-medium text-foreground">
          The proposals could not be loaded.
        </p>
        <p className="text-sm text-muted-foreground">
          Check your connection and try again.
        </p>
        <button
          type="button"
          data-ocid="os.governance.retry_button"
          onClick={onRetry}
          className="os-focus-ring inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-smooth hover:opacity-90"
        >
          Try again
        </button>
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <div
        data-ocid="os.governance.empty_state"
        className="shell-panel space-y-2 p-5"
      >
        <p className="font-display text-base font-medium text-foreground">
          No proposals yet
        </p>
        <p className="text-sm text-muted-foreground">
          This sample Nation has no proposals to show right now.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section aria-label="Proposals" className="min-w-0">
          <ProposalList
            proposals={proposals}
            selectedId={selected?.id ?? null}
            onSelect={onSelect}
          />
        </section>

        {selected ? (
          <section aria-label="Proposal detail" className="min-w-0">
            <ProposalDetail
              proposal={selected}
              nation={nationId}
              readOnly={readOnly}
              onVote={onVote}
              isVoting={isVoting}
              voteError={voteError}
              recordedChoice={recordedChoice}
            />
          </section>
        ) : null}
      </div>

      <GovernanceProposalList
        proposals={governanceProposals}
        isLoading={governanceLoading}
      />
    </div>
  );
}

/** The governance proposals with classification, periods and tally. */
function GovernanceProposalList({
  proposals,
  isLoading,
}: {
  proposals: GovernanceProposal[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div
        data-ocid="os.governance.decisions_loading_state"
        className="space-y-3"
        aria-busy="true"
      >
        {Array.from({ length: 2 }, (_, i) => `decision-skeleton-${i}`).map(
          (id) => (
            <div
              key={id}
              className="shell-panel h-32 animate-pulse bg-muted/40"
            />
          ),
        )}
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <div
        data-ocid="os.governance.decisions_empty_state"
        className="shell-panel space-y-2 p-5"
      >
        <p className="font-display text-base font-medium text-foreground">
          No formal decisions yet
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Formal decisions with a type, review period and discussion period will
          appear here once your organization starts one.
        </p>
      </div>
    );
  }

  return (
    <section
      data-ocid="os.governance.decisions_list"
      aria-label="Formal decisions"
      className="space-y-3"
    >
      <div className="space-y-1">
        <h3 className="font-display text-base font-medium text-foreground">
          Formal decisions
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Each decision shows what it is, how it is classified, how long people
          have to review and discuss it, and the current tally.
        </p>
      </div>
      <ul className="space-y-3">
        {proposals.map((proposal, index) => (
          <li key={proposal.id.toString()}>
            <GovernanceProposalCard proposal={proposal} index={index} />
          </li>
        ))}
      </ul>
    </section>
  );
}
