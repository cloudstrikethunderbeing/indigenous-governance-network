import {
  type ExecutionRequestId,
  type GovernanceCapability,
  type GovernanceProposalId,
  type NationId,
  createActor,
} from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Reads and writes for the Decisions section's governance proposals and their
 * separate execution step. These wrap the backend's governance methods so the
 * section body never calls the actor directly. Passing a vote never executes an
 * action: execution is always a distinct, explicit request.
 */

/** The Nation's governance proposals, newest first as the backend returns them. */
export function useGovernanceProposals(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["governanceProposals", nation.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listGovernanceProposals(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** The Nation's execution requests, one per passed proposal that was requested. */
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

/** The step-by-step audit trail for one execution request. */
export function useExecutionAudit(request: ExecutionRequestId | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["executionAudit", request?.toString() ?? "none"],
    queryFn: async () => {
      if (!actor || request === null) return [];
      return actor.listExecutionAudit(request);
    },
    enabled: !!actor && !isFetching && request !== null,
  });
}

/** The capabilities the current caller holds in a Nation. */
export function useCallerCapabilities(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["callerCapabilities", nation.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCallerCapabilities(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** Whether the current caller holds one capability in a Nation. */
export function useCallerHasCapability(
  nation: NationId,
  capability: GovernanceCapability,
) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["callerHasCapability", nation.toString(), capability],
    queryFn: async () => {
      if (!actor) return false;
      return actor.callerHasCapability(nation, capability);
    },
    enabled: !!actor && !isFetching,
  });
}

/** Refresh every Decisions query after an execution step changes state. */
function useInvalidateDecisions() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["governanceProposals"] });
    void queryClient.invalidateQueries({ queryKey: ["executionRequests"] });
    void queryClient.invalidateQueries({ queryKey: ["executionAudit"] });
  };
}

/** Request execution of a passed proposal. This is separate from voting. */
export function useRequestExecution() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateDecisions();
  return useMutation({
    mutationFn: async (proposal: GovernanceProposalId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.requestExecution(proposal);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Authorize a pending execution request, applying its timelock. */
export function useAuthorizeExecution() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateDecisions();
  return useMutation({
    mutationFn: async (request: ExecutionRequestId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.authorizeExecution(request);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Carry out an authorized request once its timelock has passed. */
export function useExecuteRequest() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateDecisions();
  return useMutation({
    mutationFn: async (request: ExecutionRequestId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.executeRequest(request);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Cancel an execution request before it runs. */
export function useCancelExecution() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateDecisions();
  return useMutation({
    mutationFn: async (request: ExecutionRequestId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.cancelExecution(request);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Pause or resume all execution for a Nation. */
export function useSetExecutionPaused() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateDecisions();
  return useMutation({
    mutationFn: async (input: { nation: NationId; paused: boolean }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.setExecutionPaused(input.nation, input.paused);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}
