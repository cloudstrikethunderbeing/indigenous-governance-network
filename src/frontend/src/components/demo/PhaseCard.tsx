import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import type { PhaseDefinition, PhaseStatus } from "@/data/demoData";

const statusClass: Record<PhaseStatus, string> = {
  Proposed: "badge-stage-proposed",
  Demo: "badge-stage-demo",
  "Future Development": "badge-stage-future",
};

const nodeClass: Record<PhaseStatus, string> = {
  Proposed: "phase-node phase-node-active",
  Demo: "phase-node phase-node-demo",
  "Future Development": "phase-node phase-node-future",
};

/**
 * One phase on the roadmap rail: numbered node, serif title, one-sentence
 * explanation, status stamp and a link into the interactive preview.
 */
export default function PhaseCard({ phase }: { phase: PhaseDefinition }) {
  return (
    <li
      data-ocid={`roadmap.phase.${phase.ocid}`}
      className="relative flex gap-4 sm:gap-6"
    >
      <div className="flex flex-col items-center">
        <span className={nodeClass[phase.status]} aria-hidden="true">
          {phase.index}
        </span>
        <span className="phase-rail mt-2 w-px flex-1" aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1 pb-8">
        <div className="rounded-lg border border-border bg-card p-5 shadow-subtle transition-smooth hover:shadow-elevated sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-2xl font-medium tracking-tight text-foreground md:text-3xl">
              {phase.title}
            </h3>
            <span className={statusClass[phase.status]}>{phase.status}</span>
          </div>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground sm:text-base">
            {phase.summary}
          </p>
          <Link
            to={phase.to}
            data-ocid={`roadmap.phase_link.${phase.ocid}`}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-smooth hover:gap-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Open interactive preview
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </li>
  );
}
