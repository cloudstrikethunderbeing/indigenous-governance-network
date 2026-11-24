import {
  ExecutionStatus,
  GovernanceProposalStatus,
  ProposalOutcome,
} from "@/backend";

/**
 * Plain-language labels for the Decisions section. Every label is written so a
 * member who has never seen governance software can understand it, and every
 * status is carried by words, never by colour alone.
 */

/** A plain-language label for a governance proposal's stage. */
export const PROPOSAL_STATUS_LABELS: Record<GovernanceProposalStatus, string> =
  {
    [GovernanceProposalStatus.draft]: "Being written",
    [GovernanceProposalStatus.discussion]: "Open for discussion",
    [GovernanceProposalStatus.review]: "Under review",
    [GovernanceProposalStatus.voting]: "Open for voting",
    [GovernanceProposalStatus.passed]: "Passed",
    [GovernanceProposalStatus.rejected]: "Not passed",
    [GovernanceProposalStatus.withdrawn]: "Withdrawn",
  };

/** A plain-language label for a proposal's final outcome, when it has one. */
export const PROPOSAL_OUTCOME_LABELS: Record<ProposalOutcome, string> = {
  [ProposalOutcome.approved]: "Approved",
  [ProposalOutcome.rejected]: "Not approved",
  [ProposalOutcome.tied]: "Tied",
  [ProposalOutcome.noQuorum]: "Not enough people took part",
};

/** A plain-language label for an execution request's state. */
export const EXECUTION_STATUS_LABELS: Record<ExecutionStatus, string> = {
  [ExecutionStatus.pendingAuthorization]: "Waiting for authorization",
  [ExecutionStatus.timelocked]: "Waiting out the safety delay",
  [ExecutionStatus.executed]: "Carried out",
  [ExecutionStatus.cancelled]: "Cancelled",
  [ExecutionStatus.rejected]: "Not carried out",
  [ExecutionStatus.paused]: "Paused",
};

/** One plain sentence explaining what each execution state means. */
export const EXECUTION_STATUS_HELP: Record<ExecutionStatus, string> = {
  [ExecutionStatus.pendingAuthorization]:
    "Someone asked to carry this out. It needs a separate authorization first.",
  [ExecutionStatus.timelocked]:
    "Authorized, and waiting out a safety delay so it can still be cancelled.",
  [ExecutionStatus.executed]: "This action has been carried out.",
  [ExecutionStatus.cancelled]: "This action was cancelled before it ran.",
  [ExecutionStatus.rejected]: "This action was not carried out.",
  [ExecutionStatus.paused]:
    "Execution is paused for this organization, so nothing runs right now.",
};

/** The order execution requests are grouped in, from earliest to final. */
export const EXECUTION_STATUS_ORDER: ExecutionStatus[] = [
  ExecutionStatus.pendingAuthorization,
  ExecutionStatus.timelocked,
  ExecutionStatus.executed,
  ExecutionStatus.cancelled,
  ExecutionStatus.rejected,
  ExecutionStatus.paused,
];

/**
 * Turn a backend classification string into a plain-language label. The
 * backend stores classifications such as "treasuryExpenditure" or
 * "constitutionalAmendment"; a member should read "Treasury spending" instead.
 */
export function classificationLabel(classification: string): string {
  const key = classification.trim().toLowerCase();
  switch (key) {
    case "treasuryexpenditure":
    case "treasury":
      return "Treasury spending";
    case "constitutional":
    case "constitution":
    case "constitutionalchange":
    case "constitutionalamendment":
      return "Change to the rules";
    case "authoritychange":
    case "authority":
      return "Change to who holds authority";
    case "destructiveaction":
    case "destructive":
      return "Destructive action";
    case "governanceparameters":
      return "Change to how decisions are made";
    case "general":
      return "General decision";
    default:
      return classification.length > 0 ? classification : "General decision";
  }
}

/**
 * Whether a classification needs extra authorization before it can run. This
 * mirrors the backend's high-risk rule: treasury transfers, rule changes,
 * authority changes and destructive actions.
 */
export function needsExtraAuthorization(classification: string): boolean {
  const key = classification.trim().toLowerCase();
  return (
    key.includes("treasury") ||
    key.includes("constitution") ||
    key.includes("amendment") ||
    key.includes("authority") ||
    key.includes("destructive") ||
    key.includes("dissolution") ||
    key.includes("emergency")
  );
}

/** A plain-language label for a period given in whole days. */
export function periodLabel(days: bigint): string {
  const value = Number(days);
  if (value <= 0) return "No set period";
  return value === 1 ? "1 day" : `${value} days`;
}
