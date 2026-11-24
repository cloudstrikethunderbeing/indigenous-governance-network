import type { Principal } from "@icp-sdk/core/principal";

import type {
  AppealKind,
  AppealStatus,
  CensusEventKind,
  ExecutionStatus,
  GovernanceProposalStatus,
} from "@/backend";

/**
 * Plain-language labels and formatting for the Activity timeline. Every label
 * is written so a member who does not know governance terminology can read the
 * record: what happened, who did it and when. No technical identifier — no
 * principal hash, no proposal id, no rules version — is ever shown.
 */

/** Convert a nanosecond backend timestamp to a Date, or null when invalid. */
export function timestampToDate(timestamp: bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** A short absolute date, e.g. "Apr 11, 2026". */
export function formatDate(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "Date not recorded";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** A short date and time, e.g. "Apr 11, 2026, 10:42". */
export function formatDateTime(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "Date not recorded";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** A friendly, non-technical name for a person, e.g. "Member 4F2A". */
export function personLabel(principal: Principal): string {
  const text = principal.toText();
  if (text.length === 0) return "A member";
  const tail = text
    .replace(/[^a-z0-9]/gi, "")
    .slice(-4)
    .toUpperCase();
  return tail.length > 0 ? `Member ${tail}` : "A member";
}

/** The plain-language name of a census event kind. */
export function censusKindLabel(kind: CensusEventKind): string {
  switch (kind) {
    case "membershipApproval":
      return "Member change";
    case "activity":
      return "Member activity";
    case "proposal":
      return "New decision";
    case "vote":
      return "Vote cast";
    case "delegation":
      return "Power shared";
    case "permissionChange":
      return "Member change";
    case "dispute":
      return "Appeal opened";
    case "executionOutcome":
      return "Decision carried out";
    default:
      return "Organization update";
  }
}

/** The plain-language name of an appeal kind. */
export function appealKindLabel(kind: AppealKind): string {
  switch (kind) {
    case "membershipRejection":
      return "A membership decision";
    case "inactivity":
      return "An inactivity decision";
    case "governanceDecision":
      return "A governance decision";
    default:
      return "A decision";
  }
}

/** The plain-language name of an appeal status. */
export function appealStatusLabel(status: AppealStatus): string {
  switch (status) {
    case "submitted":
      return "Submitted";
    case "underReview":
      return "Under review";
    case "upheld":
      return "Upheld";
    case "denied":
      return "Denied";
    case "withdrawn":
      return "Withdrawn";
    default:
      return "In progress";
  }
}

/** The CSS class that colours an appeal status. */
export function appealStatusClass(status: AppealStatus): string {
  switch (status) {
    case "submitted":
      return "gov-appeal-open";
    case "underReview":
      return "gov-appeal-review";
    default:
      return "gov-appeal-resolved";
  }
}

/** The plain-language name of an execution status. */
export function executionStatusLabel(status: ExecutionStatus): string {
  switch (status) {
    case "pendingAuthorization":
      return "waiting for approval";
    case "timelocked":
      return "waiting out a safety delay";
    case "executed":
      return "carried out";
    case "rejected":
      return "rejected";
    case "cancelled":
      return "cancelled";
    case "paused":
      return "paused";
    default:
      return "in progress";
  }
}

/** The plain-language name of a decision's status. */
export function proposalStatusLabel(status: GovernanceProposalStatus): string {
  switch (status) {
    case "review":
      return "under review";
    case "voting":
      return "being voted on";
    case "rejected":
      return "rejected";
    case "discussion":
      return "being discussed";
    case "withdrawn":
      return "withdrawn";
    case "draft":
      return "being drafted";
    case "passed":
      return "approved";
    default:
      return "in progress";
  }
}
