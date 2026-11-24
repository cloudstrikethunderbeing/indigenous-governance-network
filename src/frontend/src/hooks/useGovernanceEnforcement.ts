import {
  type DecisionKind,
  type FoundingAppointment,
  type GovernanceHistoryEntry,
  type JoinRequest,
  type JoinRequestId,
  type NationId,
  type RecordedVote,
  type VotingEligibility,
  createActor,
} from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/* ------------------------------------------------------------------ */
/* Governance enforcement — founding status, invitations, history,     */
/* join requests, membership invitations, eligibility and votes.       */
/* ------------------------------------------------------------------ */

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

/**
 * A Nation's launch status as the signed-in caller sees it: which founding
 * seats the caller already holds, which seats are still awaiting other people,
 * and a plain-language reason when the launch cannot continue.
 */
export function useLaunchStatus(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["launchStatus", nation.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getLaunchStatus(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** A Nation's founding appointments and their acceptance state. */
export function useFoundingInvitations(nation: NationId) {
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

/** A Nation's join requests, including approvers and required approvals. */
export function useJoinRequests(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["joinRequests", nation.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listJoinRequests(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** A Nation's voting eligibility for the current caller, with any restriction reason. */
export function useVotingEligibility(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["votingEligibility", nation.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getVotingEligibility(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** The recorded votes on a single decision. */
export function useRecordedVotes(nation: NationId, decision: DecisionKind) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["recordedVotes", nation.toString(), decisionKey(decision)],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listRecordedVotes(nation, decision);
    },
    enabled: !!actor && !isFetching,
  });
}

/** A member's membership approval progress: approvals received vs required. */
export function useMembershipApprovalStatus(
  nation: NationId,
  member: Principal,
) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["membershipApprovalStatus", nation.toString(), member.toText()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMembershipApprovalStatus(nation, member);
    },
    enabled: !!actor && !isFetching,
  });
}

/* ------------------------------------------------------------------ */
/* Governance enforcement writes                                       */
/* ------------------------------------------------------------------ */

/** Invite a founding authority by email and refresh the founding lists. */
export function useInviteFoundingAuthority() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nation: NationId;
      invitedEmail: string;
      appointmentLabel: string;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.inviteFoundingAuthority(
        input.nation,
        input.invitedEmail,
        input.appointmentLabel,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["foundingAppointments"],
      });
      void queryClient.invalidateQueries({ queryKey: ["foundingStatus"] });
      void queryClient.invalidateQueries({ queryKey: ["foundingSetup"] });
      void queryClient.invalidateQueries({ queryKey: ["governanceHistory"] });
    },
  });
}

/** Accept a founding invitation with its secure token. */
export function useAcceptFoundingInvitation() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { nation: NationId; token: string }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.acceptFoundingInvitation(input.nation, input.token);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["foundingAppointments"],
      });
      void queryClient.invalidateQueries({ queryKey: ["foundingStatus"] });
      void queryClient.invalidateQueries({ queryKey: ["foundingSetup"] });
      void queryClient.invalidateQueries({ queryKey: ["governanceHistory"] });
    },
  });
}

/** Confirm a founding seat the signed-in caller already holds. */
export function useConfirmFoundingSeat() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { nation: NationId; appointment: bigint }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.confirmFoundingSeat(input.nation, input.appointment);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["foundingAppointments"],
      });
      void queryClient.invalidateQueries({ queryKey: ["foundingStatus"] });
      void queryClient.invalidateQueries({ queryKey: ["launchStatus"] });
      void queryClient.invalidateQueries({ queryKey: ["foundingSetup"] });
      void queryClient.invalidateQueries({ queryKey: ["governanceHistory"] });
    },
  });
}

/** Resume a launch that stopped part-way, returning the refreshed launch status. */
export function useResumeLaunch() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (nation: NationId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.resumeLaunch(nation);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["launchStatus"] });
      void queryClient.invalidateQueries({ queryKey: ["foundingStatus"] });
      void queryClient.invalidateQueries({
        queryKey: ["foundingAppointments"],
      });
      void queryClient.invalidateQueries({ queryKey: ["foundingSetup"] });
      void queryClient.invalidateQueries({ queryKey: ["myNations"] });
    },
  });
}

/** Submit a join request to a Nation. */
export function useSubmitJoinRequest() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nation: NationId;
      displayName: string;
      message: string;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.submitJoinRequest(
        input.nation,
        input.displayName,
        input.message,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["joinRequests"] });
      void queryClient.invalidateQueries({ queryKey: ["governanceHistory"] });
    },
  });
}

/** Approve or reject a join request as an authorized approver. */
export function useReviewJoinRequest() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nation: NationId;
      request: JoinRequestId;
      approve: boolean;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.reviewJoinRequest(
        input.nation,
        input.request,
        input.approve,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["joinRequests"] });
      void queryClient.invalidateQueries({ queryKey: ["governanceHistory"] });
      void queryClient.invalidateQueries({ queryKey: ["nationMembers"] });
    },
  });
}

/** Withdraw a join request as its applicant. */
export function useWithdrawJoinRequest() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { nation: NationId; request: JoinRequestId }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.withdrawJoinRequest(input.nation, input.request);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["joinRequests"] });
      void queryClient.invalidateQueries({ queryKey: ["governanceHistory"] });
    },
  });
}

/** Issue a secure membership invitation to an email address. */
export function useIssueMembershipInvitation() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { nation: NationId; invitedEmail: string }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.issueMembershipInvitation(input.nation, input.invitedEmail);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["joinRequests"] });
      void queryClient.invalidateQueries({ queryKey: ["governanceHistory"] });
    },
  });
}

/** Accept a membership invitation with its secure token. */
export function useAcceptMembershipInvitation() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { nation: NationId; token: string }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.acceptMembershipInvitation(input.nation, input.token);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["joinRequests"] });
      void queryClient.invalidateQueries({ queryKey: ["nationMembers"] });
      void queryClient.invalidateQueries({ queryKey: ["governanceHistory"] });
    },
  });
}

/** Record a membership approval for a member and refresh the approval status. */
export function useApproveMembership() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { nation: NationId; member: Principal }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.approveMembership(input.nation, input.member);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["membershipApprovalStatus"],
      });
      void queryClient.invalidateQueries({ queryKey: ["joinRequests"] });
      void queryClient.invalidateQueries({ queryKey: ["nationMembers"] });
      void queryClient.invalidateQueries({ queryKey: ["governanceHistory"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** A stable cache key for a decision variant. */
function decisionKey(decision: DecisionKind): string {
  if (decision.__kind__ === "nationProposal") {
    return `nationProposal:${decision.nationProposal.toString()}`;
  }
  return `governanceProposal:${decision.governanceProposal.toString()}`;
}

export type {
  FoundingAppointment,
  GovernanceHistoryEntry,
  JoinRequest,
  RecordedVote,
  VotingEligibility,
};
