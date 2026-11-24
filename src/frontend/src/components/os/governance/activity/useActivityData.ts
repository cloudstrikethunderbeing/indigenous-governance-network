import {
  type Amendment,
  type Appeal,
  type AppealId,
  type AppealKind,
  type CensusEntry,
  type CensusSummary,
  type NationId,
  type RoleAssignment,
  type RoleDelegation,
  createActor,
} from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Reads and writes for the Activity section. These wrap the backend's
 * governance methods so the section body never calls the actor directly. The
 * timeline reads decisions, votes, member changes, rule changes, appeals and
 * approved actions for one Nation only.
 */

// The timeline also reads decisions and their execution step, which the
// Decisions section already owns. Re-exported here so the Activity section has
// one import surface.
export {
  useExecutionRequests,
  useGovernanceProposals,
} from "@/components/os/governance/decisions/useGovernanceDecisions";

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

/** Refresh every Activity query after an appeal is filed or updated. */
function useInvalidateActivity() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["appeals"] });
    void queryClient.invalidateQueries({ queryKey: ["censusEntries"] });
    void queryClient.invalidateQueries({ queryKey: ["censusSummary"] });
  };
}

/** File an appeal about a decision a member disagrees with. */
export function useFileAppeal() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateActivity();
  return useMutation({
    mutationFn: async (input: {
      nation: NationId;
      kind: AppealKind;
      subjectId: bigint;
      summary: string;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.fileAppeal(
        input.nation,
        input.kind,
        input.subjectId,
        input.summary,
      );
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Add a piece of evidence to an appeal that is already filed. */
export function useAddAppealEvidence() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateActivity();
  return useMutation({
    mutationFn: async (input: {
      appeal: AppealId;
      evidenceLabel: string;
      detail: string;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.addAppealEvidence(
        input.appeal,
        input.evidenceLabel,
        input.detail,
      );
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export type {
  Amendment,
  Appeal,
  AppealId,
  CensusEntry,
  CensusSummary,
  RoleAssignment,
  RoleDelegation,
};
