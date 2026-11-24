import { Activity } from "lucide-react";

import {
  censusMetrics,
  censusQuorumPercent,
} from "@/components/os/constitution-demo/demoScenarios";

/**
 * Step 6 — A live example Participation Census.
 *
 * A fictional, live count of who took part: eligible and active members, votes
 * cast, proposals, decisions carried out and appeals filed. It counts
 * participation without exposing any member's private choices.
 */
export default function ParticipationCensusStep() {
  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <p className="text-stamp text-accent">Step 6 · Participation Census</p>
        <h3 className="font-display text-xl font-medium tracking-tight text-foreground md:text-2xl">
          A live count of who took part
        </h3>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          The census shows how many members took part in each kind of decision.
          It counts participation only — never how any member voted.
        </p>
      </header>

      <section
        data-ocid="constitution_demo.census.panel"
        aria-label="Participation Census"
        className="gov-constitution space-y-4 p-5"
      >
        <div className="flex items-center gap-2">
          <Activity className="size-5 text-accent" aria-hidden="true" />
          <p className="text-stamp text-accent">Live example</p>
        </div>

        <ul className="space-y-4">
          {censusMetrics.map((metric) => {
            const percent = Math.round((metric.value / metric.total) * 100);
            return (
              <li
                key={metric.key}
                data-ocid={`constitution_demo.census.metric.${metric.key}`}
                className="space-y-1.5"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {metric.label}
                  </span>
                  <span className="text-tabular text-sm font-semibold text-foreground">
                    {metric.value} of {metric.total}
                  </span>
                </div>
                <div className="gov-census-track" aria-hidden="true">
                  <div
                    className="gov-census-fill"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {metric.note}
                </p>
              </li>
            );
          })}
        </ul>

        <p className="border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
          A vote counts when at least {censusQuorumPercent}% of eligible members
          take part. This is a demonstration with fictional data.
        </p>
      </section>
    </div>
  );
}
