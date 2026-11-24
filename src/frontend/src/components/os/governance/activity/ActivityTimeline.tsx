import {
  BookOpenCheck,
  Gavel,
  Scale,
  ScrollText,
  ShieldCheck,
  Users,
  Vote,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  type TimelineEntry,
  type TimelineKind,
  entryWhen,
} from "@/components/os/governance/activity/useActivityTimeline";

/** The icon and colour for each kind of timeline entry. */
const kindMeta: Record<TimelineKind, { icon: LucideIcon; label: string }> = {
  decision: { icon: Gavel, label: "Decision" },
  vote: { icon: Vote, label: "Vote" },
  member: { icon: Users, label: "Member" },
  rule: { icon: ScrollText, label: "Rules" },
  appeal: { icon: Scale, label: "Appeal" },
  execution: { icon: ShieldCheck, label: "Action" },
};

/**
 * The organization's activity timeline: one plain-language list of what has
 * happened, newest first. Each entry states in one short sentence what
 * happened, who did it and when, with no technical identifier shown.
 */
export default function ActivityTimeline({
  entries,
  isLoading,
  isError,
  onRetry,
}: {
  entries: TimelineEntry[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  if (isLoading) {
    return (
      <div
        data-ocid="os.governance.activity.loading_state"
        className="space-y-3"
        aria-busy="true"
      >
        {Array.from({ length: 4 }, (_, i) => `activity-skeleton-${i}`).map(
          (id) => (
            <div
              key={id}
              className="shell-panel h-20 animate-pulse bg-muted/40"
            />
          ),
        )}
      </div>
    );
  }

  if (isError) {
    return (
      <div
        data-ocid="os.governance.activity.error_state"
        role="alert"
        className="shell-panel space-y-3 p-5"
      >
        <p className="font-display text-base font-medium text-foreground">
          The activity could not be loaded.
        </p>
        <p className="text-sm text-muted-foreground">
          Check your connection and try again.
        </p>
        <button
          type="button"
          data-ocid="os.governance.activity.retry_button"
          onClick={onRetry}
          className="os-focus-ring inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-smooth hover:opacity-90"
        >
          Try again
        </button>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div
        data-ocid="os.governance.activity.empty_state"
        className="shell-panel space-y-3 p-6 text-center"
      >
        <BookOpenCheck
          className="mx-auto size-8 text-accent"
          aria-hidden="true"
        />
        <p className="font-display text-base font-medium text-foreground">
          Nothing has happened yet
        </p>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          When your community makes decisions, votes, changes members or rules,
          or reviews an appeal, each event appears here in plain language.
        </p>
      </div>
    );
  }

  return (
    <ol
      data-ocid="os.governance.activity.timeline"
      className="space-y-3"
      aria-label="Organization activity"
    >
      {entries.map((entry, index) => {
        const meta = kindMeta[entry.kind];
        const Icon = meta.icon;
        return (
          <li
            key={entry.id}
            data-ocid={`os.governance.activity.item.${index + 1}`}
            className="shell-panel flex items-start gap-3 p-4"
          >
            <span
              aria-hidden="true"
              className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent"
            >
              <Icon className="size-5" />
            </span>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-stamp text-accent">{meta.label}</p>
              <p className="text-sm font-medium leading-relaxed text-foreground">
                {entry.what}
              </p>
              <p className="text-xs text-muted-foreground">
                {entry.who} · {entryWhen(entry.timestamp)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
