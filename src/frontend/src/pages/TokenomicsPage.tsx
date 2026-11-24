import { Link } from "@tanstack/react-router";
import { ArrowRight, Lock, ShieldCheck, Timer } from "lucide-react";

import Panel from "@/components/dashboard/Panel";
import { tokenomicsNotice } from "@/data/demoData";

const MAX_SUPPLY = 21_000_000;

interface Allocation {
  id: string;
  label: string;
  percent: number;
  tokens: number;
  /** Conceptual distribution concept — not live terms. */
  concept: string;
  /** Conceptual vesting / lockup description. */
  vesting: string;
  /** Chart token index for the bar fill. */
  chart: string;
}

/**
 * Conceptual allocations. Percentages total exactly 100% and token quantities
 * total exactly 21,000,000. These are proposed figures, not issued tokens.
 */
const allocations: Allocation[] = [
  {
    id: "community-airdrop",
    label: "Community airdrop",
    percent: 18,
    tokens: 3_780_000,
    concept:
      "Broad distribution to early community members and research participants.",
    vesting: "Conceptual 12-month linear release after a 3-month lockup.",
    chart: "var(--chart-1)",
  },
  {
    id: "research-rewards",
    label: "Research participation rewards",
    percent: 22,
    tokens: 4_620_000,
    concept: "Rewards for verified research contributions across the network.",
    vesting: "Conceptual 24-month linear release, earned as work is verified.",
    chart: "var(--chart-2)",
  },
  {
    id: "governance-rewards",
    label: "Governance participation rewards",
    percent: 12,
    tokens: 2_520_000,
    concept:
      "Recognition for sustained, informed participation in DAO decisions.",
    vesting: "Conceptual 18-month linear release tied to participation.",
    chart: "var(--chart-3)",
  },
  {
    id: "staking-rewards",
    label: "Voluntary maturity-based staking rewards",
    percent: 15,
    tokens: 3_150_000,
    concept: "Optional, non-custodial rewards for members who choose to stake.",
    vesting: "Conceptual 36-month release, aligned with maturity periods.",
    chart: "var(--chart-4)",
  },
  {
    id: "dao-treasury",
    label: "DAO treasury & ecosystem development",
    percent: 23,
    tokens: 4_830_000,
    concept:
      "Funds research grants, tooling and the long-term health of the network.",
    vesting: "Conceptual 48-month release under DAO oversight.",
    chart: "var(--chart-5)",
  },
  {
    id: "admin-developers",
    label: "Administration & developers",
    percent: 10,
    tokens: 2_100_000,
    concept: "Sustains the core team building and maintaining the network.",
    vesting: "Conceptual 48-month release with a 12-month cliff.",
    chart: "var(--chart-6)",
  },
];

const totalPercent = allocations.reduce((sum, a) => sum + a.percent, 0);
const totalTokens = allocations.reduce((sum, a) => sum + a.tokens, 0);

const vestingConcepts = [
  {
    icon: Lock,
    title: "Lockup",
    body: "A short initial period where allocated tokens cannot move, protecting early stability.",
  },
  {
    icon: Timer,
    title: "Vesting",
    body: "Tokens release gradually over time rather than all at once, aligning long-term incentives.",
  },
  {
    icon: ShieldCheck,
    title: "Oversight",
    body: "Treasury and ecosystem allocations would be released under DAO oversight, not a single party.",
  },
];

function formatTokens(value: number): string {
  return value.toLocaleString("en-US");
}

export default function TokenomicsPage() {
  return (
    <div data-ocid="page.tokenomics" className="space-y-6">
      <header className="space-y-3">
        <p className="text-stamp text-accent">Phase 1 of 5</p>
        <h2 className="font-display text-2xl font-medium tracking-tight text-foreground md:text-3xl">
          Tokenomics
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          A proposed design for the SOVEREIGN token: a fixed maximum supply and
          a clear split of who it is intended for.
        </p>
        <div className="rule-accent" />
      </header>

      <section
        data-ocid="tokenomics.notice"
        role="note"
        className="rounded-lg border border-dashed border-accent bg-accent/5 p-4 sm:p-5"
      >
        <p className="text-stamp text-accent">{tokenomicsNotice}</p>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          These are conceptual allocations, not existing tokens or investment
          opportunities. No token has been created, sold or transferred.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel
          title="Proposed maximum supply"
          ocid="tokenomics.supply"
          className="lg:col-span-1"
        >
          <p className="text-tabular text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {formatTokens(MAX_SUPPLY)}
          </p>
          <p className="mt-1 font-display text-lg text-muted-foreground">
            SOVEREIGN tokens
          </p>
          <p className="mt-4 max-w-prose text-sm leading-relaxed text-muted-foreground">
            A fixed cap means no more than this amount could ever exist. The
            allocations below divide that cap exactly.
          </p>
        </Panel>

        <Panel
          title="Allocation breakdown"
          ocid="tokenomics.allocations"
          className="lg:col-span-2"
          action={
            <p className="text-stamp text-muted-foreground">
              {totalPercent}% · {formatTokens(totalTokens)} tokens
            </p>
          }
        >
          <ul className="list-none space-y-3" aria-label="Proposed allocations">
            {allocations.map((allocation, index) => (
              <li
                key={allocation.id}
                data-ocid={`tokenomics.allocation.${index + 1}`}
                className="shell-panel-alt p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-display text-base font-medium text-foreground sm:text-lg">
                    {allocation.label}
                  </h3>
                  <div className="flex items-baseline gap-3">
                    <span className="text-tabular text-lg font-semibold text-foreground">
                      {allocation.percent}%
                    </span>
                    <span className="text-tabular text-sm text-muted-foreground">
                      {formatTokens(allocation.tokens)}
                    </span>
                  </div>
                </div>

                <div
                  className="mt-3 h-2 w-full overflow-hidden rounded-sm bg-muted"
                  role="img"
                  aria-label={`${allocation.label}: ${allocation.percent} percent`}
                >
                  <div
                    className="h-full rounded-sm"
                    style={{
                      width: `${allocation.percent}%`,
                      background: `oklch(${allocation.chart})`,
                    }}
                  />
                </div>

                <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground">
                  {allocation.concept}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  <span className="text-stamp text-accent">
                    Vesting concept
                  </span>{" "}
                  {allocation.vesting}
                </p>
              </li>
            ))}
          </ul>

          <div
            data-ocid="tokenomics.allocation_total"
            className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-secondary px-4 py-3 sm:px-5 sm:py-4"
          >
            <span className="text-stamp text-secondary-foreground">Total</span>
            <span className="text-tabular text-sm font-semibold text-secondary-foreground">
              {totalPercent}% · {formatTokens(totalTokens)} tokens
            </span>
          </div>
        </Panel>
      </div>

      <Panel
        title="Vesting, lockup & distribution concepts"
        ocid="tokenomics.vesting"
      >
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          These are conceptual design ideas, not live terms. Any real schedule
          would be published and reviewed before issuance.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {vestingConcepts.map((concept) => (
            <div key={concept.title} className="shell-panel-alt p-4 sm:p-5">
              <concept.icon className="size-5 text-accent" aria-hidden="true" />
              <h3 className="mt-3 font-display text-lg font-medium text-foreground">
                {concept.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {concept.body}
              </p>
            </div>
          ))}
        </div>
      </Panel>

      <Link
        to="/dao/emissions"
        data-ocid="tokenomics.emissions_link"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-smooth hover:gap-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        View the four-month halving emission schedule
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
