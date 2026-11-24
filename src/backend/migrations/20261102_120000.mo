import AccessControl "mo:caffeineai-authorization/access-control";
import Map "mo:core/Map";
import Set "mo:core/Set";

module {
  // OldActor mirrors the NewActor of the preceding migration
  // (20261102_001304.mo) — the previously deployed stable signature.
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
    counters : {
      var nextSrcTransactionId : Nat;
      var nextContributionId : Nat;
      var nextAssignmentId : Nat;
      var nextTreasuryTransactionId : Nat;
      var nextProposalId : Nat;
      var nextStakingId : Nat;
    };
  };

  // Inlined stable-field types for the new state introduced in this
  // migration. Migrations must be self-contained (no project imports), so
  // these mirror — but do not import from — src/backend/types/common.mo.

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
    counters : {
      var nextSrcTransactionId : Nat;
      var nextContributionId : Nat;
      var nextAssignmentId : Nat;
      var nextTreasuryTransactionId : Nat;
      var nextProposalId : Nat;
      var nextStakingId : Nat;
      var nextWaitlistEntryId : Nat;
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
      waitlistEntries = Map.empty();
      counters = {
        var nextSrcTransactionId = old.counters.nextSrcTransactionId;
        var nextContributionId = old.counters.nextContributionId;
        var nextAssignmentId = old.counters.nextAssignmentId;
        var nextTreasuryTransactionId = old.counters.nextTreasuryTransactionId;
        var nextProposalId = old.counters.nextProposalId;
        var nextStakingId = old.counters.nextStakingId;
        var nextWaitlistEntryId = 0;
      };
    };
  };
};
