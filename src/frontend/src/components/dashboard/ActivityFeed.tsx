import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { activityFeed } from "@/data/demoData";

/** Latest-activity feed: exchange, primary sale, grant and membership entries. */
export default function ActivityFeed() {
  return (
    <ul data-ocid="dashboard.activity_feed" className="flex flex-col">
      {activityFeed.map((entry) => {
        const positive = entry.amount.startsWith("+");
        return (
          <li
            key={entry.id}
            data-ocid={`dashboard.activity.${entry.id}`}
            className="ledger-row flex items-start gap-3 py-3 first:pt-0 last:pb-0"
          >
            <span
              aria-hidden="true"
              className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
            >
              {positive ? (
                <ArrowUpRight className="size-3.5" />
              ) : (
                <ArrowDownRight className="size-3.5" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-foreground">
                {entry.kind}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {entry.detail}
              </p>
              <p className="mt-0.5 text-[0.65rem] text-muted-foreground">
                {entry.time}
              </p>
            </div>
            <span className="text-tabular shrink-0 text-xs text-foreground">
              {entry.amount}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
