import { CheckCircle2, Info, ShieldAlert } from "lucide-react";

import { EligibilityRestriction, type VotingEligibility } from "@/backend";
import { formatDate } from "@/components/os/governance/activity/activityLabels";

/**
 * The signed-in member's own voting eligibility, stated plainly before they
 * vote. When they cannot vote yet, the specific reason is shown — still in a
 * waiting period, not active long enough, or not yet admitted — along with the
 * date they become eligible when the backend provides one.
 */
export default function VotingEligibilityCard({
  eligibility,
  isLoading,
}: {
  eligibility: VotingEligibility | null;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div
        data-ocid="os.governance.members.eligibility_loading"
        aria-busy="true"
        className="shell-panel h-20 animate-pulse bg-muted/40"
      />
    );
  }

  if (!eligibility) {
    return (
      <p
        data-ocid="os.governance.members.eligibility_unavailable"
        className="shell-panel flex items-start gap-3 p-4 text-sm text-muted-foreground"
      >
        <Info className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        Your voting status could not be checked right now.
      </p>
    );
  }

  if (eligibility.eligible) {
    return (
      <p
        data-ocid="os.governance.members.eligibility_eligible"
        className="shell-panel flex items-start gap-3 p-4 text-sm text-foreground"
      >
        <CheckCircle2
          className="mt-0.5 size-5 shrink-0 text-success"
          aria-hidden="true"
        />
        <span>
          You can vote on decisions in this organization.
          {eligibility.eligibleFrom
            ? ` You became eligible on ${formatDate(eligibility.eligibleFrom)}.`
            : ""}
        </span>
      </p>
    );
  }

  const reason = restrictionReason(eligibility.restriction);
  const from = eligibility.eligibleFrom
    ? ` You can vote from ${formatDate(eligibility.eligibleFrom)}.`
    : "";

  return (
    <div
      data-ocid="os.governance.members.eligibility_restricted"
      className="shell-panel flex items-start gap-3 border-warning/50 p-4 text-sm text-foreground"
    >
      <ShieldAlert
        className="mt-0.5 size-5 shrink-0 text-warning"
        aria-hidden="true"
      />
      <div className="min-w-0 space-y-1">
        <p className="font-medium">You cannot vote yet</p>
        <p className="leading-relaxed text-muted-foreground">
          {reason}
          {from}
        </p>
      </div>
    </div>
  );
}

/** A plain sentence explaining why a member cannot vote yet. */
function restrictionReason(
  restriction: EligibilityRestriction | undefined,
): string {
  switch (restriction) {
    case EligibilityRestriction.waitingPeriod:
      return "New members wait a short period after joining before they can vote.";
    case EligibilityRestriction.inactivity:
      return "You have not taken part recently enough to meet the organization's activity requirement.";
    case EligibilityRestriction.notAdmitted:
      return "You are not yet an active member of this organization.";
    default:
      return "You do not meet the organization's rules for voting right now.";
  }
}
