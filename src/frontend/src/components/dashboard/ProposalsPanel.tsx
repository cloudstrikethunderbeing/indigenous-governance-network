import VoteBar from "@/components/dashboard/VoteBar";
import { dashboardProposals } from "@/data/demoData";

/** Example proposals with horizontal Yes/No vote bars and vote counts. */
export default function ProposalsPanel() {
  return (
    <ul data-ocid="dashboard.proposals" className="flex flex-col gap-4">
      {dashboardProposals.map((proposal, index) => (
        <li
          key={proposal.id}
          data-ocid={`dashboard.proposal.${index + 1}`}
          className="space-y-2"
        >
          <p className="text-sm font-medium text-foreground">
            {proposal.title}
          </p>
          <VoteBar
            yes={proposal.yes}
            no={proposal.no}
            ocid={`dashboard.proposal_votes.${index + 1}`}
          />
        </li>
      ))}
    </ul>
  );
}
