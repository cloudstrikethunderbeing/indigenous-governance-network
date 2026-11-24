import {
  BookOpenCheck,
  CheckCircle2,
  Gavel,
  ScrollText,
  UserPlus,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo } from "react";

import type { Principal } from "@icp-sdk/core/principal";

import type { GovernanceHistoryEntry, GovernanceHistoryKind } from "@/backend";
import {
  formatDateTime,
  personLabel,
} from "@/components/os/governance/activity/activityLabels";

/** The icon, label and colour for each kind of recorded governance event. */
const KIND_META: Record<
  GovernanceHistoryKind,
  { icon: LucideIcon; label: string; className: string }
> = {
  appointment: {
    icon: UserPlus,
    label: "Appointment",
    className: "bg-accent/10 text-accent",
  },
  acceptance: {
    icon: CheckCircle2,
    label: "Acceptance",
    className: "bg-success/10 text-success",
  },
  approval: {
    icon: CheckCircle2,
    label: "Approval",
    className: "bg-success/10 text-success",
  },
  rejection: {
    icon: XCircle,
    label: "Rejection",
    className: "bg-destructive/10 text-destructive",
  },
  vote: {
    icon: Gavel,
    label: "Vote",
    className: "bg-primary/10 text-primary",
  },
  amendment: {
    icon: ScrollText,
    label: "Amendment",
    className: "bg-warning/10 text-warning",
  },
};

/** A friendly name for the person who acted, using a member name when known. */
function actorLabel(principal: Principal, names: Map<string, string>): string {
  return names.get(principal.toText()) ?? personLabel(principal);
}

/**
 * The append-only governance history for one Nation: every appointment,
 * acceptance, approval, rejection, vote and constitutional amendment, newest
 * first, each stating who acted and when. It is read-only — entries are never
 * edited or removed here.
 */
export default function GovernanceHistoryPanel({
  entries,
  memberNames,
  isLoading,
  isError,
  onRetry,
}: {
  entries: GovernanceHistoryEntry[];
  /** Display names keyed by principal text, so people read by name. */
  memberNames: Map<string, string>;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  const sorted = useMemo(
    () => [...entries].sort((a, b) => Number(b.timestamp - a.timestamp)),
    [entries],
  );

  if (isLoading) {
    return (
      <div
        data-ocid="os.governance.history.loading_state"
        className="space-y-3"
        aria-busy="true"
      >
        {Array.from({ length: 4 }, (_, i) => `history-skeleton-${i}`).map(
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
        data-ocid="os.governance.history.error_state"
        role="alert"
        className="shell-panel space-y-3 p-5"
      >
        <p className="font-display text-base font-medium text-foreground">
          The governance history could not be loaded.
        </p>
        <p className="text-sm text-muted-foreground">
          Check your connection and try again.
        </p>
        <button
          type="button"
          data-ocid="os.governance.history.retry_button"
          onClick={onRetry}
          className="os-focus-ring inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-smooth hover:opacity-90"
        >
          Try again
        </button>
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div
        data-ocid="os.governance.history.empty_state"
        className="shell-panel space-y-3 p-6 text-center"
      >
        <BookOpenCheck
          className="mx-auto size-8 text-accent"
          aria-hidden="true"
        />
        <p className="font-display text-base font-medium text-foreground">
          No governance history yet
        </p>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          Appointments, acceptances, approvals, rejections, votes and rule
          changes are recorded here as they happen, and can never be edited or
          removed.
        </p>
      </div>
    );
  }

  return (
    <ol
      data-ocid="os.governance.history.list"
      className="space-y-3"
      aria-label="Governance history"
    >
      {sorted.map((entry, index) => {
        const meta = KIND_META[entry.kind];
        const Icon = meta.icon;
        return (
          <li
            key={entry.id.toString()}
            data-ocid={`os.governance.history.item.${index + 1}`}
            className="shell-panel flex items-start gap-3 p-4"
          >
            <span
              aria-hidden="true"
              className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full ${meta.className}`}
            >
              <Icon className="size-5" />
            </span>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-stamp text-accent">{meta.label}</p>
              <p className="text-sm font-medium leading-relaxed text-foreground">
                {entry.summary}
              </p>
              <p className="text-xs text-muted-foreground">
                {actorLabel(entry.actorPrincipal, memberNames)} ·{" "}
                {formatDateTime(entry.timestamp)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
