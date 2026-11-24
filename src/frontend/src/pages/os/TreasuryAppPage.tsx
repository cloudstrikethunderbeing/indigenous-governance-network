import { Scale, TrendingDown, TrendingUp } from "lucide-react";

import OsAppPage from "@/components/os/OsAppPage";
import TreasuryCategoryBreakdown, {
  summariseSpending,
} from "@/components/os/treasury/TreasuryCategoryBreakdown";
import TreasuryControlExplainer from "@/components/os/treasury/TreasuryControlExplainer";
import TreasuryMetricCard from "@/components/os/treasury/TreasuryMetricCard";
import TreasuryTransactionList from "@/components/os/treasury/TreasuryTransactionList";
import {
  sampleNation,
  sampleTransactions,
  sampleTreasurySummary,
} from "@/data/sampleNation";

/**
 * The Treasury app: the sample Nation's balance, income and spending, a
 * transaction ledger, a breakdown of spending by category, and a plain-language
 * explanation of how a Nation would eventually control its own treasury.
 */
export default function TreasuryAppPage() {
  const spendingByCategory = summariseSpending(sampleTransactions);

  return (
    <OsAppPage appKey="treasury">
      <div className="space-y-6">
        <header className="space-y-2">
          <p className="text-stamp text-accent">Treasury</p>
          <h2 className="font-display text-2xl font-medium tracking-tight text-foreground">
            {sampleNation.name} treasury
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            The Nation's income, spending and balance, with a transparent
            transaction ledger. Every figure below is simulated sample data.
          </p>
          <div className="rule-accent" />
        </header>

        <dl
          data-ocid="os.treasury.metrics"
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <TreasuryMetricCard
            id="income"
            label="Total income"
            value={sampleTreasurySummary.totalIncome}
            note="Grants and services received in the sample ledger."
            icon={TrendingUp}
            tone="income"
          />
          <TreasuryMetricCard
            id="expense"
            label="Total expense"
            value={sampleTreasurySummary.totalExpense}
            note="Research and operations spending in the sample ledger."
            icon={TrendingDown}
            tone="expense"
          />
          <TreasuryMetricCard
            id="balance"
            label="Balance"
            value={sampleTreasurySummary.balance}
            note="Income less expense across the sample transactions."
            icon={Scale}
            tone="balance"
          />
        </dl>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section
            data-ocid="os.treasury.transactions_section"
            aria-label="Transactions"
            className="shell-panel space-y-3 p-4"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-display text-lg font-medium text-foreground">
                Transactions
              </h3>
              <span className="text-stamp shrink-0 text-muted-foreground">
                {sampleTreasurySummary.transactionCount} entries
              </span>
            </div>
            <TreasuryTransactionList transactions={sampleTransactions} />
          </section>

          <section
            data-ocid="os.treasury.spending_section"
            aria-label="Spending by category"
            className="shell-panel space-y-3 p-4"
          >
            <div className="space-y-1">
              <h3 className="font-display text-lg font-medium text-foreground">
                Spending by category
              </h3>
              <p className="text-sm text-muted-foreground">
                How the sample Nation's spending is distributed.
              </p>
            </div>
            <TreasuryCategoryBreakdown categories={spendingByCategory} />
          </section>
        </div>

        <TreasuryControlExplainer />
      </div>
    </OsAppPage>
  );
}
