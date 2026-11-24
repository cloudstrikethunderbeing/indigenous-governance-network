import {
  type Constitution,
  type FileAttachment,
  type FileAttachmentId,
  type FileAttachmentTarget,
  type GovernanceRuleSet,
  type LaunchStatus,
  type MembershipVotingConfig,
  type NationFile,
  type NationFileId,
  type NationFileSummary,
  type NationFolder,
  type NationFolderId,
  type NationId,
  type NationLauncherConfig,
  type NationProposalId,
  type NationTheme,
  type PrivacySettings,
  type RolePermissionEntry,
  type VoteChoice,
  createActor,
} from "@/backend";
import { targetKey } from "@/components/os/attachments/attachmentTargets";
import { useActor } from "@caffeineai/core-infrastructure";
import type { ExternalBlob } from "@caffeineai/object-storage";
import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/* ------------------------------------------------------------------ */
/* Nation workspace reads — open to any visitor                        */
/* ------------------------------------------------------------------ */

/** Every Nation known to the canister. */
export function useNations() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["nations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listNations();
    },
    enabled: !!actor && !isFetching,
  });
}

/** A single Nation by id, or null when it does not exist. */
export function useNation(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["nation", nation.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getNation(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** The workspace scoped to a Nation. */
export function useWorkspace(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["workspace", nation.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getWorkspace(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** The apps registered in a workspace. */
export function useWorkspaceApps(workspace: bigint) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["workspaceApps", workspace.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listWorkspaceApps(workspace);
    },
    enabled: !!actor && !isFetching,
  });
}

/** The Nation's own governance proposals. */
export function useNationProposals(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["nationProposals", nation.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listNationProposals(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** A single Nation proposal by id, or null when it does not exist. */
export function useNationProposal(proposal: NationProposalId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["nationProposal", proposal.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getNationProposal(proposal);
    },
    enabled: !!actor && !isFetching,
  });
}

/** The Nation's discussion threads. */
export function useDiscussionThreads(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["discussionThreads", nation.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listDiscussionThreads(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** The posts in a discussion thread. */
export function useDiscussionPosts(thread: bigint) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["discussionPosts", thread.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listDiscussionPosts(thread);
    },
    enabled: !!actor && !isFetching,
  });
}

/** The Nation's members with their role and permission labels. */
export function useNationMembers(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["nationMembers", nation.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listNationMembers(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** The Nation's documents. */
export function useNationDocuments(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["nationDocuments", nation.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listNationDocuments(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** A single Nation document by id, or null when it does not exist. */
export function useNationDocument(documentId: bigint) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["nationDocument", documentId.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getNationDocument(documentId);
    },
    enabled: !!actor && !isFetching,
  });
}

/** The Nation's calendar events. */
export function useCalendarEvents(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["calendarEvents", nation.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listCalendarEvents(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** The Nation's treasury transactions. */
export function useNationTreasuryTransactions(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["nationTreasuryTransactions", nation.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listNationTreasuryTransactions(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** The Nation's treasury summary. */
export function useNationTreasurySummary(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["nationTreasurySummary", nation.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getNationTreasurySummary(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** The selectable governance model options. */
export function useGovernanceModelOptions() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["governanceModelOptions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listGovernanceModelOptions();
    },
    enabled: !!actor && !isFetching,
  });
}

/** The Nation's roles-and-permissions matrix. */
export function useRolePermissions(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["rolePermissions", nation.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRolePermissions(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** The Nation's privacy settings. */
export function usePrivacySettings(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["privacySettings", nation.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getPrivacySettings(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** Nations listed in the SOVEREIGN Network. */
export function useNetworkNations() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["networkNations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listNetworkNations();
    },
    enabled: !!actor && !isFetching,
  });
}

/* ------------------------------------------------------------------ */
/* Nation workspace writes                                             */
/* ------------------------------------------------------------------ */

/** Cast a vote on a Nation proposal and refresh the proposal lists. */
export function useCastNationVote() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      proposal: NationProposalId;
      choice: VoteChoice;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.castNationVote(input.proposal, input.choice);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["nationProposals"] });
      void queryClient.invalidateQueries({ queryKey: ["nationProposal"] });
    },
  });
}

/** Post a reply to a discussion thread and refresh its posts. */
export function usePostDiscussionReply() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { thread: bigint; body: string }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.postDiscussionReply(input.thread, input.body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["discussionPosts"] });
    },
  });
}

/** Save the Nation's roles-and-permissions matrix. */
export function useSaveRolePermissions() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nation: NationId;
      entries: RolePermissionEntry[];
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.saveRolePermissions(input.nation, input.entries);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["rolePermissions"] });
    },
  });
}

/** Save the Nation's privacy settings. */
export function useSavePrivacySettings() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: PrivacySettings) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.savePrivacySettings(settings);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["privacySettings"] });
    },
  });
}

/** Set whether the Nation opts into the SOVEREIGN Network. */
export function useSetNetworkOptIn() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { nation: NationId; optIn: boolean }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.setNetworkOptIn(input.nation, input.optIn);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["networkNations"] });
    },
  });
}

/** Ask the advisory AI Copilot a question about a Nation workspace. */
export function useAskCopilot() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (input: { nation: NationId; question: string }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.askCopilot(input.nation, input.question);
    },
  });
}

/* ------------------------------------------------------------------ */
/* Nation OS launcher, workspace view and appearance                   */
/* ------------------------------------------------------------------ */

/** The Nations a signed-in caller is authorized to switch between. */
export function useMyNations() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["myNations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMyNations();
    },
    enabled: !!actor && !isFetching,
  });
}

/** A Nation's own workspace and settings as one view, or null when absent. */
export function useNationWorkspaceView(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["nationWorkspaceView", nation.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getNationWorkspaceView(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** A Nation's collaboration participation state, or null when absent. */
export function useCollaborationState(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["collaborationState", nation.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCollaborationState(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** A Nation's visual theme. */
export function useNationTheme(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["nationTheme", nation.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getNationTheme(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** A Nation's membership and voting configuration. */
export function useMembershipVotingConfig(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["membershipVotingConfig", nation.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMembershipVotingConfig(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** Create a new Nation from the five-step launcher. */
export function useCreateNationFromLauncher() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (config: NationLauncherConfig) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.createNationFromLauncher(config);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["nations"] });
      void queryClient.invalidateQueries({ queryKey: ["myNations"] });
    },
  });
}

/** Save a Nation's visual theme. */
export function useSaveNationTheme() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { nation: NationId; theme: NationTheme }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.saveNationTheme(input.nation, input.theme);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["nationTheme"] });
      void queryClient.invalidateQueries({ queryKey: ["nationWorkspaceView"] });
    },
  });
}

/** Save a Nation's membership and voting configuration. */
export function useSaveMembershipVotingConfig() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nation: NationId;
      config: MembershipVotingConfig;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.saveMembershipVotingConfig(input.nation, input.config);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["membershipVotingConfig"],
      });
      void queryClient.invalidateQueries({ queryKey: ["nationWorkspaceView"] });
    },
  });
}

/** Ensure the built-in sample Nation workspace exists, returning its Nation id. */
export function useEnsureSampleWorkspace() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.ensureSampleWorkspace();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["nations"] });
      void queryClient.invalidateQueries({ queryKey: ["workspace"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Nation Files — folders, files, summaries and attachments            */
/* ------------------------------------------------------------------ */

/** Every folder in a Nation, flat, with its parent link. */
export function useNationFolders(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["nationFolders", nation.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listNationFolders(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** The files directly inside a folder, or at the Nation root when null. */
export function useNationFiles(
  nation: NationId,
  folder: NationFolderId | null,
) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["nationFiles", nation.toString(), folder?.toString() ?? "root"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listNationFiles(nation, folder);
    },
    enabled: !!actor && !isFetching,
  });
}

/** The Nation's file storage summary: counts and total bytes. */
export function useNationFileSummary(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["nationFileSummary", nation.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getNationFileSummary(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** The files attached to a proposal, discussion post, project, event or document. */
export function useFileAttachments(
  nation: NationId,
  target: FileAttachmentTarget,
) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["fileAttachments", nation.toString(), targetKey(target)],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listFileAttachments(nation, target);
    },
    enabled: !!actor && !isFetching,
  });
}

/** Create a folder inside a parent folder, or at the Nation root when null. */
export function useCreateNationFolder() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nation: NationId;
      parent: NationFolderId | null;
      name: string;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.createNationFolder(input.nation, input.parent, input.name);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["nationFolders"] });
      void queryClient.invalidateQueries({ queryKey: ["nationFileSummary"] });
    },
  });
}

/** Rename a folder. */
export function useRenameNationFolder() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nation: NationId;
      folder: NationFolderId;
      name: string;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.renameNationFolder(input.nation, input.folder, input.name);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["nationFolders"] });
    },
  });
}

/** Move a folder under a new parent, or to the Nation root when null. */
export function useMoveNationFolder() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nation: NationId;
      folder: NationFolderId;
      newParent: NationFolderId | null;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.moveNationFolder(
        input.nation,
        input.folder,
        input.newParent,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["nationFolders"] });
    },
  });
}

/** Delete an empty folder. */
export function useDeleteNationFolder() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { nation: NationId; folder: NationFolderId }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.deleteNationFolder(input.nation, input.folder);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["nationFolders"] });
      void queryClient.invalidateQueries({ queryKey: ["nationFileSummary"] });
    },
  });
}

/** Upload a file into a folder, or the Nation root when null. */
export function useCreateNationFile() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nation: NationId;
      folder: NationFolderId | null;
      name: string;
      size: bigint;
      contentType: string;
      content: ExternalBlob;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.createNationFile(
        input.nation,
        input.folder,
        input.name,
        input.size,
        input.contentType,
        input.content,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["nationFiles"] });
      void queryClient.invalidateQueries({ queryKey: ["nationFileSummary"] });
    },
  });
}

/** Rename a file. */
export function useRenameNationFile() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nation: NationId;
      file: NationFileId;
      name: string;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.renameNationFile(input.nation, input.file, input.name);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["nationFiles"] });
    },
  });
}

/** Move a file into a folder, or to the Nation root when null. */
export function useMoveNationFile() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nation: NationId;
      file: NationFileId;
      folder: NationFolderId | null;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.moveNationFile(input.nation, input.file, input.folder);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["nationFiles"] });
    },
  });
}

/** Delete a file. */
export function useDeleteNationFile() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { nation: NationId; file: NationFileId }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.deleteNationFile(input.nation, input.file);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["nationFiles"] });
      void queryClient.invalidateQueries({ queryKey: ["nationFileSummary"] });
    },
  });
}

/** Attach a file to a proposal, discussion post, project, event or document. */
export function useAttachFileToTarget() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nation: NationId;
      file: NationFileId;
      target: FileAttachmentTarget;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.attachFileToTarget(input.nation, input.file, input.target);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["fileAttachments"] });
    },
  });
}

/** Detach a file from the target it was attached to. */
export function useDetachFile() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nation: NationId;
      attachment: FileAttachmentId;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.detachFile(input.nation, input.attachment);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["fileAttachments"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Constitution — templates, default rules and the confirmed ruleset   */
/* ------------------------------------------------------------------ */

/** The example constitution templates the canister offers. */
export function useConstitutionTemplates() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["constitutionTemplates"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listConstitutionTemplates();
    },
    enabled: !!actor && !isFetching,
  });
}

/** The default rule set the canister builds for a template key. */
export function useDefaultRuleSet(templateKey: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["defaultRuleSet", templateKey],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDefaultRuleSet(templateKey);
    },
    enabled: !!actor && !isFetching && templateKey.length > 0,
  });
}

/** The rules currently in force for a Nation, if any. */
export function useActiveConstitution(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["activeConstitution", nation.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getActiveConstitution(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/**
 * Save the confirmed constitution for a Nation. The rules are validated by the
 * canister before they are stored, so a rejected rule set is reported honestly
 * rather than silently persisted.
 */
export function useSaveConstitution() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nation: NationId;
      templateKey: string;
      rules: GovernanceRuleSet;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.saveConstitution(
        input.nation,
        input.templateKey,
        input.rules,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["activeConstitution"] });
      void queryClient.invalidateQueries({ queryKey: ["activeRuleSet"] });
    },
  });
}

/** Validate a rule set against the canister's governance constraints. */
export function useValidateGovernanceRuleSet() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (rules: GovernanceRuleSet) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.validateGovernanceRuleSet(rules);
    },
  });
}

/* ------------------------------------------------------------------ */
/* Founding setup — begin, activate and manage the founding window     */
/* ------------------------------------------------------------------ */

/** Begin the founding setup window for a Nation. */
export function useBeginFoundingSetup() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (nation: NationId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.beginFoundingSetup(nation);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["foundingSetup"] });
    },
  });
}

/** Activate the founding setup, putting the confirmed constitution in force. */
export function useActivateFounding() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (nation: NationId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.activateFounding(nation);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["foundingSetup"] });
      void queryClient.invalidateQueries({ queryKey: ["activeConstitution"] });
    },
  });
}

/** Appoint a founding authority for a Nation's founding window. */
export function useAppointFoundingAuthority() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nation: NationId;
      authority: Principal;
      appointmentLabel: string;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.appointFoundingAuthority(
        input.nation,
        input.authority,
        input.appointmentLabel,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["foundingAppointments"],
      });
    },
  });
}

/** Accept a founding appointment as the appointed authority. */
export function useAcceptFoundingAppointment() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { nation: NationId; appointment: bigint }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.acceptFoundingAppointment(input.nation, input.appointment);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["foundingAppointments"],
      });
      void queryClient.invalidateQueries({ queryKey: ["foundingSetup"] });
    },
  });
}

/**
 * Confirm the caller's own founding seat in place. The canister accepts a
 * pending seat the caller already holds and is a no-op when it is already
 * accepted, so the launcher never appoints the creator into a seat they hold.
 */
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
      void queryClient.invalidateQueries({ queryKey: ["foundingSetup"] });
      void queryClient.invalidateQueries({ queryKey: ["launchStatus"] });
    },
  });
}

/** Decline a founding appointment as the appointed authority. */
export function useDeclineFoundingAppointment() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { nation: NationId; appointment: bigint }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.declineFoundingAppointment(input.nation, input.appointment);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["foundingAppointments"],
      });
    },
  });
}

/** Replace a founding appointment with a new authority. */
export function useReplaceFoundingAppointment() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nation: NationId;
      appointment: bigint;
      newAuthority: Principal;
      appointmentLabel: string;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.replaceFoundingAppointment(
        input.nation,
        input.appointment,
        input.newAuthority,
        input.appointmentLabel,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["foundingAppointments"],
      });
    },
  });
}

/** Cancel a Nation's founding setup window. */
export function useCancelFoundingSetup() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (nation: NationId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.cancelFoundingSetup(nation);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["foundingSetup"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Launch status and resume — what a launch saved and what is left     */
/* ------------------------------------------------------------------ */

/** The launch status of a Nation: saved steps, seats and what blocks it. */
export function useLaunchStatus(nation: NationId | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["launchStatus", nation?.toString() ?? "none"],
    queryFn: async (): Promise<LaunchStatus | null> => {
      if (!actor || nation === null) return null;
      return actor.getLaunchStatus(nation);
    },
    enabled: !!actor && !isFetching && nation !== null,
  });
}

/**
 * Resume a Nation's launch from the step that stopped. The canister reports
 * the current launch status and never re-runs a step that is already saved.
 */
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
      void queryClient.invalidateQueries({ queryKey: ["foundingSetup"] });
      void queryClient.invalidateQueries({
        queryKey: ["foundingAppointments"],
      });
      void queryClient.invalidateQueries({ queryKey: ["activeConstitution"] });
      void queryClient.invalidateQueries({ queryKey: ["myNations"] });
    },
  });
}

/** The active constitution type re-exported for launcher consumers. */
export type { Constitution };
