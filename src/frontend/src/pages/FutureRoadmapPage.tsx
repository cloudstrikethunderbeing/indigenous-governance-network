import { CircleDashed } from "lucide-react";

import Panel from "@/components/dashboard/Panel";
import { futureRoadmap } from "@/data/demoData";

/**
 * Future Roadmap — Stage 3 and beyond.
 *
 * Display-only: every item is a future possibility, not a built feature. No
 * backend call is made and nothing is persisted. All copy comes from the
 * static simulated data module.
 */
export default function FutureRoadmapPage() {
  return (
    <div data-ocid="page.future_roadmap" className="space-y-6">
      <header className="space-y-3">
        <p className="text-stamp text-accent">Future Development</p>
        <h1 className="font-display text-2xl font-medium tracking-tight text-foreground md:text-3xl">
          Real Decentralization
        </h1>
        <div className="rule-accent" aria-hidden="true" />
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          What could follow the initial $500,000 funding campaign and the
          development stages it pays for. Every item below is a future
          possibility — none of it is built, funded or approved today.
        </p>
      </header>

      <Panel
        title="Possible later stages"
        ocid="future_roadmap.section"
        action={<span className="badge-stage-future">Not built yet</span>}
      >
        <ul
          data-ocid="future_roadmap.list"
          className="grid gap-3 sm:grid-cols-2"
        >
          {futureRoadmap.map((item, index) => (
            <li
              key={item.id}
              data-ocid={`future_roadmap.item.${index + 1}`}
              className="shell-panel-alt flex gap-3 p-4 transition-smooth hover:border-primary/40 sm:p-5"
            >
              <CircleDashed
                className="mt-0.5 size-4 shrink-0 text-accent"
                aria-hidden="true"
              />
              <div className="min-w-0 space-y-1.5">
                <h3 className="font-display text-base font-medium leading-snug text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <aside
        data-ocid="future_roadmap.disclaimer"
        className="shell-panel-alt border-dashed border-accent bg-accent/10 p-4 sm:p-5"
      >
        <p className="text-stamp text-accent-foreground">Future possibility</p>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          These are directions under consideration, not commitments. Any real
          issuance, treasury accounting, audit or governance framework would
          require independent legal review, community approval and a separate
          build stage.
        </p>
      </aside>
    </div>
  );
}
