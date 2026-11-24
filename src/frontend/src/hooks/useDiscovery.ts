import {
  type CollaborationParty,
  type CollaborationProfile,
  type CommunityId,
  type CommunityProfile,
  type DirectoryEntryKind,
  type IntroductionRequestId,
  type PipelineInteractionKind,
  type PipelineItemId,
  type PipelineStage,
  type SubmissionVisibility,
  createActor,
} from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/* ------------------------------------------------------------------ */
/* Discovery — shared intelligence service over stored backend data    */
/* ------------------------------------------------------------------ */

/** Public ideas and submissions visible across the network. */
export function usePublicSubmissions() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["discovery", "publicSubmissions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listPublicSubmissions();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Submissions scoped to a single community workspace. */
export function useCommunitySubmissions(community: CommunityId | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["discovery", "communitySubmissions", community?.toString()],
    queryFn: async () => {
      if (!actor || community === null) return [];
      return actor.listCommunitySubmissions(community);
    },
    enabled: !!actor && !isFetching && community !== null,
  });
}

/** Submit a free-text idea, feedback, need, opportunity or potential proposal. */
export function useSubmitDiscoverySubmission() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      community: CommunityId;
      body: string;
      category: string;
      visibility: SubmissionVisibility;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.submitDiscoverySubmission(
        input.community,
        input.body,
        input.category,
        input.visibility,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["discovery"] });
    },
  });
}

/** Recommendations derived from stored data for a community. */
export function useRecommendations(community: CommunityId | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["discovery", "recommendations", community?.toString()],
    queryFn: async () => {
      if (!actor || community === null) return [];
      return actor.listRecommendations(community);
    },
    enabled: !!actor && !isFetching && community !== null,
  });
}

/** Pipeline items for a community, across the seven-stage progression. */
export function usePipelineItems(community: CommunityId | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["discovery", "pipelineItems", community?.toString()],
    queryFn: async () => {
      if (!actor || community === null) return [];
      return actor.listPipelineItems(community);
    },
    enabled: !!actor && !isFetching && community !== null,
  });
}

/** Interactions (comments, support, improvements) on a pipeline item. */
export function usePipelineInteractions(itemId: PipelineItemId | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["discovery", "pipelineInteractions", itemId?.toString()],
    queryFn: async () => {
      if (!actor || itemId === null) return [];
      return actor.listPipelineInteractions(itemId);
    },
    enabled: !!actor && !isFetching && itemId !== null,
  });
}

/** Create a pipeline item from a stored submission. */
export function useCreatePipelineItem() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { submissionId: bigint; title: string }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.createPipelineItem(input.submissionId, input.title);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["discovery"] });
    },
  });
}

/** Advance a pipeline item to a later stage. */
export function useAdvancePipelineItem() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      itemId: PipelineItemId;
      to: PipelineStage;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.advancePipelineItem(input.itemId, input.to);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["discovery"] });
    },
  });
}

/** Add a comment, support or improvement to a pipeline item. */
export function useAddPipelineInteraction() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      itemId: PipelineItemId;
      kind: PipelineInteractionKind;
      body: string;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.addPipelineInteraction(input.itemId, input.kind, input.body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["discovery"] });
    },
  });
}

/** Create a formal proposal from an approved pipeline item. */
export function useCreateProposalFromPipelineItem() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: PipelineItemId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.createProposalFromPipelineItem(itemId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["discovery"] });
      void queryClient.invalidateQueries({ queryKey: ["proposals"] });
    },
  });
}

/** A single community profile by id. */
export function useCommunityProfile(community: CommunityId | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["discovery", "communityProfile", community?.toString()],
    queryFn: async () => {
      if (!actor || community === null) return null;
      return actor.getCommunityProfile(community);
    },
    enabled: !!actor && !isFetching && community !== null,
  });
}

/** Save or update a community profile. */
export function useSaveCommunityProfile() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: CommunityProfile) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.saveCommunityProfile(profile);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["discovery"] });
    },
  });
}

/** Opt-in collaborators matching a community's published profile. */
export function useMatchingCollaborators(community: CommunityId | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["discovery", "matchingCollaborators", community?.toString()],
    queryFn: async () => {
      if (!actor || community === null) return [];
      return actor.listMatchingCollaborators(community);
    },
    enabled: !!actor && !isFetching && community !== null,
  });
}

/** Save or update the caller's collaboration profile. */
export function useSaveCollaborationProfile() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: CollaborationProfile) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.saveCollaborationProfile(profile);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["discovery"] });
    },
  });
}

/** Introduction requests involving the caller. */
export function useMyIntroductions() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["discovery", "myIntroductions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMyIntroductions();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Request an introduction to a collaboration party. */
export function useRequestIntroduction() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      target: CollaborationParty;
      message: string;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.requestIntroduction(input.target, input.message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["discovery"] });
    },
  });
}

/** Approve or decline an introduction request. */
export function useRespondToIntroduction() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      requestId: IntroductionRequestId;
      approve: boolean;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.respondToIntroduction(input.requestId, input.approve);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["discovery"] });
    },
  });
}

/** Collective intelligence metrics derived from stored backend data. */
export function useCollectiveIntelligenceMetrics() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["discovery", "collectiveIntelligenceMetrics"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCollectiveIntelligenceMetrics();
    },
    enabled: !!actor && !isFetching,
  });
}

/** The interactive network activity feed. */
export function useNetworkActivityFeed() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["discovery", "networkActivityFeed"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNetworkActivityFeed();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Search the opt-in directory by term and optional kind. */
export function useSearchDirectory(
  term: string,
  kind: DirectoryEntryKind | null,
) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["discovery", "directory", term, kind],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchDirectory(term, kind);
    },
    enabled: !!actor && !isFetching,
  });
}
