import type { NationProposal } from "@/backend";

import ProposalStatusBadge from "@/components/os/governance/ProposalStatusBadge";
import VoteTally from "@/components/os/governance/VoteTally";

/**
 * The list of the sample Nation's proposals. Each row shows the title, summary,
 * status and current tally, and selects the proposal for the detail view.
 */
export default function ProposalList({
  proposals,
  selectedId,
  onSelect,
}: {
  proposals: NationProposal[];
  selectedId: bigint | null;
  onSelect: (id: bigint) => void;
}) {
  return (
    <ul data-ocid="os.governance.proposal_list" className="space-y-3">
      {proposals.map((proposal, index) => {
        const selected = selectedId === proposal.id;
        return (
          <li key={proposal.id.toString()}>
            <button
              type="button"
              data-ocid={`os.governance.proposal.${index + 1}`}
              aria-current={selected ? "true" : undefined}
              onClick={() => onSelect(proposal.id)}
              className={`shell-panel os-focus-ring block w-full space-y-3 p-4 text-left transition-smooth hover:border-accent ${
                selected ? "border-accent ring-1 ring-accent" : ""
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="min-w-0 font-display text-base font-medium text-foreground">
                  {proposal.title}
                </h3>
                <ProposalStatusBadge status={proposal.status} />
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {proposal.summary}
              </p>
              <VoteTally
                votesInFavor={proposal.votesInFavor}
                votesAgainst={proposal.votesAgainst}
                votesAbstain={proposal.votesAbstain}
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
