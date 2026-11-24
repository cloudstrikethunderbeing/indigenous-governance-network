import { Link } from "@tanstack/react-router";
import { ArrowLeft, Info } from "lucide-react";
import { useMemo, useState } from "react";

import Panel from "@/components/dashboard/Panel";
import { tokenomicsNotice } from "@/data/demoData";

const MAX_SUPPLY = 21_000_000;
/** Initial emission: half the cap, so the halving series approaches the cap. */
const INITIAL_EMISSION = 10_500_000;
const PERIOD_COUNT = 12;

interface EmissionPeriod {
  index: number;
  label: string;
  emitted: number;
  cumulative: number;
  remaining: number;
}

/**
 * Build the four-month halving schedule. Each period emits half of the
 * previous period, floored to whole tokens, and cumulative emissions are
 * clamped so they can never exceed the 21,000,000 cap.
 */
function buildSchedule(): EmissionPeriod[] {
  const periods: EmissionPeriod[] = [];
  let emitted = INITIAL_EMISSION;
  let cumulative = 0;

  for (let i = 0; i < PERIOD_COUNT; i += 1) {
    const remainingBefore = MAX_SUPPLY - cumulative;
    const thisEmission = Math.min(Math.floor(emitted), remainingBefore);
    cumulative += thisEmission;
    periods.push({
      index: i + 1,
      label: `Month ${i * 4 + 1}–${i * 4 + 4}`,
      emitted: thisEmission,
      cumulative,
      remaining: MAX_SUPPLY - cumulative,
    });
    emitted = emitted / 2;
  }

  return periods;
}

function formatTokens(value: number): string {
  return value.toLocaleString("en-US");
}

const summaryCards = [
  {
    id: "initial",
    label: "Initial emission",
    value: formatTokens(INITIAL_EMISSION),
    note: "First four-month period",
  },
  {
    id: "interval",
    label: "Halving interval",
    value: "4 months",
    note: "Each period emits half the previous",
  },
  {
    id: "cap",
    label: "Maximum supply cap",
    value: formatTokens(MAX_SUPPLY),
    note: "Cumulative emissions never exceed this",
  },
] as const;

export default function EmissionSchedulePage() {
  const schedule = useMemo(() => buildSchedule(), []);
  const [selected, setSelected] = useState(0);

  const active = schedule[selected];
  const finalCumulative = schedule[schedule.length - 1].cumulative;
  const maxEmitted = Math.max(...schedule.map((p) => p.emitted));

  return (
    <div data-ocid="page.emissions" className="space-y-6">
      <header className="space-y-3">
        <p className="text-stamp text-accent">Phase 1 of 5</p>
        <h2 className="font-display text-2xl font-medium tracking-tight text-foreground md:text-3xl">
          Emission Schedule
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          A proposed four-month halving schedule: emissions start high, halve
          every four months, and approach — but never exceed — the 21,000,000
          cap.
        </p>
        <div className="rule-accent" />
      </header>

      <Panel
        title="Proposed schedule"
        ocid="emissions.notice"
        action={<span className="badge-stage-proposed">Proposed</span>}
      >
        <p className="text-stamp text-accent">{tokenomicsNotice}</p>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          Illustrative schedule only. These are conceptual emissions, not
          existing tokens or investment opportunities.
        </p>
      </Panel>

      <section
        data-ocid="emissions.summary"
        aria-label="Emission schedule summary"
        className="grid gap-4 sm:grid-cols-3"
      >
        {summaryCards.map((card) => (
          <div
            key={card.id}
            data-ocid={`emissions.summary.${card.id}`}
            className="shell-panel p-5"
          >
            <p className="text-stamp text-muted-foreground">{card.label}</p>
            <p className="text-tabular mt-2 text-2xl font-semibold text-foreground">
              {card.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{card.note}</p>
          </div>
        ))}
      </section>

      <Panel
        title="Emission per period"
        ocid="emissions.chart"
        action={
          <span className="text-stamp text-muted-foreground">
            Illustrative · 12 periods
          </span>
        }
      >
        <fieldset
          className="flex items-end gap-1.5 sm:gap-2"
          aria-label="Emission per four-month period"
        >
          {schedule.map((period, index) => {
            const heightPercent = Math.max(
              (period.emitted / maxEmitted) * 100,
              2,
            );
            const isActive = index === selected;
            return (
              <button
                key={period.index}
                type="button"
                data-ocid={`emissions.bar.${index + 1}`}
                onClick={() => setSelected(index)}
                aria-pressed={isActive}
                aria-label={`Period ${period.index}, ${period.label}: ${formatTokens(period.emitted)} tokens emitted`}
                className="group flex h-40 flex-1 flex-col justify-end focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:h-52"
              >
                <span
                  className={`w-full rounded-t-sm transition-smooth ${
                    isActive
                      ? "bg-primary"
                      : "bg-accent/40 group-hover:bg-accent/70"
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
                <span className="text-tabular mt-2 text-[0.6rem] text-muted-foreground">
                  {period.index}
                </span>
              </button>
            );
          })}
        </fieldset>

        <div
          data-ocid="emissions.detail"
          className="shell-panel-alt mt-4 p-5 sm:p-6"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display text-lg font-medium text-secondary-foreground">
              Period {active.index} · {active.label}
            </h3>
            <span className="text-stamp text-secondary-foreground">
              Halving step {active.index}
            </span>
          </div>
          <dl className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-stamp text-muted-foreground">
                Tokens emitted
              </dt>
              <dd className="text-tabular mt-1 text-xl font-semibold text-secondary-foreground">
                {formatTokens(active.emitted)}
              </dd>
            </div>
            <div>
              <dt className="text-stamp text-muted-foreground">
                Cumulative emitted
              </dt>
              <dd className="text-tabular mt-1 text-xl font-semibold text-secondary-foreground">
                {formatTokens(active.cumulative)}
              </dd>
            </div>
            <div>
              <dt className="text-stamp text-muted-foreground">
                Remaining to cap
              </dt>
              <dd className="text-tabular mt-1 text-xl font-semibold text-secondary-foreground">
                {formatTokens(active.remaining)}
              </dd>
            </div>
          </dl>
        </div>
      </Panel>

      <Panel title="Full schedule" ocid="emissions.table">
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[34rem] border-collapse text-sm">
            <caption className="sr-only">
              Illustrative four-month halving emission schedule
            </caption>
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th
                  scope="col"
                  className="text-stamp px-4 py-3 text-left text-secondary-foreground"
                >
                  Period
                </th>
                <th
                  scope="col"
                  className="text-stamp px-4 py-3 text-right text-secondary-foreground"
                >
                  Emitted
                </th>
                <th
                  scope="col"
                  className="text-stamp px-4 py-3 text-right text-secondary-foreground"
                >
                  Cumulative
                </th>
                <th
                  scope="col"
                  className="text-stamp px-4 py-3 text-right text-secondary-foreground"
                >
                  Remaining
                </th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((period, index) => (
                <tr
                  key={period.index}
                  data-ocid={`emissions.row.${index + 1}`}
                  className={`ledger-row ${
                    index === selected ? "bg-accent/5" : ""
                  }`}
                >
                  <th
                    scope="row"
                    className="px-4 py-3 text-left font-normal text-foreground"
                  >
                    <span className="text-tabular font-medium">
                      {period.index}
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {period.label}
                    </span>
                  </th>
                  <td className="text-tabular px-4 py-3 text-right text-foreground">
                    {formatTokens(period.emitted)}
                  </td>
                  <td className="text-tabular px-4 py-3 text-right text-foreground">
                    {formatTokens(period.cumulative)}
                  </td>
                  <td className="text-tabular px-4 py-3 text-right text-muted-foreground">
                    {formatTokens(period.remaining)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-border bg-secondary">
                <th
                  scope="row"
                  className="text-stamp px-4 py-3 text-left text-secondary-foreground"
                >
                  Total emitted
                </th>
                <td
                  className="text-tabular px-4 py-3 text-right font-semibold text-secondary-foreground"
                  colSpan={3}
                >
                  {formatTokens(finalCumulative)} of {formatTokens(MAX_SUPPLY)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <p
          data-ocid="emissions.consistency_note"
          className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"
        >
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span>
            The schedule is mathematically consistent: each period emits half
            the previous one, and cumulative emissions approach the 21,000,000
            cap without ever exceeding it.
          </span>
        </p>
      </Panel>

      <Link
        to="/dao/tokenomics"
        data-ocid="emissions.back_link"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-smooth hover:gap-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to tokenomics
      </Link>
    </div>
  );
}
