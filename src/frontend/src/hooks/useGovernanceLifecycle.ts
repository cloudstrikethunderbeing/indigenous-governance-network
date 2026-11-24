import {
  type AmendmentProposal,
  type AmendmentProposalId,
  type AuthorityPosition,
  type AuthorityPositionId,
  type AuthorityTermEvent,
  type AuthorityTermEventKind,
  type ConstitutionVersion,
  type DepartureKind,
  type Dissolution,
  type DissolutionId,
  type EmergencySuspension,
  type EmergencySuspensionId,
  type LifecycleError,
  type MemberDeparture,
  type MemberDepartureId,
  type NationId,
  type RuleChange,
  type SuccessionRecoveryPlan,
  type Timestamp,
  createActor,
} from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/* ------------------------------------------------------------------ */
/* Governance lifecycle — the Nation's state, activation requirements, */
/* succession and recovery, authority positions and terms, amendments  */
/* and constitution versions, member departures, emergency suspensions */
/* and dissolution. Every call goes through the generated bindings;    */
/* the backend enforces who may do what.                               */
/* ------------------------------------------------------------------ */

/** The lifecycle state of a Nation, with its plain-language explanation. */
export function useNationLifecycle(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["nationLifecycle", nation.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getNationLifecycle(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** What still stands between a Nation and activation. */
export function useActivationRequirements(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["activationRequirements", nation.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getActivationRequirements(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** The Nation's succession and recovery plan, or null when none is set. */
export function useSuccessionPlan(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["successionPlan", nation.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getSuccessionPlan(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** Save (or replace) the Nation's succession and recovery plan. */
export function useSaveSuccessionPlan() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nation: NationId;
      plan: SuccessionRecoveryPlan;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.saveSuccessionPlan(input.nation, input.plan);
    },
    onSuccess: (_result, input) => {
      void queryClient.invalidateQueries({
        queryKey: ["successionPlan", input.nation.toString()],
      });
      void queryClient.invalidateQueries({
        queryKey: ["activationRequirements", input.nation.toString()],
      });
    },
  });
}

/** Ratify the succession plan so it becomes constitutionally binding. */
export function useRatifySuccessionPlan() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (nation: NationId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.ratifySuccessionPlan(nation);
    },
    onSuccess: (_result, nation) => {
      void queryClient.invalidateQueries({
        queryKey: ["successionPlan", nation.toString()],
      });
      void queryClient.invalidateQueries({
        queryKey: ["activationRequirements", nation.toString()],
      });
    },
  });
}

/** The Nation's authority positions, each with its holder and term. */
export function useAuthorityPositions(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["authorityPositions", nation.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAuthorityPositions(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** The permanent appointment and departure history of every authority seat. */
export function useAuthorityTermEvents(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["authorityTermEvents", nation.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAuthorityTermEvents(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** Create a new authority position with its seat label and term. */
export function useCreateAuthorityPosition() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nation: NationId;
      seatLabel: string;
      termStart: Timestamp;
      termEnd: Timestamp;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.createAuthorityPosition(
        input.nation,
        input.seatLabel,
        input.termStart,
        input.termEnd,
      );
    },
    onSuccess: (_result, input) => {
      void queryClient.invalidateQueries({
        queryKey: ["authorityPositions", input.nation.toString()],
      });
      void queryClient.invalidateQueries({
        queryKey: ["authorityTermEvents", input.nation.toString()],
      });
    },
  });
}

/** Appoint a successor to an authority position; they must accept separately. */
export function useAppointAuthoritySuccessor() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nation: NationId;
      position: AuthorityPositionId;
      successor: Principal;
      successorDisplayLabel: string;
      reason: string;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.appointAuthoritySuccessor(
        input.nation,
        input.position,
        input.successor,
        input.successorDisplayLabel,
        input.reason,
      );
    },
    onSuccess: (_result, input) => {
      void queryClient.invalidateQueries({
        queryKey: ["authorityPositions", input.nation.toString()],
      });
      void queryClient.invalidateQueries({
        queryKey: ["authorityTermEvents", input.nation.toString()],
      });
    },
  });
}

/** Accept an appointment to an authority position as the signed-in caller. */
export function useAcceptAuthorityAppointment() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nation: NationId;
      position: AuthorityPositionId;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.acceptAuthorityAppointment(input.nation, input.position);
    },
    onSuccess: (_result, input) => {
      void queryClient.invalidateQueries({
        queryKey: ["authorityPositions", input.nation.toString()],
      });
      void queryClient.invalidateQueries({
        queryKey: ["authorityTermEvents", input.nation.toString()],
      });
    },
  });
}

/** Record an authority's departure: resignation, retirement, removal or replacement. */
export function useRecordAuthorityDeparture() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nation: NationId;
      position: AuthorityPositionId;
      kind: AuthorityTermEventKind;
      reason: string;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.recordAuthorityDeparture(
        input.nation,
        input.position,
        input.kind,
        input.reason,
      );
    },
    onSuccess: (_result, input) => {
      void queryClient.invalidateQueries({
        queryKey: ["authorityPositions", input.nation.toString()],
      });
      void queryClient.invalidateQueries({
        queryKey: ["authorityTermEvents", input.nation.toString()],
      });
    },
  });
}

/** The Nation's amendment proposals, each with its status and rule changes. */
export function useAmendmentProposals(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["amendmentProposals", nation.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAmendmentProposals(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** Every ratified constitution version, newest last. */
export function useConstitutionVersions(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["constitutionVersions", nation.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listConstitutionVersions(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** Propose a constitutional amendment with its rule changes and voting deadline. */
export function useProposeAmendment() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nation: NationId;
      title: string;
      summary: string;
      changes: RuleChange[];
      votingDeadline: Timestamp;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.proposeAmendment(
        input.nation,
        input.title,
        input.summary,
        input.changes,
        input.votingDeadline,
      );
    },
    onSuccess: (_result, input) => {
      void queryClient.invalidateQueries({
        queryKey: ["amendmentProposals", input.nation.toString()],
      });
    },
  });
}

/** Ratify a passed amendment, producing a new constitution version. */
export function useRatifyAmendment() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nation: NationId;
      proposal: AmendmentProposalId;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.ratifyAmendment(input.nation, input.proposal);
    },
    onSuccess: (_result, input) => {
      void queryClient.invalidateQueries({
        queryKey: ["amendmentProposals", input.nation.toString()],
      });
      void queryClient.invalidateQueries({
        queryKey: ["constitutionVersions", input.nation.toString()],
      });
      void queryClient.invalidateQueries({
        queryKey: ["activeConstitution", input.nation.toString()],
      });
    },
  });
}

/** The Nation's member departures, including notice, review and appeal state. */
export function useMemberDepartures(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["memberDepartures", nation.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMemberDepartures(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** Record a member's departure, which revokes their permissions. */
export function useRecordMemberDeparture() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nation: NationId;
      member: Principal;
      kind: DepartureKind;
      notice: string;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.recordMemberDeparture(
        input.nation,
        input.member,
        input.kind,
        input.notice,
      );
    },
    onSuccess: (_result, input) => {
      void queryClient.invalidateQueries({
        queryKey: ["memberDepartures", input.nation.toString()],
      });
      void queryClient.invalidateQueries({
        queryKey: ["nationMembers", input.nation.toString()],
      });
    },
  });
}

/** The Nation's emergency suspensions, active, expired and restored. */
export function useEmergencySuspensions(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["emergencySuspensions", nation.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listEmergencySuspensions(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** Request a narrowly scoped emergency suspension; a second authority must approve. */
export function useRequestEmergencySuspension() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nation: NationId;
      reason: string;
      affectedAccounts: Principal[];
      affectedFunctions: string[];
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.requestEmergencySuspension(
        input.nation,
        input.reason,
        input.affectedAccounts,
        input.affectedFunctions,
      );
    },
    onSuccess: (_result, input) => {
      void queryClient.invalidateQueries({
        queryKey: ["emergencySuspensions", input.nation.toString()],
      });
    },
  });
}

/** Approve a pending emergency suspension as a second authority. */
export function useApproveEmergencySuspension() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nation: NationId;
      suspension: EmergencySuspensionId;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.approveEmergencySuspension(input.nation, input.suspension);
    },
    onSuccess: (_result, input) => {
      void queryClient.invalidateQueries({
        queryKey: ["emergencySuspensions", input.nation.toString()],
      });
    },
  });
}

/** Restore normal operation after an emergency suspension. */
export function useRestoreEmergencySuspension() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nation: NationId;
      suspension: EmergencySuspensionId;
      note: string;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.restoreEmergencySuspension(
        input.nation,
        input.suspension,
        input.note,
      );
    },
    onSuccess: (_result, input) => {
      void queryClient.invalidateQueries({
        queryKey: ["emergencySuspensions", input.nation.toString()],
      });
    },
  });
}

/** The Nation's dissolution proposals and their cooling-off state. */
export function useDissolutions(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["dissolutions", nation.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listDissolutions(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** Propose dissolving the Nation; it needs a 90% vote and a cooling-off period. */
export function useProposeDissolution() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nation: NationId;
      proposal: string;
      explanation: string;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.proposeDissolution(
        input.nation,
        input.proposal,
        input.explanation,
      );
    },
    onSuccess: (_result, input) => {
      void queryClient.invalidateQueries({
        queryKey: ["dissolutions", input.nation.toString()],
      });
    },
  });
}

/** Archive a completed dissolution, closing the Nation's record. */
export function useArchiveDissolution() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nation: NationId;
      dissolution: DissolutionId;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.archiveDissolution(input.nation, input.dissolution);
    },
    onSuccess: (_result, input) => {
      void queryClient.invalidateQueries({
        queryKey: ["dissolutions", input.nation.toString()],
      });
      void queryClient.invalidateQueries({
        queryKey: ["nationLifecycle", input.nation.toString()],
      });
    },
  });
}

/** Cancel a draft Nation that was never activated. */
export function useCancelDraftNation() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (nation: NationId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.cancelDraftNation(nation);
    },
    onSuccess: (_result, nation) => {
      void queryClient.invalidateQueries({
        queryKey: ["nationLifecycle", nation.toString()],
      });
      void queryClient.invalidateQueries({ queryKey: ["nations"] });
    },
  });
}

/** A plain-language message for a failed lifecycle action. */
export function lifecycleErrorMessage(error: LifecycleError): string {
  switch (error) {
    case "notAuthorized":
      return "You do not have permission to do this.";
    case "quorumNotReached":
      return "Not enough authorities have approved this yet.";
    case "approvalThresholdNotMet":
      return "The required approval threshold has not been met.";
    case "duplicateApproval":
      return "This has already been approved by that authority.";
    case "planNotRatified":
      return "The succession plan must be ratified first.";
    case "successorNotAccepted":
      return "The successor has not accepted the appointment yet.";
    case "coolingOffNotElapsed":
      return "The cooling-off period has not finished yet.";
    case "obligationsNotReviewed":
      return "Outstanding obligations must be reviewed first.";
    case "emergencyScopeExceeded":
      return "Emergency powers cannot be used for this action.";
    case "invalidLifecycleTransition":
      return "This step is not allowed in the Nation's current state.";
    case "alreadyArchived":
      return "This Nation is already archived.";
    case "notActivatedDraft":
      return "Only a draft that was never activated can be cancelled.";
    case "missingTitle":
      return "A title is required.";
    case "invalidThreshold":
      return "That approval threshold is not valid.";
    case "duplicateIdentity":
      return "Each authority must be a different person.";
    case "notNationMember":
      return "Only members of this Nation can do this.";
    case "unknownPosition":
      return "That authority position could not be found.";
    case "unknownSuspension":
      return "That emergency suspension could not be found.";
    case "unknownDissolution":
      return "That dissolution could not be found.";
    case "unknownAmendment":
      return "That amendment could not be found.";
    default:
      return "That action could not be completed. Please try again.";
  }
}

export type {
  AmendmentProposal,
  AmendmentProposalId,
  AuthorityPosition,
  AuthorityPositionId,
  AuthorityTermEvent,
  AuthorityTermEventKind,
  ConstitutionVersion,
  DepartureKind,
  Dissolution,
  DissolutionId,
  EmergencySuspension,
  EmergencySuspensionId,
  LifecycleError,
  MemberDeparture,
  MemberDepartureId,
  RuleChange,
  SuccessionRecoveryPlan,
};
