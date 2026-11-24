import { Network } from "lucide-react";
import type { ReactNode } from "react";

/**
 * An empty state that invites participation instead of showing fabricated
 * numbers. Every Discovery surface uses this when stored data is absent.
 */
export default function EmptyState({
  title,
  description,
  action,
  ocid = "discovery.empty_state",
}: {
  title: string;
  description: string;
  action?: ReactNode;
  ocid?: string;
}) {
  return (
    <div
      data-ocid={ocid}
      className="network-panel-alt flex flex-col items-center gap-3 px-6 py-10 text-center"
    >
      <span
        aria-hidden="true"
        className="flex size-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground"
      >
        <Network className="size-5" />
      </span>
      <h3 className="font-display text-base font-medium tracking-tight text-foreground">
        {title}
      </h3>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}
