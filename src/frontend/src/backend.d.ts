import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
import type { ExternalBlob } from "@caffeineai/object-storage";
export type { ExternalBlob } from "@caffeineai/object-storage";
export type AcceptInvitationResult = {
    __kind__: "ok";
    ok: MemberAdmissionId;
} | {
    __kind__: "err";
    err: GovernanceError;
};
export type ActivateFoundingResult = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: GovernanceError;
};
export type ActivityEntryId = bigint;
export type AddInteractionResult = {
    __kind__: "ok";
    ok: bigint;
} | {
    __kind__: "err";
    err: DiscoveryError;
};
export type AdvancePipelineResult = {
    __kind__: "ok";
    ok: PipelineStage;
} | {
    __kind__: "err";
    err: DiscoveryError;
};
export interface AlternateAuthority {
    alternate: Principal;
    coversPosition: AuthorityPositionId;
    alternateDisplayLabel: string;
}
export interface Amendment {
    id: AmendmentId;
    newRules: GovernanceRuleSet;
    previousRules: GovernanceRuleSet;
    nation: NationId;
    previousVersion: bigint;
    authorizedBy: Principal;
    summary: string;
    timestamp: Timestamp;
    resultingVersion: bigint;
}
export type AmendmentId = bigint;
export interface AmendmentProposal {
    id: AmendmentProposalId;
    status: AmendmentProposalStatus;
    title: string;
    nation: NationId;
    abstentionHandling: AbstentionHandling;
    approvalThresholdPercent: bigint;
    baseConstitutionVersion: bigint;
    votingDeadline: Timestamp;
    quorumPercent: bigint;
    summary: string;
    discussionThread?: DiscussionThreadId;
    timestamp: Timestamp;
    ratifications: Array<PlanRatification>;
    proposer: Principal;
    changes: Array<RuleChange>;
    votingEligibility: string;
    effectiveDate?: Timestamp;
}
export type AmendmentProposalId = bigint;
export interface AnswerDistribution {
    weekKey: string;
    entries: Array<AnswerDistributionEntry>;
    totalResponses: bigint;
}
export interface AnswerDistributionEntry {
    optionId: bigint;
    count: bigint;
    labelText: string;
}
export interface Appeal {
    id: AppealId;
    status: AppealStatus;
    decisionNote?: string;
    recusals: Array<AppealRecusal>;
    nation: NationId;
    kind: AppealKind;
    summary: string;
    evidence: Array<AppealEvidence>;
    subjectId: bigint;
    timestamp: Timestamp;
    decidedBy?: Principal;
    appellant: Principal;
}
export interface AppealEvidence {
    evidenceLabel: string;
    submittedBy: Principal;
    detail: string;
    timestamp: Timestamp;
}
export type AppealId = bigint;
export interface AppealRecusal {
    timestamp: Timestamp;
    reviewer: Principal;
    reason: string;
}
export type ArchiveDissolutionResult = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: LifecycleError;
};
export type AskCopilotResult = {
    __kind__: "ok";
    ok: CopilotAnswer;
} | {
    __kind__: "err";
    err: SovereignError;
};
export interface Assignment {
    id: AssignmentId;
    status: AssignmentStatus;
    title: string;
    description: string;
    timestamp: Timestamp;
    priority: AssignmentPriority;
    srcSpent: bigint;
    requestedBy: Principal;
}
export type AssignmentId = bigint;
export interface AuthorityPosition {
    id: AuthorityPositionId;
    status: AuthorityPositionStatus;
    nation: NationId;
    termEnd: Timestamp;
    termStart: Timestamp;
    seatLabel: string;
    holderDisplayLabel: string;
    timestamp: Timestamp;
    holder?: Principal;
}
export type AuthorityPositionId = bigint;
export interface AuthorityTermEvent {
    id: AuthorityTermEventId;
    nation: NationId;
    subject: Principal;
    kind: AuthorityTermEventKind;
    constitutionVersion: bigint;
    timestamp: Timestamp;
    actingPrincipal: Principal;
    position: AuthorityPositionId;
    approvals: Array<Principal>;
    reason: string;
}
export type AuthorityTermEventId = bigint;
export interface CalendarEvent {
    id: CalendarEventId;
    startTime: Timestamp;
    title: string;
    nation: NationId;
    endTime: Timestamp;
    description: string;
    timestamp: Timestamp;
    location: string;
}
export type CalendarEventId = bigint;
export interface Cell {
    value: Value;
    name: string;
}
export interface CensusEntry {
    id: CensusEntryId;
    nation: NationId;
    subject: Principal;
    kind: CensusEventKind;
    constitutionVersion: bigint;
    referenceId: bigint;
    summary: string;
    timestamp: Timestamp;
    confidential: boolean;
}
export type CensusEntryId = bigint;
export interface CensusSummary {
    nation: NationId;
    disputes: bigint;
    votes: bigint;
    executions: bigint;
    delegations: bigint;
    proposals: bigint;
    activeMembers: bigint;
    eligibleMembers: bigint;
}
export type ChallengeImpressionId = bigint;
export interface ChallengeOption {
    optionId: bigint;
    labelText: string;
}
export type ChallengeResponseId = bigint;
export type ChallengeStartId = bigint;
export type CollaborationParty = {
    __kind__: "member";
    member: Principal;
} | {
    __kind__: "community";
    community: CommunityId;
};
export interface CollaborationProfile {
    id: CollaborationProfileId;
    displayName: string;
    interests: Array<string>;
    needs: Array<string>;
    timestamp: Timestamp;
    partnershipOpportunities: Array<string>;
    party: CollaborationParty;
    skills: Array<string>;
    discoveryOptIn: boolean;
}
export type CollaborationProfileId = bigint;
export interface CollaborationState {
    nation: NationId;
    isSample: boolean;
    displayLabel: string;
    optedIn: boolean;
}
export interface CollectiveIntelligenceMetrics {
    ideasSubmitted: bigint;
    activeCommunities: bigint;
    collaborationOpportunities: bigint;
    completedInitiatives: bigint;
    successfulPartnerships: bigint;
    activeProposals: bigint;
}
export type CommentId = bigint;
export type CommentReportId = bigint;
export type CommunityId = bigint;
export interface CommunityProfile {
    id: CommunityId;
    region: string;
    projectNeeds: Array<string>;
    owner: Principal;
    interests: Array<string>;
    name: string;
    description: string;
    timestamp: Timestamp;
    partnershipOpportunities: Array<string>;
    visibility: CommunityVisibility;
    skills: Array<string>;
    objectives: Array<string>;
    discoveryOptIn: boolean;
}
export type ConfigureWeeklyChallengeResult = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: VisitorError;
};
export type ConfirmFoundingSeatResult = {
    __kind__: "ok";
    ok: bigint;
} | {
    __kind__: "err";
    err: GovernanceError;
};
export interface Constitution {
    id: ConstitutionId;
    active: boolean;
    nation: NationId;
    confirmedBy: Principal;
    templateKey: string;
    version: bigint;
    timestamp: Timestamp;
    ratifications?: Array<PlanRatification>;
    rules: GovernanceRuleSet;
}
export type ConstitutionId = bigint;
export interface ConstitutionVersion {
    id: ConstitutionVersionId;
    nation: NationId;
    authorizingAuthority: Principal;
    version: bigint;
    timestamp: Timestamp;
    ratifications: Array<PlanRatification>;
    producedByAmendment?: AmendmentProposalId;
    rules: GovernanceRuleSet;
    effectiveDate: Timestamp;
}
export type ConstitutionVersionId = bigint;
export interface Contribution {
    id: ContributionId;
    status: ContributionStatus;
    links: Array<string>;
    notes: string;
    rationale?: string;
    timestamp: Timestamp;
    srcAwarded?: bigint;
    reviewer?: Principal;
    contributionType: ContributionType;
    contributor: Principal;
}
export type ContributionId = bigint;
export interface CopilotAnswer {
    nation: NationId;
    question: string;
    answer: string;
    advisoryOnly: boolean;
    timestamp: Timestamp;
    sources: Array<CopilotSource>;
}
export interface CopilotSource {
    title: string;
    referenceId: bigint;
    sourceKind: string;
}
export interface CouncilMember {
    councilMemberDisplayLabel: string;
    councilMember: Principal;
}
export type CreateNationResult = {
    __kind__: "ok";
    ok: NationId;
} | {
    __kind__: "err";
    err: SovereignError;
};
export type CreatePipelineItemResult = {
    __kind__: "ok";
    ok: PipelineItemId;
} | {
    __kind__: "err";
    err: DiscoveryError;
};
export type CreateProposalFromItemResult = {
    __kind__: "ok";
    ok: ProposalId;
} | {
    __kind__: "err";
    err: DiscoveryError;
};
export type DecisionKind = {
    __kind__: "nationProposal";
    nationProposal: NationProposalId;
} | {
    __kind__: "governanceProposal";
    governanceProposal: GovernanceProposalId;
};
export type DeleteFileResult = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: FileError;
};
export type DeleteFolderResult = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: FileError;
};
export interface DesignatedSuccessor {
    successor: Principal;
    position: AuthorityPositionId;
    successorDisplayLabel: string;
}
export interface DirectoryEntry {
    title: string;
    kind: DirectoryEntryKind;
    tags: Array<string>;
    referenceId: bigint;
    description: string;
}
export interface DiscoverySubmission {
    id: SubmissionId;
    body: string;
    community: CommunityId;
    author: Principal;
    interestTags: Array<string>;
    timestamp: Timestamp;
    category: string;
    visibility: SubmissionVisibility;
    classification: SubmissionClassification;
}
export interface DiscussionPost {
    id: DiscussionPostId;
    body: string;
    author: Principal;
    thread: DiscussionThreadId;
    timestamp: Timestamp;
}
export type DiscussionPostId = bigint;
export interface DiscussionThread {
    id: DiscussionThreadId;
    title: string;
    nation: NationId;
    author: Principal;
    timestamp: Timestamp;
}
export type DiscussionThreadId = bigint;
export interface Dissolution {
    id: DissolutionId;
    status: DissolutionStatus;
    memberNotifiedAt?: Timestamp;
    tally: DissolutionTally;
    nation: NationId;
    explanation: string;
    finalConfirmation?: PlanRatification;
    timestamp: Timestamp;
    dataExportReference?: string;
    proposal: string;
    proposer: Principal;
    coolingOffEnd: Timestamp;
    obligationsReview?: ObligationsReview;
    archivedAt?: Timestamp;
}
export type DissolutionId = bigint;
export interface DissolutionTally {
    votesAgainst: bigint;
    approvalThresholdPercent: bigint;
    quorumPercent: bigint;
    votesAbstain: bigint;
    votesInFavor: bigint;
}
export interface EmergencyAuditEntry {
    action: string;
    note: string;
    timestamp: Timestamp;
    actorPrincipal: Principal;
}
export interface EmergencyRestoration {
    note: string;
    restoredAt: Timestamp;
    restoredBy: Principal;
}
export interface EmergencySuspension {
    id: EmergencySuspensionId;
    status: EmergencySuspensionStatus;
    expiresAt: Timestamp;
    nation: NationId;
    affectedFunctions: Array<string>;
    affectedAccounts: Array<Principal>;
    approvingAuthorities: Array<Principal>;
    timestamp: Timestamp;
    restoration?: EmergencyRestoration;
    auditTrail: Array<EmergencyAuditEntry>;
    requestedBy: Principal;
    reason: string;
}
export type EmergencySuspensionId = bigint;
export interface EmissionScheduleConfig {
    halvingIntervalMonths: bigint;
    initialEmission: bigint;
    schedule: Array<EmissionScheduleEntry>;
    maxSupply: bigint;
}
export interface EmissionScheduleEntry {
    cumulativeReleased: bigint;
    emission: bigint;
    remainingSupply: bigint;
    periodIndex: bigint;
    startDate: Timestamp;
}
export interface EngagementTotals {
    challengeCompletions: bigint;
    impressions: bigint;
    challengeStarts: bigint;
    reports: bigint;
    comments: bigint;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface ExecutionAuditEntry {
    id: bigint;
    action: string;
    nation: NationId;
    request: ExecutionRequestId;
    note: string;
    timestamp: Timestamp;
    actorPrincipal: Principal;
}
export interface ExecutionRequest {
    id: ExecutionRequestId;
    status: ExecutionStatus;
    nation: NationId;
    timelockUntil?: Timestamp;
    constitutionVersion: bigint;
    authorizedBy?: Principal;
    cancelledBy?: Principal;
    highRisk: boolean;
    timestamp: Timestamp;
    proposal: GovernanceProposalId;
    requestedBy: Principal;
}
export type ExecutionRequestId = bigint;
export interface FileAttachment {
    id: FileAttachmentId;
    nation: NationId;
    file: NationFileId;
    target: FileAttachmentTarget;
    timestamp: Timestamp;
    attachedBy: Principal;
}
export type FileAttachmentId = bigint;
export type FileAttachmentTarget = {
    __kind__: "discussionPost";
    discussionPost: DiscussionPostId;
} | {
    __kind__: "calendarEvent";
    calendarEvent: CalendarEventId;
} | {
    __kind__: "document";
    document: NationDocumentId;
} | {
    __kind__: "proposal";
    proposal: NationProposalId;
} | {
    __kind__: "project";
    project: bigint;
};
export interface FoundingAppointment {
    id: bigint;
    status: FoundingAppointmentStatus;
    expiresAt: Timestamp;
    nation: NationId;
    appointmentLabel: string;
    timestamp: Timestamp;
    authority: Principal;
    acceptedAt?: Timestamp;
    invitedEmail?: string;
    invitationToken: string;
}
export interface FoundingSeatSummary {
    status: FoundingAppointmentStatus;
    appointmentLabel: string;
    heldByCaller: boolean;
    awaitingOther: boolean;
    authority: Principal;
    appointmentId: bigint;
}
export interface FoundingSetup {
    status: FoundingSetupStatus;
    nation: NationId;
    setupExpiresAt: Timestamp;
    foundingAuthority: Principal;
    timestamp: Timestamp;
    activatedConstitutionVersion?: bigint;
}
export interface GovernanceHistoryEntry {
    id: GovernanceHistoryId;
    nation: NationId;
    kind: GovernanceHistoryKind;
    constitutionVersion: bigint;
    referenceId: bigint;
    summary: string;
    timestamp: Timestamp;
    actorPrincipal: Principal;
}
export type GovernanceHistoryId = bigint;
export interface GovernanceModelOption {
    labelText: string;
    description: string;
    modelKey: string;
}
export interface GovernanceProposal {
    id: GovernanceProposalId;
    status: GovernanceProposalStatus;
    abstentionsCount: boolean;
    title: string;
    votesAgainst: bigint;
    nation: NationId;
    approvalThresholdPercent: bigint;
    constitutionVersion: bigint;
    quorumPercent: bigint;
    tieBreakRule: string;
    votesAbstain: bigint;
    summary: string;
    votesInFavor: bigint;
    reviewPeriodDays: bigint;
    timestamp: Timestamp;
    proposer: Principal;
    discussionPeriodDays: bigint;
    outcome?: ProposalOutcome;
    classification: string;
}
export type GovernanceProposalId = bigint;
export interface GovernanceRole {
    id: GovernanceRoleId;
    roleName: string;
    nation: NationId;
    capabilities: Array<GovernanceCapability>;
    kind: GovernanceRoleKind;
    description: string;
    isCustom: boolean;
    timestamp: Timestamp;
}
export type GovernanceRoleId = bigint;
export type GovernanceRoleKind = {
    __kind__: "member";
    member: null;
} | {
    __kind__: "observer";
    observer: null;
} | {
    __kind__: "executionAuthority";
    executionAuthority: null;
} | {
    __kind__: "membershipAuthority";
    membershipAuthority: null;
} | {
    __kind__: "documentSteward";
    documentSteward: null;
} | {
    __kind__: "custom";
    custom: GovernanceRoleId;
} | {
    __kind__: "auditor";
    auditor: null;
} | {
    __kind__: "governanceDelegate";
    governanceDelegate: null;
} | {
    __kind__: "proposalSteward";
    proposalSteward: null;
} | {
    __kind__: "foundingAuthority";
    foundingAuthority: null;
} | {
    __kind__: "treasurySteward";
    treasurySteward: null;
};
export interface GovernanceRuleSet {
    abstentionsCount: boolean;
    confidentialityRule: string;
    dataExportProcedure: string;
    proposalClassifications: Array<string>;
    approvalThresholdPercent: bigint;
    leadershipElectionProcedure: string;
    proposalSubmissionPeriodDays: bigint;
    treasurySpendLimit: bigint;
    loginRequirement: string;
    aiPermissions: string;
    emergencyPauseProcedure: string;
    humanOversight: string;
    votingWeight: string;
    governanceRecoveryProcedure: string;
    documentAccess: string;
    quorumPercent: bigint;
    tieBreakRule: string;
    votingMethod: string;
    foundingAuthorityProcedure: string;
    proposalReviewPeriodDays: bigint;
    appealsProcedure: string;
    participationRequirement: string;
    treasuryAuthorization: string;
    proposalDiscussionPeriodDays: bigint;
    membershipApprovalThresholdPercent: bigint;
    leadershipRemovalProcedure: string;
    disputeProcedure: string;
    leadershipTermDays: bigint;
    identityVerification: string;
    newMemberWaitingPeriodDays: bigint;
    dissolutionProcedure: string;
    evidenceReviewProcedure: string;
    membershipEligibility: string;
    collaborationDataSharing: string;
    votingEligibility: string;
    delegationAllowed: boolean;
    amendmentProcedure: string;
    approvalOutcomes: Array<string>;
}
export interface IntroductionRequest {
    id: IntroductionRequestId;
    status: IntroductionStatus;
    requester: CollaborationParty;
    requesterApproved: boolean;
    target: CollaborationParty;
    message: string;
    targetApproved: boolean;
    timestamp: Timestamp;
}
export type IntroductionRequestId = bigint;
export type IssueInvitationResult = {
    __kind__: "ok";
    ok: MembershipInvitationId;
} | {
    __kind__: "err";
    err: GovernanceError;
};
export interface JoinRequest {
    id: JoinRequestId;
    status: JoinRequestStatus;
    applicant: Principal;
    requiredApprovals: bigint;
    expiresAt: Timestamp;
    nation: NationId;
    displayName: string;
    constitutionVersion: bigint;
    message: string;
    timestamp: Timestamp;
    approvers: Array<Principal>;
}
export type JoinRequestId = bigint;
export interface LaunchStatus {
    nation: NationId;
    requiredAuthorities: bigint;
    canResume: boolean;
    constitutionSaved: boolean;
    awaitingOtherSeats: Array<FoundingSeatSummary>;
    acceptedAuthorities: bigint;
    blockedReason: string;
    callerSeats: Array<FoundingSeatSummary>;
    setupStatus: FoundingSetupStatus;
    lifecycleState: NationLifecycleState;
}
export interface Lead {
    id: LeadId;
    status: LeadStatus;
    pathway: LeadPathway;
    organizationType?: OrganizationType;
    intendedDeployment?: string;
    prepaidInterest?: boolean;
    name: string;
    intendedSupport?: FundingSupportType;
    email: string;
    adminNote?: string;
    timestamp: Timestamp;
    organization?: string;
    budgetRange?: string;
    intendedDaoUseCase?: string;
    consentToContact: boolean;
}
export interface LeadAnalytics {
    prepaidInterestCount: bigint;
    freeEarlyAccessCount: bigint;
    consentingLeads: bigint;
    foundingOrganizationCount: bigint;
    statusCounts: Array<[LeadStatus, bigint]>;
    totalLeads: bigint;
    organizationTypeCounts: Array<[OrganizationType, bigint]>;
    strategicFundingPartnerCount: bigint;
}
export type LeadId = bigint;
export interface LeadList {
    pathway: LeadPathway;
    total: bigint;
    leads: Array<Lead>;
}
export interface MemberAdmission {
    id: MemberAdmissionId;
    member: Principal;
    admittedAt: Timestamp;
    nation: NationId;
    constitutionVersion: bigint;
    timestamp: Timestamp;
}
export type MemberAdmissionId = bigint;
export interface MemberDeparture {
    id: MemberDepartureId;
    appealReference?: AppealId;
    member: Principal;
    status: DepartureStatus;
    nation: NationId;
    notice: string;
    kind: DepartureKind;
    effectiveAt: Timestamp;
    reviewNote: string;
    recordedBy: Principal;
    permissionRevokedAt?: Timestamp;
    timestamp: Timestamp;
}
export type MemberDepartureId = bigint;
export type MembershipApprovalResult = {
    __kind__: "ok";
    ok: {
        admitted: boolean;
        approvalId: bigint;
    };
} | {
    __kind__: "err";
    err: GovernanceError;
};
export type MembershipInvitationId = bigint;
export interface MembershipVotingConfig {
    membershipModel: string;
    approvalThresholdPercent: bigint;
    quorumPercent: bigint;
    votingModel: string;
}
export type ModerateCommentResult = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: VisitorError;
};
export type MoveFileResult = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: FileError;
};
export interface Nation {
    id: NationId;
    region: string;
    governanceModel: string;
    name: string;
    privacyLevel: PrivacyLevel;
    isSample: boolean;
    shortDescription: string;
    openToCollaboration: boolean;
    timestamp: Timestamp;
}
export interface NationDocument {
    id: NationDocumentId;
    title: string;
    nation: NationId;
    body: string;
    author: Principal;
    timestamp: Timestamp;
}
export type NationDocumentId = bigint;
export interface NationFile {
    id: NationFileId;
    content: ExternalBlob;
    nation: NationId;
    contentType: string;
    name: string;
    size: bigint;
    timestamp: Timestamp;
    uploadedBy: Principal;
    folder?: NationFolderId;
}
export type NationFileId = bigint;
export interface NationFileSummary {
    nation: NationId;
    fileCount: bigint;
    totalBytes: bigint;
    folderCount: bigint;
}
export interface NationFolder {
    id: NationFolderId;
    nation: NationId;
    name: string;
    createdBy: Principal;
    timestamp: Timestamp;
    parent?: NationFolderId;
}
export type NationFolderId = bigint;
export type NationId = bigint;
export interface NationLauncherConfig {
    region: string;
    theme: NationTheme;
    name: string;
    shortDescription: string;
    selectedApps: Array<SelectedApp>;
    membershipVoting: MembershipVotingConfig;
    governanceModelKey: string;
}
export interface NationMember {
    id: NationMemberId;
    member: Principal;
    nation: NationId;
    displayName: string;
    permissionLabels: Array<string>;
    timestamp: Timestamp;
    roleLabel: string;
}
export type NationMemberId = bigint;
export interface NationProposal {
    id: NationProposalId;
    status: NationProposalStatus;
    title: string;
    votesAgainst: bigint;
    nation: NationId;
    votesAbstain: bigint;
    summary: string;
    votesInFavor: bigint;
    timestamp: Timestamp;
}
export type NationProposalId = bigint;
export interface NationTheme {
    themeKey: string;
    wallpaperKey: string;
    blurEnabled: boolean;
}
export interface NationTreasurySummary {
    nation: NationId;
    balance: bigint;
    totalIncome: bigint;
    totalExpense: bigint;
    transactionCount: bigint;
}
export interface NationTreasuryTransaction {
    id: NationTreasuryTransactionId;
    direction: NationTreasuryDirection;
    nation: NationId;
    description: string;
    timestamp: Timestamp;
    category: string;
    amount: bigint;
}
export type NationTreasuryTransactionId = bigint;
export interface NationWorkspaceView {
    theme: NationTheme;
    privacySettings: PrivacySettings;
    nation: Nation;
    networkOptIn: boolean;
    apps: Array<WorkspaceApp>;
    workspace?: Workspace;
    membershipVoting: MembershipVotingConfig;
}
export interface NetworkActivityEntry {
    id: ActivityEntryId;
    kind: ActivityKind;
    community: CommunityId;
    summary: string;
    timestamp: Timestamp;
}
export interface NetworkNationProfile {
    region: string;
    nation: NationId;
    networkOptIn: boolean;
    name: string;
    shortDescription: string;
    timestamp: Timestamp;
    collaborationInterests: Array<string>;
}
export interface ObligationsReview {
    note: string;
    outstandingObligations: Array<string>;
    reviewedAt: Timestamp;
    reviewedBy: Principal;
}
export interface ParticipationConversion {
    starts: bigint;
    completions: bigint;
    completionRatePercent: number;
    startRatePercent: number;
    impressions: bigint;
}
export interface ParticipationTrendPoint {
    day: string;
    starts: bigint;
    completions: bigint;
    impressions: bigint;
    comments: bigint;
}
export interface PersonalRecordExport {
    member: Principal;
    censusEntries: Array<CensusEntry>;
    nation: NationId;
    exportedAt: Timestamp;
    admission?: MemberAdmission;
    recordedVotes: Array<RecordedVote>;
    departures: Array<MemberDeparture>;
}
export interface PipelineInteraction {
    id: bigint;
    pipelineItemId: PipelineItemId;
    body: string;
    kind: PipelineInteractionKind;
    author: Principal;
    timestamp: Timestamp;
}
export interface PipelineItem {
    id: PipelineItemId;
    title: string;
    community: CommunityId;
    stage: PipelineStage;
    timestamp: Timestamp;
    submissionId: SubmissionId;
    proposalId?: ProposalId;
}
export type PipelineItemId = bigint;
export interface PlanRatification {
    ratifiedAt: Timestamp;
    authority: Principal;
}
export interface PrivacySettings {
    calendarVisible: boolean;
    nation: NationId;
    timestamp: Timestamp;
    documentsVisible: boolean;
    proposalsVisible: boolean;
    treasuryVisible: boolean;
    discussionsVisible: boolean;
}
export type ProposalId = bigint;
export interface ProposalTally {
    against: bigint;
    abstain: bigint;
    inFavor: bigint;
}
export interface ProposalView {
    id: ProposalId;
    status: ProposalStatus;
    tally: ProposalTally;
    title: string;
    closeTimestamp?: Timestamp;
    description: string;
    category: ProposalCategory;
    proposer: Principal;
    openTimestamp: Timestamp;
}
export interface PublicComment {
    id: CommentId;
    displayName?: string;
    body: string;
    participant?: Principal;
    moderationStatus: CommentModerationStatus;
    timestamp: Timestamp;
    sessionId: VisitorSessionId;
    reported: boolean;
}
export type RatifyAmendmentResult = {
    __kind__: "ok";
    ok: ConstitutionVersionId;
} | {
    __kind__: "err";
    err: LifecycleError;
};
export type RatifySuccessionPlanResult = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: LifecycleError;
};
export interface Recommendation {
    title: string;
    kind: RecommendationKind;
    explanation: string;
    referenceId: bigint;
}
export type RecordAuthorityTermEventResult = {
    __kind__: "ok";
    ok: AuthorityTermEventId;
} | {
    __kind__: "err";
    err: LifecycleError;
};
export type RecordCensusResult = {
    __kind__: "ok";
    ok: CensusEntryId;
} | {
    __kind__: "err";
    err: GovernanceError;
};
export type RecordImpressionResult = {
    __kind__: "ok";
    ok: ChallengeImpressionId;
} | {
    __kind__: "err";
    err: VisitorError;
};
export interface RecordedVote {
    id: RecordedVoteId;
    decision: DecisionKind;
    nation: NationId;
    voter: Principal;
    timestamp: Timestamp;
    confidential: boolean;
    choice: VoteChoice;
}
export type RecordedVoteId = bigint;
export interface RecoveryTrustee {
    trustee: Principal;
    trusteeDisplayLabel: string;
}
export type RenameFolderResult = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: FileError;
};
export type ReportCommentResult = {
    __kind__: "ok";
    ok: CommentReportId;
} | {
    __kind__: "err";
    err: VisitorError;
};
export type RequestIntroductionResult = {
    __kind__: "ok";
    ok: IntroductionRequestId;
} | {
    __kind__: "err";
    err: DiscoveryError;
};
export type RespondIntroductionResult = {
    __kind__: "ok";
    ok: IntroductionStatus;
} | {
    __kind__: "err";
    err: DiscoveryError;
};
export type RestoreEmergencySuspensionResult = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: LifecycleError;
};
export type Result = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: string;
};
export type Result_1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export interface Result__1 {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type ResumeLaunchResult = {
    __kind__: "ok";
    ok: LaunchStatus;
} | {
    __kind__: "err";
    err: GovernanceError;
};
export interface ReturningVisitorActivity {
    returningSessions: bigint;
    distinctSessions: bigint;
    newSessions: bigint;
}
export type ReviewJoinRequestResult = {
    __kind__: "ok";
    ok: JoinRequestStatus;
} | {
    __kind__: "err";
    err: GovernanceError;
};
export interface RoleAssignment {
    id: RoleAssignmentId;
    member: Principal;
    grantedBy: Principal;
    nation: NationId;
    role: GovernanceRoleId;
    timestamp: Timestamp;
}
export type RoleAssignmentId = bigint;
export interface RoleDelegation {
    id: RoleDelegationId;
    active: boolean;
    expiresAt: Timestamp;
    nation: NationId;
    capabilities: Array<GovernanceCapability>;
    role: GovernanceRoleId;
    delegate: Principal;
    delegator: Principal;
    timestamp: Timestamp;
}
export type RoleDelegationId = bigint;
export interface RolePermissionEntry {
    allowed: boolean;
    roleLabel: string;
    capability: string;
}
export interface RuleChange {
    afterValue: string;
    beforeValue: string;
    fieldName: string;
}
export type SaveAmendmentProposalResult = {
    __kind__: "ok";
    ok: AmendmentProposalId;
} | {
    __kind__: "err";
    err: LifecycleError;
};
export type SaveAmendmentResult = {
    __kind__: "ok";
    ok: AmendmentId;
} | {
    __kind__: "err";
    err: GovernanceError;
};
export type SaveAppealResult = {
    __kind__: "ok";
    ok: AppealId;
} | {
    __kind__: "err";
    err: GovernanceError;
};
export type SaveAttachmentResult = {
    __kind__: "ok";
    ok: FileAttachmentId;
} | {
    __kind__: "err";
    err: FileError;
};
export type SaveAuthorityPositionResult = {
    __kind__: "ok";
    ok: AuthorityPositionId;
} | {
    __kind__: "err";
    err: LifecycleError;
};
export type SaveCollaborationProfileResult = {
    __kind__: "ok";
    ok: CollaborationProfileId;
} | {
    __kind__: "err";
    err: DiscoveryError;
};
export type SaveCommunityProfileResult = {
    __kind__: "ok";
    ok: CommunityId;
} | {
    __kind__: "err";
    err: DiscoveryError;
};
export type SaveConstitutionResult = {
    __kind__: "ok";
    ok: ConstitutionId;
} | {
    __kind__: "err";
    err: GovernanceError;
};
export type SaveDiscussionPostResult = {
    __kind__: "ok";
    ok: DiscussionPostId;
} | {
    __kind__: "err";
    err: SovereignError;
};
export type SaveDissolutionResult = {
    __kind__: "ok";
    ok: DissolutionId;
} | {
    __kind__: "err";
    err: LifecycleError;
};
export type SaveEmergencySuspensionResult = {
    __kind__: "ok";
    ok: EmergencySuspensionId;
} | {
    __kind__: "err";
    err: LifecycleError;
};
export type SaveExecutionRequestResult = {
    __kind__: "ok";
    ok: ExecutionRequestId;
} | {
    __kind__: "err";
    err: GovernanceError;
};
export type SaveFileResult = {
    __kind__: "ok";
    ok: NationFileId;
} | {
    __kind__: "err";
    err: FileError;
};
export type SaveFolderResult = {
    __kind__: "ok";
    ok: NationFolderId;
} | {
    __kind__: "err";
    err: FileError;
};
export type SaveGovernanceProposalResult = {
    __kind__: "ok";
    ok: GovernanceProposalId;
} | {
    __kind__: "err";
    err: GovernanceError;
};
export type SaveMemberDepartureResult = {
    __kind__: "ok";
    ok: MemberDepartureId;
} | {
    __kind__: "err";
    err: LifecycleError;
};
export type SaveMembershipVotingResult = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: SovereignError;
};
export type SaveNationProposalResult = {
    __kind__: "ok";
    ok: NationProposalId;
} | {
    __kind__: "err";
    err: SovereignError;
};
export type SaveNationThemeResult = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: SovereignError;
};
export type SavePrivacySettingsResult = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: SovereignError;
};
export type SaveRoleAssignmentResult = {
    __kind__: "ok";
    ok: RoleAssignmentId;
} | {
    __kind__: "err";
    err: GovernanceError;
};
export type SaveRoleDelegationResult = {
    __kind__: "ok";
    ok: RoleDelegationId;
} | {
    __kind__: "err";
    err: GovernanceError;
};
export type SaveRoleResult = {
    __kind__: "ok";
    ok: GovernanceRoleId;
} | {
    __kind__: "err";
    err: GovernanceError;
};
export type SaveSuccessionPlanResult = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: LifecycleError;
};
export interface SelectedApp {
    status: WorkspaceAppStatus;
    oneLineDescription: string;
    displayName: string;
    appKey: string;
    iconKey: string;
}
export type SetNetworkOptInResult = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: SovereignError;
};
export type SrcBalance = bigint;
export type SrcReference = {
    __kind__: "assignment";
    assignment: AssignmentId;
} | {
    __kind__: "none";
    none: null;
} | {
    __kind__: "contribution";
    contribution: ContributionId;
};
export interface SrcTransaction {
    id: SrcTransactionId;
    member: Principal;
    reference: SrcReference;
    timestamp: Timestamp;
    txType: SrcTransactionType;
    amount: bigint;
}
export type SrcTransactionId = bigint;
export interface StakePreset {
    termLabel: string;
    termSeconds: bigint;
    maturityRateBps: bigint;
}
export type StakingId = bigint;
export interface StakingRecord {
    id: StakingId;
    member: Principal;
    status: StakingStatus;
    unlockTime: Timestamp;
    lockTermSeconds: bigint;
    lockStart: Timestamp;
    maturityRateBps: bigint;
    lockedAmount: bigint;
}
export interface StakingView {
    id: StakingId;
    member: Principal;
    status: StakingStatus;
    unlockTime: Timestamp;
    accruedMaturity: bigint;
    votingPower: bigint;
    lockTermSeconds: bigint;
    effectiveStatus: StakingStatus;
    lockStart: Timestamp;
    maturityRateBps: bigint;
    lockedAmount: bigint;
}
export type StartChallengeResult = {
    __kind__: "ok";
    ok: ChallengeStartId;
} | {
    __kind__: "err";
    err: VisitorError;
};
export type SubmissionId = bigint;
export type SubmitChallengeResponseResult = {
    __kind__: "ok";
    ok: ChallengeResponseId;
} | {
    __kind__: "err";
    err: VisitorError;
};
export type SubmitCommentResult = {
    __kind__: "ok";
    ok: CommentId;
} | {
    __kind__: "err";
    err: VisitorError;
};
export type SubmitDiscoveryResult = {
    __kind__: "ok";
    ok: {
        id: SubmissionId;
        classification: SubmissionClassification;
    };
} | {
    __kind__: "err";
    err: DiscoveryError;
};
export type SubmitJoinRequestResult = {
    __kind__: "ok";
    ok: JoinRequestId;
} | {
    __kind__: "err";
    err: GovernanceError;
};
export type SubmitLeadResult = {
    __kind__: "ok";
    ok: LeadId;
} | {
    __kind__: "err";
    err: LeadError;
};
export interface SuccessionRecoveryPlan {
    recoveryApprovalThreshold: bigint;
    recoveryTrustees: Array<RecoveryTrustee>;
    nation: NationId;
    ratified: boolean;
    membershipCouncil: Array<CouncilMember>;
    designatedSuccessors: Array<DesignatedSuccessor>;
    timestamp: Timestamp;
    ratifications: Array<PlanRatification>;
    identityRecoveryProcedure: string;
    alternateAuthorities: Array<AlternateAuthority>;
}
export type Timestamp = bigint;
export interface TokenAllocation {
    releaseConditions: string;
    treasuryOversight: string;
    tokenAmount: bigint;
    vestingSchedule: string;
    category: AllocationCategory;
    lockupPeriod: string;
    percentage: number;
}
export interface TokenomicsConfig {
    allocations: Array<TokenAllocation>;
    maxSupply: bigint;
}
export interface TreasurySummary {
    fundingReceived: bigint;
    aiApiSpend: bigint;
    runwayMonths?: bigint;
    currentBalance: bigint;
    totalIncome: bigint;
    institutionalResearchContracts: bigint;
    infrastructureAndStorageCost: bigint;
    grantsAndDonations: bigint;
    serviceRevenue: bigint;
    approvedResearchBounties: bigint;
    totalExpense: bigint;
    otherOperatingCost: bigint;
    monthlyOperatingCost: bigint;
}
export interface TreasuryTransaction {
    id: TreasuryTransactionId;
    direction: TreasuryDirection;
    description: string;
    recordedBy: Principal;
    timestamp: Timestamp;
    category: TreasuryCategory;
    amount: bigint;
}
export type TreasuryTransactionId = bigint;
export type UpdateLeadResult = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: LeadError;
};
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export interface VisitorAnalytics {
    completionRatePercent: number;
    returningVisitors: ReturningVisitorActivity;
    recentComments: Array<PublicComment>;
    weeklyTrend: Array<ParticipationTrendPoint>;
    answerDistribution: AnswerDistribution;
    totals: EngagementTotals;
    conversion: ParticipationConversion;
}
export type VisitorSessionId = string;
export interface VoteDelegation {
    active: boolean;
    delegate: Principal;
    delegator: Principal;
    timestamp: Timestamp;
}
export interface VotingEligibility {
    eligible: boolean;
    restriction?: EligibilityRestriction;
    eligibleFrom?: Timestamp;
}
export interface WaitlistEntry {
    id: WaitlistEntryId;
    name: string;
    email: string;
    interestArea?: WaitlistInterestArea;
    timestamp: Timestamp;
    organization?: string;
}
export type WaitlistEntryId = bigint;
export type WaitlistSubmitResult = {
    __kind__: "ok";
    ok: WaitlistEntryId;
} | {
    __kind__: "err";
    err: WaitlistError;
};
export interface WeeklyChallenge {
    weekKey: string;
    question: string;
    updatedAt: Timestamp;
    options: Array<ChallengeOption>;
}
export interface Workspace {
    id: WorkspaceId;
    nation: NationId;
    name: string;
    description: string;
    timestamp: Timestamp;
}
export interface WorkspaceApp {
    id: WorkspaceAppId;
    status: WorkspaceAppStatus;
    oneLineDescription: string;
    displayName: string;
    order: bigint;
    appKey: string;
    workspace: WorkspaceId;
    iconKey: string;
}
export type WorkspaceAppId = bigint;
export type WorkspaceId = bigint;
export enum AbstentionHandling {
    excludedFromDenominator = "excludedFromDenominator",
    countTowardQuorum = "countTowardQuorum"
}
export enum ActivityKind {
    publicIdea = "publicIdea",
    partnership = "partnership",
    communityMilestone = "communityMilestone",
    proposal = "proposal"
}
export enum AllocationCategory {
    adminDeveloperAllocation = "adminDeveloperAllocation",
    researchParticipationRewards = "researchParticipationRewards",
    stakingNeuronParticipation = "stakingNeuronParticipation",
    communityAirdrop = "communityAirdrop",
    daoTreasuryEcosystemReserve = "daoTreasuryEcosystemReserve",
    governanceParticipationRewards = "governanceParticipationRewards"
}
export enum AmendmentProposalStatus {
    ratified = "ratified",
    voting = "voting",
    rejected = "rejected",
    discussion = "discussion",
    withdrawn = "withdrawn"
}
export enum AppealKind {
    governanceDecision = "governanceDecision",
    inactivity = "inactivity",
    membershipRejection = "membershipRejection"
}
export enum AppealStatus {
    submitted = "submitted",
    underReview = "underReview",
    denied = "denied",
    upheld = "upheld",
    withdrawn = "withdrawn"
}
export enum AssignmentPriority {
    low = "low",
    high = "high",
    urgent = "urgent",
    medium = "medium"
}
export enum AssignmentStatus {
    completed = "completed",
    queued = "queued",
    inProgress = "inProgress",
    queuedAwaitingFunding = "queuedAwaitingFunding"
}
export enum AuthorityPositionStatus {
    vacant = "vacant",
    filled = "filled",
    suspended = "suspended",
    retired = "retired"
}
export enum AuthorityTermEventKind {
    appointment = "appointment",
    resignation = "resignation",
    replacement = "replacement",
    acceptance = "acceptance",
    retirement = "retirement",
    removal = "removal"
}
export enum CensusEventKind {
    delegation = "delegation",
    executionOutcome = "executionOutcome",
    vote = "vote",
    permissionChange = "permissionChange",
    membershipApproval = "membershipApproval",
    proposal = "proposal",
    dispute = "dispute",
    activity = "activity"
}
export enum CommentModerationStatus {
    hidden = "hidden",
    visible = "visible",
    removed = "removed"
}
export enum CommunityVisibility {
    privateVisible = "privateVisible",
    publicVisible = "publicVisible"
}
export enum ContributionStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum ContributionType {
    acceptedChallengeOrCorrection = "acceptedChallengeOrCorrection",
    expertPeerReview = "expertPeerReview",
    courtTreatyResearch = "courtTreatyResearch",
    sourceVerificationCitationCorrection = "sourceVerificationCitationCorrection",
    undripAnalysis = "undripAnalysis",
    legalLegislativeResearch = "legalLegislativeResearch"
}
export enum DepartureKind {
    voluntaryDeparture = "voluntaryDeparture",
    constitutionalRemoval = "constitutionalRemoval",
    suspension = "suspension",
    retirement = "retirement"
}
export enum DepartureStatus {
    appealed = "appealed",
    notice = "notice",
    underReview = "underReview",
    effective = "effective",
    withdrawn = "withdrawn"
}
export enum DirectoryEntryKind {
    community = "community",
    opportunity = "opportunity"
}
export enum DiscoveryError {
    missingTitle = "missingTitle",
    notAuthorized = "notAuthorized",
    bodyTooLong = "bodyTooLong",
    invalidStageTransition = "invalidStageTransition",
    unknownCommunity = "unknownCommunity",
    unknownSubmission = "unknownSubmission",
    unknownProfile = "unknownProfile",
    alreadyApproved = "alreadyApproved",
    missingBody = "missingBody",
    unknownPipelineItem = "unknownPipelineItem",
    notCommunityMember = "notCommunityMember",
    unknownIntroduction = "unknownIntroduction",
    invalidIntroductionState = "invalidIntroductionState"
}
export enum DissolutionStatus {
    voting = "voting",
    approved = "approved",
    rejected = "rejected",
    proposed = "proposed",
    coolingOff = "coolingOff",
    withdrawn = "withdrawn",
    archived = "archived"
}
export enum EligibilityRestriction {
    inactivity = "inactivity",
    notAdmitted = "notAdmitted",
    waitingPeriod = "waitingPeriod"
}
export enum EmergencySuspensionStatus {
    active = "active",
    expired = "expired",
    restored = "restored"
}
export enum ExecutionStatus {
    pendingAuthorization = "pendingAuthorization",
    cancelled = "cancelled",
    rejected = "rejected",
    executed = "executed",
    timelocked = "timelocked",
    paused = "paused"
}
export enum FileError {
    crossNationAccess = "crossNationAccess",
    notAuthorized = "notAuthorized",
    unknownTarget = "unknownTarget",
    unknownAttachment = "unknownAttachment",
    unknownFile = "unknownFile",
    notNationMember = "notNationMember",
    folderNotEmpty = "folderNotEmpty",
    invalidMove = "invalidMove",
    unknownFolder = "unknownFolder",
    missingName = "missingName",
    nameTooLong = "nameTooLong",
    unknownNation = "unknownNation",
    sampleReadOnly = "sampleReadOnly",
    duplicateName = "duplicateName"
}
export enum FoundingAppointmentStatus {
    replaced = "replaced",
    expired = "expired",
    pending = "pending",
    accepted = "accepted",
    declined = "declined"
}
export enum FoundingSetupStatus {
    activated = "activated",
    cancelled = "cancelled",
    expired = "expired",
    foundingSetup = "foundingSetup"
}
export enum FundingSupportType {
    sponsorship = "sponsorship",
    other = "other",
    investmentInterest = "investmentInterest",
    strategicPartnership = "strategicPartnership",
    grantOrPhilanthropy = "grantOrPhilanthropy"
}
export enum GovernanceCapability {
    view = "view",
    vote = "vote",
    approve = "approve",
    modify = "modify",
    execute = "execute",
    propose = "propose"
}
export enum GovernanceError {
    setupCancelledRecoverable = "setupCancelledRecoverable",
    unknownConstitution = "unknownConstitution",
    notInFoundingSetup = "notInFoundingSetup",
    missingTitle = "missingTitle",
    notAuthorized = "notAuthorized",
    alreadyVoted = "alreadyVoted",
    invalidTimelock = "invalidTimelock",
    unknownAppeal = "unknownAppeal",
    executionPaused = "executionPaused",
    duplicateExecution = "duplicateExecution",
    alreadyActivated = "alreadyActivated",
    invalidThreshold = "invalidThreshold",
    unknownRole = "unknownRole",
    unknownExecutionRequest = "unknownExecutionRequest",
    notNationMember = "notNationMember",
    invalidRuleSet = "invalidRuleSet",
    setupExpiredRecoverable = "setupExpiredRecoverable",
    proposalNotPassed = "proposalNotPassed",
    unknownProposal = "unknownProposal",
    delegationExpired = "delegationExpired",
    notFoundingAuthority = "notFoundingAuthority",
    missingName = "missingName",
    missingSummary = "missingSummary",
    conflictOfInterest = "conflictOfInterest",
    unknownNation = "unknownNation",
    setupExpired = "setupExpired"
}
export enum GovernanceHistoryKind {
    appointment = "appointment",
    vote = "vote",
    rejection = "rejection",
    amendment = "amendment",
    approval = "approval",
    acceptance = "acceptance"
}
export enum GovernanceProposalStatus {
    review = "review",
    voting = "voting",
    rejected = "rejected",
    discussion = "discussion",
    withdrawn = "withdrawn",
    draft = "draft",
    passed = "passed"
}
export enum IntroductionStatus {
    pending = "pending",
    approved = "approved",
    declined = "declined"
}
export enum JoinRequestStatus {
    pendingReview = "pendingReview",
    active = "active",
    expired = "expired",
    underReview = "underReview",
    approved = "approved",
    rejected = "rejected",
    withdrawn = "withdrawn"
}
export enum LeadError {
    invalidEmail = "invalidEmail",
    notAuthorized = "notAuthorized",
    missingConsent = "missingConsent",
    missingOrganization = "missingOrganization",
    unknownLead = "unknownLead",
    missingEmail = "missingEmail",
    missingName = "missingName"
}
export enum LeadPathway {
    freeEarlyAccess = "freeEarlyAccess",
    foundingOrganization = "foundingOrganization",
    strategicFundingPartner = "strategicFundingPartner"
}
export enum LeadStatus {
    new = "new",
    foundingOrganizationProspect = "foundingOrganizationProspect",
    strategicPartner = "strategicPartner",
    notProceeding = "notProceeding",
    contacted = "contacted",
    interested = "interested",
    converted = "converted"
}
export enum LifecycleError {
    alreadyArchived = "alreadyArchived",
    obligationsNotReviewed = "obligationsNotReviewed",
    invalidLifecycleTransition = "invalidLifecycleTransition",
    missingTitle = "missingTitle",
    duplicateApproval = "duplicateApproval",
    quorumNotReached = "quorumNotReached",
    unknownSuspension = "unknownSuspension",
    emergencyScopeExceeded = "emergencyScopeExceeded",
    notAuthorized = "notAuthorized",
    duplicateIdentity = "duplicateIdentity",
    approvalThresholdNotMet = "approvalThresholdNotMet",
    planNotRatified = "planNotRatified",
    successorNotAccepted = "successorNotAccepted",
    invalidThreshold = "invalidThreshold",
    notNationMember = "notNationMember",
    unknownDissolution = "unknownDissolution",
    notActivatedDraft = "notActivatedDraft",
    unknownAmendment = "unknownAmendment",
    coolingOffNotElapsed = "coolingOffNotElapsed",
    unknownPosition = "unknownPosition",
    notFoundingAuthority = "notFoundingAuthority",
    missingSummary = "missingSummary",
    unknownNation = "unknownNation",
    unknownDeparture = "unknownDeparture",
    missingReason = "missingReason",
    selfApproval = "selfApproval"
}
export enum NationLifecycleState {
    active = "active",
    pendingDissolution = "pendingDissolution",
    pendingActivation = "pendingActivation",
    temporarilySuspended = "temporarilySuspended",
    draft = "draft",
    restrictedGovernance = "restrictedGovernance",
    archived = "archived"
}
export enum NationProposalStatus {
    open = "open",
    rejected = "rejected",
    withdrawn = "withdrawn",
    draft = "draft",
    passed = "passed"
}
export enum NationTreasuryDirection {
    expense = "expense",
    income = "income"
}
export enum OrganizationType {
    nonProfitOrCharity = "nonProfitOrCharity",
    enterprise = "enterprise",
    other = "other",
    governmentOrPublicSector = "governmentOrPublicSector",
    educationalInstitution = "educationalInstitution",
    indigenousNationOrCommunity = "indigenousNationOrCommunity",
    smallBusiness = "smallBusiness",
    cooperative = "cooperative"
}
export enum PipelineInteractionKind {
    improvement = "improvement",
    support = "support",
    comment = "comment"
}
export enum PipelineStage {
    draftProposal = "draftProposal",
    approvedAction = "approvedAction",
    idea = "idea",
    communityFeedback = "communityFeedback",
    results = "results",
    governanceVote = "governanceVote",
    collaboration = "collaboration"
}
export enum PrivacyLevel {
    publiclyVisible = "publiclyVisible",
    privateToMembers = "privateToMembers",
    openToCollaboration = "openToCollaboration"
}
export enum ProposalCategory {
    grantsAndRewards = "grantsAndRewards",
    platformDevelopment = "platformDevelopment",
    technicalUpgrade = "technicalUpgrade",
    researchPriority = "researchPriority",
    governanceParameters = "governanceParameters",
    treasuryExpenditure = "treasuryExpenditure"
}
export enum ProposalOutcome {
    tied = "tied",
    approved = "approved",
    noQuorum = "noQuorum",
    rejected = "rejected"
}
export enum ProposalStatus {
    closed = "closed",
    open = "open",
    rejected = "rejected",
    passed = "passed"
}
export enum RecommendationKind {
    relevantProposal = "relevantProposal",
    matchingMember = "matchingMember",
    similarIdea = "similarIdea",
    sharedObjective = "sharedObjective",
    suggestedNextStep = "suggestedNextStep",
    collaborationPartner = "collaborationPartner"
}
export enum SovereignError {
    missingGovernanceModel = "missingGovernanceModel",
    missingTitle = "missingTitle",
    notAuthorized = "notAuthorized",
    bodyTooLong = "bodyTooLong",
    unknownThread = "unknownThread",
    notNationMember = "notNationMember",
    unknownDocument = "unknownDocument",
    unknownEvent = "unknownEvent",
    unknownProposal = "unknownProposal",
    notNationOwner = "notNationOwner",
    missingApps = "missingApps",
    invalidTheme = "invalidTheme",
    missingBody = "missingBody",
    unknownWorkspace = "unknownWorkspace",
    missingName = "missingName",
    unknownMember = "unknownMember",
    invalidTimeRange = "invalidTimeRange",
    unknownNation = "unknownNation",
    invalidPrivacyLevel = "invalidPrivacyLevel"
}
export enum SrcTransactionType {
    earn = "earn",
    spend = "spend"
}
export enum StakingStatus {
    active = "active",
    unlocked = "unlocked",
    matured = "matured"
}
export enum SubmissionClassification {
    idea = "idea",
    need = "need",
    feedback = "feedback",
    opportunity = "opportunity",
    potentialProposal = "potentialProposal"
}
export enum SubmissionVisibility {
    publicVisible = "publicVisible",
    communityOnly = "communityOnly"
}
export enum TreasuryCategory {
    fundingReceived = "fundingReceived",
    institutionalResearchContract = "institutionalResearchContract",
    aiApiSpend = "aiApiSpend",
    grantOrDonation = "grantOrDonation",
    approvedResearchBounty = "approvedResearchBounty",
    serviceRevenue = "serviceRevenue",
    infrastructureOrStorageCost = "infrastructureOrStorageCost",
    otherOperatingCost = "otherOperatingCost"
}
export enum TreasuryDirection {
    expense = "expense",
    income = "income"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum VisitorError {
    unknownComment = "unknownComment",
    notAuthorized = "notAuthorized",
    unknownChallenge = "unknownChallenge",
    bodyTooLong = "bodyTooLong",
    invalidChallenge = "invalidChallenge",
    missingBody = "missingBody",
    missingSessionId = "missingSessionId",
    unknownOption = "unknownOption",
    alreadyReported = "alreadyReported"
}
export enum VoteChoice {
    against = "against",
    abstain = "abstain",
    inFavor = "inFavor"
}
export enum WaitlistError {
    invalidEmail = "invalidEmail",
    missingEmail = "missingEmail",
    missingName = "missingName"
}
export enum WaitlistInterestArea {
    digitalSovereigntyAndDataGovernance = "digitalSovereigntyAndDataGovernance",
    aiAndTechnology = "aiAndTechnology",
    fundingAndStrategicPartnerships = "fundingAndStrategicPartnerships",
    daoAndEcosystemDevelopment = "daoAndEcosystemDevelopment",
    legalResearchAndPolicy = "legalResearchAndPolicy",
    indigenousLeadershipAndGovernance = "indigenousLeadershipAndGovernance",
    researchParticipation = "researchParticipation"
}
export enum WorkspaceAppStatus {
    preview = "preview",
    working = "working"
}
export interface backendInterface {
    acceptAuthorityAppointment(nation: NationId, position: AuthorityPositionId): Promise<RecordAuthorityTermEventResult>;
    acceptFoundingAppointment(nation: NationId, appointment: bigint): Promise<ActivateFoundingResult>;
    acceptFoundingInvitation(nation: NationId, token: string): Promise<ActivateFoundingResult>;
    acceptMembershipInvitation(nation: NationId, token: string): Promise<AcceptInvitationResult>;
    activateFounding(nation: NationId): Promise<ActivateFoundingResult>;
    addAppealEvidence(appeal: AppealId, evidenceLabel: string, detail: string): Promise<SaveAppealResult>;
    addPipelineInteraction(itemId: PipelineItemId, kind: PipelineInteractionKind, body: string): Promise<AddInteractionResult>;
    advanceAssignmentStatus(assignmentId: AssignmentId, newStatus: AssignmentStatus): Promise<void>;
    advancePipelineItem(itemId: PipelineItemId, to: PipelineStage): Promise<AdvancePipelineResult>;
    amendConstitution(nation: NationId, summary: string, newRules: GovernanceRuleSet): Promise<SaveAmendmentResult>;
    appealMemberDeparture(nation: NationId, departure: MemberDepartureId, summary: string): Promise<SaveMemberDepartureResult>;
    appointAuthoritySuccessor(nation: NationId, position: AuthorityPositionId, successor: Principal, successorDisplayLabel: string, reason: string): Promise<RecordAuthorityTermEventResult>;
    appointFoundingAuthority(nation: NationId, authority: Principal, appointmentLabel: string): Promise<SaveConstitutionResult>;
    approveEmergencySuspension(nation: NationId, suspension: EmergencySuspensionId): Promise<SaveEmergencySuspensionResult>;
    approveMembership(nation: NationId, member: Principal): Promise<MembershipApprovalResult>;
    archiveDissolution(nation: NationId, dissolution: DissolutionId): Promise<ArchiveDissolutionResult>;
    askCopilot(nation: NationId, question: string): Promise<AskCopilotResult>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignRole(nation: NationId, member: Principal, role: GovernanceRoleId): Promise<SaveRoleAssignmentResult>;
    attachFileToTarget(nation: NationId, file: NationFileId, target: FileAttachmentTarget): Promise<SaveAttachmentResult>;
    authorizeExecution(request: ExecutionRequestId): Promise<SaveExecutionRequestResult>;
    beginFoundingSetup(nation: NationId): Promise<ActivateFoundingResult>;
    callerHasCapability(nation: NationId, capability: GovernanceCapability): Promise<boolean>;
    cancelDraftNation(nation: NationId): Promise<ArchiveDissolutionResult>;
    cancelExecution(request: ExecutionRequestId): Promise<SaveExecutionRequestResult>;
    cancelFoundingSetup(nation: NationId): Promise<ActivateFoundingResult>;
    castDissolutionVote(nation: NationId, dissolution: DissolutionId, choice: VoteChoice): Promise<SaveDissolutionResult>;
    castGovernanceVote(proposal: GovernanceProposalId, choice: VoteChoice, confidential: boolean): Promise<SaveGovernanceProposalResult>;
    castNationVote(proposal: NationProposalId, choice: VoteChoice): Promise<SaveNationProposalResult>;
    castVote(proposalId: ProposalId, choice: VoteChoice): Promise<void>;
    closeDissolutionVoting(nation: NationId, dissolution: DissolutionId): Promise<SaveDissolutionResult>;
    closeGovernanceProposal(proposal: GovernanceProposalId): Promise<SaveGovernanceProposalResult>;
    closeProposal(proposalId: ProposalId): Promise<ProposalStatus>;
    configureWeeklyChallenge(weekKey: string, question: string, options: Array<ChallengeOption>): Promise<ConfigureWeeklyChallengeResult>;
    confirmFoundingSeat(nation: NationId, appointment: bigint): Promise<ConfirmFoundingSeatResult>;
    createAuthorityPosition(nation: NationId, seatLabel: string, termStart: Timestamp, termEnd: Timestamp): Promise<SaveAuthorityPositionResult>;
    createCustomRole(nation: NationId, roleName: string, description: string, capabilities: Array<GovernanceCapability>): Promise<SaveRoleResult>;
    createGovernanceProposal(nation: NationId, title: string, summary: string, classification: string, reviewPeriodDays: bigint, discussionPeriodDays: bigint, quorumPercent: bigint, approvalThresholdPercent: bigint, abstentionsCount: boolean, tieBreakRule: string): Promise<SaveGovernanceProposalResult>;
    createNationFile(nation: NationId, folder: NationFolderId | null, name: string, size: bigint, contentType: string, content: ExternalBlob): Promise<SaveFileResult>;
    createNationFolder(nation: NationId, parent: NationFolderId | null, name: string): Promise<SaveFolderResult>;
    createNationFromLauncher(config: NationLauncherConfig): Promise<CreateNationResult>;
    createPipelineItem(submissionId: SubmissionId, title: string): Promise<CreatePipelineItemResult>;
    createProposal(title: string, description: string, category: ProposalCategory): Promise<ProposalId>;
    createProposalFromPipelineItem(itemId: PipelineItemId): Promise<CreateProposalFromItemResult>;
    createRoleDelegation(nation: NationId, delegate: Principal, role: GovernanceRoleId, capabilities: Array<GovernanceCapability>, expiresAt: Timestamp): Promise<SaveRoleDelegationResult>;
    decideAppeal(appeal: AppealId, uphold: boolean, decisionNote: string): Promise<SaveAppealResult>;
    declineFoundingAppointment(nation: NationId, appointment: bigint): Promise<ActivateFoundingResult>;
    delegateVote(delegate: Principal): Promise<void>;
    deleteNationFile(nation: NationId, file: NationFileId): Promise<DeleteFileResult>;
    deleteNationFolder(nation: NationId, folder: NationFolderId): Promise<DeleteFolderResult>;
    detachFile(nation: NationId, attachment: FileAttachmentId): Promise<DeleteFileResult>;
    ensureNationRoles(nation: NationId): Promise<Array<GovernanceRole>>;
    ensureSampleWorkspace(): Promise<NationId>;
    execute(qJson: string): Promise<Result__1>;
    executeRequest(request: ExecutionRequestId): Promise<SaveExecutionRequestResult>;
    exportMyRecords(nation: NationId): Promise<PersonalRecordExport>;
    fileAppeal(nation: NationId, kind: AppealKind, subjectId: bigint, summary: string): Promise<SaveAppealResult>;
    finalizeMemberDeparture(nation: NationId, departure: MemberDepartureId): Promise<SaveMemberDepartureResult>;
    getActivationRequirements(nation: NationId): Promise<{
        constitutionRatifiedByAll: boolean;
        outstanding: Array<string>;
        hasConfirmedConstitution: boolean;
        required: bigint;
        accepted: bigint;
        planRatified: boolean;
    }>;
    getActiveConstitution(nation: NationId): Promise<Constitution | null>;
    getActiveRuleSet(nation: NationId): Promise<GovernanceRuleSet | null>;
    getApiDoc(): Promise<string>;
    getAppeal(appeal: AppealId): Promise<Appeal | null>;
    getCallerCapabilities(nation: NationId): Promise<Array<GovernanceCapability>>;
    getCallerContributions(): Promise<Array<Contribution>>;
    getCallerSrcBalance(): Promise<SrcBalance>;
    getCallerSrcTransactions(): Promise<Array<SrcTransaction>>;
    getCallerUserRole(): Promise<UserRole>;
    getCensusSummary(nation: NationId): Promise<CensusSummary>;
    getCollaborationState(nation: NationId): Promise<CollaborationState | null>;
    getCollectiveIntelligenceMetrics(): Promise<CollectiveIntelligenceMetrics>;
    getCommunityProfile(community: CommunityId): Promise<CommunityProfile | null>;
    getDefaultRuleSet(templateKey: string): Promise<GovernanceRuleSet>;
    getDissolution(nation: NationId): Promise<Dissolution | null>;
    getEmergencySuspension(suspension: EmergencySuspensionId): Promise<EmergencySuspension | null>;
    getEmissionScheduleConfig(): Promise<EmissionScheduleConfig>;
    getExecutionRequest(request: ExecutionRequestId): Promise<ExecutionRequest | null>;
    getFoundingSetup(nation: NationId): Promise<FoundingSetup | null>;
    getFoundingStatus(nation: NationId): Promise<{
        activated: boolean;
        required: bigint;
        accepted: bigint;
    }>;
    getGovernanceProposal(proposal: GovernanceProposalId): Promise<GovernanceProposal | null>;
    getLaunchStatus(nation: NationId): Promise<LaunchStatus | null>;
    getLeadAnalytics(): Promise<LeadAnalytics>;
    getMemberDeparture(departure: MemberDepartureId): Promise<MemberDeparture | null>;
    getMembershipApprovalStatus(nation: NationId, member: Principal): Promise<{
        required: bigint;
        approvals: bigint;
    }>;
    getMembershipVotingConfig(nation: NationId): Promise<MembershipVotingConfig>;
    getMyDelegation(): Promise<VoteDelegation | null>;
    getNation(nation: NationId): Promise<Nation | null>;
    getNationDocument(document_: NationDocumentId): Promise<NationDocument | null>;
    getNationFileSummary(nation: NationId): Promise<NationFileSummary>;
    getNationLifecycle(nation: NationId): Promise<{
        explanation: string;
        stateKey: string;
        state: NationLifecycleState;
        enteredAt: Timestamp;
        reason: string;
    } | null>;
    getNationProposal(proposal: NationProposalId): Promise<NationProposal | null>;
    getNationRole(nation: NationId, role: GovernanceRoleId): Promise<GovernanceRole | null>;
    getNationTheme(nation: NationId): Promise<NationTheme>;
    getNationTreasurySummary(nation: NationId): Promise<NationTreasurySummary>;
    getNationWorkspaceView(nation: NationId): Promise<NationWorkspaceView | null>;
    getNetworkActivityFeed(): Promise<Array<NetworkActivityEntry>>;
    getPrivacySettings(nation: NationId): Promise<PrivacySettings>;
    getProposal(id: ProposalId): Promise<ProposalView | null>;
    getRolePermissions(nation: NationId): Promise<Array<RolePermissionEntry>>;
    getSuccessionPlan(nation: NationId): Promise<SuccessionRecoveryPlan | null>;
    getTokenomicsConfig(): Promise<TokenomicsConfig>;
    getTreasurySummary(): Promise<TreasurySummary>;
    getVisitorAnalytics(): Promise<VisitorAnalytics>;
    getVotingEligibility(nation: NationId): Promise<VotingEligibility>;
    getWaitlistCount(): Promise<bigint>;
    getWeeklyChallenge(): Promise<WeeklyChallenge | null>;
    getWorkspace(nation: NationId): Promise<Workspace | null>;
    inviteFoundingAuthority(nation: NationId, invitedEmail: string, appointmentLabel: string): Promise<SaveConstitutionResult>;
    isCallerAdmin(): Promise<boolean>;
    isCallerReviewer(): Promise<boolean>;
    isMemberDeparted(nation: NationId, member: Principal): Promise<boolean>;
    issueMembershipInvitation(nation: NationId, invitedEmail: string): Promise<IssueInvitationResult>;
    listAmendmentProposals(nation: NationId): Promise<Array<AmendmentProposal>>;
    listAmendments(nation: NationId): Promise<Array<Amendment>>;
    listAppeals(nation: NationId): Promise<Array<Appeal>>;
    listAssignments(): Promise<Array<Assignment>>;
    listAuthorityPositions(nation: NationId): Promise<Array<AuthorityPosition>>;
    listAuthorityTermEvents(nation: NationId): Promise<Array<AuthorityTermEvent>>;
    listCalendarEvents(nation: NationId): Promise<Array<CalendarEvent>>;
    listCensusEntries(nation: NationId): Promise<Array<CensusEntry>>;
    listCommunitySubmissions(community: CommunityId): Promise<Array<DiscoverySubmission>>;
    listConstitutionTemplates(): Promise<Array<GovernanceModelOption>>;
    listConstitutionVersions(nation: NationId): Promise<Array<ConstitutionVersion>>;
    listDiscussionPosts(thread: DiscussionThreadId): Promise<Array<DiscussionPost>>;
    listDiscussionThreads(nation: NationId): Promise<Array<DiscussionThread>>;
    listDissolutions(nation: NationId): Promise<Array<Dissolution>>;
    listEmergencySuspensions(nation: NationId): Promise<Array<EmergencySuspension>>;
    listExecutionAudit(request: ExecutionRequestId): Promise<Array<ExecutionAuditEntry>>;
    listExecutionRequests(nation: NationId): Promise<Array<ExecutionRequest>>;
    listFileAttachments(nation: NationId, target: FileAttachmentTarget): Promise<Array<FileAttachment>>;
    listFoundingAppointments(nation: NationId): Promise<Array<FoundingAppointment>>;
    listGovernanceHistory(nation: NationId): Promise<Array<GovernanceHistoryEntry>>;
    listGovernanceModelOptions(): Promise<Array<GovernanceModelOption>>;
    listGovernanceProposals(nation: NationId): Promise<Array<GovernanceProposal>>;
    listJoinRequests(nation: NationId): Promise<Array<JoinRequest>>;
    listLeads(pathway: LeadPathway): Promise<LeadList>;
    listMatchingCollaborators(community: CommunityId): Promise<Array<CollaborationProfile>>;
    listMemberDepartures(nation: NationId): Promise<Array<MemberDeparture>>;
    listMyIntroductions(): Promise<Array<IntroductionRequest>>;
    listMyNations(): Promise<Array<Nation>>;
    listMyStakes(): Promise<Array<StakingView>>;
    listNationDocuments(nation: NationId): Promise<Array<NationDocument>>;
    listNationFiles(nation: NationId, folder: NationFolderId | null): Promise<Array<NationFile>>;
    listNationFolders(nation: NationId): Promise<Array<NationFolder>>;
    listNationMembers(nation: NationId): Promise<Array<NationMember>>;
    listNationProposals(nation: NationId): Promise<Array<NationProposal>>;
    listNationRoles(nation: NationId): Promise<Array<GovernanceRole>>;
    listNationTreasuryTransactions(nation: NationId): Promise<Array<NationTreasuryTransaction>>;
    listNations(): Promise<Array<Nation>>;
    listNetworkNations(): Promise<Array<NetworkNationProfile>>;
    listPendingContributions(): Promise<Array<Contribution>>;
    listPipelineInteractions(itemId: PipelineItemId): Promise<Array<PipelineInteraction>>;
    listPipelineItems(community: CommunityId): Promise<Array<PipelineItem>>;
    listProposals(): Promise<Array<ProposalView>>;
    listPublicComments(): Promise<Array<PublicComment>>;
    listPublicSubmissions(): Promise<Array<DiscoverySubmission>>;
    listRecommendations(community: CommunityId): Promise<Array<Recommendation>>;
    listRecordedVotes(nation: NationId, decision: DecisionKind): Promise<Array<RecordedVote>>;
    listRoleAssignments(nation: NationId): Promise<Array<RoleAssignment>>;
    listRoleDelegations(nation: NationId): Promise<Array<RoleDelegation>>;
    listStakePresets(): Promise<Array<StakePreset>>;
    listTreasuryTransactions(): Promise<Array<TreasuryTransaction>>;
    listWaitlistEntries(): Promise<Array<WaitlistEntry>>;
    listWorkspaceApps(workspace: WorkspaceId): Promise<Array<WorkspaceApp>>;
    lockStake(amount: bigint, termSeconds: bigint): Promise<StakingRecord>;
    moderateComment(commentId: CommentId, status: CommentModerationStatus): Promise<ModerateCommentResult>;
    moveNationFile(nation: NationId, file: NationFileId, folder: NationFolderId | null): Promise<MoveFileResult>;
    moveNationFolder(nation: NationId, folder: NationFolderId, newParent: NationFolderId | null): Promise<RenameFolderResult>;
    openDissolutionVoting(nation: NationId, dissolution: DissolutionId): Promise<SaveDissolutionResult>;
    postDiscussionReply(thread: DiscussionThreadId, body: string): Promise<SaveDiscussionPostResult>;
    proposeAmendment(nation: NationId, title: string, summary: string, changes: Array<RuleChange>, votingDeadline: Timestamp): Promise<SaveAmendmentProposalResult>;
    proposeDissolution(nation: NationId, proposal: string, explanation: string): Promise<SaveDissolutionResult>;
    raiseAssignmentPriority(assignmentId: AssignmentId, additionalSrc: bigint, newPriority: AssignmentPriority): Promise<void>;
    ratifyAmendment(nation: NationId, proposal: AmendmentProposalId): Promise<RatifyAmendmentResult>;
    ratifyConstitution(nation: NationId): Promise<ActivateFoundingResult>;
    ratifySuccessionPlan(nation: NationId): Promise<RatifySuccessionPlanResult>;
    recordAuthorityDeparture(nation: NationId, position: AuthorityPositionId, kind: AuthorityTermEventKind, reason: string): Promise<RecordAuthorityTermEventResult>;
    recordCensusEntry(nation: NationId, kind: CensusEventKind, subject: Principal, referenceId: bigint, summary: string, confidential: boolean, constitutionVersion: bigint): Promise<RecordCensusResult>;
    recordChallengeImpression(sessionId: VisitorSessionId): Promise<RecordImpressionResult>;
    recordDataExport(nation: NationId, dissolution: DissolutionId, exportReference: string): Promise<SaveDissolutionResult>;
    recordMemberDeparture(nation: NationId, member: Principal, kind: DepartureKind, notice: string): Promise<SaveMemberDepartureResult>;
    recordObligationsReview(nation: NationId, dissolution: DissolutionId, note: string, outstandingObligations: Array<string>): Promise<SaveDissolutionResult>;
    recordTreasuryTransaction(category: TreasuryCategory, direction: TreasuryDirection, amount: bigint, description: string): Promise<TreasuryTransaction>;
    recuseFromAppeal(appeal: AppealId, reason: string): Promise<SaveAppealResult>;
    renameNationFile(nation: NationId, file: NationFileId, name: string): Promise<SaveFileResult>;
    renameNationFolder(nation: NationId, folder: NationFolderId, name: string): Promise<RenameFolderResult>;
    replaceFoundingAppointment(nation: NationId, appointment: bigint, newAuthority: Principal, appointmentLabel: string): Promise<SaveConstitutionResult>;
    reportComment(sessionId: VisitorSessionId, commentId: CommentId, reason: string | null): Promise<ReportCommentResult>;
    requestAssignment(title: string, description: string, srcToSpend: bigint, priority: AssignmentPriority): Promise<AssignmentId>;
    requestEmergencySuspension(nation: NationId, reason: string, affectedAccounts: Array<Principal>, affectedFunctions: Array<string>): Promise<SaveEmergencySuspensionResult>;
    requestExecution(proposal: GovernanceProposalId): Promise<SaveExecutionRequestResult>;
    requestIntroduction(target: CollaborationParty, message: string): Promise<RequestIntroductionResult>;
    respondToIntroduction(requestId: IntroductionRequestId, approve: boolean): Promise<RespondIntroductionResult>;
    restoreEmergencySuspension(nation: NationId, suspension: EmergencySuspensionId, note: string): Promise<RestoreEmergencySuspensionResult>;
    resumeLaunch(nation: NationId): Promise<ResumeLaunchResult>;
    reviewContribution(contributionId: ContributionId, decision: {
        __kind__: "reject";
        reject: null;
    } | {
        __kind__: "approve";
        approve: bigint;
    }, rationale: string): Promise<void>;
    reviewJoinRequest(nation: NationId, request: JoinRequestId, approve: boolean): Promise<ReviewJoinRequestResult>;
    reviewMemberDeparture(nation: NationId, departure: MemberDepartureId, reviewNote: string): Promise<SaveMemberDepartureResult>;
    revokeDelegation(): Promise<void>;
    revokeRole(nation: NationId, assignment: RoleAssignmentId): Promise<SaveRoleAssignmentResult>;
    revokeRoleDelegation(nation: NationId, delegation: RoleDelegationId): Promise<SaveRoleDelegationResult>;
    saveCollaborationProfile(profile: CollaborationProfile): Promise<SaveCollaborationProfileResult>;
    saveCommunityProfile(profile: CommunityProfile): Promise<SaveCommunityProfileResult>;
    saveConstitution(nation: NationId, templateKey: string, rules: GovernanceRuleSet): Promise<SaveConstitutionResult>;
    saveLeadNote(leadId: LeadId, note: string | null): Promise<UpdateLeadResult>;
    saveMembershipVotingConfig(nation: NationId, config: MembershipVotingConfig): Promise<SaveMembershipVotingResult>;
    saveNationTheme(nation: NationId, theme: NationTheme): Promise<SaveNationThemeResult>;
    savePrivacySettings(settings: PrivacySettings): Promise<SavePrivacySettingsResult>;
    saveRolePermissions(nation: NationId, entries: Array<RolePermissionEntry>): Promise<SavePrivacySettingsResult>;
    saveSuccessionPlan(nation: NationId, plan: SuccessionRecoveryPlan): Promise<SaveSuccessionPlanResult>;
    schema(): Promise<string>;
    searchDirectory(term: string, kind: DirectoryEntryKind | null): Promise<Array<DirectoryEntry>>;
    setExecutionPaused(nation: NationId, paused: boolean): Promise<SaveExecutionRequestResult>;
    setNetworkOptIn(nation: NationId, optIn: boolean): Promise<SetNetworkOptInResult>;
    setReviewerRole(user: Principal, isReviewer: boolean): Promise<void>;
    startChallenge(sessionId: VisitorSessionId): Promise<StartChallengeResult>;
    submitChallengeResponse(sessionId: VisitorSessionId, optionId: bigint, reasoning: string | null): Promise<SubmitChallengeResponseResult>;
    submitContribution(contributionType: ContributionType, notes: string, links: Array<string>): Promise<ContributionId>;
    submitDiscoverySubmission(community: CommunityId, body: string, category: string, visibility: SubmissionVisibility): Promise<SubmitDiscoveryResult>;
    submitEarlyAccessLead(name: string, email: string, organization: string | null, organizationType: OrganizationType | null, intendedDaoUseCase: string | null, consentToContact: boolean): Promise<SubmitLeadResult>;
    submitFoundingOrganizationLead(organization: string, contactName: string, email: string, intendedDeployment: string | null, prepaidInterest: boolean | null, budgetRange: string | null, consentToContact: boolean): Promise<SubmitLeadResult>;
    submitJoinRequest(nation: NationId, displayName: string, message: string): Promise<SubmitJoinRequestResult>;
    submitPublicComment(sessionId: VisitorSessionId, displayName: string | null, body: string): Promise<SubmitCommentResult>;
    submitStrategicFundingLead(contactName: string, organization: string | null, email: string, intendedSupport: FundingSupportType | null, budgetRange: string | null, consentToContact: boolean): Promise<SubmitLeadResult>;
    submitWaitlistEntry(name: string, email: string, organization: string | null, interestArea: WaitlistInterestArea | null): Promise<WaitlistSubmitResult>;
    unlockStake(id: StakingId): Promise<StakingRecord>;
    updateEmissionSchedule(initialEmission: bigint, halvingIntervalMonths: bigint): Promise<Result>;
    updateLeadStatus(leadId: LeadId, status: LeadStatus): Promise<UpdateLeadResult>;
    updateRoleCapabilities(nation: NationId, role: GovernanceRoleId, capabilities: Array<GovernanceCapability>): Promise<SaveRoleResult>;
    updateTokenomicsConfig(allocations: Array<TokenAllocation>): Promise<Result>;
    validateGovernanceRuleSet(rules: GovernanceRuleSet): Promise<GovernanceError | null>;
    withdrawDissolution(nation: NationId, dissolution: DissolutionId): Promise<SaveDissolutionResult>;
    withdrawJoinRequest(nation: NationId, request: JoinRequestId): Promise<ReviewJoinRequestResult>;
    withdrawMemberDeparture(nation: NationId, departure: MemberDepartureId): Promise<SaveMemberDepartureResult>;
}
