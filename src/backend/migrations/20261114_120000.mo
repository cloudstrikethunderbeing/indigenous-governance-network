import AccessControl "mo:caffeineai-authorization/access-control";
import Map "mo:core/Map";
import Set "mo:core/Set";

module {
  // Inlined stable-field types carried over from the preceding migration
  // (20261110_120000.mo). Migrations must be self-contained (no project
  // imports), so these mirror — but do not import from —
  // src/backend/types/common.mo and src/backend/types/discovery.mo.

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

  // OldActor mirrors the NewActor of the preceding migration
  // (20261110_120000.mo) — the previously deployed stable signature.
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
    };
  };

  // Inlined stable-field types for the Discovery state introduced in this
  // migration. Migrations must be self-contained (no project imports), so
  // these mirror — but do not import from —
  // src/backend/types/discovery.mo.

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
    // Discovery — Collective Intelligence & Collaboration Network.
    // Additive, starts empty.
    communityProfiles : Map.Map<Nat, CommunityProfile>;
    discoverySubmissions : Map.Map<Nat, DiscoverySubmission>;
    pipelineItems : Map.Map<Nat, PipelineItem>;
    pipelineInteractions : Map.Map<Nat, [PipelineInteraction]>;
    collaborationProfiles : Map.Map<Nat, CollaborationProfile>;
    introductionRequests : Map.Map<Nat, IntroductionRequest>;
    networkActivity : Map.Map<Nat, NetworkActivityEntry>;
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
      communityProfiles = Map.empty();
      discoverySubmissions = Map.empty();
      pipelineItems = Map.empty();
      pipelineInteractions = Map.empty();
      collaborationProfiles = Map.empty();
      introductionRequests = Map.empty();
      networkActivity = Map.empty();
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
        var nextCommunityId = 0;
        var nextSubmissionId = 0;
        var nextPipelineItemId = 0;
        var nextPipelineInteractionId = 0;
        var nextCollaborationProfileId = 0;
        var nextIntroductionRequestId = 0;
        var nextActivityEntryId = 0;
      };
    };
  };
};
