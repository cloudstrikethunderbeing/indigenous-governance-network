import { CalendarClock, Loader2, Trash2 } from "lucide-react";

import type { GovernanceRole, RoleDelegation } from "@/backend";
import {
  capabilityLabels,
  labelSlug,
  shortPrincipal,
} from "@/components/os/governance/members/membersCopy";

/**
 * The delegations panel: who has asked someone else to act for them, until
 * when, and a way to end it early. A delegation always shows its expiry date
 * and can be revoked at any time.
 */
export default function DelegationsPanel({
  delegations,
  roles,
  canManage,
  revokingId,
  onRevoke,
}: {
  delegations: RoleDelegation[];
  roles: GovernanceRole[];
  canManage: boolean;
  revokingId: string | null;
  onRevoke: (delegation: RoleDelegation) => void;
}) {
  const now = Date.now();

  return (
    <section
      data-ocid="os.governance.members.delegations"
      aria-label="Delegations"
      className="shell-panel space-y-3 p-4"
    >
      <div className="space-y-1">
        <p className="text-stamp text-accent">Delegations</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          A member may ask someone they trust to act for them. Every delegation
          has an end date and can be taken back at any time.
        </p>
      </div>

      {delegations.length === 0 ? (
        <p
          data-ocid="os.governance.members.delegations_empty"
          className="rounded-md border border-border bg-muted/40 px-3 py-3 text-sm text-muted-foreground"
        >
          No delegations right now.
        </p>
      ) : (
        <ul className="space-y-2">
          {delegations.map((delegation, index) => {
            const role = roles.find(
              (entry) => entry.id.toString() === delegation.role.toString(),
            );
            const expired = Number(delegation.expiresAt / 1_000_000n) < now;
            const active = delegation.active && !expired;
            const isRevoking = revokingId === delegation.id.toString();

            return (
              <li
                key={delegation.id.toString()}
                data-ocid={`os.governance.members.delegation.${index + 1}`}
                className="space-y-2 rounded-md border border-border bg-muted/40 p-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">
                        {shortPrincipal(delegation.delegator.toText())}
                      </span>{" "}
                      asked{" "}
                      <span className="font-medium">
                        {shortPrincipal(delegation.delegate.toText())}
                      </span>{" "}
                      to act for them
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {role ? role.roleName : "A role"}
                    </p>
                  </div>
                  <span
                    data-ocid={`os.governance.members.delegation_status.${index + 1}`}
                    className={`text-stamp inline-flex shrink-0 items-center gap-1 rounded-sm border px-2 py-1 ${
                      active
                        ? "border-success bg-success/10 text-success"
                        : "border-border bg-muted text-muted-foreground"
                    }`}
                  >
                    {active ? "Active" : expired ? "Expired" : "Ended"}
                  </span>
                </div>

                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarClock className="size-3.5" aria-hidden="true" />
                  Ends {formatExpiry(delegation.expiresAt)}
                </p>

                {delegation.capabilities.length > 0 ? (
                  <ul className="flex flex-wrap gap-1.5">
                    {delegation.capabilities.map((capability) => (
                      <li
                        key={capability}
                        className="gov-role-chip"
                        data-ocid={`os.governance.members.delegation_capability.${index + 1}.${labelSlug(capability)}`}
                      >
                        {capabilityLabels[capability]}
                      </li>
                    ))}
                  </ul>
                ) : null}

                {active && canManage ? (
                  <button
                    type="button"
                    data-ocid={`os.governance.members.delegation_revoke.${index + 1}`}
                    disabled={isRevoking}
                    onClick={() => onRevoke(delegation)}
                    className="os-focus-ring inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-destructive/50 bg-card px-4 py-2 text-sm font-medium text-destructive transition-smooth hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isRevoking ? (
                      <Loader2
                        className="size-4 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <Trash2 className="size-4" aria-hidden="true" />
                    )}
                    Take it back
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/** A readable date for a delegation's expiry, with a fallback. */
function formatExpiry(expiresAt: bigint): string {
  const date = new Date(Number(expiresAt / 1_000_000n));
  if (Number.isNaN(date.getTime())) return "an unknown date";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
