import { ShieldOff, X } from "lucide-react";

import { revokedAuthority } from "@/components/os/constitution-demo/demoScenarios";

/**
 * Step 4 — A revoked authority being denied access.
 *
 * A fictional member has had a permission removed. When they try to use it, the
 * action is refused. The visitor can attempt the action to see the denial.
 * Nothing is saved.
 */
export default function RevokedAuthorityStep({
  attempted,
  onAttempt,
}: {
  attempted: boolean;
  onAttempt: () => void;
}) {
  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <p className="text-stamp text-accent">Step 4 · Revoked authority</p>
        <h3 className="font-display text-xl font-medium tracking-tight text-foreground md:text-2xl">
          When a permission is taken away
        </h3>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Removing a role removes what it could do. The next time that member
          tries to act, the organization refuses the action.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <section
          data-ocid="constitution_demo.revoked.member"
          aria-label="Member and former role"
          className="shell-panel space-y-3 p-5"
        >
          <span
            aria-hidden="true"
            className="flex size-11 items-center justify-center rounded-full border border-current gov-permission-denied"
          >
            <ShieldOff className="size-5" />
          </span>
          <div className="space-y-1">
            <p className="text-stamp text-muted-foreground">Member</p>
            <p className="font-display text-lg font-medium text-foreground">
              {revokedAuthority.member}
            </p>
            <p className="text-sm text-muted-foreground">
              Former role: {revokedAuthority.formerRole}
            </p>
          </div>
          <span className="status-chip gov-permission-denied">
            Permission removed
          </span>
        </section>

        <section
          data-ocid="constitution_demo.revoked.attempt"
          aria-label="Attempted action"
          className="shell-panel space-y-3 p-5"
        >
          <p className="text-stamp text-accent">Attempted action</p>
          <p className="text-sm leading-relaxed text-foreground">
            {revokedAuthority.attemptedAction}
          </p>
          {attempted ? (
            <output
              data-ocid="constitution_demo.revoked.result"
              className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-foreground"
            >
              <X
                className="mt-0.5 size-4 shrink-0 text-destructive"
                aria-hidden="true"
              />
              {revokedAuthority.result}
            </output>
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground">
              Try the action to see what the organization does.
            </p>
          )}
        </section>
      </div>

      <div className="space-y-3">
        {attempted ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            This is a demonstration — nothing was saved.
          </p>
        ) : (
          <button
            type="button"
            data-ocid="constitution_demo.revoked.attempt_button"
            onClick={onAttempt}
            className="os-focus-ring inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 sm:w-auto"
          >
            <ShieldOff className="size-4" aria-hidden="true" />
            Try the action
          </button>
        )}
      </div>
    </div>
  );
}
