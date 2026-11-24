import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  Gavel,
  MessagesSquare,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  sampleEvents,
  sampleMembers,
  sampleProposals,
  sampleThreads,
  sampleTransactions,
  sampleTreasurySummary,
} from "@/data/sampleNation";

const openProposals = sampleProposals.filter((p) => p.status === "open");

/** Format an ISO date-time string as a short, readable date. */
function formatEventDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Date to be confirmed";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function SectionHeader({
  icon: Icon,
  title,
  to,
  linkLabel,
  marker,
}: {
  icon: LucideIcon;
  title: string;
  to: string;
  linkLabel: string;
  marker: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex min-w-0 items-center gap-2">
        <Icon className="size-4 shrink-0 text-accent" aria-hidden="true" />
        <h3 className="truncate font-display text-base font-medium text-foreground">
          {title}
        </h3>
      </span>
      <Link
        to={to}
        data-ocid={marker}
        className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary transition-smooth hover:gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {linkLabel}
        <ArrowRight className="size-3.5" aria-hidden="true" />
      </Link>
    </div>
  );
}

/**
 * The dashboard's at-a-glance summaries: open proposals with their tallies,
 * recent discussion activity, upcoming events, the treasury balance with recent
 * transactions, and the member count. Every panel links into its full app.
 */
export default function DashboardSummary() {
  const recentTransactions = sampleTransactions.slice(0, 3);
  const upcomingEvents = sampleEvents.slice(0, 3);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Open proposals */}
      <section
        data-ocid="os.dashboard.proposals_section"
        aria-label="Open proposals"
        className="shell-panel space-y-3 p-4"
      >
        <SectionHeader
          icon={Gavel}
          title="Open proposals"
          to="/os/governance"
          linkLabel="Governance"
          marker="os.dashboard.governance_link"
        />
        {openProposals.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No proposals are open right now.
          </p>
        ) : (
          <ul data-ocid="os.dashboard.proposal_list" className="space-y-3">
            {openProposals.map((proposal) => {
              const total =
                proposal.votesInFavor +
                proposal.votesAgainst +
                proposal.votesAbstain;
              const yesPercent =
                total > 0
                  ? Math.round((proposal.votesInFavor / total) * 100)
                  : 0;
              return (
                <li
                  key={proposal.id}
                  data-ocid={`os.dashboard.proposal.${proposal.id}`}
                  className="space-y-2"
                >
                  <p className="text-sm font-medium text-foreground">
                    {proposal.title}
                  </p>
                  <div
                    className="vote-bar"
                    role="img"
                    aria-label={`${yesPercent}% in favour`}
                  >
                    <div
                      className="vote-bar-yes"
                      style={{ width: `${yesPercent}%` }}
                    />
                  </div>
                  <p className="text-tabular text-xs text-muted-foreground">
                    {proposal.votesInFavor} in favour · {proposal.votesAgainst}{" "}
                    against · {proposal.votesAbstain} abstain
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Recent discussion activity */}
      <section
        data-ocid="os.dashboard.discussions_section"
        aria-label="Recent discussion activity"
        className="shell-panel space-y-3 p-4"
      >
        <SectionHeader
          icon={MessagesSquare}
          title="Recent discussions"
          to="/os/discussions"
          linkLabel="Discussions"
          marker="os.dashboard.discussions_link"
        />
        <ul data-ocid="os.dashboard.thread_list" className="space-y-3">
          {sampleThreads.map((thread) => (
            <li
              key={thread.id}
              data-ocid={`os.dashboard.thread.${thread.id}`}
              className="space-y-1"
            >
              <p className="text-sm font-medium text-foreground">
                {thread.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {thread.author} · {thread.posts.length}{" "}
                {thread.posts.length === 1 ? "reply" : "replies"}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Upcoming events */}
      <section
        data-ocid="os.dashboard.events_section"
        aria-label="Upcoming events"
        className="shell-panel space-y-3 p-4"
      >
        <SectionHeader
          icon={CalendarDays}
          title="Upcoming events"
          to="/os/calendar"
          linkLabel="Calendar"
          marker="os.dashboard.calendar_link"
        />
        <ul data-ocid="os.dashboard.event_list" className="space-y-3">
          {upcomingEvents.map((event) => (
            <li
              key={event.id}
              data-ocid={`os.dashboard.event.${event.id}`}
              className="flex items-start justify-between gap-3"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-foreground">
                  {event.title}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {event.location}
                </span>
              </span>
              <span className="text-tabular shrink-0 text-xs font-medium text-accent">
                {formatEventDate(event.startTime)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Treasury */}
      <section
        data-ocid="os.dashboard.treasury_section"
        aria-label="Treasury"
        className="shell-panel space-y-3 p-4"
      >
        <SectionHeader
          icon={Wallet}
          title="Treasury"
          to="/os/treasury"
          linkLabel="Treasury"
          marker="os.dashboard.treasury_link"
        />
        <div className="space-y-1">
          <p className="text-stamp text-muted-foreground">Balance</p>
          <p
            data-ocid="os.dashboard.treasury_balance"
            className="text-tabular text-2xl font-semibold text-foreground"
          >
            ${sampleTreasurySummary.balance.toLocaleString()}
          </p>
        </div>
        <ul data-ocid="os.dashboard.transaction_list" className="space-y-2">
          {recentTransactions.map((tx) => (
            <li
              key={tx.id}
              data-ocid={`os.dashboard.transaction.${tx.id}`}
              className="flex items-center justify-between gap-3"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm text-foreground">
                  {tx.description}
                </span>
                <span className="text-stamp text-muted-foreground">
                  {tx.category}
                </span>
              </span>
              <span
                className={`text-tabular shrink-0 text-sm font-medium ${
                  tx.direction === "income"
                    ? "text-success"
                    : "text-muted-foreground"
                }`}
              >
                {tx.direction === "income" ? "+" : "−"}$
                {tx.amount.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Members */}
      <section
        data-ocid="os.dashboard.members_section"
        aria-label="Members"
        className="shell-panel space-y-3 p-4 lg:col-span-2"
      >
        <SectionHeader
          icon={Users}
          title="Members"
          to="/os/members"
          linkLabel="Members"
          marker="os.dashboard.members_link"
        />
        <div className="flex flex-wrap items-center gap-4">
          <div className="space-y-1">
            <p className="text-stamp text-muted-foreground">Member count</p>
            <p
              data-ocid="os.dashboard.member_count"
              className="text-tabular text-2xl font-semibold text-foreground"
            >
              {sampleMembers.length}
            </p>
          </div>
          <ul
            data-ocid="os.dashboard.member_list"
            className="flex flex-wrap gap-2"
          >
            {sampleMembers.map((member) => (
              <li
                key={member.id}
                data-ocid={`os.dashboard.member.${member.id}`}
                className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3"
              >
                <span className="avatar-chip" aria-hidden="true">
                  {member.displayName
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-medium text-foreground">
                    {member.displayName}
                  </span>
                  <span className="block truncate text-[0.65rem] text-muted-foreground">
                    {member.roleLabel}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
