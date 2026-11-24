import {
  type Amendment,
  type Appeal,
  type AppealId,
  type CensusEntry,
  type CensusSummary,
  type ExecutionRequest,
  type FoundingAppointment,
  type FoundingSetup,
  type GovernanceHistoryEntry,
  type NationId,
  type RoleAssignment,
  type RoleDelegation,
  createActor,
} from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";

/* ------------------------------------------------------------------ */
/* Governance Activity reads — the Participation Census, appeals,      */
/* founding setup and the records behind the governance history.       */
/* ------------------------------------------------------------------ */

/** A Nation's Participation Census entries, with confidential detail redacted. */
export function useCensusEntries(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["censusEntries", nation.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listCensusEntries(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** A Nation's Participation Census summary: who is eligible and who took part. */
export function useCensusSummary(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["censusSummary", nation.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCensusSummary(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** A Nation's appeals, including evidence, recusals and the recorded decision. */
export function useAppeals(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["appeals", nation.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAppeals(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** A Nation's founding setup state, or null when it has none. */
export function useFoundingSetup(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["foundingSetup", nation.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getFoundingSetup(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** A Nation's founding appointments and their acceptance state. */
export function useFoundingAppointments(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["foundingAppointments", nation.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listFoundingAppointments(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** A Nation's founding acceptance progress: accepted vs required, and whether it is active. */
export function useFoundingStatus(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["foundingStatus", nation.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getFoundingStatus(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** A Nation's auditable governance history: appointments, votes, approvals and amendments. */
export function useGovernanceHistory(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["governanceHistory", nation.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listGovernanceHistory(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** A Nation's constitution amendment history, each with its rules in effect. */
export function useAmendments(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["amendments", nation.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAmendments(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** A Nation's execution requests: approved decisions and their outcome. */
export function useExecutionRequests(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["executionRequests", nation.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listExecutionRequests(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** A Nation's role delegations, including expired and revoked ones. */
export function useRoleDelegations(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["roleDelegations", nation.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listRoleDelegations(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** A Nation's role assignments: who holds which role and when it was granted. */
export function useRoleAssignments(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["roleAssignments", nation.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listRoleAssignments(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

export type {
  Amendment,
  Appeal,
  AppealId,
  CensusEntry,
  CensusSummary,
  ExecutionRequest,
  FoundingAppointment,
  FoundingSetup,
  GovernanceHistoryEntry,
  RoleAssignment,
  RoleDelegation,
};
