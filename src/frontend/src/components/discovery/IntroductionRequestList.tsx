import { Check, X } from "lucide-react";

import { type IntroductionRequest, IntroductionStatus } from "@/backend";

const STATUS_CLASS: Record<IntroductionStatus, string> = {
  pending: "status-progress",
  approved: "status-won",
  declined: "status-closed",
};

function partyLabel(party: IntroductionRequest["requester"]): string {
  return party.__kind__ === "community"
    ? `Community #${party.community.toString()}`
    : `Member ${party.member.toString().slice(0, 8)}…`;
}

/**
 * Introduction requests involving the caller. Both parties must approve before
 * private contact details are shared, so each pending request exposes an
 * approve and a decline action.
 */
export default function IntroductionRequestList({
  requests,
  onRespond,
  pending,
}: {
  requests: IntroductionRequest[];
  onRespond: (requestId: bigint, approve: boolean) => void;
  pending?: boolean;
}) {
  return (
    <ul
      data-ocid="discovery.introduction_list"
      className="network-panel divide-y divide-border"
    >
      {requests.map((request, index) => {
        const awaitingCaller =
          request.status === IntroductionStatus.pending &&
          (!request.requesterApproved || !request.targetApproved);
        return (
          <li
            key={request.id.toString()}
            data-ocid={`discovery.introduction_row.${index}`}
            className="flex flex-col gap-2 px-4 py-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                {partyLabel(request.requester)} → {partyLabel(request.target)}
              </span>
              <span className={`status-chip ${STATUS_CLASS[request.status]}`}>
                {request.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{request.message}</p>
            {awaitingCaller ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  data-ocid={`discovery.introduction_row.approve_button.${index}`}
                  disabled={pending}
                  onClick={() => onRespond(request.id, true)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-smooth hover:bg-primary/90 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <Check className="size-3.5" aria-hidden="true" />
                  Approve
                </button>
                <button
                  type="button"
                  data-ocid={`discovery.introduction_row.decline_button.${index}`}
                  disabled={pending}
                  onClick={() => onRespond(request.id, false)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-smooth hover:bg-muted disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <X className="size-3.5" aria-hidden="true" />
                  Decline
                </button>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
