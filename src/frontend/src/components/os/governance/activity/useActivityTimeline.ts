import { useMemo } from "react";

import type {
  Amendment,
  Appeal,
  CensusEntry,
  ExecutionRequest,
  GovernanceProposal,
  RoleAssignment,
  RoleDelegation,
} from "@/backend";
import {
  appealKindLabel,
  appealStatusLabel,
  censusKindLabel,
  executionStatusLabel,
  formatDateTime,
  personLabel,
  proposalStatusLabel,
} from "@/components/os/governance/activity/activityLabels";
import {
  useAmendments,
  useAppeals,
  useCensusEntries,
  useExecutionRequests,
  useGovernanceProposals,
  useRoleAssignments,
  useRoleDelegations,
} from "@/components/os/governance/activity/useActivityData";

/** The kind of thing that happened, used to pick an icon and a colour. */
export type TimelineKind =
  | "decision"
  | "vote"
  | "member"
  | "rule"
  | "appeal"
  | "execution";

/** One plain-language entry in the organization's activity timeline. */
export interface TimelineEntry {
  /** A stable identity for React keys, never shown to the reader. */
  id: string;
  kind: TimelineKind;
  /** One short sentence stating what happened. */
  what: string;
  /** Who did it, in plain language. */
  who: string;
  /** When it happened, as a nanosecond timestamp for sorting. */
  timestamp: bigint;
}

/** Build one timeline entry from a decision (proposal). */
function fromProposal(proposal: GovernanceProposal): TimelineEntry {
  return {
    id: `decision-${proposal.id.toString()}`,
    kind: "decision",
    what: `A decision was put forward: ${proposal.title}. It is ${proposalStatusLabel(
      proposal.status,
    )}.`,
    who: personLabel(proposal.proposer),
    timestamp: proposal.timestamp,
  };
}

/** Build one timeline entry from a recorded census event. */
function fromCensus(entry: CensusEntry): TimelineEntry {
  const kind: TimelineKind =
    entry.kind === "vote"
      ? "vote"
      : entry.kind === "membershipApproval" ||
          entry.kind === "permissionChange" ||
          entry.kind === "activity"
        ? "member"
        : entry.kind === "executionOutcome"
          ? "execution"
          : entry.kind === "dispute"
            ? "appeal"
            : "decision";
  return {
    id: `census-${entry.id.toString()}`,
    kind,
    what: `${censusKindLabel(entry.kind)}: ${entry.summary}`,
    who: personLabel(entry.subject),
    timestamp: entry.timestamp,
  };
}

/** Build one timeline entry from a rule change (amendment). */
function fromAmendment(amendment: Amendment): TimelineEntry {
  return {
    id: `amendment-${amendment.id.toString()}`,
    kind: "rule",
    what: `The rules were changed: ${amendment.summary}`,
    who: personLabel(amendment.authorizedBy),
    timestamp: amendment.timestamp,
  };
}

/** Build one timeline entry from an appeal and its current progress. */
function fromAppeal(appeal: Appeal): TimelineEntry {
  return {
    id: `appeal-${appeal.id.toString()}`,
    kind: "appeal",
    what: `An appeal was filed about ${appealKindLabel(
      appeal.kind,
    ).toLowerCase()}: ${appeal.summary}. It is ${appealStatusLabel(
      appeal.status,
    ).toLowerCase()}.`,
    who: personLabel(appeal.appellant),
    timestamp: appeal.timestamp,
  };
}

/** Build one timeline entry from an approved decision being carried out. */
function fromExecution(request: ExecutionRequest): TimelineEntry {
  return {
    id: `execution-${request.id.toString()}`,
    kind: "execution",
    what: `An approved decision is ${executionStatusLabel(request.status)}.`,
    who: personLabel(request.requestedBy),
    timestamp: request.timestamp,
  };
}

/** Build one timeline entry from a member being given a role. */
function fromAssignment(assignment: RoleAssignment): TimelineEntry {
  return {
    id: `assignment-${assignment.id.toString()}`,
    kind: "member",
    what: "A member was given a new role and the permissions that come with it.",
    who: personLabel(assignment.member),
    timestamp: assignment.timestamp,
  };
}

/** Build one timeline entry from decision-making power being shared. */
function fromDelegation(delegation: RoleDelegation): TimelineEntry {
  return {
    id: `delegation-${delegation.id.toString()}`,
    kind: "member",
    what: delegation.active
      ? "A member shared their decision-making power with someone else."
      : "A shared decision-making arrangement ended.",
    who: personLabel(delegation.delegator),
    timestamp: delegation.timestamp,
  };
}

/**
 * The organization's activity timeline: one plain-language list of what has
 * happened, newest first, drawn from decisions, votes, member changes, rule
 * changes, appeals and approved actions. Every entry states what happened, who
 * did it and when, with no technical identifier shown.
 */
export function useActivityTimeline(nation: bigint) {
  const proposals = useGovernanceProposals(nation);
  const census = useCensusEntries(nation);
  const amendments = useAmendments(nation);
  const appeals = useAppeals(nation);
  const executions = useExecutionRequests(nation);
  const assignments = useRoleAssignments(nation);
  const delegations = useRoleDelegations(nation);

  const entries = useMemo<TimelineEntry[]>(() => {
    const all: TimelineEntry[] = [
      ...(proposals.data ?? []).map(fromProposal),
      ...(census.data ?? []).map(fromCensus),
      ...(amendments.data ?? []).map(fromAmendment),
      ...(appeals.data ?? []).map(fromAppeal),
      ...(executions.data ?? []).map(fromExecution),
      ...(assignments.data ?? []).map(fromAssignment),
      ...(delegations.data ?? []).map(fromDelegation),
    ];
    return all.sort((a, b) => Number(b.timestamp - a.timestamp));
  }, [
    proposals.data,
    census.data,
    amendments.data,
    appeals.data,
    executions.data,
    assignments.data,
    delegations.data,
  ]);

  const isLoading =
    proposals.isLoading ||
    census.isLoading ||
    amendments.isLoading ||
    appeals.isLoading ||
    executions.isLoading ||
    assignments.isLoading ||
    delegations.isLoading;

  const isError =
    proposals.isError ||
    census.isError ||
    amendments.isError ||
    appeals.isError ||
    executions.isError ||
    assignments.isError ||
    delegations.isError;

  const refetch = useMemo(
    () => () => {
      void proposals.refetch();
      void census.refetch();
      void amendments.refetch();
      void appeals.refetch();
      void executions.refetch();
      void assignments.refetch();
      void delegations.refetch();
    },
    [
      proposals,
      census,
      amendments,
      appeals,
      executions,
      assignments,
      delegations,
    ],
  );

  return { entries, isLoading, isError, refetch };
}

/** A short, plain-language "when" for a timeline entry. */
export function entryWhen(timestamp: bigint): string {
  return formatDateTime(timestamp);
}
