import { Info, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";

import {
  type SavingsAssumptions,
  savingsAreas,
  savingsDisclaimer,
  savingsFormulaLabel,
  savingsMethodNote,
  weeksPerYear,
} from "@/components/os/savings/savingsCopy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** A currency formatter for whole-dollar annual figures. */
const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** The starting assumptions for every area, keyed by area key. */
function startingAssumptions(): Record<string, SavingsAssumptions> {
  return Object.fromEntries(
    savingsAreas.map((area) => [area.key, { ...area.defaults }]),
  );
}

/** The annual saving for one area, derived only from its assumptions. */
function annualSaving(assumptions: SavingsAssumptions): number {
  const share = Math.min(Math.max(assumptions.absorbedShare, 0), 100) / 100;
  return Math.round(
    assumptions.people *
      assumptions.hoursPerWeek *
      assumptions.hourlyCost *
      weeksPerYear *
      share,
  );
}

/** One editable assumption field within an area row. */
function AssumptionField({
  id,
  ocid,
  label,
  suffix,
  value,
  min,
  max,
  step,
  onChange,
}: {
  id: string;
  ocid: string;
  label: string;
  suffix: string;
  value: number;
  min: number;
  max?: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      <div className="flex items-center gap-1.5">
        <Input
          id={id}
          data-ocid={ocid}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={String(value)}
          onChange={(event) => onChange(Number.parseFloat(event.target.value))}
          className="h-10 w-full text-right"
        />
        <span className="shrink-0 text-xs text-muted-foreground">{suffix}</span>
      </div>
    </div>
  );
}

/**
 * The self-service cost estimator. A Nation sets the assumptions behind each
 * area — people, hours per week, fully loaded hourly cost and the share shared
 * tooling could absorb — and sees each area's estimated annual saving with its
 * formula, plus the combined annual saving. Every figure is illustrative and
 * derived only from the assumptions entered; nothing is sent anywhere.
 */
export default function SavingsEstimator() {
  const [assumptions, setAssumptions] =
    useState<Record<string, SavingsAssumptions>>(startingAssumptions);

  const rows = useMemo(
    () =>
      savingsAreas.map((area) => {
        const values = assumptions[area.key] ?? area.defaults;
        return { area, values, saving: annualSaving(values) };
      }),
    [assumptions],
  );

  const totalSaving = rows.reduce((sum, row) => sum + row.saving, 0);

  function update(key: string, field: keyof SavingsAssumptions, value: number) {
    setAssumptions((current) => {
      const area = savingsAreas.find((entry) => entry.key === key);
      const base = current[key] ?? area?.defaults;
      if (!base) return current;
      const next = Number.isFinite(value) ? value : 0;
      return { ...current, [key]: { ...base, [field]: next } };
    });
  }

  function handleReset() {
    setAssumptions(startingAssumptions());
  }

  return (
    <section
      data-ocid="os.savings.estimator"
      aria-label="Cost savings estimator"
      className="space-y-5"
    >
      <div className="space-y-1.5">
        <p className="text-stamp text-accent">Self-service estimator</p>
        <h2 className="font-display text-xl font-medium tracking-tight text-foreground">
          Set the assumptions behind each area
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Each area starts from a set of assumptions. Change any of them and the
          estimate updates immediately. Every figure is illustrative and comes
          only from what you enter.
        </p>
      </div>

      <ul data-ocid="os.savings.input_list" className="space-y-4">
        {rows.map(({ area, values, saving }) => (
          <li
            key={area.key}
            data-ocid={`os.savings.input_row.${area.key}`}
            className="shell-panel space-y-4 p-4"
          >
            <div className="min-w-0 space-y-1">
              <h3 className="text-sm font-medium text-foreground">
                {area.label}
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {area.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <AssumptionField
                id={`savings-people-${area.key}`}
                ocid={`os.savings.input.${area.key}`}
                label="People"
                suffix="people"
                value={values.people}
                min={0}
                step={1}
                onChange={(value) => update(area.key, "people", value)}
              />
              <AssumptionField
                id={`savings-hours-${area.key}`}
                ocid={`os.savings.input_hours.${area.key}`}
                label="Hours / week"
                suffix="hrs"
                value={values.hoursPerWeek}
                min={0}
                step={1}
                onChange={(value) => update(area.key, "hoursPerWeek", value)}
              />
              <AssumptionField
                id={`savings-cost-${area.key}`}
                ocid={`os.savings.input_cost.${area.key}`}
                label="Hourly cost"
                suffix="$/hr"
                value={values.hourlyCost}
                min={0}
                step={1}
                onChange={(value) => update(area.key, "hourlyCost", value)}
              />
              <AssumptionField
                id={`savings-share-${area.key}`}
                ocid={`os.savings.input_share.${area.key}`}
                label="Absorbed share"
                suffix="%"
                value={values.absorbedShare}
                min={0}
                max={100}
                step={5}
                onChange={(value) => update(area.key, "absorbedShare", value)}
              />
            </div>

            <div
              data-ocid={`os.savings.arithmetic_row.${area.key}`}
              className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-border pt-3"
            >
              <p className="text-xs leading-relaxed text-muted-foreground">
                {savingsFormulaLabel}
              </p>
              <p className="text-tabular text-sm font-medium text-foreground">
                {usd.format(saving)}
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  / yr
                </span>
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="button"
          variant="outline"
          data-ocid="os.savings.reset_button"
          onClick={handleReset}
          className="h-11 w-full sm:w-auto"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Reset assumptions
        </Button>
      </div>

      <div
        data-ocid="os.savings.result"
        className="space-y-4 rounded-lg border border-border bg-card p-4 md:p-5"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-stamp text-muted-foreground">
            Combined estimated annual saving
          </p>
          <p
            data-ocid="os.savings.result_total"
            className="text-tabular text-3xl font-semibold text-primary"
          >
            {usd.format(totalSaving)}
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              / yr
            </span>
          </p>
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">
          {savingsMethodNote}
        </p>

        <div className="overflow-x-auto">
          <table
            data-ocid="os.savings.arithmetic_table"
            className="w-full min-w-[34rem] border-collapse text-sm"
          >
            <caption className="sr-only">
              The arithmetic behind the estimate, area by area
            </caption>
            <thead>
              <tr className="border-b border-border text-left">
                <th
                  scope="col"
                  className="py-2 pr-3 text-stamp font-medium text-muted-foreground"
                >
                  Area
                </th>
                <th
                  scope="col"
                  className="py-2 pr-3 text-right text-stamp font-medium text-muted-foreground"
                >
                  People
                </th>
                <th
                  scope="col"
                  className="py-2 pr-3 text-right text-stamp font-medium text-muted-foreground"
                >
                  Hours / week
                </th>
                <th
                  scope="col"
                  className="py-2 pr-3 text-right text-stamp font-medium text-muted-foreground"
                >
                  Hourly cost
                </th>
                <th
                  scope="col"
                  className="py-2 pr-3 text-right text-stamp font-medium text-muted-foreground"
                >
                  Absorbed
                </th>
                <th
                  scope="col"
                  className="py-2 text-right text-stamp font-medium text-muted-foreground"
                >
                  Annual saving
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ area, values, saving }) => (
                <tr
                  key={area.key}
                  data-ocid={`os.savings.arithmetic_row.${area.key}`}
                  className="ledger-row"
                >
                  <th
                    scope="row"
                    className="py-2 pr-3 text-left font-normal text-foreground"
                  >
                    {area.label}
                  </th>
                  <td className="text-tabular py-2 pr-3 text-right text-foreground">
                    {values.people}
                  </td>
                  <td className="text-tabular py-2 pr-3 text-right text-foreground">
                    {values.hoursPerWeek}
                  </td>
                  <td className="text-tabular py-2 pr-3 text-right text-foreground">
                    {usd.format(values.hourlyCost)}
                  </td>
                  <td className="text-tabular py-2 pr-3 text-right text-muted-foreground">
                    {Math.round(values.absorbedShare)}%
                  </td>
                  <td className="text-tabular py-2 text-right font-medium text-foreground">
                    {usd.format(saving)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-border">
                <th
                  scope="row"
                  colSpan={5}
                  className="py-2 pr-3 text-left text-stamp font-medium text-foreground"
                >
                  Combined
                </th>
                <td className="text-tabular py-2 text-right font-semibold text-primary">
                  {usd.format(totalSaving)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <p
          data-ocid="os.savings.disclaimer"
          className="flex items-start gap-2 rounded-md border border-dashed border-accent bg-accent/10 px-3 py-2 text-xs leading-relaxed text-accent-foreground"
        >
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{savingsDisclaimer}</span>
        </p>
      </div>
    </section>
  );
}
