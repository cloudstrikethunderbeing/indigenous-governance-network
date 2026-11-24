import {
  type ChallengeOption,
  type CommentModerationStatus,
  type FundingSupportType,
  type LeadPathway,
  type LeadStatus,
  type OrganizationType,
  UserRole,
  type VisitorSessionId,
  createActor,
} from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** The caller's assigned role (admin / user / guest), including anonymous visitors. */
export function useCallerUserRole() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["callerUserRole"],
    queryFn: async () => {
      if (!actor) return UserRole.guest;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Whether the current caller holds the admin role. Used to show the admin-only nav indicator. */
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

/* ------------------------------------------------------------------ */
/* Visitor engagement — public, anonymous-friendly                     */
/* ------------------------------------------------------------------ */

/** The current administrator-configured weekly challenge, or null when none is set. */
export function useWeeklyChallenge() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["weeklyChallenge"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getWeeklyChallenge();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Public discussion comments, including their moderation status. */
export function usePublicComments() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["publicComments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listPublicComments();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Record a real welcome-popup impression for the visitor's session. */
export function useRecordChallengeImpression() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (sessionId: VisitorSessionId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.recordChallengeImpression(sessionId);
    },
  });
}

/** Record the start of a challenge participation for the visitor's session. */
export function useStartChallenge() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (sessionId: VisitorSessionId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.startChallenge(sessionId);
    },
  });
}

/** Submit a challenge response and refresh the public analytics surfaces. */
export function useSubmitChallengeResponse() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      sessionId: VisitorSessionId;
      optionId: bigint;
      reasoning: string | null;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.submitChallengeResponse(
        input.sessionId,
        input.optionId,
        input.reasoning,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["visitorAnalytics"] });
    },
  });
}

/** Submit a public discussion comment and refresh the comment list. */
export function useSubmitPublicComment() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      sessionId: VisitorSessionId;
      displayName: string | null;
      body: string;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.submitPublicComment(
        input.sessionId,
        input.displayName,
        input.body,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["publicComments"] });
    },
  });
}

/** Report a public comment for moderation review. */
export function useReportComment() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      sessionId: VisitorSessionId;
      commentId: bigint;
      reason: string | null;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.reportComment(
        input.sessionId,
        input.commentId,
        input.reason,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["publicComments"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Lead pathways — three public submission endpoints                   */
/* ------------------------------------------------------------------ */

/** Pathway A — Free Early Access registration. */
export function useSubmitEarlyAccessLead() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (input: {
      name: string;
      email: string;
      organization: string | null;
      organizationType: OrganizationType | null;
      intendedDaoUseCase: string | null;
      consentToContact: boolean;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.submitEarlyAccessLead(
        input.name,
        input.email,
        input.organization,
        input.organizationType,
        input.intendedDaoUseCase,
        input.consentToContact,
      );
    },
  });
}

/** Pathway B — Founding Organization expression of interest. */
export function useSubmitFoundingOrganizationLead() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (input: {
      organization: string;
      contactName: string;
      email: string;
      intendedDeployment: string | null;
      prepaidInterest: boolean | null;
      budgetRange: string | null;
      consentToContact: boolean;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.submitFoundingOrganizationLead(
        input.organization,
        input.contactName,
        input.email,
        input.intendedDeployment,
        input.prepaidInterest,
        input.budgetRange,
        input.consentToContact,
      );
    },
  });
}

/** Pathway C — Strategic Funding Partner enquiry. */
export function useSubmitStrategicFundingLead() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (input: {
      contactName: string;
      organization: string | null;
      email: string;
      intendedSupport: FundingSupportType | null;
      budgetRange: string | null;
      consentToContact: boolean;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.submitStrategicFundingLead(
        input.contactName,
        input.organization,
        input.email,
        input.intendedSupport,
        input.budgetRange,
        input.consentToContact,
      );
    },
  });
}

/* ------------------------------------------------------------------ */
/* Admin — visitor analytics, leads and moderation                     */
/* ------------------------------------------------------------------ */

/** Admin-only visitor engagement analytics. */
export function useVisitorAnalytics() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["visitorAnalytics"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getVisitorAnalytics();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Admin-only lead analytics summary. */
export function useLeadAnalytics() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["leadAnalytics"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getLeadAnalytics();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Admin-only lead list for a single pathway. */
export function useLeads(pathway: LeadPathway) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["leads", pathway],
    queryFn: async () => {
      if (!actor) return null;
      return actor.listLeads(pathway);
    },
    enabled: !!actor && !isFetching,
  });
}

/** Admin-only lead status update. */
export function useUpdateLeadStatus() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { leadId: bigint; status: LeadStatus }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.updateLeadStatus(input.leadId, input.status);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["leads"] });
      void queryClient.invalidateQueries({ queryKey: ["leadAnalytics"] });
    },
  });
}

/** Admin-only private note on a lead. */
export function useSaveLeadNote() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { leadId: bigint; note: string | null }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.saveLeadNote(input.leadId, input.note);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

/** Admin-only comment moderation (hide / remove / restore). */
export function useModerateComment() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      commentId: bigint;
      status: CommentModerationStatus;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.moderateComment(input.commentId, input.status);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["publicComments"] });
      void queryClient.invalidateQueries({ queryKey: ["visitorAnalytics"] });
    },
  });
}

/** Admin-only weekly challenge configuration. */
export function useConfigureWeeklyChallenge() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      weekKey: string;
      question: string;
      options: ChallengeOption[];
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.configureWeeklyChallenge(
        input.weekKey,
        input.question,
        input.options,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["weeklyChallenge"] });
    },
  });
}
