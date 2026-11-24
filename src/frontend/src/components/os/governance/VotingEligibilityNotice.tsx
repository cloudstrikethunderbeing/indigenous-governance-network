import { CheckCircle2, Info, ShieldAlert } from "lucide-react";

import { EligibilityRestriction, type VotingEligibility } from "@/backend";
import { formatDate } from "@/components/os/governance/activity/activityLabels";

/** A plain-language reason for a voting restriction, with a next step. */
function restrictionCopy(restriction: EligibilityRestriction): {
  title: string;
  detail: string;
} {
  switch (restriction) {
    case "notAdmitted":
      return {
        title: "You are not yet a member",
        detail:
          "Voting opens once your membership is approved. Ask an administrator to review your request.",
      };
    case "waitingPeriod":
      return {
        title: "Your waiting period is still running",
        detail:
          "New members can vote after a short settling-in period. You will be able to vote once it ends.",
      };
    case "inactivity":
      return {
        title: "Your membership is currently inactive",
        detail:
          "Voting needs recent activity. Take part in the organization to restore your eligibility.",
      };
    default:
      return {
        title: "You cannot vote right now",
        detail: "Ask an administrator if you believe this is a mistake.",
      };
  }
}

/**
 * The caller's own voting eligibility, shown before they vote. An eligible
 * member sees a short confirmation; a restricted member sees the plain reason
 * and what to do next, so a blocked vote is never a mystery.
 */
export default function VotingEligibilityNotice({
  eligibility,
  isLoading,
}: {
  eligibility: VotingEligibility | null;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div
        data-ocid="os.governance.eligibility.loading_state"
        className="shell-panel h-16 animate-pulse bg-muted/40"
        aria-busy="true"
      />
    );
  }

  if (!eligibility) {
    return (
      <div
        data-ocid="os.governance.eligibility.unknown_state"
        className="shell-panel flex items-start gap-3 p-4"
      >
        <Info
          className="mt-0.5 size-5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <p className="text-sm leading-relaxed text-muted-foreground">
          Your voting status could not be checked right now. You can still read
          every decision.
        </p>
      </div>
    );
  }

  if (eligibility.eligible) {
    return (
      <div
        data-ocid="os.governance.eligibility.eligible_state"
        className="shell-panel flex items-start gap-3 border-success/40 p-4"
      >
        <CheckCircle2
          className="mt-0.5 size-5 shrink-0 text-success"
          aria-hidden="true"
        />
        <div className="min-w-0 space-y-0.5">
          <p className="text-sm font-medium text-foreground">
            You can vote on decisions
          </p>
          {eligibility.eligibleFrom !== undefined ? (
            <p className="text-xs text-muted-foreground">
              Eligible since {formatDate(eligibility.eligibleFrom)}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  const copy = restrictionCopy(
    eligibility.restriction ?? EligibilityRestriction.notAdmitted,
  );

  return (
    <output
      data-ocid="os.governance.eligibility.restricted_state"
      className="shell-panel flex items-start gap-3 border-warning/50 p-4"
    >
      <ShieldAlert
        className="mt-0.5 size-5 shrink-0 text-warning"
        aria-hidden="true"
      />
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-medium text-foreground">{copy.title}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {copy.detail}
        </p>
      </div>
    </output>
  );
}
