import {
  CalendarDays,
  FileText,
  MessagesSquare,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import {
  sampleDocuments,
  sampleEvents,
  sampleMembers,
  sampleProposals,
  sampleThreads,
  sampleTransactions,
  sampleTreasurySummary,
} from "@/data/sampleNation";

/** The content areas a visitor can browse in the sample Nation. */
const AREAS = [
  { key: "proposals", label: "Proposals", icon: FileText },
  { key: "discussions", label: "Discussions", icon: MessagesSquare },
  { key: "members", label: "Members", icon: Users },
  { key: "documents", label: "Documents", icon: FileText },
  { key: "calendar", label: "Calendar", icon: CalendarDays },
  { key: "treasury", label: "Treasury", icon: Wallet },
] as const;

type AreaKey = (typeof AREAS)[number]["key"];

/** A small illustrative-data stamp shown on every browsed record. */
function IllustrativeTag() {
  return (
    <span className="text-stamp shrink-0 rounded-sm border border-dashed border-accent px-1.5 py-0.5 text-accent-foreground">
      Illustrative
    </span>
  );
}

/** A labelled section wrapper for one browsable area. */
function AreaPanel({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <section
      data-ocid={`os.sample.area.${title.toLowerCase()}`}
      aria-label={title}
      className="shell-panel space-y-4 p-4 md:p-5"
    >
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-accent" aria-hidden="true" />
          <h3 className="font-display text-lg font-medium tracking-tight text-foreground">
            {title}
          </h3>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </header>
      {children}
    </section>
  );
}

function ProposalsArea() {
  return (
    <AreaPanel
      title="Proposals"
      description="Community proposals and their current vote tallies."
      icon={FileText}
    >
      <ul data-ocid="os.sample.proposals.list" className="space-y-3">
        {sampleProposals.map((proposal, index) => {
          const total =
            proposal.votesInFavor +
            proposal.votesAgainst +
            proposal.votesAbstain;
          const yesPercent =
            total > 0 ? Math.round((proposal.votesInFavor / total) * 100) : 0;
          return (
            <li
              key={proposal.id}
              data-ocid={`os.sample.proposals.item.${index + 1}`}
              className="space-y-2 rounded-lg border border-border bg-card p-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h4 className="min-w-0 text-sm font-medium text-foreground">
                  {proposal.title}
                </h4>
                <IllustrativeTag />
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {proposal.summary}
              </p>
              <div className="space-y-1">
                <div
                  aria-hidden="true"
                  className="flex h-1.5 w-full overflow-hidden rounded-sm bg-muted"
                >
                  <span
                    className="h-full bg-[oklch(var(--vote-yes))]"
                    style={{ width: `${yesPercent}%` }}
                  />
                </div>
                <p className="text-tabular text-xs text-muted-foreground">
                  {proposal.votesInFavor} in favour · {proposal.votesAgainst}{" "}
                  against · {proposal.votesAbstain} abstain ·{" "}
                  <span className="uppercase tracking-wide">
                    {proposal.status}
                  </span>
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </AreaPanel>
  );
}

function DiscussionsArea() {
  const [openId, setOpenId] = useState<number | null>(
    sampleThreads[0]?.id ?? null,
  );
  return (
    <AreaPanel
      title="Discussions"
      description="Community conversation threads and their replies."
      icon={MessagesSquare}
    >
      <ul data-ocid="os.sample.discussions.list" className="space-y-3">
        {sampleThreads.map((thread, index) => {
          const open = thread.id === openId;
          return (
            <li
              key={thread.id}
              data-ocid={`os.sample.discussions.item.${index + 1}`}
              className="rounded-lg border border-border bg-card"
            >
              <button
                type="button"
                data-ocid={`os.sample.discussions.toggle.${index + 1}`}
                aria-expanded={open}
                onClick={() => setOpenId(open ? null : thread.id)}
                className="os-focus-ring flex w-full min-h-[44px] items-center justify-between gap-3 p-3 text-left"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">
                    {thread.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    Started by {thread.author} · {thread.posts.length}{" "}
                    {thread.posts.length === 1 ? "reply" : "replies"}
                  </span>
                </span>
                <IllustrativeTag />
              </button>
              {open ? (
                <ul className="space-y-2 border-t border-border p-3">
                  {thread.posts.map((post) => (
                    <li key={post.id} className="space-y-0.5">
                      <p className="text-xs font-semibold text-foreground">
                        {post.author}
                      </p>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {post.body}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </AreaPanel>
  );
}

function MembersArea() {
  return (
    <AreaPanel
      title="Members"
      description="Who belongs to the Nation, their role and what it lets them do."
      icon={Users}
    >
      <ul data-ocid="os.sample.members.list" className="space-y-3">
        {sampleMembers.map((member, index) => (
          <li
            key={member.id}
            data-ocid={`os.sample.members.item.${index + 1}`}
            className="space-y-2 rounded-lg border border-border bg-card p-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span aria-hidden="true" className="avatar-chip">
                  {member.displayName
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {member.displayName}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {member.roleLabel}
                  </span>
                </span>
              </div>
              <IllustrativeTag />
            </div>
            <ul className="flex flex-wrap gap-1.5">
              {member.permissionLabels.map((label) => (
                <li
                  key={label}
                  className="rounded-sm border border-border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
                >
                  {label}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </AreaPanel>
  );
}

function DocumentsArea() {
  const [openId, setOpenId] = useState<number | null>(null);
  return (
    <AreaPanel
      title="Documents"
      description="Shared records and community knowledge."
      icon={FileText}
    >
      <ul data-ocid="os.sample.documents.list" className="space-y-3">
        {sampleDocuments.map((doc, index) => {
          const open = doc.id === openId;
          return (
            <li
              key={doc.id}
              data-ocid={`os.sample.documents.item.${index + 1}`}
              className="rounded-lg border border-border bg-card"
            >
              <button
                type="button"
                data-ocid={`os.sample.documents.toggle.${index + 1}`}
                aria-expanded={open}
                onClick={() => setOpenId(open ? null : doc.id)}
                className="os-focus-ring flex w-full min-h-[44px] items-center justify-between gap-3 p-3 text-left"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">
                    {doc.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {doc.author}
                  </span>
                </span>
                <IllustrativeTag />
              </button>
              {open ? (
                <p className="border-t border-border p-3 text-xs leading-relaxed text-muted-foreground">
                  {doc.body}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </AreaPanel>
  );
}

function CalendarArea() {
  return (
    <AreaPanel
      title="Calendar"
      description="Meetings, gatherings and events in the sample Nation."
      icon={CalendarDays}
    >
      <ul data-ocid="os.sample.calendar.list" className="space-y-3">
        {sampleEvents.map((event, index) => (
          <li
            key={event.id}
            data-ocid={`os.sample.calendar.item.${index + 1}`}
            className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card p-3"
          >
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-medium text-foreground">
                {event.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {event.description}
              </p>
              <p className="text-tabular text-xs text-muted-foreground">
                {event.startTime.replace("T", " · ")} · {event.location}
              </p>
            </div>
            <IllustrativeTag />
          </li>
        ))}
      </ul>
    </AreaPanel>
  );
}

function TreasuryArea() {
  return (
    <AreaPanel
      title="Treasury"
      description="Community income, spending and balance. Every figure is simulated."
      icon={Wallet}
    >
      <dl
        data-ocid="os.sample.treasury.metrics"
        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
      >
        <div className="rounded-lg border border-border bg-card p-3">
          <dt className="text-stamp text-muted-foreground">Total income</dt>
          <dd className="text-tabular mt-1 text-lg font-semibold text-foreground">
            ${sampleTreasurySummary.totalIncome.toLocaleString()}
          </dd>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <dt className="text-stamp text-muted-foreground">Total expense</dt>
          <dd className="text-tabular mt-1 text-lg font-semibold text-foreground">
            ${sampleTreasurySummary.totalExpense.toLocaleString()}
          </dd>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <dt className="text-stamp text-muted-foreground">Balance</dt>
          <dd className="text-tabular mt-1 text-lg font-semibold text-foreground">
            ${sampleTreasurySummary.balance.toLocaleString()}
          </dd>
        </div>
      </dl>
      <ul data-ocid="os.sample.treasury.list" className="space-y-2">
        {sampleTransactions.map((tx, index) => (
          <li
            key={tx.id}
            data-ocid={`os.sample.treasury.item.${index + 1}`}
            className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {tx.description}
              </p>
              <p className="text-xs text-muted-foreground">{tx.category}</p>
            </div>
            <span
              className={`text-tabular shrink-0 text-sm font-semibold ${
                tx.direction === "income"
                  ? "text-[oklch(var(--success))]"
                  : "text-foreground"
              }`}
            >
              {tx.direction === "income" ? "+" : "−"}$
              {tx.amount.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </AreaPanel>
  );
}

/**
 * The browsable content of the sample Nation: proposals, discussions, members,
 * documents, calendar events and treasury information, each in its own labelled
 * area. A tab strip switches between areas on every screen size.
 */
export default function SampleNationSections() {
  const [area, setArea] = useState<AreaKey>("proposals");

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label="Sample Nation content areas"
        data-ocid="os.sample.area_tabs"
        className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1"
      >
        {AREAS.map((entry) => {
          const active = entry.key === area;
          return (
            <button
              key={entry.key}
              type="button"
              role="tab"
              aria-selected={active}
              data-ocid={`os.sample.area_tab.${entry.key}`}
              onClick={() => setArea(entry.key)}
              className={`os-focus-ring inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-smooth ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-accent/60"
              }`}
            >
              <entry.icon className="size-4" aria-hidden="true" />
              {entry.label}
            </button>
          );
        })}
      </div>

      {area === "proposals" ? <ProposalsArea /> : null}
      {area === "discussions" ? <DiscussionsArea /> : null}
      {area === "members" ? <MembersArea /> : null}
      {area === "documents" ? <DocumentsArea /> : null}
      {area === "calendar" ? <CalendarArea /> : null}
      {area === "treasury" ? <TreasuryArea /> : null}
    </div>
  );
}
