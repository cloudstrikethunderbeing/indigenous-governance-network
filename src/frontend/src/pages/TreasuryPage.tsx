import { ArrowDownRight, ArrowUpRight, Info, Landmark } from "lucide-react";

import Panel from "@/components/dashboard/Panel";
import { simulationNotice } from "@/data/demoData";

type FlowKind = "income" | "cost";

interface TreasuryCategory {
  id: string;
  label: string;
  kind: FlowKind;
  /** One-line plain-language explanation. */
  note: string;
  /** Illustrative monthly figure in USD — simulated only. */
  monthly: number;
}

/**
 * Illustrative category breakdown for the concept treasury. Every figure is a
 * static, simulated demonstration value — not real funding, income,
 * expenditure or a treasury balance.
 */
const categories: TreasuryCategory[] = [
  {
    id: "donations-grants",
    label: "Donations & grants",
    kind: "income",
    note: "Philanthropic and grant funding offered to the research network.",
    monthly: 42000,
  },
  {
    id: "research-contracts",
    label: "Institutional research contracts",
    kind: "income",
    note: "Commissioned research work for partner institutions.",
    monthly: 28000,
  },
  {
    id: "service-revenue",
    label: "Service revenue",
    kind: "income",
    note: "Fees for research services, data work and advisory support.",
    monthly: 9500,
  },
  {
    id: "icp-infrastructure",
    label: "ICP infrastructure costs",
    kind: "cost",
    note: "Canister cycles, storage and network operation.",
    monthly: 6200,
  },
  {
    id: "ai-research",
    label: "AI research expenses",
    kind: "cost",
    note: "Model inference and compute for research workflows.",
    monthly: 11400,
  },
  {
    id: "community-rewards",
    label: "Community participation rewards",
    kind: "cost",
    note: "Recognition for verified community contributions.",
    monthly: 7800,
  },
  {
    id: "development-operating",
    label: "Development & operating expenses",
    kind: "cost",
    note: "Engineering, design, legal review and day-to-day operations.",
    monthly: 21500,
  },
];

const incomeCategories = categories.filter((c) => c.kind === "income");
const costCategories = categories.filter((c) => c.kind === "cost");

const totalIncome = incomeCategories.reduce((sum, c) => sum + c.monthly, 0);
const totalCost = costCategories.reduce((sum, c) => sum + c.monthly, 0);
const monthlyBurn = totalCost - totalIncome;
const runwayMonths = 18;

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function FlowRow({ category }: { category: TreasuryCategory }) {
  const isIncome = category.kind === "income";
  const Icon = isIncome ? ArrowUpRight : ArrowDownRight;

  return (
    <li
      data-ocid={`treasury.category.${category.id}`}
      className="ledger-row flex items-start gap-3 py-3.5"
    >
      <span
        aria-hidden="true"
        className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md ${
          isIncome
            ? "bg-primary/10 text-primary"
            : "bg-destructive/10 text-destructive"
        }`}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{category.label}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {category.note}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-tabular text-sm font-medium text-foreground">
          {usd.format(category.monthly)}
        </p>
        <p className="text-stamp text-muted-foreground">Simulated / mo</p>
      </div>
    </li>
  );
}

export default function TreasuryPage() {
  return (
    <div data-ocid="page.treasury" className="space-y-6">
      <header className="space-y-3">
        <p className="text-stamp text-accent">Phase 3 of 5</p>
        <h2 className="font-display text-2xl font-medium tracking-tight text-foreground md:text-3xl">
          Treasury Transparency
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          An open ledger of funding, costs and runway for the concept treasury.
          The treasury starts empty — no real funds, income, expenditure or
          balances exist.
        </p>
        <div className="rule-accent" />
      </header>

      {/* Honest empty state — the default truth of this concept treasury. */}
      <section
        data-ocid="treasury.empty_state"
        aria-label="Treasury status"
        className="rounded-lg border border-dashed border-accent bg-accent/5 p-5 sm:p-6"
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent/15 text-accent-foreground"
          >
            <Landmark className="size-5" />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-lg font-medium text-foreground">
              No real treasury exists yet
            </h3>
            <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted-foreground">
              This is a concept preview. There are no real funds, income,
              expenditure or balances. Every figure below is simulated
              demonstration data.
            </p>
          </div>
        </div>
      </section>

      {/* Burn rate and runway — simulated. */}
      <section
        data-ocid="treasury.summary"
        aria-label="Simulated burn rate and runway"
        className="grid gap-4 sm:grid-cols-2"
      >
        <div className="shell-panel p-5">
          <p className="text-stamp text-muted-foreground">Monthly burn rate</p>
          <p className="text-tabular mt-2 text-3xl font-medium text-foreground">
            {usd.format(monthlyBurn)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Simulated net cost per month
          </p>
        </div>
        <div className="shell-panel p-5">
          <p className="text-stamp text-muted-foreground">Runway</p>
          <p className="text-tabular mt-2 text-3xl font-medium text-foreground">
            {runwayMonths} months
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Simulated at the current burn rate
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Category breakdown — income. */}
        <Panel
          title="Funding sources"
          ocid="treasury.income_section"
          action={
            <p className="text-tabular text-sm text-muted-foreground">
              {usd.format(totalIncome)} / mo simulated
            </p>
          }
        >
          <ul className="list-none">
            {incomeCategories.map((category) => (
              <FlowRow key={category.id} category={category} />
            ))}
          </ul>
        </Panel>

        {/* Category breakdown — costs. */}
        <Panel
          title="Costs & expenditures"
          ocid="treasury.cost_section"
          action={
            <p className="text-tabular text-sm text-muted-foreground">
              {usd.format(totalCost)} / mo simulated
            </p>
          }
        >
          <ul className="list-none">
            {costCategories.map((category) => (
              <FlowRow key={category.id} category={category} />
            ))}
          </ul>
        </Panel>
      </div>

      <p
        data-ocid="treasury.disclosure"
        className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"
      >
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        <span>
          {simulationNotice}. All figures are illustrative examples only and do
          not represent real funding, income, expenditure or a treasury balance.
        </span>
      </p>
    </div>
  );
}
