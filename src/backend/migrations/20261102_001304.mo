import AccessControl "mo:caffeineai-authorization/access-control";
import Map "mo:core/Map";
import Set "mo:core/Set";

module {
  public type OldActor = { accessControlState : AccessControl.AccessControlState };

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
    counters : {
      var nextSrcTransactionId : Nat;
      var nextContributionId : Nat;
      var nextAssignmentId : Nat;
      var nextTreasuryTransactionId : Nat;
      var nextProposalId : Nat;
      var nextStakingId : Nat;
    };
  };

  public func migration(old : OldActor) : NewActor {
    {
      accessControlState = old.accessControlState;
      reviewers = Set.empty();
      srcBalances = Map.empty();
      srcTransactions = Map.empty();
      contributions = Map.empty();
      assignments = Map.empty();
      treasuryTransactions = Map.empty();
      tokenomicsConfigState = {
        var config = {
          maxSupply = 21_000_000;
          allocations = [
            {
              category = #daoTreasuryEcosystemReserve;
              percentage = 30.0;
              tokenAmount = 6_300_000;
              vestingSchedule = "Released to DAO treasury control over 4 years; no individual beneficiary vesting.";
              lockupPeriod = "Immediate availability under DAO/multisig control; no personal lockup.";
              releaseConditions = "Spendable only via passed DAO treasury-expenditure proposals.";
              treasuryOversight = "Full public treasury ledger; every expenditure requires a passed proposal.";
            },
            {
              category = #communityAirdrop;
              percentage = 10.0;
              tokenAmount = 2_100_000;
              vestingSchedule = "No vesting; distributed in eligibility snapshots, proposed not executed.";
              lockupPeriod = "None beyond standard anti-sybil eligibility windows.";
              releaseConditions = "Eligibility criteria set by DAO governance prior to any real distribution.";
              treasuryOversight = "Snapshot criteria and recipient lists published for public audit.";
            },
            {
              category = #researchParticipationRewards;
              percentage = 20.0;
              tokenAmount = 4_200_000;
              vestingSchedule = "Emitted gradually per the four-month halving schedule, not granted upfront.";
              lockupPeriod = "None; reflects already-completed, reviewer-approved contributions.";
              releaseConditions = "Tied to verified, reviewer-approved research contributions (SRC-linked).";
              treasuryOversight = "Every reward traceable to an approved contribution record.";
            },
            {
              category = #governanceParticipationRewards;
              percentage = 10.0;
              tokenAmount = 2_100_000;
              vestingSchedule = "Emitted gradually per the four-month halving schedule.";
              lockupPeriod = "None beyond the voting/delegation activity that earns them.";
              releaseConditions = "Tied to recorded voting or delegation participation.";
              treasuryOversight = "Participation records are public and auditable.";
            },
            {
              category = #stakingNeuronParticipation;
              percentage = 20.0;
              tokenAmount = 4_200_000;
              vestingSchedule = "Emitted gradually per the four-month halving schedule as maturity accrues.";
              lockupPeriod = "Matches each staker's voluntarily chosen lock term; user-controlled.";
              releaseConditions = "Accrues only while voluntarily locked; never custodied by the DAO.";
              treasuryOversight = "Staking and maturity records are public and auditable.";
            },
            {
              category = #adminDeveloperAllocation;
              percentage = 10.0;
              tokenAmount = 2_100_000;
              vestingSchedule = "Linear vesting over 4 years with a 1-year cliff, publicly reported.";
              lockupPeriod = "1-year cliff before any release; no transfer during the cliff.";
              releaseConditions = "Capped at 10% of supply; released only per the published vesting schedule.";
              treasuryOversight = "Vesting progress and recipients publicly reported each period.";
            },
          ];
        };
      };
      emissionScheduleState = {
        var config = {
          initialEmission = 5_250_000;
          halvingIntervalMonths = 4;
          maxSupply = 21_000_000;
          schedule = [];
        };
      };
      proposals = Map.empty();
      votes = Map.empty();
      delegations = Map.empty();
      stakingRecords = Map.empty();
      counters = {
        var nextSrcTransactionId = 0;
        var nextContributionId = 0;
        var nextAssignmentId = 0;
        var nextTreasuryTransactionId = 0;
        var nextProposalId = 0;
        var nextStakingId = 0;
      };
    };
  };
};
