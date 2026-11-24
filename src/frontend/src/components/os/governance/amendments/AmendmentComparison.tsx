import { ArrowRight, FileDiff } from "lucide-react";

import type { RuleChange } from "@/backend";
import {
  formatRuleValue,
  ruleExplanations,
  ruleGroups,
} from "@/components/os/governance/rules/ruleExplanations";

/** The plain label for a rule change's field, falling back to its raw name. */
function changeLabel(change: RuleChange): string {
  const known =
    ruleExplanations[change.fieldName as keyof typeof ruleExplanations];
  return known ? known.label : change.fieldName;
}

/**
 * A side-by-side comparison of the current constitution and a proposed change.
 * Each changed rule is shown with its before and after values so a reader can
 * see exactly what would change, and the rules that stay the same are listed
 * separately so nothing is hidden.
 */
export default function AmendmentComparison({
  changes,
  currentRules,
}: {
  changes: RuleChange[];
  currentRules: Parameters<typeof formatRuleValue>[1] | null;
}) {
  if (changes.length === 0) {
    return (
      <section
        data-ocid="os.governance.amendments.comparison_empty_state"
        className="shell-panel space-y-2 p-5"
      >
        <p className="font-display text-base font-medium text-foreground">
          No rule changes recorded
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          This amendment does not list any rule changes.
        </p>
      </section>
    );
  }

  const changedFields = new Set(changes.map((change) => change.fieldName));
  const unchangedGroups = currentRules
    ? ruleGroups
        .map((group) => ({
          group,
          fields: group.fields.filter((field) => !changedFields.has(field)),
        }))
        .filter((entry) => entry.fields.length > 0)
    : [];

  return (
    <section
      data-ocid="os.governance.amendments.comparison"
      aria-label="Current rules compared with the proposed change"
      className="space-y-4"
    >
      <header className="flex items-start gap-3">
        <span className="os-icon-glyph size-10 shrink-0" aria-hidden="true">
          <FileDiff className="size-5" />
        </span>
        <div className="min-w-0 space-y-1">
          <p className="text-stamp text-accent">Before and after</p>
          <h3 className="font-display text-lg font-medium tracking-tight text-foreground">
            What would change
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The current rule on the left, the proposed rule on the right.
          </p>
        </div>
      </header>

      <ol className="space-y-3">
        {changes.map((change, index) => (
          <li
            key={`${change.fieldName}-${index}`}
            data-ocid={`os.governance.amendments.comparison_row.${index + 1}`}
            className="shell-panel space-y-3 p-4"
          >
            <p className="text-sm font-medium text-foreground">
              {changeLabel(change)}
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center">
              <div className="shell-panel-alt space-y-1 p-3">
                <p className="text-stamp text-muted-foreground">Current</p>
                <p className="break-words text-sm leading-relaxed text-foreground">
                  {change.beforeValue || "Not set"}
                </p>
              </div>
              <ArrowRight
                className="mx-auto hidden size-4 text-muted-foreground sm:block"
                aria-hidden="true"
              />
              <div className="space-y-1 rounded-lg border border-accent/50 bg-accent/10 p-3">
                <p className="text-stamp text-accent">Proposed</p>
                <p className="break-words text-sm font-semibold leading-relaxed text-foreground">
                  {change.afterValue || "Not set"}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>

      {unchangedGroups.length > 0 ? (
        <details className="group shell-panel p-4">
          <summary className="os-focus-ring flex min-h-[44px] cursor-pointer list-none items-center gap-2 rounded-lg text-sm font-medium text-foreground">
            <span className="text-accent">Rules that stay the same</span>
            <span className="ml-auto text-xs text-muted-foreground group-open:hidden">
              Show
            </span>
            <span className="ml-auto hidden text-xs text-muted-foreground group-open:inline">
              Hide
            </span>
          </summary>
          <div className="mt-3 space-y-4">
            {unchangedGroups.map(({ group, fields }) => (
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
                        {currentRules
                          ? formatRuleValue(field, currentRules)
                          : "—"}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </details>
      ) : null}
    </section>
  );
}
