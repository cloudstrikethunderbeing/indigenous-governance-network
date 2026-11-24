import { FilePlus2, FileSignature, Send, UserCog } from "lucide-react";
import type { ComponentType } from "react";

import { type QuickAction, quickActions } from "@/data/demoData";

const iconMap: Record<
  QuickAction["icon"],
  ComponentType<{ className?: string }>
> = {
  proposal: FileSignature,
  nfts: Send,
  roles: UserCog,
  rfp: FilePlus2,
};

/**
 * Quick-action cards for the demo's primary actions. Each is a clearly
 * non-functional demo control: it is disabled and labelled as such.
 */
export default function QuickActions() {
  return (
    <section
      data-ocid="dashboard.quick_actions"
      aria-label="Quick actions (demo)"
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
    >
      {quickActions.map((action) => {
        const Icon = iconMap[action.icon];
        return (
          <button
            key={action.id}
            type="button"
            disabled
            data-ocid={`dashboard.quick_action.${action.id}`}
            title={`${action.description} Demo control — not functional.`}
            className="quick-action cursor-not-allowed opacity-90"
          >
            <span
              aria-hidden="true"
              className="flex size-9 items-center justify-center rounded-md border border-border bg-muted text-primary"
            >
              <Icon className="size-4" />
            </span>
            <span className="text-sm font-medium text-foreground">
              {action.label}
            </span>
            <span className="text-xs leading-snug text-muted-foreground">
              {action.description}
            </span>
          </button>
        );
      })}
    </section>
  );
}
