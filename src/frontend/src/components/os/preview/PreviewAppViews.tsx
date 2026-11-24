import {
  CalendarDays,
  FileText,
  FolderOpen,
  Gavel,
  MessagesSquare,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import {
  sampleDocuments,
  sampleEvents,
  sampleMembers,
  sampleNation,
  sampleProposals,
  sampleThreads,
  sampleTransactions,
  sampleTreasurySummary,
} from "@/data/sampleNation";

/** A compact illustrative-data stamp shown on every preview record. */
function IllustrativeTag() {
  return (
    <span className="text-stamp shrink-0 rounded-sm border border-dashed border-accent px-1.5 py-0.5 text-accent-foreground">
      Illustrative
    </span>
  );
}

/** A labelled panel inside a preview app view. */
function PreviewPanel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="size-4 shrink-0 text-accent" aria-hidden="true" />
        <h3 className="font-display text-base font-medium tracking-tight text-foreground">
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

/** Format an ISO date-time string as a short, readable date. */
function formatEventDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Date to be confirmed";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function DashboardView() {
  const openProposals = sampleProposals.filter((p) => p.status === "open");
  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <p className="text-stamp text-accent">{sampleNation.region}</p>
        <h2 className="font-display text-xl font-medium tracking-tight text-foreground">
          Welcome to {sampleNation.name}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {sampleNation.shortDescription}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="shell-panel p-3">
          <p className="text-stamp text-muted-foreground">Open proposals</p>
          <p className="text-tabular mt-1 text-xl font-semibold text-foreground">
            {openProposals.length}
          </p>
        </div>
        <div className="shell-panel p-3">
          <p className="text-stamp text-muted-foreground">Members</p>
          <p className="text-tabular mt-1 text-xl font-semibold text-foreground">
            {sampleMembers.length}
          </p>
        </div>
        <div className="shell-panel p-3">
          <p className="text-stamp text-muted-foreground">Documents</p>
          <p className="text-tabular mt-1 text-xl font-semibold text-foreground">
            {sampleDocuments.length}
          </p>
        </div>
        <div className="shell-panel p-3">
          <p className="text-stamp text-muted-foreground">Balance</p>
          <p className="text-tabular mt-1 text-xl font-semibold text-foreground">
            ${sampleTreasurySummary.balance.toLocaleString()}
          </p>
        </div>
      </div>

      <PreviewPanel title="Open proposals" icon={Gavel}>
        <ul className="space-y-3">
          {openProposals.map((proposal) => {
            const total =
              proposal.votesInFavor +
              proposal.votesAgainst +
              proposal.votesAbstain;
            const yesPercent =
              total > 0 ? Math.round((proposal.votesInFavor / total) * 100) : 0;
            return (
              <li
                key={proposal.id}
                className="space-y-2 rounded-lg border border-border bg-card p-3"
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
      </PreviewPanel>

      <PreviewPanel title="Upcoming events" icon={CalendarDays}>
        <ul className="space-y-2">
          {sampleEvents.map((event) => (
            <li
              key={event.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card p-3"
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
      </PreviewPanel>
    </div>
  );
}

function GovernanceView() {
  return (
    <PreviewPanel title="Proposals" icon={Gavel}>
      <ul className="space-y-3">
        {sampleProposals.map((proposal) => {
          const total =
            proposal.votesInFavor +
            proposal.votesAgainst +
            proposal.votesAbstain;
          const yesPercent =
            total > 0 ? Math.round((proposal.votesInFavor / total) * 100) : 0;
          return (
            <li
              key={proposal.id}
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
    </PreviewPanel>
  );
}

function DiscussionsView() {
  return (
    <PreviewPanel title="Threads" icon={MessagesSquare}>
      <ul className="space-y-3">
        {sampleThreads.map((thread) => (
          <li
            key={thread.id}
            className="space-y-2 rounded-lg border border-border bg-card p-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h4 className="min-w-0 text-sm font-medium text-foreground">
                {thread.title}
              </h4>
              <IllustrativeTag />
            </div>
            <p className="text-xs text-muted-foreground">
              Started by {thread.author} · {thread.posts.length}{" "}
              {thread.posts.length === 1 ? "reply" : "replies"}
            </p>
            <ul className="space-y-2 border-t border-border pt-2">
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
          </li>
        ))}
      </ul>
    </PreviewPanel>
  );
}

function MembersView() {
  return (
    <PreviewPanel title="Members" icon={Users}>
      <ul className="space-y-3">
        {sampleMembers.map((member) => (
          <li
            key={member.id}
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
    </PreviewPanel>
  );
}

function DocumentsView() {
  return (
    <PreviewPanel title="Documents" icon={FileText}>
      <ul className="space-y-3">
        {sampleDocuments.map((doc) => (
          <li
            key={doc.id}
            className="space-y-2 rounded-lg border border-border bg-card p-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h4 className="min-w-0 text-sm font-medium text-foreground">
                {doc.title}
              </h4>
              <IllustrativeTag />
            </div>
            <p className="text-xs text-muted-foreground">{doc.author}</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {doc.body}
            </p>
          </li>
        ))}
      </ul>
    </PreviewPanel>
  );
}

function CalendarView() {
  return (
    <PreviewPanel title="Events" icon={CalendarDays}>
      <ul className="space-y-3">
        {sampleEvents.map((event) => (
          <li
            key={event.id}
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
    </PreviewPanel>
  );
}

function TreasuryView() {
  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="shell-panel p-3">
          <dt className="text-stamp text-muted-foreground">Total income</dt>
          <dd className="text-tabular mt-1 text-lg font-semibold text-foreground">
            ${sampleTreasurySummary.totalIncome.toLocaleString()}
          </dd>
        </div>
        <div className="shell-panel p-3">
          <dt className="text-stamp text-muted-foreground">Total expense</dt>
          <dd className="text-tabular mt-1 text-lg font-semibold text-foreground">
            ${sampleTreasurySummary.totalExpense.toLocaleString()}
          </dd>
        </div>
        <div className="shell-panel p-3">
          <dt className="text-stamp text-muted-foreground">Balance</dt>
          <dd className="text-tabular mt-1 text-lg font-semibold text-foreground">
            ${sampleTreasurySummary.balance.toLocaleString()}
          </dd>
        </div>
      </dl>
      <PreviewPanel title="Transactions" icon={Wallet}>
        <ul className="space-y-2">
          {sampleTransactions.map((tx) => (
            <li
              key={tx.id}
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
      </PreviewPanel>
    </div>
  );
}

function FilesView() {
  const folders = [
    { name: "Governance", count: 6 },
    { name: "Research", count: 12 },
    { name: "Community", count: 9 },
    { name: "Stewardship", count: 4 },
  ];
  return (
    <div className="space-y-4">
      <PreviewPanel title="Folders" icon={FolderOpen}>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {folders.map((folder) => (
            <li
              key={folder.name}
              className="file-card items-center text-center"
            >
              <span
                className="file-type-glyph file-glyph-folder"
                aria-hidden="true"
              >
                <FolderOpen className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-foreground">
                  {folder.name}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {folder.count} items
                </span>
              </span>
            </li>
          ))}
        </ul>
      </PreviewPanel>
      <PreviewPanel title="Recent files" icon={FileText}>
        <ul className="space-y-2">
          {sampleDocuments.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
            >
              <span
                className="file-type-glyph file-glyph-doc"
                aria-hidden="true"
              >
                <FileText className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">
                  {doc.title}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {doc.author}
                </span>
              </span>
              <IllustrativeTag />
            </li>
          ))}
        </ul>
      </PreviewPanel>
    </div>
  );
}

/** Render the content view for one preview app key. */
export function PreviewAppView({ appKey }: { appKey: string }) {
  switch (appKey) {
    case "governance":
      return <GovernanceView />;
    case "discussions":
      return <DiscussionsView />;
    case "members":
      return <MembersView />;
    case "documents":
      return <DocumentsView />;
    case "calendar":
      return <CalendarView />;
    case "treasury":
      return <TreasuryView />;
    case "files":
      return <FilesView />;
    default:
      return <DashboardView />;
  }
}
