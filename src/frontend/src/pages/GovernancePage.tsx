import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Clock,
  Coins,
  Gavel,
  Handshake,
  History,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

import Panel from "@/components/dashboard/Panel";
import { sovereigntySafeguard } from "@/data/demoData";

type ProposalStatus = "Open" | "Passed" | "Rejected";

interface Proposal {
  id: string;
  ocid: string;
  title: string;
  summary: string;
  /** Treasury allocation requested, in simulated SOVEREIGN. */
  allocation: number;
  /** Simulated votes already cast before this session. */
  baseYes: number;
  baseNo: number;
  /** Simulated participation reward for voting, in SRC. */
  reward: number;
  closesLabel: string;
}

const proposals: Proposal[] = [
  {
    id: "research-grant-arctic",
    ocid: "research_grant_arctic",
    title: "Fund an Arctic monitoring research grant",
    summary:
      "Allocate treasury funds to commission independent, community-led environmental monitoring research.",
    allocation: 250_000,
    baseYes: 412,
    baseNo: 96,
    reward: 25,
    closesLabel: "Closes in 4 days",
  },
  {
    id: "open-data-standard",
    ocid: "open_data_standard",
    title: "Adopt an open research data standard",
    summary:
      "Require every funded project to publish results under a shared, community-approved data standard.",
    allocation: 0,
    baseYes: 388,
    baseNo: 141,
    reward: 15,
    closesLabel: "Closes in 6 days",
  },
  {
    id: "treasury-reserve",
    ocid: "treasury_reserve",
    title: "Set aside a treasury reserve",
    summary:
      "Hold a portion of the treasury in reserve to fund long-horizon research without new fundraising.",
    allocation: 500_000,
    baseYes: 205,
    baseNo: 233,
    reward: 20,
    closesLabel: "Closes in 9 days",
  },
];

interface VoteRecord {
  proposalId: string;
  choice: "yes" | "no";
  reward: number;
}

const delegationConcepts = [
  {
    icon: Users,
    title: "Delegate to a trusted voice",
    body: "A member could hand their voting weight to someone who follows the research closely, without giving up ownership of anything.",
  },
  {
    icon: Handshake,
    title: "Keep it voluntary",
    body: "Delegation would always be optional and revocable. No one is ever required to vote or to hand over their say.",
  },
  {
    icon: ShieldCheck,
    title: "Nation authority is untouched",
    body: "Delegation moves voting weight only. It never transfers Nation authority, treaty rights or decision-making over Indigenous laws.",
  },
];

const participationRewards = [
  {
    icon: Coins,
    label: "Vote on a proposal",
    value: "+15–25 SRC",
    note: "Simulated reward for taking part",
  },
  {
    icon: Gavel,
    label: "Submit a proposal",
    value: "+50 SRC",
    note: "Simulated reward for contributing an idea",
  },
  {
    icon: History,
    label: "Review a closed proposal",
    value: "+5 SRC",
    note: "Simulated reward for staying informed",
  },
];

function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

function statusClass(status: ProposalStatus): string {
  if (status === "Passed") return "badge-stage-live";
  if (status === "Rejected") return "badge-stage-future";
  return "badge-stage-demo";
}

export default function GovernancePage() {
  const [votes, setVotes] = useState<Record<string, "yes" | "no">>({});
  const [history, setHistory] = useState<VoteRecord[]>([]);

  const castVote = (proposal: Proposal, choice: "yes" | "no") => {
    if (votes[proposal.id]) return;
    setVotes((current) => ({ ...current, [proposal.id]: choice }));
    setHistory((current) => [
      {
        proposalId: proposal.id,
        choice,
        reward: proposal.reward,
      },
      ...current,
    ]);
  };

  const totalReward = useMemo(
    () => history.reduce((sum, record) => sum + record.reward, 0),
    [history],
  );

  const proposalTitle = (id: string) =>
    proposals.find((proposal) => proposal.id === id)?.title ?? id;

  return (
    <div data-ocid="page.governance" className="space-y-6">
      <header className="space-y-3">
        <p className="text-stamp text-accent">Phase 4 of 5</p>
        <h2 className="font-display text-2xl font-medium tracking-tight text-foreground md:text-3xl">
          DAO Governance
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          How a self-governing research network could make decisions together.
          Cast a simulated vote below to see a tally and status update — nothing
          is saved and no real vote is cast.
        </p>
        <div className="rule-accent" />
      </header>

      {/* Sovereignty safeguard — visible throughout the governance experience. */}
      <section
        data-ocid="governance.safeguard"
        aria-label="Indigenous-sovereignty safeguard"
        className="shell-panel border-primary/40 bg-primary/5 p-5 sm:p-6"
      >
        <div className="flex items-start gap-3">
          <ShieldCheck
            className="mt-0.5 size-5 shrink-0 text-primary"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="text-stamp text-primary">Sovereignty safeguard</p>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-foreground sm:text-base">
              {sovereigntySafeguard}
            </p>
          </div>
        </div>
      </section>

      {/* Simulated voting session summary */}
      <section
        data-ocid="governance.session"
        aria-label="Simulated governance session"
        className="grid gap-4 sm:grid-cols-3"
      >
        <div className="shell-panel p-4">
          <p className="text-stamp text-muted-foreground">Votes cast</p>
          <p className="text-tabular mt-1 text-2xl font-semibold text-foreground">
            {history.length}
          </p>
        </div>
        <div className="shell-panel p-4">
          <p className="text-stamp text-muted-foreground">SRC earned</p>
          <p className="text-tabular mt-1 text-2xl font-semibold text-foreground">
            {formatNumber(totalReward)}
          </p>
        </div>
        <div className="shell-panel p-4">
          <p className="text-stamp text-muted-foreground">Open proposals</p>
          <p className="text-tabular mt-1 text-2xl font-semibold text-foreground">
            {proposals.length}
          </p>
        </div>
      </section>

      {/* Proposals */}
      <Panel title="Example proposals" ocid="governance.proposals_panel">
        <ul data-ocid="governance.proposal_list" className="space-y-4">
          {proposals.map((proposal, index) => {
            const choice = votes[proposal.id];
            const yes = proposal.baseYes + (choice === "yes" ? 1 : 0);
            const no = proposal.baseNo + (choice === "no" ? 1 : 0);
            const total = yes + no;
            const yesPct = total > 0 ? Math.round((yes / total) * 100) : 0;
            const status: ProposalStatus = choice
              ? yes > no
                ? "Passed"
                : "Rejected"
              : "Open";

            return (
              <li
                key={proposal.id}
                data-ocid={`governance.proposal.${index + 1}`}
                className="shell-panel-alt p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-lg font-medium text-foreground sm:text-xl">
                      {proposal.title}
                    </h3>
                    <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
                      {proposal.summary}
                    </p>
                  </div>
                  <span
                    data-ocid={`governance.proposal_status.${index + 1}`}
                    className={statusClass(status)}
                  >
                    {status}
                  </span>
                </div>

                <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <div className="flex items-center gap-1.5">
                    <dt className="text-muted-foreground">Treasury ask</dt>
                    <dd className="text-tabular font-medium text-foreground">
                      {proposal.allocation > 0
                        ? `${formatNumber(proposal.allocation)} SOVEREIGN`
                        : "No allocation"}
                    </dd>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <dt className="text-muted-foreground">Reward</dt>
                    <dd className="text-tabular font-medium text-foreground">
                      +{proposal.reward} SRC
                    </dd>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock
                      className="size-3.5 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <dd className="text-muted-foreground">
                      {proposal.closesLabel}
                    </dd>
                  </div>
                </dl>

                {/* Tally */}
                <div className="mt-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Simulated tally
                    </span>
                    <span className="text-tabular text-foreground">
                      {formatNumber(yes)} yes · {formatNumber(no)} no
                    </span>
                  </div>
                  <div
                    className="vote-bar mt-2"
                    role="img"
                    aria-label={`${yesPct} percent in favour`}
                  >
                    <div
                      className="vote-bar-yes"
                      style={{ width: `${yesPct}%` }}
                    />
                  </div>
                  <p className="text-tabular mt-1 text-xs text-muted-foreground">
                    {yesPct}% in favour
                  </p>
                </div>

                {/* Vote controls */}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {choice ? (
                    <p
                      data-ocid={`governance.vote_confirmation.${index + 1}`}
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary"
                    >
                      <Check className="size-4" aria-hidden="true" />
                      Simulated vote recorded:{" "}
                      {choice === "yes" ? "In favour" : "Against"}
                    </p>
                  ) : (
                    <>
                      <button
                        type="button"
                        data-ocid={`governance.vote_yes_button.${index + 1}`}
                        onClick={() => castVote(proposal, "yes")}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-smooth hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        Vote in favour
                      </button>
                      <button
                        type="button"
                        data-ocid={`governance.vote_no_button.${index + 1}`}
                        onClick={() => castVote(proposal, "no")}
                        className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-smooth hover:bg-accent/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        Vote against
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </Panel>

      {/* Delegation concepts */}
      <Panel title="Delegation concepts" ocid="governance.delegation_panel">
        <p className="mb-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          A future system could let members delegate their voting weight. These
          are concepts only — no delegation exists here.
        </p>
        <ul
          data-ocid="governance.delegation_list"
          className="grid gap-4 sm:grid-cols-3"
        >
          {delegationConcepts.map((concept, index) => (
            <li
              key={concept.title}
              data-ocid={`governance.delegation.${index + 1}`}
              className="shell-panel-alt p-4"
            >
              <concept.icon
                className="size-5 text-primary"
                aria-hidden="true"
              />
              <h3 className="mt-3 font-display text-base font-medium text-foreground">
                {concept.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {concept.body}
              </p>
            </li>
          ))}
        </ul>
      </Panel>

      {/* Participation rewards */}
      <Panel title="Participation rewards" ocid="governance.rewards_panel">
        <p className="mb-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Taking part could earn simulated SOVEREIGN Research Credits. These
          figures are illustrative and never persisted.
        </p>
        <ul
          data-ocid="governance.reward_list"
          className="divide-y divide-border"
        >
          {participationRewards.map((reward, index) => (
            <li
              key={reward.label}
              data-ocid={`governance.reward.${index + 1}`}
              className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
            >
              <reward.icon
                className="size-5 shrink-0 text-accent"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">
                  {reward.label}
                </p>
                <p className="text-xs text-muted-foreground">{reward.note}</p>
              </div>
              <span className="text-tabular shrink-0 text-sm font-semibold text-foreground">
                {reward.value}
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      {/* Voting & proposal history */}
      <Panel title="Your simulated history" ocid="governance.history_panel">
        {history.length === 0 ? (
          <div
            data-ocid="governance.history_empty_state"
            className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center"
          >
            <p className="text-sm text-muted-foreground">
              No simulated votes yet. Cast a vote above to see it appear here.
            </p>
          </div>
        ) : (
          <ul
            data-ocid="governance.history_list"
            className="divide-y divide-border"
          >
            {history.map((record, index) => (
              <li
                key={`${record.proposalId}-${index}`}
                data-ocid={`governance.history.${index + 1}`}
                className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {proposalTitle(record.proposalId)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Simulated vote ·{" "}
                    {record.choice === "yes" ? "In favour" : "Against"}
                  </p>
                </div>
                <span className="text-tabular shrink-0 text-sm font-semibold text-primary">
                  +{record.reward} SRC
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">
        All voting, delegation and governance activity on this page is
        simulated. Nothing is persisted, no real vote is cast and no token,
        wallet or treasury is involved.
      </p>

      <div>
        <Link
          to="/dao/staking"
          data-ocid="governance.staking_link"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-smooth hover:gap-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Explore the staking and maturity concept
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
