import { CircleSlash, RotateCcw, Vote } from "lucide-react";

import { votingRoster } from "@/components/os/constitution-demo/demoScenarios";

/** The icon and colour for each voting status. */
const statusStyles: Record<string, { icon: typeof Vote; className: string }> = {
  Eligible: { icon: Vote, className: "gov-permission-granted" },
  Inactive: { icon: CircleSlash, className: "gov-permission-denied" },
  Reactivated: { icon: RotateCcw, className: "gov-permission-inherited" },
};

/**
 * Step 2 — Voting eligibility, inactivity and reactivation.
 *
 * A fictional roster shows who may vote, what happens when a member goes quiet,
 * and how they return. The visitor can reactivate the inactive member to see
 * voting resume. Nothing is saved.
 */
export default function VotingEligibilityStep({
  reactivated,
  onReactivate,
}: {
  reactivated: boolean;
  onReactivate: () => void;
}) {
  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <p className="text-stamp text-accent">
          Step 2 · Voting &amp; membership
        </p>
        <h3 className="font-display text-xl font-medium tracking-tight text-foreground md:text-2xl">
          Who may vote, and what happens when they go quiet
        </h3>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Voting follows the rules in your constitution. A member who stops
          taking part is paused, and can return at any time.
        </p>
      </header>

      <ul className="space-y-3">
        {votingRoster.map((entry, index) => {
          const isInactive = entry.status === "Inactive";
          const status =
            isInactive && reactivated ? "Reactivated" : entry.status;
          const note =
            isInactive && reactivated
              ? "Returned and confirmed their membership, so voting is active again."
              : entry.note;
          const style = statusStyles[status] ?? statusStyles.Eligible;
          const StatusIcon = style.icon;
          return (
            <li
              key={entry.member}
              data-ocid={`constitution_demo.voting.member.${index + 1}`}
              className="shell-panel flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:gap-4"
            >
              <span
                aria-hidden="true"
                className={`flex size-10 shrink-0 items-center justify-center rounded-full border border-current ${style.className}`}
              >
                <StatusIcon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground">
                  {entry.member}
                </span>
                <span className="block text-sm leading-relaxed text-muted-foreground">
                  {note}
                </span>
              </span>
              <span
                data-ocid={`constitution_demo.voting.status.${index + 1}`}
                className={`shrink-0 text-xs font-semibold uppercase tracking-wider ${style.className}`}
              >
                {status}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="space-y-3">
        {reactivated ? (
          <output
            data-ocid="constitution_demo.voting.reactivated"
            className="flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-foreground"
          >
            <RotateCcw className="size-4 text-primary" aria-hidden="true" />
            Member B returned and may vote again. This is a demonstration —
            nothing was saved.
          </output>
        ) : (
          <button
            type="button"
            data-ocid="constitution_demo.voting.reactivate_button"
            onClick={onReactivate}
            className="os-focus-ring inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 sm:w-auto"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Reactivate the inactive member
          </button>
        )}
      </div>
    </div>
  );
}
