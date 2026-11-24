import { Layers } from "lucide-react";

import { savingsAreas } from "@/components/os/savings/savingsCopy";

/**
 * The cost-savings narrative: what integrated digital governance could reduce,
 * area by area. It explains each area in plain language and never states a
 * figure or promises a reduction — the estimator below is where a Nation
 * supplies its own numbers.
 */
export default function SavingsMessaging() {
  return (
    <section
      data-ocid="os.savings.messaging"
      aria-label="Where integrated governance could reduce effort"
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <p className="text-stamp text-accent">Where the effort goes</p>
        <h2 className="font-display text-xl font-medium tracking-tight text-foreground">
          Integrated governance removes duplicated work
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          When governance, records, meetings and infrastructure live in one
          place, a Nation stops paying for the same work twice. These are the
          areas where that duplication usually shows up.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {savingsAreas.map((area) => (
          <li
            key={area.key}
            data-ocid={`os.savings.area.${area.key}`}
            className="shell-panel flex items-start gap-3 p-4"
          >
            <span
              aria-hidden="true"
              className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-primary"
            >
              <Layers className="size-4" />
            </span>
            <div className="min-w-0 space-y-1">
              <h3 className="text-sm font-medium text-foreground">
                {area.label}
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {area.description}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">
        No figure is shown here because none would be honest: what a Nation
        saves depends on the effort it spends today. The estimator below lets
        you set the assumptions behind each area and see an illustrative annual
        estimate.
      </p>
    </section>
  );
}
