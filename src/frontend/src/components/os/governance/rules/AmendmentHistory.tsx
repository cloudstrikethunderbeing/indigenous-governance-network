import { History } from "lucide-react";

import type { Amendment } from "@/backend";
import {
  formatRuleValue,
  ruleExplanations,
  ruleGroups,
} from "@/components/os/governance/rules/ruleExplanations";

/** Convert a backend nanosecond timestamp to a readable date, or null. */
function formatTimestamp(timestamp: bigint): string | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * The amendment history: every change the organization has made to its rules.
 * Each amendment shows when it was made and the rules that were in effect at
 * that time, so a past decision is always read under the rules that applied
 * when it happened.
 */
export default function AmendmentHistory({
  amendments,
  isLoading,
  isError,
  onRetry,
}: {
  amendments: Amendment[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  if (isLoading) {
    return (
      <section
        data-ocid="os.governance.rules.amendments_loading"
        aria-busy="true"
        className="space-y-3"
      >
        {Array.from({ length: 2 }, (_, i) => `amendment-skeleton-${i}`).map(
          (id) => (
            <div
              key={id}
              className="shell-panel h-24 animate-pulse bg-muted/40"
            />
          ),
        )}
      </section>
    );
  }

  if (isError) {
    return (
      <section
        data-ocid="os.governance.rules.amendments_error"
        role="alert"
        className="shell-panel space-y-3 p-5"
      >
        <p className="font-display text-base font-medium text-foreground">
          The amendment history could not be loaded.
        </p>
        <p className="text-sm text-muted-foreground">
          Check your connection and try again.
        </p>
        <button
          type="button"
          data-ocid="os.governance.rules.amendments_retry_button"
          onClick={onRetry}
          className="os-focus-ring inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-smooth hover:opacity-90"
        >
          Try again
        </button>
      </section>
    );
  }

  if (amendments.length === 0) {
    return (
      <section
        data-ocid="os.governance.rules.amendments_empty_state"
        className="shell-panel space-y-2 p-5"
      >
        <p className="font-display text-base font-medium text-foreground">
          No changes yet
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          These rules have not been changed since they were first agreed. When
          the community amends them, every change will appear here.
        </p>
      </section>
    );
  }

  return (
    <ol data-ocid="os.governance.rules.amendment_list" className="space-y-4">
      {amendments.map((amendment, index) => (
        <li key={amendment.id.toString()}>
          <AmendmentCard amendment={amendment} position={index + 1} />
        </li>
      ))}
    </ol>
  );
}

/** One amendment: when it was made and the rules in effect at that time. */
function AmendmentCard({
  amendment,
  position,
}: {
  amendment: Amendment;
  position: number;
}) {
  const madeOn = formatTimestamp(amendment.timestamp);
  const previousGroups = ruleGroups
    .map((group) => ({
      group,
      fields: group.fields.filter(
        (field) => formatRuleValue(field, amendment.previousRules) !== "",
      ),
    }))
    .filter((entry) => entry.fields.length > 0);

  return (
    <article
      data-ocid={`os.governance.rules.amendment.${position}`}
      className="shell-panel space-y-4 p-4 md:p-5"
    >
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="gov-role-chip">
            <History className="size-3.5" aria-hidden="true" />
            Version {amendment.resultingVersion.toString()}
          </span>
          <span className="text-stamp text-muted-foreground">
            {madeOn ?? "Date unavailable"}
          </span>
        </div>
        <h3 className="font-display text-base font-medium text-foreground">
          {amendment.summary}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          This change replaced version {amendment.previousVersion.toString()}.
          The rules below are the ones that were in effect when this decision
          was made.
        </p>
      </header>

      <details className="group">
        <summary className="os-focus-ring flex min-h-[44px] cursor-pointer list-none items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-smooth hover:border-accent">
          <span className="text-accent">Rules in effect at that time</span>
          <span className="ml-auto text-xs text-muted-foreground group-open:hidden">
            Show
          </span>
          <span className="ml-auto hidden text-xs text-muted-foreground group-open:inline">
            Hide
          </span>
        </summary>
        <div className="mt-3 space-y-4">
          {previousGroups.map(({ group, fields }) => (
            <div key={group.key} className="space-y-2">
              <p className="text-stamp text-accent">{group.label}</p>
              <dl className="space-y-2">
                {fields.map((field) => (
                  <div
                    key={field}
                    className="grid grid-cols-1 gap-0.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] sm:gap-3"
                  >
                    <dt className="text-sm font-medium text-foreground">
                      {ruleExplanations[field].label}
                    </dt>
                    <dd className="text-sm leading-relaxed text-muted-foreground">
                      {formatRuleValue(field, amendment.previousRules)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </details>
    </article>
  );
}
