import { useMemo } from "react";

import type { CensusSummary } from "@/backend";

/** One plain-language statistic about who took part. */
interface StatTile {
  key: string;
  label: string;
  value: bigint;
}

/**
 * A compact, plain-language summary of who took part in the organization. It
 * counts participation without ever showing how an individual voted, and it
 * keeps another organization's records out of view. It sits above the timeline
 * so the Activity section stays a single, readable view.
 */
export default function ParticipationSummary({
  summary,
  isLoading,
}: {
  summary: CensusSummary | null;
  isLoading: boolean;
}) {
  const stats = useMemo<StatTile[]>(() => {
    if (!summary) return [];
    return [
      { key: "eligible", label: "Members", value: summary.eligibleMembers },
      { key: "active", label: "Took part", value: summary.activeMembers },
      { key: "proposals", label: "Decisions", value: summary.proposals },
      { key: "votes", label: "Votes", value: summary.votes },
      { key: "disputes", label: "Appeals", value: summary.disputes },
      {
        key: "executions",
        label: "Actions carried out",
        value: summary.executions,
      },
    ];
  }, [summary]);

  if (isLoading) {
    return (
      <div
        data-ocid="os.governance.activity.summary_loading"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
        aria-busy="true"
      >
        {Array.from({ length: 6 }, (_, i) => `summary-skeleton-${i}`).map(
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

  if (stats.length === 0) return null;

  return (
    <section
      data-ocid="os.governance.activity.summary"
      aria-label="Participation summary"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
    >
      {stats.map((stat) => (
        <div
          key={stat.key}
          data-ocid={`os.governance.activity.summary_stat.${stat.key}`}
          className="shell-panel space-y-1 p-3"
        >
          <p className="text-tabular font-display text-2xl font-semibold text-foreground">
            {stat.value.toString()}
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {stat.label}
          </p>
        </div>
      ))}
    </section>
  );
}
