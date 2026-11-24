import { Check, Clock, Loader2, ShieldCheck, UserCheck, X } from "lucide-react";

import type { Principal } from "@icp-sdk/core/principal";

import { type JoinRequest, JoinRequestStatus } from "@/backend";
import { formatDate } from "@/components/os/governance/activity/activityLabels";
import {
  memberInitials,
  shortPrincipal,
} from "@/components/os/governance/members/membersCopy";

/**
 * The join-request queue for authorized approvers. Each request shows who is
 * asking, why, how many approvals it still needs and when it expires, with a
 * clear approve or reject action. Every rule — the threshold, who may approve,
 * duplicate prevention and expiry — is enforced by the backend.
 */
export default function JoinRequestList({
  requests,
  canApprove,
  reviewingId,
  onApprove,
  onReject,
}: {
  requests: JoinRequest[];
  canApprove: boolean;
  reviewingId: string | null;
  onApprove: (request: JoinRequest) => void;
  onReject: (request: JoinRequest) => void;
}) {
  const open = requests.filter(
    (request) =>
      request.status === JoinRequestStatus.pendingReview ||
      request.status === JoinRequestStatus.underReview,
  );

  if (open.length === 0) {
    return (
      <p
        data-ocid="os.governance.members.join_requests_empty"
        className="shell-panel p-5 text-sm text-muted-foreground"
      >
        No one is waiting to join right now. When someone asks to join, their
        request appears here for approval.
      </p>
    );
  }

  return (
    <ul data-ocid="os.governance.members.join_requests" className="space-y-3">
      {open.map((request, index) => {
        const requestId = request.id.toString();
        const isReviewing = reviewingId === requestId;
        const approvals = request.approvers.length;
        const required = Number(request.requiredApprovals);
        const remaining = Math.max(required - approvals, 0);
        const name =
          request.displayName || shortPrincipal(request.applicant.toText());

        return (
          <li key={requestId}>
            <div
              data-ocid={`os.governance.members.join_request.${index + 1}`}
              className="shell-panel space-y-3 p-4"
            >
              <div className="flex items-start gap-3">
                <span className="avatar-chip shrink-0" aria-hidden="true">
                  {memberInitials(request.displayName)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Asked to join on {formatDate(request.timestamp)}
                  </p>
                </div>
                <span
                  data-ocid={`os.governance.members.join_request_status.${index + 1}`}
                  className="text-stamp inline-flex shrink-0 items-center gap-1 rounded-sm border border-warning bg-warning/10 px-2 py-1 text-warning-foreground"
                >
                  <Clock className="size-3" aria-hidden="true" />
                  Pending
                </span>
              </div>

              {request.message ? (
                <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm leading-relaxed text-foreground">
                  {request.message}
                </p>
              ) : null}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck
                      className="size-3.5 text-primary"
                      aria-hidden="true"
                    />
                    {approvals} of {required} approvals
                  </span>
                  <span>Expires {formatDate(request.expiresAt)}</span>
                </div>
                <div
                  className="h-1.5 overflow-hidden rounded-sm bg-muted"
                  aria-hidden="true"
                >
                  <div
                    className="h-full rounded-sm bg-primary transition-smooth"
                    style={{
                      width: `${required > 0 ? Math.min((approvals / required) * 100, 100) : 0}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {remaining > 0
                    ? `${remaining} more ${remaining === 1 ? "approval" : "approvals"} needed before they can join.`
                    : "All approvals reached — they can join."}
                </p>
              </div>

              {canApprove ? (
                <div className="flex flex-col gap-2 border-t border-border pt-3 sm:flex-row">
                  <button
                    type="button"
                    data-ocid={`os.governance.members.approve_request_button.${index + 1}`}
                    disabled={isReviewing}
                    onClick={() => onApprove(request)}
                    className="os-focus-ring inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isReviewing ? (
                      <Loader2
                        className="size-4 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <UserCheck className="size-4" aria-hidden="true" />
                    )}
                    Approve
                  </button>
                  <button
                    type="button"
                    data-ocid={`os.governance.members.reject_button.${index + 1}`}
                    disabled={isReviewing}
                    onClick={() => onReject(request)}
                    className="os-focus-ring inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg border border-input bg-card px-4 py-3 text-sm font-semibold text-foreground transition-smooth hover:border-destructive/60 hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <X className="size-4" aria-hidden="true" />
                    Reject
                  </button>
                </div>
              ) : (
                <p className="flex items-center gap-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
                  <Check className="size-3.5 text-success" aria-hidden="true" />
                  Only someone with approval permission can review this request.
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
