import { AlertCircle, Loader2 } from "lucide-react";

import { useVisitorAnalytics } from "@/hooks/useQueries";

import WeeklyChallengeConfig from "./WeeklyChallengeConfig";

/** A single labelled metric in the analytics grid. */
function Metric({
  label,
  value,
  ocid,
}: {
  label: string;
  value: string;
  ocid: string;
}) {
  return (
    <div data-ocid={ocid} className="shell-panel-alt flex flex-col gap-1 p-4">
      <span className="text-stamp text-muted-foreground">{label}</span>
      <span className="text-tabular text-2xl font-semibold text-foreground">
        {value}
      </span>
    </div>
  );
}

/** Format a percentage the backend returned, without inventing precision. */
function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Visitor Analytics — popup impressions, challenge starts and completions,
 * answer distributions, comment counts, returning visitors and conversion.
 * Every figure is the value the backend returned; nothing is estimated.
 */
export default function VisitorAnalyticsSection() {
  const { data, isLoading, isError } = useVisitorAnalytics();

  if (isLoading) {
    return (
      <output
        data-ocid="engagement.analytics.loading_state"
        className="flex items-center gap-2 text-sm text-muted-foreground"
      >
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Loading visitor analytics…
      </output>
    );
  }

  if (isError || !data) {
    return (
      <p
        data-ocid="engagement.analytics.error_state"
        role="alert"
        className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
      >
        <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
        Visitor analytics could not be loaded. Please try again.
      </p>
    );
  }

  const { totals, conversion, returningVisitors, answerDistribution } = data;
  const distributionTotal = Number(answerDistribution.totalResponses);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Metric
          label="Popup impressions"
          value={totals.impressions.toString()}
          ocid="engagement.analytics.impressions"
        />
        <Metric
          label="Challenge starts"
          value={totals.challengeStarts.toString()}
          ocid="engagement.analytics.starts"
        />
        <Metric
          label="Completions"
          value={totals.challengeCompletions.toString()}
          ocid="engagement.analytics.completions"
        />
        <Metric
          label="Comments"
          value={totals.comments.toString()}
          ocid="engagement.analytics.comments"
        />
        <Metric
          label="Reports"
          value={totals.reports.toString()}
          ocid="engagement.analytics.reports"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section
          data-ocid="engagement.analytics.conversion"
          aria-label="Participation conversion"
          className="shell-panel p-4 sm:p-5"
        >
          <h3 className="font-display text-base font-medium tracking-tight text-foreground">
            Participation conversion
          </h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Start rate</dt>
              <dd className="text-tabular font-medium text-foreground">
                {formatPercent(conversion.startRatePercent)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Completion rate</dt>
              <dd className="text-tabular font-medium text-foreground">
                {formatPercent(conversion.completionRatePercent)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Starts from impressions</dt>
              <dd className="text-tabular font-medium text-foreground">
                {conversion.starts.toString()} /{" "}
                {conversion.impressions.toString()}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Completions from starts</dt>
              <dd className="text-tabular font-medium text-foreground">
                {conversion.completions.toString()} /{" "}
                {conversion.starts.toString()}
              </dd>
            </div>
          </dl>
        </section>

        <section
          data-ocid="engagement.analytics.returning"
          aria-label="Returning visitors"
          className="shell-panel p-4 sm:p-5"
        >
          <h3 className="font-display text-base font-medium tracking-tight text-foreground">
            Returning visitors
          </h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Distinct sessions</dt>
              <dd className="text-tabular font-medium text-foreground">
                {returningVisitors.distinctSessions.toString()}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">New sessions</dt>
              <dd className="text-tabular font-medium text-foreground">
                {returningVisitors.newSessions.toString()}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Returning sessions</dt>
              <dd className="text-tabular font-medium text-foreground">
                {returningVisitors.returningSessions.toString()}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <section
        data-ocid="engagement.analytics.distribution"
        aria-label="Answer distribution"
        className="shell-panel p-4 sm:p-5"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-base font-medium tracking-tight text-foreground">
            Answer distribution
          </h3>
          <span className="text-stamp text-muted-foreground">
            {answerDistribution.weekKey}
          </span>
        </div>

        {answerDistribution.entries.length === 0 ? (
          <p
            data-ocid="engagement.analytics.distribution_empty_state"
            className="mt-4 text-sm text-muted-foreground"
          >
            No challenge responses have been recorded yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {answerDistribution.entries.map((entry, index) => {
              const count = Number(entry.count);
              const share =
                distributionTotal > 0 ? (count / distributionTotal) * 100 : 0;
              const segment = (index % 5) + 1;
              return (
                <li
                  key={entry.optionId.toString()}
                  data-ocid={`engagement.analytics.distribution_row.${index + 1}`}
                  className="space-y-2"
                >
                  <div className="flex items-baseline justify-between gap-4 text-sm">
                    <span className="min-w-0 truncate text-foreground">
                      {entry.labelText}
                    </span>
                    <span className="text-tabular shrink-0 text-muted-foreground">
                      {count} · {share.toFixed(1)}%
                    </span>
                  </div>
                  <div
                    className="challenge-track"
                    role="img"
                    aria-label={`${entry.labelText}: ${count} responses, ${share.toFixed(1)} percent`}
                  >
                    <div
                      className={`distribution-seg-${segment}`}
                      style={{ width: `${share}%`, height: "100%" }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <WeeklyChallengeConfig />
    </div>
  );
}
