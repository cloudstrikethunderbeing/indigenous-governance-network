import type { SampleTransaction } from "@/data/sampleNation";

/** One spending category with its total and share of all spending. */
export interface SpendingCategory {
  category: string;
  amount: number;
  share: number;
}

/** Group the sample expenses by category, largest first. */
export function summariseSpending(
  transactions: SampleTransaction[],
): SpendingCategory[] {
  const totals = new Map<string, number>();
  for (const transaction of transactions) {
    if (transaction.direction !== "expense") continue;
    totals.set(
      transaction.category,
      (totals.get(transaction.category) ?? 0) + transaction.amount,
    );
  }
  const total = [...totals.values()].reduce((sum, value) => sum + value, 0);
  return [...totals.entries()]
    .map(([category, amount]) => ({
      category,
      amount,
      share: total === 0 ? 0 : amount / total,
    }))
    .sort((a, b) => b.amount - a.amount);
}

/**
 * A breakdown of the sample Nation's spending by category, each with its total
 * and its share of all spending.
 */
export default function TreasuryCategoryBreakdown({
  categories,
}: {
  categories: SpendingCategory[];
}) {
  return (
    <ul data-ocid="os.treasury.category_list" className="space-y-3">
      {categories.map((entry) => (
        <li
          key={entry.category}
          data-ocid={`os.treasury.category.${entry.category
            .toLowerCase()
            .replace(/\s+/g, "_")}`}
          className="space-y-1.5"
        >
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 truncate text-sm font-medium text-foreground">
              {entry.category}
            </span>
            <span className="text-tabular shrink-0 text-sm text-muted-foreground">
              ${entry.amount.toLocaleString()}
              <span className="ml-2 text-xs">
                {Math.round(entry.share * 100)}%
              </span>
            </span>
          </div>
          <div className="challenge-track" aria-hidden="true">
            <div
              className="challenge-fill"
              style={{ width: `${Math.round(entry.share * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
