import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

import type { SampleTransaction } from "@/data/sampleNation";

/**
 * The sample Nation's transaction ledger: each row shows the direction, the
 * description, the category and the signed amount.
 */
export default function TreasuryTransactionList({
  transactions,
}: {
  transactions: SampleTransaction[];
}) {
  return (
    <ul data-ocid="os.treasury.transaction_list" className="space-y-0">
      {transactions.map((transaction) => {
        const isIncome = transaction.direction === "income";
        const DirectionIcon = isIncome ? ArrowDownLeft : ArrowUpRight;
        return (
          <li
            key={transaction.id}
            data-ocid={`os.treasury.transaction.${transaction.id}`}
            className="ledger-row flex items-center gap-3 py-3"
          >
            <span
              className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                isIncome
                  ? "bg-success/10 text-success"
                  : "bg-muted text-muted-foreground"
              }`}
              aria-hidden="true"
            >
              <DirectionIcon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {transaction.description}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                <span className="capitalize">{transaction.direction}</span>
                {" · "}
                {transaction.category}
              </p>
            </div>
            <span
              className={`text-tabular shrink-0 text-sm font-semibold ${
                isIncome ? "text-success" : "text-foreground"
              }`}
            >
              {isIncome ? "+" : "−"}${transaction.amount.toLocaleString()}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
