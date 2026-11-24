import { Activity, CheckCircle2, Users } from "lucide-react";
import type { ReactNode } from "react";

import type { CensusSummary } from "@/backend";

/**
 * The Participation Census summary, in plain language. It answers the one
 * question an organization actually asks — how many people are taking part —
 * without exposing how any individual voted. The backend redacts confidential
 * detail before it reaches the UI, so this card only ever shows totals.
 */
export default function CensusSummaryCard({
  summary,
  isLoading,
  isError,
  onRetry,
}: {
  summary: CensusSummary | null;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  if (isLoading) {
    return (
      <section
        data-ocid="os.governance.members.census_loading"
        aria-busy="true"
        className="shell-panel h-32 animate-pulse bg-muted/40"
      />
    );
  }

  if (isError || !summary) {
    return (
      <section
        data-ocid="os.governance.members.census_error"
        role="alert"
        className="shell-panel space-y-3 p-4"
      >
        <p className="font-display text-base font-medium text-foreground">
          The participation summary could not be loaded.
        </p>
        <p className="text-sm text-muted-foreground">
          Check your connection and try again.
        </p>
        <button
          type="button"
          data-ocid="os.governance.members.census_retry_button"
          onClick={onRetry}
          className="os-focus-ring inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-smooth hover:opacity-90"
        >
          Try again
        </button>
      </section>
    );
  }

  const eligible = Number(summary.eligibleMembers);
  const active = Number(summary.activeMembers);
  const percent = eligible > 0 ? Math.round((active / eligible) * 100) : 0;

  return (
    <section
      data-ocid="os.governance.members.census_summary"
      aria-label="Participation summary"
      className="shell-panel space-y-4 p-4"
    >
      <div className="space-y-1">
        <p className="text-stamp text-accent">Participation</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          How many people in your organization are taking part. Individual
          choices stay private.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat
          icon={<Users className="size-4" aria-hidden="true" />}
          label="People who can take part"
          value={eligible}
          ocid="os.governance.members.census_eligible"
        />
        <Stat
          icon={<CheckCircle2 className="size-4" aria-hidden="true" />}
          label="People taking part"
          value={active}
          ocid="os.governance.members.census_active"
        />
      </div>

      <div className="space-y-2">
        <div
          className="gov-progress-track"
          role="progressbar"
          tabIndex={0}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label={`${active} of ${eligible} people are taking part`}
        >
          <div className="gov-progress-fill" style={{ width: `${percent}%` }} />
        </div>
        <p
          data-ocid="os.governance.members.census_percent"
          className="text-sm leading-relaxed text-muted-foreground"
        >
          {eligible === 0
            ? "No one can take part yet. Let people in to get started."
            : `${active} of ${eligible} people are taking part (${percent}%).`}
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-2 border-t border-border pt-3 sm:grid-cols-4">
        <MiniStat label="Decisions" value={summary.proposals} />
        <MiniStat label="Votes" value={summary.votes} />
        <MiniStat label="Actions carried out" value={summary.executions} />
        <MiniStat label="Reviews" value={summary.disputes} />
      </ul>
    </section>
  );
}

/** One large, plain-language statistic. */
function Stat({
  icon,
  label,
  value,
  ocid,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  ocid: string;
}) {
  return (
    <div className="rounded-md border border-border bg-muted/40 p-3">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs leading-snug">{label}</span>
      </span>
      <p
        data-ocid={ocid}
        className="text-tabular mt-1.5 font-display text-2xl font-semibold text-foreground"
      >
        {value}
      </p>
    </div>
  );
}

/** One small supporting count. */
function MiniStat({ label, value }: { label: string; value: bigint }) {
  return (
    <li className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Activity className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="text-tabular font-medium text-foreground">
        {Number(value)}
      </span>
      <span className="min-w-0 truncate">{label}</span>
    </li>
  );
}
