import type { Principal } from "@icp-sdk/core/principal";

import {
  type JoinRequest,
  type JoinRequestId,
  type NationId,
  createActor,
} from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * React Query hooks for the join-request flow inside the Members section.
 *
 * A person asks to join, authorized approvers review the request, and the
 * applicant may withdraw it. The backend owns every rule — the approval
 * threshold, who may approve, duplicate prevention and expiry — so these hooks
 * only carry the request and refresh the affected lists afterwards.
 */

/* ------------------------------------------------------------------ */
/* Reads                                                               */
/* ------------------------------------------------------------------ */

/** Every join request for the organization, in any status. */
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

/* ------------------------------------------------------------------ */
/* Writes                                                              */
/* ------------------------------------------------------------------ */

/** Ask to join the organization. Enters Pending Review. */
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

/** Approve or reject a pending request as an authorized approver. */
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
      void queryClient.invalidateQueries({ queryKey: ["roleAssignments"] });
    },
  });
}

/** Withdraw your own pending request. */
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

/* ------------------------------------------------------------------ */
/* Derived helpers                                                     */
/* ------------------------------------------------------------------ */

/** The signed-in person's own request, if they have one. */
export function findOwnRequest(
  requests: JoinRequest[],
  caller: Principal | null,
): JoinRequest | null {
  if (!caller) return null;
  const callerText = caller.toText();
  return (
    requests.find((request) => request.applicant.toText() === callerText) ??
    null
  );
}
