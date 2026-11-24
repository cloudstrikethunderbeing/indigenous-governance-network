import AccessControl "mo:caffeineai-authorization/access-control";
import Map "mo:core/Map";
import Set "mo:core/Set";

module {
  // Inlined stable-field types carried over from the preceding migration
  // (20261117_200000.mo). Migrations must be self-contained (no project
  // imports), so these mirror — but do not import from —
  // src/backend/types/common.mo, src/backend/types/discovery.mo and
  // src/backend/types/sovereign.mo.

  type SrcTransactionType = { #earn; #spend };
  type SrcReference = { #contribution : Nat; #assignment : Nat; #none };
  type SrcTransaction = {
    id : Nat;
    member : Principal;
    txType : SrcTransactionType;
    amount : Nat;
    reference : SrcReference;
    timestamp : Int;
  };

  type ContributionType = {
    #legalLegislativeResearch;
    #courtTreatyResearch;
    #undripAnalysis;
    #sourceVerificationCitationCorrection;
    #expertPeerReview;
    #acceptedChallengeOrCorrection;
  };
  type ContributionStatus = { #pending; #approved; #rejected };
  type Contribution = {
    id : Nat;
    contributor : Principal;
    contributionType : ContributionType;
    notes : Text;
    links : [Text];
    status : ContributionStatus;
    reviewer : ?Principal;
    rationale : ?Text;
    srcAwarded : ?Nat;
    timestamp : Int;
  };

  type AssignmentPriority = { #low; #medium; #high; #urgent };
  type AssignmentStatus = {
    #queuedAwaitingFunding;
    #queued;
    #inProgress;
    #completed;
  };
  type Assignment = {
    id : Nat;
    title : Text;
    description : Text;
    requestedBy : Principal;
    priority : AssignmentPriority;
    srcSpent : Nat;
    status : AssignmentStatus;
    timestamp : Int;
  };

  type TreasuryCategory = {
    #fundingReceived;
    #grantOrDonation;
    #institutionalResearchContract;
    #serviceRevenue;
    #aiApiSpend;
    #infrastructureOrStorageCost;
    #approvedResearchBounty;
    #otherOperatingCost;
  };
  type TreasuryDirection = { #income; #expense };
  type TreasuryTransaction = {
    id : Nat;
    category : TreasuryCategory;
    direction : TreasuryDirection;
    amount : Nat;
    description : Text;
    recordedBy : Principal;
    timestamp : Int;
  };

  type AllocationCategory = {
    #daoTreasuryEcosystemReserve;
    #communityAirdrop;
    #researchParticipationRewards;
    #governanceParticipationRewards;
    #stakingNeuronParticipation;
    #adminDeveloperAllocation;
  };
  type TokenAllocation = {
    category : AllocationCategory;
    percentage : Float;
    tokenAmount : Nat;
    vestingSchedule : Text;
    lockupPeriod : Text;
    releaseConditions : Text;
    treasuryOversight : Text;
  };
  type TokenomicsConfig = { maxSupply : Nat; allocations : [TokenAllocation] };

  type EmissionScheduleEntry = {
    periodIndex : Nat;
    startDate : Int;
    emission : Nat;
    cumulativeReleased : Nat;
    remainingSupply : Nat;
  };
  type EmissionScheduleConfig = {
    initialEmission : Nat;
    halvingIntervalMonths : Nat;
    maxSupply : Nat;
    schedule : [EmissionScheduleEntry];
  };

  type ProposalCategory = {
    #treasuryExpenditure;
    #researchPriority;
    #platformDevelopment;
    #technicalUpgrade;
    #grantsAndRewards;
    #governanceParameters;
  };
  type ProposalStatus = { #open; #closed; #passed; #rejected };
  type Proposal = {
    id : Nat;
    title : Text;
    description : Text;
    category : ProposalCategory;
    proposer : Principal;
    status : ProposalStatus;
    openTimestamp : Int;
    closeTimestamp : ?Int;
  };

  type VoteChoice = { #inFavor; #against; #abstain };
  type Vote = {
    proposalId : Nat;
    voter : Principal;
    choice : VoteChoice;
    timestamp : Int;
  };
  type VoteDelegation = {
    delegator : Principal;
    delegate : Principal;
    active : Bool;
    timestamp : Int;
  };

  type StakingStatus = { #active; #matured; #unlocked };
  type StakingRecord = {
    id : Nat;
    member : Principal;
    lockedAmount : Nat;
    lockTermSeconds : Nat;
    lockStart : Int;
    unlockTime : Int;
    maturityRateBps : Nat;
    status : StakingStatus;
  };

  type WaitlistInterestArea = {
    #indigenousLeadershipAndGovernance;
    #legalResearchAndPolicy;
    #aiAndTechnology;
    #digitalSovereigntyAndDataGovernance;
    #researchParticipation;
    #daoAndEcosystemDevelopment;
    #fundingAndStrategicPartnerships;
  };
  type WaitlistEntry = {
    id : Nat;
    name : Text;
    email : Text;
    organization : ?Text;
    interestArea : ?WaitlistInterestArea;
    timestamp : Int;
  };

  type ChallengeOption = { optionId : Nat; labelText : Text };
  type WeeklyChallenge = {
    weekKey : Text;
    question : Text;
    options : [ChallengeOption];
    updatedAt : Int;
  };

  type ChallengeImpression = {
    id : Nat;
    sessionId : Text;
    participant : ?Principal;
    weekKey : Text;
    timestamp : Int;
  };

  type ChallengeStart = {
    id : Nat;
    sessionId : Text;
    participant : ?Principal;
    weekKey : Text;
    timestamp : Int;
  };

  type ChallengeResponse = {
    id : Nat;
    sessionId : Text;
    participant : ?Principal;
    weekKey : Text;
    optionId : Nat;
    reasoning : ?Text;
    timestamp : Int;
  };

  type CommentModerationStatus = { #visible; #hidden; #removed };
  type PublicComment = {
    id : Nat;
    sessionId : Text;
    participant : ?Principal;
    displayName : ?Text;
    body : Text;
    moderationStatus : CommentModerationStatus;
    reported : Bool;
    timestamp : Int;
  };

  type CommentReport = {
    id : Nat;
    commentId : Nat;
    sessionId : Text;
    reason : ?Text;
    timestamp : Int;
  };

  type LeadStatus = {
    #new;
    #contacted;
    #interested;
    #foundingOrganizationProspect;
    #strategicPartner;
    #converted;
    #notProceeding;
  };
  type LeadPathway = {
    #freeEarlyAccess;
    #foundingOrganization;
    #strategicFundingPartner;
  };
  type OrganizationType = {
    #indigenousNationOrCommunity;
    #nonProfitOrCharity;
    #cooperative;
    #smallBusiness;
    #enterprise;
    #governmentOrPublicSector;
    #educationalInstitution;
    #other;
  };
  type FundingSupportType = {
    #grantOrPhilanthropy;
    #strategicPartnership;
    #sponsorship;
    #investmentInterest;
    #other;
  };
  type Lead = {
    id : Nat;
    pathway : LeadPathway;
    name : Text;
    email : Text;
    organization : ?Text;
    organizationType : ?OrganizationType;
    intendedDaoUseCase : ?Text;
    intendedDeployment : ?Text;
    prepaidInterest : ?Bool;
    budgetRange : ?Text;
    intendedSupport : ?FundingSupportType;
    consentToContact : Bool;
    status : LeadStatus;
    adminNote : ?Text;
    timestamp : Int;
  };

  type CommunityVisibility = { #publicVisible; #privateVisible };
  type CommunityProfile = {
    id : Nat;
    owner : Principal;
    name : Text;
    description : Text;
    region : Text;
    objectives : [Text];
    skills : [Text];
    interests : [Text];
    projectNeeds : [Text];
    partnershipOpportunities : [Text];
    discoveryOptIn : Bool;
    visibility : CommunityVisibility;
    timestamp : Int;
  };

  type SubmissionClassification = {
    #idea;
    #feedback;
    #need;
    #opportunity;
    #potentialProposal;
  };
  type SubmissionVisibility = { #publicVisible; #communityOnly };
  type DiscoverySubmission = {
    id : Nat;
    author : Principal;
    community : Nat;
    body : Text;
    classification : SubmissionClassification;
    category : Text;
    interestTags : [Text];
    visibility : SubmissionVisibility;
    timestamp : Int;
  };

  type PipelineStage = {
    #idea;
    #communityFeedback;
    #collaboration;
    #draftProposal;
    #governanceVote;
    #approvedAction;
    #results;
  };
  type PipelineItem = {
    id : Nat;
    community : Nat;
    submissionId : Nat;
    title : Text;
    stage : PipelineStage;
    proposalId : ?Nat;
    timestamp : Int;
  };

  type PipelineInteractionKind = { #comment; #support; #improvement };
  type PipelineInteraction = {
    id : Nat;
    pipelineItemId : Nat;
    author : Principal;
    kind : PipelineInteractionKind;
    body : Text;
    timestamp : Int;
  };

  type CollaborationParty = { #member : Principal; #community : Nat };
  type CollaborationProfile = {
    id : Nat;
    party : CollaborationParty;
    displayName : Text;
    skills : [Text];
    interests : [Text];
    needs : [Text];
    partnershipOpportunities : [Text];
    discoveryOptIn : Bool;
    timestamp : Int;
  };

  type IntroductionStatus = { #pending; #approved; #declined };
  type IntroductionRequest = {
    id : Nat;
    requester : CollaborationParty;
    target : CollaborationParty;
    message : Text;
    requesterApproved : Bool;
    targetApproved : Bool;
    status : IntroductionStatus;
    timestamp : Int;
  };

  type ActivityKind = {
    #publicIdea;
    #proposal;
    #partnership;
    #communityMilestone;
  };
  type NetworkActivityEntry = {
    id : Nat;
    kind : ActivityKind;
    community : Nat;
    summary : Text;
    timestamp : Int;
  };

  // SOVEREIGN OS — Nation workspace types carried over from the preceding
  // migration (20261117_200000.mo).

  type PrivacyLevel = {
    #privateToMembers;
    #openToCollaboration;
    #publiclyVisible;
  };
  type Nation = {
    id : Nat;
    name : Text;
    shortDescription : Text;
    region : Text;
    governanceModel : Text;
    privacyLevel : PrivacyLevel;
    isSample : Bool;
    openToCollaboration : Bool;
    timestamp : Int;
  };

  type Workspace = {
    id : Nat;
    nation : Nat;
    name : Text;
    description : Text;
    timestamp : Int;
  };

  type WorkspaceAppStatus = { #working; #preview };
  type WorkspaceApp = {
    id : Nat;
    workspace : Nat;
    appKey : Text;
    displayName : Text;
    oneLineDescription : Text;
    status : WorkspaceAppStatus;
    iconKey : Text;
    order : Nat;
  };

  type NationProposalStatus = {
    #draft;
    #open;
    #passed;
    #rejected;
    #withdrawn;
  };
  type NationProposal = {
    id : Nat;
    nation : Nat;
    title : Text;
    summary : Text;
    status : NationProposalStatus;
    votesInFavor : Nat;
    votesAgainst : Nat;
    votesAbstain : Nat;
    timestamp : Int;
  };

  type DiscussionThread = {
    id : Nat;
    nation : Nat;
    title : Text;
    author : Principal;
    timestamp : Int;
  };

  type DiscussionPost = {
    id : Nat;
    thread : Nat;
    author : Principal;
    body : Text;
    timestamp : Int;
  };

  type NationMember = {
    id : Nat;
    nation : Nat;
    member : Principal;
    displayName : Text;
    roleLabel : Text;
    permissionLabels : [Text];
    timestamp : Int;
  };

  type NationDocument = {
    id : Nat;
    nation : Nat;
    title : Text;
    body : Text;
    author : Principal;
    timestamp : Int;
  };

  type CalendarEvent = {
    id : Nat;
    nation : Nat;
    title : Text;
    description : Text;
    startTime : Int;
    endTime : Int;
    location : Text;
    timestamp : Int;
  };

  type NationTreasuryDirection = { #income; #expense };
  type NationTreasuryTransaction = {
    id : Nat;
    nation : Nat;
    direction : NationTreasuryDirection;
    category : Text;
    amount : Nat;
    description : Text;
    timestamp : Int;
  };

  type GovernanceModelOption = {
    modelKey : Text;
    labelText : Text;
    description : Text;
  };

  type RolePermissionEntry = {
    roleLabel : Text;
    capability : Text;
    allowed : Bool;
  };

  type PrivacySettings = {
    nation : Nat;
    proposalsVisible : Bool;
    discussionsVisible : Bool;
    documentsVisible : Bool;
    calendarVisible : Bool;
    treasuryVisible : Bool;
    timestamp : Int;
  };

  type NetworkNationProfile = {
    nation : Nat;
    name : Text;
    shortDescription : Text;
    region : Text;
    collaborationInterests : [Text];
    networkOptIn : Bool;
    timestamp : Int;
  };

  type NationTheme = {
    themeKey : Text;
    wallpaperKey : Text;
    blurEnabled : Bool;
  };

  type MembershipVotingConfig = {
    membershipModel : Text;
    votingModel : Text;
    quorumPercent : Nat;
    approvalThresholdPercent : Nat;
  };

  type NationOwnership = {
    nation : Nat;
    creator : Principal;
    timestamp : Int;
  };

  type NationFolder = {
    id : Nat;
    nation : Nat;
    parent : ?Nat;
    name : Text;
    createdBy : Principal;
    timestamp : Int;
  };

  type NationFile = {
    id : Nat;
    nation : Nat;
    folder : ?Nat;
    name : Text;
    size : Nat;
    contentType : Text;
    uploadedBy : Principal;
    content : Blob;
    timestamp : Int;
  };

  type FileAttachmentTarget = {
    #proposal : Nat;
    #discussionPost : Nat;
    #project : Nat;
    #calendarEvent : Nat;
    #document : Nat;
  };

  type FileAttachment = {
    id : Nat;
    nation : Nat;
    file : Nat;
    target : FileAttachmentTarget;
    attachedBy : Principal;
    timestamp : Int;
  };

  // ---------------------------------------------------------------------
  // DAO Constitution & Governance state introduced in this migration.
  // Additive, starts empty. Migrations must be self-contained (no project
  // imports), so these mirror — but do not import from —
  // src/backend/types/sovereign.mo.
  // ---------------------------------------------------------------------

  type FoundingSetupStatus = {
    #foundingSetup;
    #activated;
    #expired;
    #cancelled;
  };

  type FoundingAppointmentStatus = {
    #pending;
    #accepted;
    #declined;
    #expired;
    #replaced;
  };

  type FoundingAppointment = {
    id : Nat;
    nation : Nat;
    authority : Principal;
    appointmentLabel : Text;
    status : FoundingAppointmentStatus;
    expiresAt : Int;
    timestamp : Int;
  };

  type FoundingSetup = {
    nation : Nat;
    status : FoundingSetupStatus;
    foundingAuthority : Principal;
    setupExpiresAt : Int;
    activatedConstitutionVersion : ?Nat;
    timestamp : Int;
  };

  type GovernanceRuleSet = {
    foundingAuthorityProcedure : Text;
    membershipEligibility : Text;
    identityVerification : Text;
    membershipApprovalThresholdPercent : Nat;
    loginRequirement : Text;
    participationRequirement : Text;
    votingEligibility : Text;
    newMemberWaitingPeriodDays : Nat;
    votingMethod : Text;
    delegationAllowed : Bool;
    votingWeight : Text;
    proposalSubmissionPeriodDays : Nat;
    proposalReviewPeriodDays : Nat;
    proposalDiscussionPeriodDays : Nat;
    quorumPercent : Nat;
    approvalThresholdPercent : Nat;
    abstentionsCount : Bool;
    tieBreakRule : Text;
    proposalClassifications : [Text];
    approvalOutcomes : [Text];
    treasurySpendLimit : Nat;
    treasuryAuthorization : Text;
    leadershipElectionProcedure : Text;
    leadershipTermDays : Nat;
    leadershipRemovalProcedure : Text;
    documentAccess : Text;
    confidentialityRule : Text;
    aiPermissions : Text;
    humanOversight : Text;
    appealsProcedure : Text;
    disputeProcedure : Text;
    evidenceReviewProcedure : Text;
    emergencyPauseProcedure : Text;
    governanceRecoveryProcedure : Text;
    amendmentProcedure : Text;
    collaborationDataSharing : Text;
    dissolutionProcedure : Text;
    dataExportProcedure : Text;
  };

  type Constitution = {
    id : Nat;
    nation : Nat;
    version : Nat;
    rules : GovernanceRuleSet;
    templateKey : Text;
    confirmedBy : Principal;
    active : Bool;
    timestamp : Int;
  };

  type Amendment = {
    id : Nat;
    nation : Nat;
    resultingVersion : Nat;
    previousVersion : Nat;
    summary : Text;
    previousRules : GovernanceRuleSet;
    newRules : GovernanceRuleSet;
    authorizedBy : Principal;
    timestamp : Int;
  };

  type GovernanceRoleKind = {
    #foundingAuthority;
    #membershipAuthority;
    #member;
    #governanceDelegate;
    #proposalSteward;
    #executionAuthority;
    #treasurySteward;
    #documentSteward;
    #auditor;
    #observer;
    #custom : Nat;
  };

  type GovernanceCapability = {
    #view;
    #propose;
    #approve;
    #vote;
    #modify;
    #execute;
  };

  type GovernanceRole = {
    id : Nat;
    nation : Nat;
    kind : GovernanceRoleKind;
    roleName : Text;
    description : Text;
    capabilities : [GovernanceCapability];
    isCustom : Bool;
    timestamp : Int;
  };

  type RoleAssignment = {
    id : Nat;
    nation : Nat;
    member : Principal;
    role : Nat;
    grantedBy : Principal;
    timestamp : Int;
  };

  type RoleDelegation = {
    id : Nat;
    nation : Nat;
    delegator : Principal;
    delegate : Principal;
    role : Nat;
    capabilities : [GovernanceCapability];
    expiresAt : Int;
    active : Bool;
    timestamp : Int;
  };

  type GovernanceProposalStatus = {
    #draft;
    #review;
    #discussion;
    #voting;
    #passed;
    #rejected;
    #withdrawn;
  };

  type ProposalOutcome = {
    #approved;
    #rejected;
    #noQuorum;
    #tied;
  };

  type GovernanceProposal = {
    id : Nat;
    nation : Nat;
    title : Text;
    summary : Text;
    classification : Text;
    status : GovernanceProposalStatus;
    proposer : Principal;
    constitutionVersion : Nat;
    reviewPeriodDays : Nat;
    discussionPeriodDays : Nat;
    quorumPercent : Nat;
    approvalThresholdPercent : Nat;
    abstentionsCount : Bool;
    tieBreakRule : Text;
    votesInFavor : Nat;
    votesAgainst : Nat;
    votesAbstain : Nat;
    outcome : ?ProposalOutcome;
    timestamp : Int;
  };

  type GovernanceVote = {
    proposal : Nat;
    nation : Nat;
    voter : Principal;
    choice : VoteChoice;
    confidential : Bool;
    timestamp : Int;
  };

  type ExecutionStatus = {
    #pendingAuthorization;
    #timelocked;
    #executed;
    #cancelled;
    #paused;
    #rejected;
  };

  type ExecutionRequest = {
    id : Nat;
    nation : Nat;
    proposal : Nat;
    status : ExecutionStatus;
    requestedBy : Principal;
    authorizedBy : ?Principal;
    highRisk : Bool;
    timelockUntil : ?Int;
    cancelledBy : ?Principal;
    constitutionVersion : Nat;
    timestamp : Int;
  };

  type ExecutionAuditEntry = {
    id : Nat;
    nation : Nat;
    request : Nat;
    action : Text;
    actorPrincipal : Principal;
    note : Text;
    timestamp : Int;
  };

  type AppealKind = {
    #membershipRejection;
    #inactivity;
    #governanceDecision;
  };

  type AppealStatus = {
    #submitted;
    #underReview;
    #upheld;
    #denied;
    #withdrawn;
  };

  type AppealEvidence = {
    evidenceLabel : Text;
    detail : Text;
    submittedBy : Principal;
    timestamp : Int;
  };

  type AppealRecusal = {
    reviewer : Principal;
    reason : Text;
    timestamp : Int;
  };

  type Appeal = {
    id : Nat;
    nation : Nat;
    kind : AppealKind;
    status : AppealStatus;
    appellant : Principal;
    subjectId : Nat;
    summary : Text;
    evidence : [AppealEvidence];
    recusals : [AppealRecusal];
    decidedBy : ?Principal;
    decisionNote : ?Text;
    timestamp : Int;
  };

  type CensusEventKind = {
    #membershipApproval;
    #activity;
    #proposal;
    #vote;
    #delegation;
    #permissionChange;
    #dispute;
    #executionOutcome;
  };

  type CensusEntry = {
    id : Nat;
    nation : Nat;
    kind : CensusEventKind;
    subject : Principal;
    referenceId : Nat;
    summary : Text;
    confidential : Bool;
    constitutionVersion : Nat;
    timestamp : Int;
  };

  // OldActor mirrors the NewActor of the preceding migration
  // (20261117_200000.mo) — the previously deployed stable signature.
  public type OldActor = {
    accessControlState : AccessControl.AccessControlState;
    reviewers : Set.Set<Principal>;
    srcBalances : Map.Map<Principal, Nat>;
    srcTransactions : Map.Map<Nat, SrcTransaction>;
    contributions : Map.Map<Nat, Contribution>;
    assignments : Map.Map<Nat, Assignment>;
    treasuryTransactions : Map.Map<Nat, TreasuryTransaction>;
    tokenomicsConfigState : { var config : TokenomicsConfig };
    emissionScheduleState : { var config : EmissionScheduleConfig };
    proposals : Map.Map<Nat, Proposal>;
    votes : Map.Map<Nat, Map.Map<Principal, Vote>>;
    delegations : Map.Map<Principal, VoteDelegation>;
    stakingRecords : Map.Map<Nat, StakingRecord>;
    waitlistEntries : Map.Map<Nat, WaitlistEntry>;
    challengeImpressions : Map.Map<Nat, ChallengeImpression>;
    challengeStarts : Map.Map<Nat, ChallengeStart>;
    challengeResponses : Map.Map<Nat, ChallengeResponse>;
    publicComments : Map.Map<Nat, PublicComment>;
    commentReports : Map.Map<Nat, CommentReport>;
    weeklyChallengeState : { var challenge : ?WeeklyChallenge };
    leads : Map.Map<Nat, Lead>;
    communityProfiles : Map.Map<Nat, CommunityProfile>;
    discoverySubmissions : Map.Map<Nat, DiscoverySubmission>;
    pipelineItems : Map.Map<Nat, PipelineItem>;
    pipelineInteractions : Map.Map<Nat, [PipelineInteraction]>;
    collaborationProfiles : Map.Map<Nat, CollaborationProfile>;
    introductionRequests : Map.Map<Nat, IntroductionRequest>;
    networkActivity : Map.Map<Nat, NetworkActivityEntry>;
    nations : Map.Map<Nat, Nation>;
    workspaces : Map.Map<Nat, Workspace>;
    workspaceApps : Map.Map<Nat, WorkspaceApp>;
    nationProposals : Map.Map<Nat, NationProposal>;
    discussionThreads : Map.Map<Nat, DiscussionThread>;
    discussionPosts : Map.Map<Nat, DiscussionPost>;
    nationMembers : Map.Map<Nat, NationMember>;
    nationDocuments : Map.Map<Nat, NationDocument>;
    calendarEvents : Map.Map<Nat, CalendarEvent>;
    nationTreasuryTransactions : Map.Map<Nat, NationTreasuryTransaction>;
    privacySettings : Map.Map<Nat, PrivacySettings>;
    networkNationProfiles : Map.Map<Nat, NetworkNationProfile>;
    nationOwners : Map.Map<Nat, NationOwnership>;
    nationThemes : Map.Map<Nat, NationTheme>;
    nationMembershipVoting : Map.Map<Nat, MembershipVotingConfig>;
    nationFolders : Map.Map<Nat, NationFolder>;
    nationFiles : Map.Map<Nat, NationFile>;
    fileAttachments : Map.Map<Nat, FileAttachment>;
    counters : {
      var nextSrcTransactionId : Nat;
      var nextContributionId : Nat;
      var nextAssignmentId : Nat;
      var nextTreasuryTransactionId : Nat;
      var nextProposalId : Nat;
      var nextStakingId : Nat;
      var nextWaitlistEntryId : Nat;
      var nextChallengeImpressionId : Nat;
      var nextChallengeStartId : Nat;
      var nextChallengeResponseId : Nat;
      var nextCommentId : Nat;
      var nextCommentReportId : Nat;
      var nextLeadId : Nat;
      var nextCommunityId : Nat;
      var nextSubmissionId : Nat;
      var nextPipelineItemId : Nat;
      var nextPipelineInteractionId : Nat;
      var nextCollaborationProfileId : Nat;
      var nextIntroductionRequestId : Nat;
      var nextActivityEntryId : Nat;
      var nextNationId : Nat;
      var nextWorkspaceId : Nat;
      var nextWorkspaceAppId : Nat;
      var nextNationProposalId : Nat;
      var nextDiscussionThreadId : Nat;
      var nextDiscussionPostId : Nat;
      var nextNationMemberId : Nat;
      var nextNationDocumentId : Nat;
      var nextCalendarEventId : Nat;
      var nextNationTreasuryTransactionId : Nat;
      var nextNationFolderId : Nat;
      var nextNationFileId : Nat;
      var nextFileAttachmentId : Nat;
    };
  };

  public type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    reviewers : Set.Set<Principal>;
    srcBalances : Map.Map<Principal, Nat>;
    srcTransactions : Map.Map<Nat, SrcTransaction>;
    contributions : Map.Map<Nat, Contribution>;
    assignments : Map.Map<Nat, Assignment>;
    treasuryTransactions : Map.Map<Nat, TreasuryTransaction>;
    tokenomicsConfigState : { var config : TokenomicsConfig };
    emissionScheduleState : { var config : EmissionScheduleConfig };
    proposals : Map.Map<Nat, Proposal>;
    votes : Map.Map<Nat, Map.Map<Principal, Vote>>;
    delegations : Map.Map<Principal, VoteDelegation>;
    stakingRecords : Map.Map<Nat, StakingRecord>;
    waitlistEntries : Map.Map<Nat, WaitlistEntry>;
    challengeImpressions : Map.Map<Nat, ChallengeImpression>;
    challengeStarts : Map.Map<Nat, ChallengeStart>;
    challengeResponses : Map.Map<Nat, ChallengeResponse>;
    publicComments : Map.Map<Nat, PublicComment>;
    commentReports : Map.Map<Nat, CommentReport>;
    weeklyChallengeState : { var challenge : ?WeeklyChallenge };
    leads : Map.Map<Nat, Lead>;
    communityProfiles : Map.Map<Nat, CommunityProfile>;
    discoverySubmissions : Map.Map<Nat, DiscoverySubmission>;
    pipelineItems : Map.Map<Nat, PipelineItem>;
    pipelineInteractions : Map.Map<Nat, [PipelineInteraction]>;
    collaborationProfiles : Map.Map<Nat, CollaborationProfile>;
    introductionRequests : Map.Map<Nat, IntroductionRequest>;
    networkActivity : Map.Map<Nat, NetworkActivityEntry>;
    nations : Map.Map<Nat, Nation>;
    workspaces : Map.Map<Nat, Workspace>;
    workspaceApps : Map.Map<Nat, WorkspaceApp>;
    nationProposals : Map.Map<Nat, NationProposal>;
    discussionThreads : Map.Map<Nat, DiscussionThread>;
    discussionPosts : Map.Map<Nat, DiscussionPost>;
    nationMembers : Map.Map<Nat, NationMember>;
    nationDocuments : Map.Map<Nat, NationDocument>;
    calendarEvents : Map.Map<Nat, CalendarEvent>;
    nationTreasuryTransactions : Map.Map<Nat, NationTreasuryTransaction>;
    privacySettings : Map.Map<Nat, PrivacySettings>;
    networkNationProfiles : Map.Map<Nat, NetworkNationProfile>;
    nationOwners : Map.Map<Nat, NationOwnership>;
    nationThemes : Map.Map<Nat, NationTheme>;
    nationMembershipVoting : Map.Map<Nat, MembershipVotingConfig>;
    nationFolders : Map.Map<Nat, NationFolder>;
    nationFiles : Map.Map<Nat, NationFile>;
    fileAttachments : Map.Map<Nat, FileAttachment>;
    // DAO Constitution & Governance state. Additive, starts empty.
    foundingSetups : Map.Map<Nat, FoundingSetup>;
    foundingAppointments : Map.Map<Nat, FoundingAppointment>;
    constitutions : Map.Map<Nat, Constitution>;
    amendments : Map.Map<Nat, Amendment>;
    governanceRoles : Map.Map<Nat, GovernanceRole>;
    roleAssignments : Map.Map<Nat, RoleAssignment>;
    roleDelegations : Map.Map<Nat, RoleDelegation>;
    governanceProposals : Map.Map<Nat, GovernanceProposal>;
    governanceVotes : Map.Map<Nat, GovernanceVote>;
    executionRequests : Map.Map<Nat, ExecutionRequest>;
    executionAudit : Map.Map<Nat, ExecutionAuditEntry>;
    appeals : Map.Map<Nat, Appeal>;
    censusEntries : Map.Map<Nat, CensusEntry>;
    counters : {
      var nextSrcTransactionId : Nat;
      var nextContributionId : Nat;
      var nextAssignmentId : Nat;
      var nextTreasuryTransactionId : Nat;
      var nextProposalId : Nat;
      var nextStakingId : Nat;
      var nextWaitlistEntryId : Nat;
      var nextChallengeImpressionId : Nat;
      var nextChallengeStartId : Nat;
      var nextChallengeResponseId : Nat;
      var nextCommentId : Nat;
      var nextCommentReportId : Nat;
      var nextLeadId : Nat;
      var nextCommunityId : Nat;
      var nextSubmissionId : Nat;
      var nextPipelineItemId : Nat;
      var nextPipelineInteractionId : Nat;
      var nextCollaborationProfileId : Nat;
      var nextIntroductionRequestId : Nat;
      var nextActivityEntryId : Nat;
      var nextNationId : Nat;
      var nextWorkspaceId : Nat;
      var nextWorkspaceAppId : Nat;
      var nextNationProposalId : Nat;
      var nextDiscussionThreadId : Nat;
      var nextDiscussionPostId : Nat;
      var nextNationMemberId : Nat;
      var nextNationDocumentId : Nat;
      var nextCalendarEventId : Nat;
      var nextNationTreasuryTransactionId : Nat;
      var nextNationFolderId : Nat;
      var nextNationFileId : Nat;
      var nextFileAttachmentId : Nat;
      var nextConstitutionId : Nat;
      var nextAmendmentId : Nat;
      var nextGovernanceRoleId : Nat;
      var nextRoleAssignmentId : Nat;
      var nextRoleDelegationId : Nat;
      var nextGovernanceProposalId : Nat;
      var nextExecutionRequestId : Nat;
      var nextExecutionAuditId : Nat;
      var nextAppealId : Nat;
      var nextCensusEntryId : Nat;
      var nextFoundingAppointmentId : Nat;
    };
  };

  public func migration(old : OldActor) : NewActor {
    {
      accessControlState = old.accessControlState;
      reviewers = old.reviewers;
      srcBalances = old.srcBalances;
      srcTransactions = old.srcTransactions;
      contributions = old.contributions;
      assignments = old.assignments;
      treasuryTransactions = old.treasuryTransactions;
      tokenomicsConfigState = old.tokenomicsConfigState;
      emissionScheduleState = old.emissionScheduleState;
      proposals = old.proposals;
      votes = old.votes;
      delegations = old.delegations;
      stakingRecords = old.stakingRecords;
      waitlistEntries = old.waitlistEntries;
      challengeImpressions = old.challengeImpressions;
      challengeStarts = old.challengeStarts;
      challengeResponses = old.challengeResponses;
      publicComments = old.publicComments;
      commentReports = old.commentReports;
      weeklyChallengeState = old.weeklyChallengeState;
      leads = old.leads;
      communityProfiles = old.communityProfiles;
      discoverySubmissions = old.discoverySubmissions;
      pipelineItems = old.pipelineItems;
      pipelineInteractions = old.pipelineInteractions;
      collaborationProfiles = old.collaborationProfiles;
      introductionRequests = old.introductionRequests;
      networkActivity = old.networkActivity;
      nations = old.nations;
      workspaces = old.workspaces;
      workspaceApps = old.workspaceApps;
      nationProposals = old.nationProposals;
      discussionThreads = old.discussionThreads;
      discussionPosts = old.discussionPosts;
      nationMembers = old.nationMembers;
      nationDocuments = old.nationDocuments;
      calendarEvents = old.calendarEvents;
      nationTreasuryTransactions = old.nationTreasuryTransactions;
      privacySettings = old.privacySettings;
      networkNationProfiles = old.networkNationProfiles;
      nationOwners = old.nationOwners;
      nationThemes = old.nationThemes;
      nationMembershipVoting = old.nationMembershipVoting;
      nationFolders = old.nationFolders;
      nationFiles = old.nationFiles;
      fileAttachments = old.fileAttachments;
      foundingSetups = Map.empty();
      foundingAppointments = Map.empty();
      constitutions = Map.empty();
      amendments = Map.empty();
      governanceRoles = Map.empty();
      roleAssignments = Map.empty();
      roleDelegations = Map.empty();
      governanceProposals = Map.empty();
      governanceVotes = Map.empty();
      executionRequests = Map.empty();
      executionAudit = Map.empty();
      appeals = Map.empty();
      censusEntries = Map.empty();
      counters = {
        var nextSrcTransactionId = old.counters.nextSrcTransactionId;
        var nextContributionId = old.counters.nextContributionId;
        var nextAssignmentId = old.counters.nextAssignmentId;
        var nextTreasuryTransactionId = old.counters.nextTreasuryTransactionId;
        var nextProposalId = old.counters.nextProposalId;
        var nextStakingId = old.counters.nextStakingId;
        var nextWaitlistEntryId = old.counters.nextWaitlistEntryId;
        var nextChallengeImpressionId = old.counters.nextChallengeImpressionId;
        var nextChallengeStartId = old.counters.nextChallengeStartId;
        var nextChallengeResponseId = old.counters.nextChallengeResponseId;
        var nextCommentId = old.counters.nextCommentId;
        var nextCommentReportId = old.counters.nextCommentReportId;
        var nextLeadId = old.counters.nextLeadId;
        var nextCommunityId = old.counters.nextCommunityId;
        var nextSubmissionId = old.counters.nextSubmissionId;
        var nextPipelineItemId = old.counters.nextPipelineItemId;
        var nextPipelineInteractionId = old.counters.nextPipelineInteractionId;
        var nextCollaborationProfileId = old.counters.nextCollaborationProfileId;
        var nextIntroductionRequestId = old.counters.nextIntroductionRequestId;
        var nextActivityEntryId = old.counters.nextActivityEntryId;
        var nextNationId = old.counters.nextNationId;
        var nextWorkspaceId = old.counters.nextWorkspaceId;
        var nextWorkspaceAppId = old.counters.nextWorkspaceAppId;
        var nextNationProposalId = old.counters.nextNationProposalId;
        var nextDiscussionThreadId = old.counters.nextDiscussionThreadId;
        var nextDiscussionPostId = old.counters.nextDiscussionPostId;
        var nextNationMemberId = old.counters.nextNationMemberId;
        var nextNationDocumentId = old.counters.nextNationDocumentId;
        var nextCalendarEventId = old.counters.nextCalendarEventId;
        var nextNationTreasuryTransactionId = old.counters.nextNationTreasuryTransactionId;
        var nextNationFolderId = old.counters.nextNationFolderId;
        var nextNationFileId = old.counters.nextNationFileId;
        var nextFileAttachmentId = old.counters.nextFileAttachmentId;
        var nextConstitutionId = 0;
        var nextAmendmentId = 0;
        var nextGovernanceRoleId = 0;
        var nextRoleAssignmentId = 0;
        var nextRoleDelegationId = 0;
        var nextGovernanceProposalId = 0;
        var nextExecutionRequestId = 0;
        var nextExecutionAuditId = 0;
        var nextAppealId = 0;
        var nextCensusEntryId = 0;
        var nextFoundingAppointmentId = 0;
      };
    };
  };
};
