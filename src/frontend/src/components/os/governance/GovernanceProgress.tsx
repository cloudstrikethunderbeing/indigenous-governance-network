import { Check } from "lucide-react";

import {
  type GovernanceViewKey,
  governanceViews,
} from "@/components/os/governance/governanceSections";

/**
 * The visual governance setup progress indicator. It shows how complete the
 * organization's rules are as a plain percentage and a short checklist, so a
 * member can see at a glance what is still missing.
 */
export default function GovernanceProgress({
  completed,
  compact = false,
}: {
  /** The governance views that are already set up. */
  completed: GovernanceViewKey[];
  /** Render a slimmer bar without the checklist, for tight layouts. */
  compact?: boolean;
}) {
  const done = new Set(completed);
  const total = governanceViews.length;
  const doneCount = governanceViews.filter((view) => done.has(view.key)).length;
  const percent = Math.round((doneCount / total) * 100);

  return (
    <section
      data-ocid="os.governance.progress"
      aria-label="Governance setup progress"
      className="shell-panel space-y-3 p-4"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-stamp text-accent">Setup progress</p>
        <p
          data-ocid="os.governance.progress_percent"
          className="text-tabular text-sm font-semibold text-foreground"
        >
          {percent}% complete
        </p>
      </div>

      <div
        className="gov-progress-track"
        role="progressbar"
        tabIndex={0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label={`${doneCount} of ${total} governance areas set up`}
      >
        <div className="gov-progress-fill" style={{ width: `${percent}%` }} />
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        {doneCount === total
          ? "Every part of your rules is set up. Your organization is ready."
          : `${doneCount} of ${total} areas are set up. Finish the rest whenever you are ready.`}
      </p>

      {compact ? null : (
        <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {governanceViews.map((view) => {
            const isDone = done.has(view.key);
            return (
              <li
                key={view.key}
                data-ocid={`os.governance.progress_item.${view.key}`}
                className="flex items-center gap-2 text-sm"
              >
                <span
                  aria-hidden="true"
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                    isDone
                      ? "border-transparent bg-success text-success-foreground"
                      : "border-border bg-muted text-muted-foreground"
                  }`}
                >
                  {isDone ? <Check className="size-3" /> : null}
                </span>
                <span
                  className={
                    isDone ? "text-foreground" : "text-muted-foreground"
                  }
                >
                  {view.label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
