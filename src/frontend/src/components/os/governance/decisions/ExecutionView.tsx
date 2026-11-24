import { ChevronDown, History, ShieldCheck } from "lucide-react";
import { useState } from "react";

import {
  type ExecutionRequest,
  ExecutionStatus,
  type GovernanceProposal,
} from "@/backend";
import {
  EXECUTION_STATUS_HELP,
  EXECUTION_STATUS_LABELS,
  EXECUTION_STATUS_ORDER,
  classificationLabel,
} from "@/components/os/governance/decisions/executionCopy";
import { useExecutionAudit } from "@/components/os/governance/decisions/useGovernanceDecisions";

/** The statuses that read as "still in progress" rather than finished. */
const OPEN_STATUSES = new Set<ExecutionStatus>([
  ExecutionStatus.pendingAuthorization,
  ExecutionStatus.timelocked,
  ExecutionStatus.paused,
]);

/** A plain-language label for the extra authorization a high-risk action needs. */
function authorizationNote(request: ExecutionRequest): string {
  if (!request.highRisk) {
    return "Any member may authorize this action.";
  }
  return "This is a high-risk action. It needs a second, independent authorization from someone other than the person who requested it.";
}

/**
 * The execution view: every request to carry out a passed decision, grouped by
 * its state, with the extra authorization high-risk actions need and the
 * step-by-step audit trail. Execution is always separate from voting.
 */
export default function ExecutionView({
  requests,
  proposals,
}: {
  requests: ExecutionRequest[];
  proposals: GovernanceProposal[];
}) {
  const [openId, setOpenId] = useState<bigint | null>(null);

  const proposalTitle = (id: bigint): string =>
    proposals.find((p) => p.id === id)?.title ?? "A passed decision";

  const proposalClassification = (id: bigint): string =>
    proposals.find((p) => p.id === id)?.classification ?? "general";

  if (requests.length === 0) {
    return (
      <div
        data-ocid="os.governance.execution_empty_state"
        className="shell-panel space-y-2 p-5"
      >
        <p className="font-display text-base font-medium text-foreground">
          Nothing is waiting to be carried out
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          When a decision passes, carrying it out is a separate step. Requests
          to carry out a decision will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {EXECUTION_STATUS_ORDER.map((status) => {
        const group = requests.filter((request) => request.status === status);
        if (group.length === 0) return null;
        return (
          <section
            key={status}
            data-ocid={`os.governance.execution_group.${status}`}
            aria-label={EXECUTION_STATUS_LABELS[status]}
            className="space-y-3"
          >
            <div className="space-y-1">
              <h3 className="font-display text-base font-medium text-foreground">
                {EXECUTION_STATUS_LABELS[status]}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {EXECUTION_STATUS_HELP[status]}
              </p>
            </div>

            <ul className="space-y-3">
              {group.map((request, index) => {
                const isOpen = openId === request.id;
                return (
                  <li key={request.id.toString()}>
                    <article
                      data-ocid={`os.governance.execution_request.${index + 1}`}
                      className="shell-panel space-y-3 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0 space-y-1">
                          <h4 className="min-w-0 font-display text-base font-medium text-foreground">
                            {proposalTitle(request.proposal)}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {classificationLabel(
                              proposalClassification(request.proposal),
                            )}
                          </p>
                        </div>
                        <span
                          className={`text-stamp inline-flex shrink-0 items-center rounded-sm border border-border bg-muted px-2 py-1 ${
                            OPEN_STATUSES.has(request.status)
                              ? "gov-execution-pending"
                              : "text-muted-foreground"
                          }`}
                        >
                          {EXECUTION_STATUS_LABELS[request.status]}
                        </span>
                      </div>

                      <p className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                        <ShieldCheck
                          className="mt-0.5 size-4 shrink-0 text-accent"
                          aria-hidden="true"
                        />
                        {authorizationNote(request)}
                      </p>

                      <button
                        type="button"
                        data-ocid={`os.governance.execution_audit_toggle.${index + 1}`}
                        aria-expanded={isOpen}
                        onClick={() => setOpenId(isOpen ? null : request.id)}
                        className="os-focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-input bg-card px-4 py-2 text-sm font-medium text-foreground transition-smooth hover:border-accent hover:bg-accent/10"
                      >
                        <History className="size-4" aria-hidden="true" />
                        {isOpen ? "Hide the record" : "See the record"}
                        <ChevronDown
                          className={`size-4 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                          aria-hidden="true"
                        />
                      </button>

                      {isOpen ? <ExecutionAudit request={request.id} /> : null}
                    </article>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

/** The step-by-step audit trail for one execution request. */
function ExecutionAudit({ request }: { request: bigint }) {
  const auditQuery = useExecutionAudit(request);
  const entries = auditQuery.data ?? [];

  if (auditQuery.isLoading) {
    return (
      <div
        data-ocid="os.governance.execution_audit_loading"
        className="space-y-2"
        aria-busy="true"
      >
        {Array.from({ length: 2 }, (_, i) => `audit-skeleton-${i}`).map(
          (id) => (
            <div
              key={id}
              className="h-10 animate-pulse rounded-md bg-muted/40"
            />
          ),
        )}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <p
        data-ocid="os.governance.execution_audit_empty"
        className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
      >
        There is no record for this request yet.
      </p>
    );
  }

  return (
    <ol
      data-ocid="os.governance.execution_audit"
      className="space-y-2 border-t border-border pt-3"
    >
      {entries.map((entry, index) => (
        <li
          key={entry.id.toString()}
          data-ocid={`os.governance.execution_audit_entry.${index + 1}`}
          className="gov-demo-impact space-y-0.5 py-1 pl-3"
        >
          <p className="text-sm font-medium text-foreground">{entry.action}</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {entry.note}
          </p>
        </li>
      ))}
    </ol>
  );
}
