import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import Expose "mo:caffeineai-oql/Expose";
import OQL "mo:caffeineai-oql";
import Entity "mo:caffeineai-oql/Entity";
import NatValue "mo:caffeineai-oql/NatValue";
import TextValue "mo:caffeineai-oql/TextValue";
import PrincipalValue "mo:caffeineai-oql/PrincipalValue";
import IntValue "mo:caffeineai-oql/IntValue";
import BoolValue "mo:caffeineai-oql/BoolValue";
import ApiDocMixin "mixins/api-doc";
import ResearchCreditsMixin "domains/researchCredits";
import TreasuryMixin "domains/treasury";
import TokenomicsMixin "domains/tokenomics";
import GovernanceMixin "domains/governance";
import StakingMixin "domains/staking";
import WaitlistMixin "domains/waitlist";
import VisitorApiMixin "mixins/visitor-api";
import DiscoveryApiMixin "mixins/discovery-api";
import SovereignApiMixin "mixins/sovereign-api";
import CensusApiMixin "mixins/census-api";
import RolesApiMixin "mixins/roles-api";
import ExecutionApiMixin "mixins/execution-api";
import ConstitutionApiMixin "mixins/constitution-api";
import DepartureApiMixin "mixins/departure-api";
import DissolutionApiMixin "mixins/dissolution-api";
import Common "types/common";
import Discovery "types/discovery";
import Sovereign "types/sovereign";
import ConstitutionLib "domains/constitution";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import List "mo:core/List";

actor {
  let accessControlState : AccessControl.AccessControlState;

  // Additive to AccessControl's #admin/#user/#guest roles: tracks which
  // registered members also hold reviewer privileges (contribution
  // approval/rejection). Admin status still comes from accessControlState.
  let reviewers : Set.Set<Principal>;

  // SOVEREIGN Research Credits (SRC) ledger — separate from the proposed
  // token and from treasury funds.
  let srcBalances : Map.Map<Principal, Common.SrcBalance>;
  let srcTransactions : Map.Map<Common.SrcTransactionId, Common.SrcTransaction>;

  // Verified research contributions awaiting / having received review.
  let contributions : Map.Map<Common.ContributionId, Common.Contribution>;

  // Research assignments commissioned or prioritized with SRC.
  let assignments : Map.Map<Common.AssignmentId, Common.Assignment>;

  // Transparent treasury ledger of real operating funds.
  let treasuryTransactions : Map.Map<Common.TreasuryTransactionId, Common.TreasuryTransaction>;

  // Proposed SOVEREIGN token design — not an issued or available token.
  let tokenomicsConfigState : { var config : Common.TokenomicsConfig };

  // Proposed four-month halving emission schedule design.
  let emissionScheduleState : { var config : Common.EmissionScheduleConfig };

  // DAO governance: proposals, one-vote-per-member-per-proposal records
  // (nested by proposal then voter), and vote delegation.
  let proposals : Map.Map<Common.ProposalId, Common.Proposal>;
  let votes : Map.Map<Common.ProposalId, Map.Map<Principal, Common.Vote>>;
  let delegations : Map.Map<Principal, Common.VoteDelegation>;

  // Voluntary, non-custodial staking / governance-maturity records.
  let stakingRecords : Map.Map<Common.StakingId, Common.StakingRecord>;

  // SOVEREIGN early access waitlist submissions.
  let waitlistEntries : Map.Map<Common.WaitlistEntryId, Common.WaitlistEntry>;

  // Visitor participation experience — additive demonstration layer.
  let challengeImpressions : Map.Map<Nat, Common.ChallengeImpression>;
  let challengeStarts : Map.Map<Nat, Common.ChallengeStart>;
  let challengeResponses : Map.Map<Nat, Common.ChallengeResponse>;
  let publicComments : Map.Map<Nat, Common.PublicComment>;
  let commentReports : Map.Map<Nat, Common.CommentReport>;
  let weeklyChallengeState : { var challenge : ?Common.WeeklyChallenge };

  // Lead-capture pathways: Free Early Access, Founding Organization and
  // Strategic Funding Partner. Private contact data — admin-only reads.
  let leads : Map.Map<Common.LeadId, Common.Lead>;

  // Discovery — Collective Intelligence & Collaboration Network. Additive
  // to every domain above; community-level isolation is enforced against
  // each record's `community` field.
  let communityProfiles : Map.Map<Common.CommunityId, Discovery.CommunityProfile>;
  let discoverySubmissions : Map.Map<Discovery.SubmissionId, Discovery.DiscoverySubmission>;
  let pipelineItems : Map.Map<Discovery.PipelineItemId, Discovery.PipelineItem>;
  let pipelineInteractions : Map.Map<Discovery.PipelineItemId, [Discovery.PipelineInteraction]>;
  let collaborationProfiles : Map.Map<Discovery.CollaborationProfileId, Discovery.CollaborationProfile>;
  let introductionRequests : Map.Map<Discovery.IntroductionRequestId, Discovery.IntroductionRequest>;
  let networkActivity : Map.Map<Discovery.ActivityEntryId, Discovery.NetworkActivityEntry>;

  // SOVEREIGN OS — Nation workspaces. Additive to every domain above; the
  // data contract lives in types/sovereign.mo and the stable fields are
  // introduced by migrations/20261117_120000.mo. Nation-scoped isolation is
  // enforced against each record's `nation` field.
  let nations : Map.Map<Sovereign.NationId, Sovereign.Nation>;
  let workspaces : Map.Map<Sovereign.WorkspaceId, Sovereign.Workspace>;
  let workspaceApps : Map.Map<Sovereign.WorkspaceAppId, Sovereign.WorkspaceApp>;
  let nationProposals : Map.Map<Sovereign.NationProposalId, Sovereign.NationProposal>;
  let discussionThreads : Map.Map<Sovereign.DiscussionThreadId, Sovereign.DiscussionThread>;
  let discussionPosts : Map.Map<Sovereign.DiscussionPostId, Sovereign.DiscussionPost>;
  let nationMembers : Map.Map<Sovereign.NationMemberId, Sovereign.NationMember>;
  let nationDocuments : Map.Map<Sovereign.NationDocumentId, Sovereign.NationDocument>;
  let calendarEvents : Map.Map<Sovereign.CalendarEventId, Sovereign.CalendarEvent>;
  let nationTreasuryTransactions : Map.Map<Sovereign.NationTreasuryTransactionId, Sovereign.NationTreasuryTransaction>;
  let privacySettings : Map.Map<Sovereign.NationId, Sovereign.PrivacySettings>;
  let networkNationProfiles : Map.Map<Sovereign.NationId, Sovereign.NetworkNationProfile>;
  let nationOwners : Map.Map<Sovereign.NationId, Sovereign.NationOwnership>;
  let nationThemes : Map.Map<Sovereign.NationId, Sovereign.NationTheme>;
  let nationMembershipVoting : Map.Map<Sovereign.NationId, Sovereign.MembershipVotingConfig>;

  // Nation Files — the shared document storage layer. Each Nation has its
  // own independent file namespace; folders and files are scoped to exactly
  // one Nation and are private by default. File bytes live off-chain and are
  // referenced by an `ExternalBlob`; both metadata and content reference are
  // access-controlled on the backend. Introduced by
  // migrations/20261117_200000.mo.
  let nationFolders : Map.Map<Sovereign.NationFolderId, Sovereign.NationFolder>;
  let nationFiles : Map.Map<Sovereign.NationFileId, Sovereign.NationFile>;
  let fileAttachments : Map.Map<Sovereign.FileAttachmentId, Sovereign.FileAttachment>;

  // DAO Constitution & Governance — additive to the Nation workspace layer
  // above. A Nation's constitution is a versioned governance policy; roles,
  // decisions, execution, appeals and the Participation Census are all
  // Nation-scoped and private by default. Introduced by
  // migrations/20261118_120000.mo.
  let foundingSetups : Map.Map<Sovereign.NationId, Sovereign.FoundingSetup>;
  let foundingAppointments : Map.Map<Nat, Sovereign.FoundingAppointment>;
  let constitutions : Map.Map<Sovereign.ConstitutionId, Sovereign.Constitution>;
  let amendments : Map.Map<Sovereign.AmendmentId, Sovereign.Amendment>;
  let governanceRoles : Map.Map<Sovereign.GovernanceRoleId, Sovereign.GovernanceRole>;
  let roleAssignments : Map.Map<Sovereign.RoleAssignmentId, Sovereign.RoleAssignment>;
  let roleDelegations : Map.Map<Sovereign.RoleDelegationId, Sovereign.RoleDelegation>;
  let governanceProposals : Map.Map<Sovereign.GovernanceProposalId, Sovereign.GovernanceProposal>;
  let governanceVotes : Map.Map<Nat, Sovereign.GovernanceVote>;
  let executionRequests : Map.Map<Sovereign.ExecutionRequestId, Sovereign.ExecutionRequest>;
  let executionAudit : Map.Map<Nat, Sovereign.ExecutionAuditEntry>;
  let appeals : Map.Map<Sovereign.AppealId, Sovereign.Appeal>;
  let censusEntries : Map.Map<Sovereign.CensusEntryId, Sovereign.CensusEntry>;

  // Constitutional enforcement — membership onboarding, per-member admission,
  // one recorded vote per member per decision, and the append-only per-Nation
  // governance history. Introduced by migrations/20261124_120000.mo.
  let joinRequests : Map.Map<Sovereign.JoinRequestId, Sovereign.JoinRequest>;
  let membershipInvitations : Map.Map<Sovereign.MembershipInvitationId, Sovereign.MembershipInvitation>;
  let memberAdmissions : Map.Map<Sovereign.MemberAdmissionId, Sovereign.MemberAdmission>;
  let recordedVotes : Map.Map<Sovereign.RecordedVoteId, Sovereign.RecordedVote>;
  let governanceHistory : Map.Map<Sovereign.GovernanceHistoryId, Sovereign.GovernanceHistoryEntry>;

  // DAO lifecycle & constitutional continuity — backend-enforced lifecycle
  // states, authority positions separated from their holders, succession and
  // recovery plans, constitution versions, amendment proposals, member
  // departures, emergency suspensions and dissolution workflows. Introduced
  // by migrations/20261124_180000.mo.
  let nationLifecycles : Map.Map<Sovereign.NationId, Sovereign.NationLifecycle>;
  let authorityPositions : Map.Map<Sovereign.AuthorityPositionId, Sovereign.AuthorityPosition>;
  let authorityTermEvents : Map.Map<Sovereign.AuthorityTermEventId, Sovereign.AuthorityTermEvent>;
  let successionPlans : Map.Map<Sovereign.NationId, Sovereign.SuccessionRecoveryPlan>;
  let constitutionVersions : Map.Map<Sovereign.ConstitutionVersionId, Sovereign.ConstitutionVersion>;
  let amendmentProposals : Map.Map<Sovereign.AmendmentProposalId, Sovereign.AmendmentProposal>;
  let memberDepartures : Map.Map<Sovereign.MemberDepartureId, Sovereign.MemberDeparture>;
  let emergencySuspensions : Map.Map<Sovereign.EmergencySuspensionId, Sovereign.EmergencySuspension>;
  let dissolutions : Map.Map<Sovereign.DissolutionId, Sovereign.Dissolution>;

  // Shared id counters, wrapped in a record so a future mixin's mutations
  // propagate back to this actor's stable state.
  let counters : {
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
    var nextJoinRequestId : Nat;
    var nextMembershipInvitationId : Nat;
    var nextMemberAdmissionId : Nat;
    var nextRecordedVoteId : Nat;
    var nextGovernanceHistoryId : Nat;
    var nextAuthorityPositionId : Nat;
    var nextAuthorityTermEventId : Nat;
    var nextConstitutionVersionId : Nat;
    var nextAmendmentProposalId : Nat;
    var nextMemberDepartureId : Nat;
    var nextEmergencySuspensionId : Nat;
    var nextDissolutionId : Nat;
  };

  include MixinAuthorization(accessControlState, null);
  include MixinObjectStorage();
  include ResearchCreditsMixin(accessControlState, reviewers, srcBalances, srcTransactions, contributions, assignments, counters);
  include TreasuryMixin(accessControlState, treasuryTransactions, counters);
  include TokenomicsMixin(accessControlState, tokenomicsConfigState, emissionScheduleState);
  include GovernanceMixin(accessControlState, proposals, votes, delegations, counters);
  include StakingMixin(stakingRecords, counters, accessControlState);
  include WaitlistMixin(waitlistEntries, counters);
  include VisitorApiMixin(
    accessControlState,
    challengeImpressions,
    challengeStarts,
    challengeResponses,
    publicComments,
    commentReports,
    weeklyChallengeState,
    leads,
    counters,
  );
  include DiscoveryApiMixin(
    accessControlState,
    communityProfiles,
    discoverySubmissions,
    pipelineItems,
    pipelineInteractions,
    collaborationProfiles,
    introductionRequests,
    networkActivity,
    proposals,
    counters,
  );
  include SovereignApiMixin(
    accessControlState,
    nations,
    workspaces,
    workspaceApps,
    nationProposals,
    discussionThreads,
    discussionPosts,
    nationMembers,
    nationDocuments,
    calendarEvents,
    nationTreasuryTransactions,
    privacySettings,
    networkNationProfiles,
    nationOwners,
    nationThemes,
    nationMembershipVoting,
    nationFolders,
    nationFiles,
    fileAttachments,
    memberAdmissions,
    recordedVotes,
    censusEntries,
    foundingSetups,
    foundingAppointments,
    nationLifecycles,
    counters,
  );
  include CensusApiMixin(
    accessControlState,
    nations,
    nationMembers,
    nationOwners,
    censusEntries,
    counters,
  );
  include RolesApiMixin(
    accessControlState,
    governanceRoles,
    roleAssignments,
    roleDelegations,
    censusEntries,
    nationOwners,
    nationMembers,
    joinRequests,
    membershipInvitations,
    memberAdmissions,
    governanceHistory,
    constitutions,
    counters,
  );
  include ExecutionApiMixin(
    accessControlState,
    nations,
    nationMembers,
    nationOwners,
    constitutions,
    governanceProposals,
    governanceVotes,
    executionRequests,
    executionAudit,
    appeals,
    censusEntries,
    memberAdmissions,
    recordedVotes,
    governanceHistory,
    counters,
  );
  include ConstitutionApiMixin(
    accessControlState,
    nations,
    nationMembers,
    nationOwners,
    foundingSetups,
    foundingAppointments,
    constitutions,
    amendments,
    governanceHistory,
    nationLifecycles,
    authorityPositions,
    authorityTermEvents,
    successionPlans,
    constitutionVersions,
    amendmentProposals,
    counters,
  );

  // DAO lifecycle & constitutional continuity — member departure and
  // emergency governance. Additive to the constitution and enforcement
  // layers above; every record is Nation-scoped and private by default.
  include DepartureApiMixin(
    accessControlState,
    nations,
    nationMembers,
    nationOwners,
    governanceRoles,
    roleAssignments,
    roleDelegations,
    memberAdmissions,
    censusEntries,
    recordedVotes,
    governanceHistory,
    nationLifecycles,
    memberDepartures,
    emergencySuspensions,
    counters,
  );
  include DissolutionApiMixin(
    accessControlState,
    nations,
    nationOwners,
    nationMembers,
    nationLifecycles,
    foundingSetups,
    foundingAppointments,
    constitutions,
    dissolutions,
    governanceHistory,
    counters,
  );

  // ---------------------------------------------------------------------
  // OQL registration — one queryable entity per persisted, non-transient
  // field introduced by the five DAO economy domains above. Every entity
  // here uses manual-mode row extraction (Entity.manual) because the
  // underlying records carry variant and nested-map fields that auto-
  // derivation does not support; variant fields are projected as Text
  // tags, and the `links : [Text]` array field on Contribution is simply
  // omitted from the projected columns (arrays are not a supported OQL
  // column type).
  // ---------------------------------------------------------------------

  // Sample owner principal for .sample(...) dummy rows only — the value
  // itself is never read.
  transient let anyP = Principal.fromText("aaaaa-aa");

  // votes is a nested Map<ProposalId, Map<Principal, Vote>>; flatten it
  // into a plain array of Vote rows for the manual entity iterator.
  func allVotes() : [Common.Vote] {
    let acc = List.empty<Common.Vote>();
    for (voterMap in votes.values()) {
      for (vote in voterMap.values()) {
        acc.add(vote);
      };
    };
    acc.toArray();
  };

  // pipelineInteractions is a Map<PipelineItemId, [PipelineInteraction]>;
  // flatten it into a plain array of interaction rows for the manual entity
  // iterator.
  func allPipelineInteractions() : [Discovery.PipelineInteraction] {
    let acc = List.empty<Discovery.PipelineInteraction>();
    for (interactions in pipelineInteractions.values()) {
      for (interaction in interactions.values()) {
        acc.add(interaction);
      };
    };
    acc.toArray();
  };

  include Expose({
    entities = [
      // Owner-scoped with controller/admin oversight: the contributor sees
      // only their own contributions, while the controller (and the Data
      // Intelligence agent acting as controller) can still answer
      // aggregate questions over all contributions.
      OQL.Entity.manual<Common.Contribution>("contribution", func () = contributions.values(), "Contribution", "id")
        .sample({
          id = 0;
          contributor = anyP;
          contributionType = #legalLegislativeResearch;
          notes = "";
          links = [];
          status = #pending;
          reviewer = null;
          rationale = null;
          srcAwarded = null;
          timestamp = 0;
        })
        .payload("id", func c = c.id)
        .payload("contributor", func c = c.contributor)
        .payload(
          "contributionType",
          func c = switch (c.contributionType) {
            case (#legalLegislativeResearch) "legalLegislativeResearch";
            case (#courtTreatyResearch) "courtTreatyResearch";
            case (#undripAnalysis) "undripAnalysis";
            case (#sourceVerificationCitationCorrection) "sourceVerificationCitationCorrection";
            case (#expertPeerReview) "expertPeerReview";
            case (#acceptedChallengeOrCorrection) "acceptedChallengeOrCorrection";
          },
        )
        .payload("notes", func c = c.notes)
        .payload(
          "status",
          func c = switch (c.status) {
            case (#pending) "pending";
            case (#approved) "approved";
            case (#rejected) "rejected";
          },
        )
        .payload("reviewer", func c = c.reviewer)
        .payload("rationale", func c = c.rationale)
        .payload("srcAwarded", func c = c.srcAwarded)
        .payload("timestamp", func c = c.timestamp)
        .ownedBy("contributor")
        .controllerOrScoped()
        .build(),

      OQL.Entity.manual<Common.Assignment>("assignment", func () = assignments.values(), "Assignment", "id")
        .sample({
          id = 0;
          title = "";
          description = "";
          requestedBy = anyP;
          priority = #low;
          srcSpent = 0;
          status = #queuedAwaitingFunding;
          timestamp = 0;
        })
        .payload("id", func a = a.id)
        .payload("title", func a = a.title)
        .payload("description", func a = a.description)
        .payload("requestedBy", func a = a.requestedBy)
        .payload(
          "priority",
          func a = switch (a.priority) {
            case (#low) "low";
            case (#medium) "medium";
            case (#high) "high";
            case (#urgent) "urgent";
          },
        )
        .payload("srcSpent", func a = a.srcSpent)
        .payload(
          "status",
          func a = switch (a.status) {
            case (#queuedAwaitingFunding) "queuedAwaitingFunding";
            case (#queued) "queued";
            case (#inProgress) "inProgress";
            case (#completed) "completed";
          },
        )
        .payload("timestamp", func a = a.timestamp)
        .ownedBy("requestedBy")
        .controllerOrScoped()
        .build(),

      OQL.Entity.manual<Common.SrcTransaction>("srcTransaction", func () = srcTransactions.values(), "SrcTransaction", "id")
        .sample({
          id = 0;
          member = anyP;
          txType = #earn;
          amount = 0;
          reference = #none;
          timestamp = 0;
        })
        .payload("id", func t = t.id)
        .payload("member", func t = t.member)
        .payload(
          "txType",
          func t = switch (t.txType) {
            case (#earn) "earn";
            case (#spend) "spend";
          },
        )
        .payload("amount", func t = t.amount)
        .payload(
          "reference",
          func t = switch (t.reference) {
            case (#contribution(id)) "contribution:" # id.toText();
            case (#assignment(id)) "assignment:" # id.toText();
            case (#none) "none";
          },
        )
        .payload("timestamp", func t = t.timestamp)
        .ownedBy("member")
        .controllerOrScoped()
        .build(),

      // Treasury transparency is public — matches listTreasuryTransactions /
      // getTreasurySummary, which require no sign-in.
      OQL.Entity.manual<Common.TreasuryTransaction>("treasuryTransaction", func () = treasuryTransactions.values(), "TreasuryTransaction", "id")
        .sample({
          id = 0;
          category = #fundingReceived;
          direction = #income;
          amount = 0;
          description = "";
          recordedBy = anyP;
          timestamp = 0;
        })
        .payload("id", func t = t.id)
        .payload(
          "category",
          func t = switch (t.category) {
            case (#fundingReceived) "fundingReceived";
            case (#grantOrDonation) "grantOrDonation";
            case (#institutionalResearchContract) "institutionalResearchContract";
            case (#serviceRevenue) "serviceRevenue";
            case (#aiApiSpend) "aiApiSpend";
            case (#infrastructureOrStorageCost) "infrastructureOrStorageCost";
            case (#approvedResearchBounty) "approvedResearchBounty";
            case (#otherOperatingCost) "otherOperatingCost";
          },
        )
        .payload(
          "direction",
          func t = switch (t.direction) {
            case (#income) "income";
            case (#expense) "expense";
          },
        )
        .payload("amount", func t = t.amount)
        .payload("description", func t = t.description)
        .payload("recordedBy", func t = t.recordedBy)
        .payload("timestamp", func t = t.timestamp)
        .public_()
        .build(),

      // DAO proposal transparency is public — matches listProposals /
      // getProposal, which require no sign-in.
      OQL.Entity.manual<Common.Proposal>("proposal", func () = proposals.values(), "Proposal", "id")
        .sample({
          id = 0;
          title = "";
          description = "";
          category = #treasuryExpenditure;
          proposer = anyP;
          status = #open;
          openTimestamp = 0;
          closeTimestamp = null;
        })
        .payload("id", func p = p.id)
        .payload("title", func p = p.title)
        .payload("description", func p = p.description)
        .payload(
          "category",
          func p = switch (p.category) {
            case (#treasuryExpenditure) "treasuryExpenditure";
            case (#researchPriority) "researchPriority";
            case (#platformDevelopment) "platformDevelopment";
            case (#technicalUpgrade) "technicalUpgrade";
            case (#grantsAndRewards) "grantsAndRewards";
            case (#governanceParameters) "governanceParameters";
          },
        )
        .payload("proposer", func p = p.proposer)
        .payload(
          "status",
          func p = switch (p.status) {
            case (#open) "open";
            case (#closed) "closed";
            case (#passed) "passed";
            case (#rejected) "rejected";
          },
        )
        .payload("openTimestamp", func p = p.openTimestamp)
        .payload("closeTimestamp", func p = p.closeTimestamp)
        .public_()
        .build(),

      // Individual vote records — public, matching the DAO's transparent
      // voting-history goal (NNS/SNS-style public governance records).
      OQL.Entity.manual<Common.Vote>("vote", func () = allVotes().values(), "Vote", "voteKey")
        .sample({ proposalId = 0; voter = anyP; choice = #inFavor; timestamp = 0 })
        .payload("voteKey", func v = v.proposalId.toText() # ":" # v.voter.toText())
        .payload("proposalId", func v = v.proposalId)
        .payload("voter", func v = v.voter)
        .payload(
          "choice",
          func v = switch (v.choice) {
            case (#inFavor) "inFavor";
            case (#against) "against";
            case (#abstain) "abstain";
          },
        )
        .payload("timestamp", func v = v.timestamp)
        .public_()
        .build(),

      // Delegation records — public, for the same voting-transparency
      // reason as `vote` above.
      OQL.Entity.manual<Common.VoteDelegation>("voteDelegation", func () = delegations.values(), "VoteDelegation", "delegator")
        .sample({ delegator = anyP; delegate = anyP; active = true; timestamp = 0 })
        .payload("delegator", func d = d.delegator)
        .payload("delegate", func d = d.delegate)
        .payload("active", func d = d.active)
        .payload("timestamp", func d = d.timestamp)
        .public_()
        .build(),

      // Staking records are strictly private per member — matches
      // listMyStakes, which never lets one member see another's stakes.
      OQL.Entity.manual<Common.StakingRecord>("stakingRecord", func () = stakingRecords.values(), "StakingRecord", "id")
        .sample({
          id = 0;
          member = anyP;
          lockedAmount = 0;
          lockTermSeconds = 0;
          lockStart = 0;
          unlockTime = 0;
          maturityRateBps = 0;
          status = #active;
        })
        .payload("id", func s = s.id)
        .payload("member", func s = s.member)
        .payload("lockedAmount", func s = s.lockedAmount)
        .payload("lockTermSeconds", func s = s.lockTermSeconds)
        .payload("lockStart", func s = s.lockStart)
        .payload("unlockTime", func s = s.unlockTime)
        .payload("maturityRateBps", func s = s.maturityRateBps)
        .payload(
          "status",
          func s = switch (s.status) {
            case (#active) "active";
            case (#matured) "matured";
            case (#unlocked) "unlocked";
          },
        )
        .ownedBy("member")
        .scopedPerUser()
        .build(),

      // Waitlist submissions are private interest-list data: no end user
      // reads them directly, but the Data Intelligence agent (acting as
      // controller) can answer aggregate questions over them.
      OQL.Entity.manual<Common.WaitlistEntry>("waitlistEntry", func () = waitlistEntries.values(), "WaitlistEntry", "id")
        .sample({
          id = 0;
          name = "";
          email = "";
          organization = ?"";
          interestArea = ?#indigenousLeadershipAndGovernance;
          timestamp = 0;
        })
        .payload("id", func w = w.id)
        .payload("name", func w = w.name)
        .payload("email", func w = w.email)
        .payload("organization", func w = w.organization)
        .payload(
          "interestArea",
          func w = switch (w.interestArea) {
            case (null) "none";
            case (?area) switch (area) {
              case (#indigenousLeadershipAndGovernance) "indigenousLeadershipAndGovernance";
              case (#legalResearchAndPolicy) "legalResearchAndPolicy";
              case (#aiAndTechnology) "aiAndTechnology";
              case (#digitalSovereigntyAndDataGovernance) "digitalSovereigntyAndDataGovernance";
              case (#researchParticipation) "researchParticipation";
              case (#daoAndEcosystemDevelopment) "daoAndEcosystemDevelopment";
              case (#fundingAndStrategicPartnerships) "fundingAndStrategicPartnerships";
            };
          },
        )
        .payload("timestamp", func w = w.timestamp)
        .controllerOnly()
        .build(),

      // -----------------------------------------------------------------
      // Visitor participation experience — additive demonstration layer.
      // Impressions, starts and completions are pseudonymous analytics
      // events (a client-generated session id, no personal data), so they
      // are controller-only: the Data Intelligence agent can answer
      // aggregate questions while no end user reads raw event rows.
      // -----------------------------------------------------------------

      OQL.Entity.manual<Common.ChallengeImpression>("challengeImpression", func () = challengeImpressions.values(), "ChallengeImpression", "id")
        .sample({ id = 0; sessionId = ""; participant = null; weekKey = ""; timestamp = 0 })
        .payload("id", func c = c.id)
        .payload("sessionId", func c = c.sessionId)
        .payload("participant", func c = c.participant)
        .payload("weekKey", func c = c.weekKey)
        .payload("timestamp", func c = c.timestamp)
        .controllerOnly()
        .build(),

      OQL.Entity.manual<Common.ChallengeStart>("challengeStart", func () = challengeStarts.values(), "ChallengeStart", "id")
        .sample({ id = 0; sessionId = ""; participant = null; weekKey = ""; timestamp = 0 })
        .payload("id", func c = c.id)
        .payload("sessionId", func c = c.sessionId)
        .payload("participant", func c = c.participant)
        .payload("weekKey", func c = c.weekKey)
        .payload("timestamp", func c = c.timestamp)
        .controllerOnly()
        .build(),

      OQL.Entity.manual<Common.ChallengeResponse>("challengeResponse", func () = challengeResponses.values(), "ChallengeResponse", "id")
        .sample({ id = 0; sessionId = ""; participant = null; weekKey = ""; optionId = 0; reasoning = null; timestamp = 0 })
        .payload("id", func c = c.id)
        .payload("sessionId", func c = c.sessionId)
        .payload("participant", func c = c.participant)
        .payload("weekKey", func c = c.weekKey)
        .payload("optionId", func c = c.optionId)
        .payload("reasoning", func c = c.reasoning)
        .payload("timestamp", func c = c.timestamp)
        .controllerOnly()
        .build(),

      // Public comments are world-readable — matches listPublicComments,
      // which requires no sign-in. Moderation status is projected as a
      // Text tag so a query can filter visible vs hidden vs removed.
      OQL.Entity.manual<Common.PublicComment>("publicComment", func () = publicComments.values(), "PublicComment", "id")
        .sample({ id = 0; sessionId = ""; participant = null; displayName = null; body = ""; moderationStatus = #visible; reported = false; timestamp = 0 })
        .payload("id", func c = c.id)
        .payload("sessionId", func c = c.sessionId)
        .payload("participant", func c = c.participant)
        .payload("displayName", func c = c.displayName)
        .payload("body", func c = c.body)
        .payload(
          "moderationStatus",
          func c = switch (c.moderationStatus) {
            case (#visible) "visible";
            case (#hidden) "hidden";
            case (#removed) "removed";
          },
        )
        .payload("reported", func c = c.reported)
        .payload("timestamp", func c = c.timestamp)
        .public_()
        .build(),

      // Comment reports are moderation data for administrators only.
      OQL.Entity.manual<Common.CommentReport>("commentReport", func () = commentReports.values(), "CommentReport", "id")
        .sample({ id = 0; commentId = 0; sessionId = ""; reason = null; timestamp = 0 })
        .payload("id", func r = r.id)
        .payload("commentId", func r = r.commentId)
        .payload("sessionId", func r = r.sessionId)
        .payload("reason", func r = r.reason)
        .payload("timestamp", func r = r.timestamp)
        .controllerOnly()
        .build(),

      // Lead records carry private contact details and are admin-only
      // (listLeads / getLeadAnalytics both require an admin caller). The
      // Data Intelligence agent, acting as controller, can still answer
      // aggregate questions over them.
      OQL.Entity.manual<Common.Lead>("lead", func () = leads.values(), "Lead", "id")
        .sample({
          id = 0;
          pathway = #freeEarlyAccess;
          name = "";
          email = "";
          organization = null;
          organizationType = null;
          intendedDaoUseCase = null;
          intendedDeployment = null;
          prepaidInterest = null;
          budgetRange = null;
          intendedSupport = null;
          consentToContact = false;
          status = #new;
          adminNote = null;
          timestamp = 0;
        })
        .payload("id", func l = l.id)
        .payload(
          "pathway",
          func l = switch (l.pathway) {
            case (#freeEarlyAccess) "freeEarlyAccess";
            case (#foundingOrganization) "foundingOrganization";
            case (#strategicFundingPartner) "strategicFundingPartner";
          },
        )
        .payload("name", func l = l.name)
        .payload("email", func l = l.email)
        .payload("organization", func l = l.organization)
        .payload(
          "organizationType",
          func l = switch (l.organizationType) {
            case (null) "none";
            case (?t) switch (t) {
              case (#indigenousNationOrCommunity) "indigenousNationOrCommunity";
              case (#nonProfitOrCharity) "nonProfitOrCharity";
              case (#cooperative) "cooperative";
              case (#smallBusiness) "smallBusiness";
              case (#enterprise) "enterprise";
              case (#governmentOrPublicSector) "governmentOrPublicSector";
              case (#educationalInstitution) "educationalInstitution";
              case (#other) "other";
            };
          },
        )
        .payload("intendedDaoUseCase", func l = l.intendedDaoUseCase)
        .payload("intendedDeployment", func l = l.intendedDeployment)
        .payload("prepaidInterest", func l = l.prepaidInterest)
        .payload("budgetRange", func l = l.budgetRange)
        .payload(
          "intendedSupport",
          func l = switch (l.intendedSupport) {
            case (null) "none";
            case (?t) switch (t) {
              case (#grantOrPhilanthropy) "grantOrPhilanthropy";
              case (#strategicPartnership) "strategicPartnership";
              case (#sponsorship) "sponsorship";
              case (#investmentInterest) "investmentInterest";
              case (#other) "other";
            };
          },
        )
        .payload("consentToContact", func l = l.consentToContact)
        .payload(
          "status",
          func l = switch (l.status) {
            case (#new) "new";
            case (#contacted) "contacted";
            case (#interested) "interested";
            case (#foundingOrganizationProspect) "foundingOrganizationProspect";
            case (#strategicPartner) "strategicPartner";
            case (#converted) "converted";
            case (#notProceeding) "notProceeding";
          },
        )
        .payload("adminNote", func l = l.adminNote)
        .payload("timestamp", func l = l.timestamp)
        .controllerOnly()
        .build(),

      // -----------------------------------------------------------------
      // Discovery — Collective Intelligence & Collaboration Network.
      // Community profiles are public when the community opted in and
      // published them; the entity is public_ so the Data Intelligence
      // agent and any visitor can answer over the published directory.
      // -----------------------------------------------------------------

      OQL.Entity.manual<Discovery.CommunityProfile>("communityProfile", func () = communityProfiles.values(), "CommunityProfile", "id")
        .sample({
          id = 0;
          owner = anyP;
          name = "";
          description = "";
          region = "";
          objectives = [];
          skills = [];
          interests = [];
          projectNeeds = [];
          partnershipOpportunities = [];
          discoveryOptIn = false;
          visibility = #publicVisible;
          timestamp = 0;
        })
        .payload("id", func c = c.id)
        .payload("owner", func c = c.owner)
        .payload("name", func c = c.name)
        .payload("description", func c = c.description)
        .payload("region", func c = c.region)
        .payload(
          "visibility",
          func c = switch (c.visibility) {
            case (#publicVisible) "public";
            case (#privateVisible) "private";
          },
        )
        .payload("discoveryOptIn", func c = c.discoveryOptIn)
        .payload("timestamp", func c = c.timestamp)
        .public_()
        .build(),

      // Public discovery submissions are world-readable; community-only
      // submissions are scoped to their author. The entity is
      // controllerOrScoped so the agent can answer aggregate questions
      // while a signed-in caller reads only their own rows.
      OQL.Entity.manual<Discovery.DiscoverySubmission>("discoverySubmission", func () = discoverySubmissions.values(), "DiscoverySubmission", "id")
        .sample({
          id = 0;
          author = anyP;
          community = 0;
          body = "";
          classification = #idea;
          category = "";
          interestTags = [];
          visibility = #publicVisible;
          timestamp = 0;
        })
        .payload("id", func s = s.id)
        .payload("author", func s = s.author)
        .payload("community", func s = s.community)
        .payload("body", func s = s.body)
        .payload(
          "classification",
          func s = switch (s.classification) {
            case (#idea) "idea";
            case (#feedback) "feedback";
            case (#need) "need";
            case (#opportunity) "opportunity";
            case (#potentialProposal) "potentialProposal";
          },
        )
        .payload("category", func s = s.category)
        .payload(
          "visibility",
          func s = switch (s.visibility) {
            case (#publicVisible) "public";
            case (#communityOnly) "communityOnly";
          },
        )
        .payload("timestamp", func s = s.timestamp)
        .ownedBy("author")
        .controllerOrScoped()
        .build(),

      // Pipeline items are public: the idea-to-proposal progression is a
      // visible community process.
      OQL.Entity.manual<Discovery.PipelineItem>("pipelineItem", func () = pipelineItems.values(), "PipelineItem", "id")
        .sample({
          id = 0;
          community = 0;
          submissionId = 0;
          title = "";
          stage = #idea;
          proposalId = null;
          timestamp = 0;
        })
        .payload("id", func p = p.id)
        .payload("community", func p = p.community)
        .payload("submissionId", func p = p.submissionId)
        .payload("title", func p = p.title)
        .payload(
          "stage",
          func p = switch (p.stage) {
            case (#idea) "idea";
            case (#communityFeedback) "communityFeedback";
            case (#collaboration) "collaboration";
            case (#draftProposal) "draftProposal";
            case (#governanceVote) "governanceVote";
            case (#approvedAction) "approvedAction";
            case (#results) "results";
          },
        )
        .payload("proposalId", func p = p.proposalId)
        .payload("timestamp", func p = p.timestamp)
        .public_()
        .build(),

      // Pipeline interactions (comments, support, improvement suggestions)
      // are public: the idea-to-proposal progression is a visible community
      // process. The stored value is a Map<PipelineItemId,
      // [PipelineInteraction]>, flattened into one row per interaction.
      OQL.Entity.manual<Discovery.PipelineInteraction>("pipelineInteraction", func () = allPipelineInteractions().values(), "PipelineInteraction", "id")
        .sample({
          id = 0;
          pipelineItemId = 0;
          author = anyP;
          kind = #comment;
          body = "";
          timestamp = 0;
        })
        .payload("id", func i = i.id)
        .payload("pipelineItemId", func i = i.pipelineItemId)
        .payload("author", func i = i.author)
        .payload(
          "kind",
          func i = switch (i.kind) {
            case (#comment) "comment";
            case (#support) "support";
            case (#improvement) "improvement";
          },
        )
        .payload("body", func i = i.body)
        .payload("timestamp", func i = i.timestamp)
        .public_()
        .build(),

      // Collaboration profiles are opt-in discovery data; the entity is
      // public_ so opted-in parties are discoverable.
      OQL.Entity.manual<Discovery.CollaborationProfile>("collaborationProfile", func () = collaborationProfiles.values(), "CollaborationProfile", "id")
        .sample({
          id = 0;
          party = #member(anyP);
          displayName = "";
          skills = [];
          interests = [];
          needs = [];
          partnershipOpportunities = [];
          discoveryOptIn = false;
          timestamp = 0;
        })
        .payload("id", func c = c.id)
        .payload(
          "party",
          func c = switch (c.party) {
            case (#member(p)) "member:" # p.toText();
            case (#community(id)) "community:" # id.toText();
          },
        )
        .payload("displayName", func c = c.displayName)
        .payload("discoveryOptIn", func c = c.discoveryOptIn)
        .payload("timestamp", func c = c.timestamp)
        .public_()
        .build(),

      // Introduction requests carry private contact intent and are
      // controller-only: the agent can answer aggregate questions while no
      // end user reads raw request rows.
      OQL.Entity.manual<Discovery.IntroductionRequest>("introductionRequest", func () = introductionRequests.values(), "IntroductionRequest", "id")
        .sample({
          id = 0;
          requester = #member(anyP);
          target = #member(anyP);
          message = "";
          requesterApproved = false;
          targetApproved = false;
          status = #pending;
          timestamp = 0;
        })
        .payload("id", func r = r.id)
        .payload(
          "requester",
          func r = switch (r.requester) {
            case (#member(p)) "member:" # p.toText();
            case (#community(id)) "community:" # id.toText();
          },
        )
        .payload(
          "target",
          func r = switch (r.target) {
            case (#member(p)) "member:" # p.toText();
            case (#community(id)) "community:" # id.toText();
          },
        )
        .payload("requesterApproved", func r = r.requesterApproved)
        .payload("targetApproved", func r = r.targetApproved)
        .payload(
          "status",
          func r = switch (r.status) {
            case (#pending) "pending";
            case (#approved) "approved";
            case (#declined) "declined";
          },
        )
        .payload("timestamp", func r = r.timestamp)
        .controllerOnly()
        .build(),

      // Network activity is public: it is the visible feed of real recorded
      // events.
      OQL.Entity.manual<Discovery.NetworkActivityEntry>("networkActivity", func () = networkActivity.values(), "NetworkActivityEntry", "id")
        .sample({
          id = 0;
          kind = #publicIdea;
          community = 0;
          summary = "";
          timestamp = 0;
        })
        .payload("id", func a = a.id)
        .payload(
          "kind",
          func a = switch (a.kind) {
            case (#publicIdea) "publicIdea";
            case (#proposal) "proposal";
            case (#partnership) "partnership";
            case (#communityMilestone) "communityMilestone";
          },
        )
        .payload("community", func a = a.community)
        .payload("summary", func a = a.summary)
        .payload("timestamp", func a = a.timestamp)
        .public_()
        .build(),

      // -----------------------------------------------------------------
      // SOVEREIGN OS — Nation workspaces. Nation-scoped isolation is
      // enforced against each record's `nation` field. Workspace content is
      // community-controlled: the Nation listing and its workspace registry
      // are public so a visitor can explore the demonstration workspace,
      // while the community's own records are controller-only so the Data
      // Intelligence agent can answer aggregate questions without exposing
      // one Nation's private content to another.
      // -----------------------------------------------------------------

      OQL.Entity.manual<Sovereign.Nation>("nation", func () = nations.values(), "Nation", "id")
        .sample({
          id = 0;
          name = "";
          shortDescription = "";
          region = "";
          governanceModel = "";
          privacyLevel = #privateToMembers;
          isSample = false;
          openToCollaboration = false;
          timestamp = 0;
        })
        .payload("id", func n = n.id)
        .payload("name", func n = n.name)
        .payload("shortDescription", func n = n.shortDescription)
        .payload("region", func n = n.region)
        .payload("governanceModel", func n = n.governanceModel)
        .payload(
          "privacyLevel",
          func n = switch (n.privacyLevel) {
            case (#privateToMembers) "privateToMembers";
            case (#openToCollaboration) "openToCollaboration";
            case (#publiclyVisible) "publiclyVisible";
          },
        )
        .payload("isSample", func n = n.isSample)
        .payload("openToCollaboration", func n = n.openToCollaboration)
        .payload("timestamp", func n = n.timestamp)
        .public_()
        .build(),

      OQL.Entity.manual<Sovereign.Workspace>("workspace", func () = workspaces.values(), "Workspace", "id")
        .sample({ id = 0; nation = 0; name = ""; description = ""; timestamp = 0 })
        .payload("id", func w = w.id)
        .payload("nation", func w = w.nation)
        .payload("name", func w = w.name)
        .payload("description", func w = w.description)
        .payload("timestamp", func w = w.timestamp)
        .public_()
        .build(),

      OQL.Entity.manual<Sovereign.WorkspaceApp>("workspaceApp", func () = workspaceApps.values(), "WorkspaceApp", "id")
        .sample({
          id = 0;
          workspace = 0;
          appKey = "";
          displayName = "";
          oneLineDescription = "";
          status = #working;
          iconKey = "";
          order = 0;
        })
        .payload("id", func a = a.id)
        .payload("workspace", func a = a.workspace)
        .payload("appKey", func a = a.appKey)
        .payload("displayName", func a = a.displayName)
        .payload("oneLineDescription", func a = a.oneLineDescription)
        .payload(
          "status",
          func a = switch (a.status) {
            case (#working) "working";
            case (#preview) "preview";
          },
        )
        .payload("iconKey", func a = a.iconKey)
        .payload("order", func a = a.order)
        .public_()
        .build(),

      OQL.Entity.manual<Sovereign.NationProposal>("nationProposal", func () = nationProposals.values(), "NationProposal", "id")
        .sample({
          id = 0;
          nation = 0;
          title = "";
          summary = "";
          status = #draft;
          votesInFavor = 0;
          votesAgainst = 0;
          votesAbstain = 0;
          timestamp = 0;
        })
        .payload("id", func p = p.id)
        .payload("nation", func p = p.nation)
        .payload("title", func p = p.title)
        .payload("summary", func p = p.summary)
        .payload(
          "status",
          func p = switch (p.status) {
            case (#draft) "draft";
            case (#open) "open";
            case (#passed) "passed";
            case (#rejected) "rejected";
            case (#withdrawn) "withdrawn";
          },
        )
        .payload("votesInFavor", func p = p.votesInFavor)
        .payload("votesAgainst", func p = p.votesAgainst)
        .payload("votesAbstain", func p = p.votesAbstain)
        .payload("timestamp", func p = p.timestamp)
        .controllerOnly()
        .build(),

      OQL.Entity.manual<Sovereign.DiscussionThread>("discussionThread", func () = discussionThreads.values(), "DiscussionThread", "id")
        .sample({ id = 0; nation = 0; title = ""; author = anyP; timestamp = 0 })
        .payload("id", func t = t.id)
        .payload("nation", func t = t.nation)
        .payload("title", func t = t.title)
        .payload("author", func t = t.author)
        .payload("timestamp", func t = t.timestamp)
        .controllerOnly()
        .build(),

      OQL.Entity.manual<Sovereign.DiscussionPost>("discussionPost", func () = discussionPosts.values(), "DiscussionPost", "id")
        .sample({ id = 0; thread = 0; author = anyP; body = ""; timestamp = 0 })
        .payload("id", func p = p.id)
        .payload("thread", func p = p.thread)
        .payload("author", func p = p.author)
        .payload("body", func p = p.body)
        .payload("timestamp", func p = p.timestamp)
        .controllerOnly()
        .build(),

      OQL.Entity.manual<Sovereign.NationMember>("nationMember", func () = nationMembers.values(), "NationMember", "id")
        .sample({
          id = 0;
          nation = 0;
          member = anyP;
          displayName = "";
          roleLabel = "";
          permissionLabels = [];
          timestamp = 0;
        })
        .payload("id", func m = m.id)
        .payload("nation", func m = m.nation)
        .payload("member", func m = m.member)
        .payload("displayName", func m = m.displayName)
        .payload("roleLabel", func m = m.roleLabel)
        .payload("timestamp", func m = m.timestamp)
        .controllerOnly()
        .build(),

      OQL.Entity.manual<Sovereign.NationDocument>("nationDocument", func () = nationDocuments.values(), "NationDocument", "id")
        .sample({ id = 0; nation = 0; title = ""; body = ""; author = anyP; timestamp = 0 })
        .payload("id", func d = d.id)
        .payload("nation", func d = d.nation)
        .payload("title", func d = d.title)
        .payload("body", func d = d.body)
        .payload("author", func d = d.author)
        .payload("timestamp", func d = d.timestamp)
        .controllerOnly()
        .build(),

      OQL.Entity.manual<Sovereign.CalendarEvent>("calendarEvent", func () = calendarEvents.values(), "CalendarEvent", "id")
        .sample({
          id = 0;
          nation = 0;
          title = "";
          description = "";
          startTime = 0;
          endTime = 0;
          location = "";
          timestamp = 0;
        })
        .payload("id", func e = e.id)
        .payload("nation", func e = e.nation)
        .payload("title", func e = e.title)
        .payload("description", func e = e.description)
        .payload("startTime", func e = e.startTime)
        .payload("endTime", func e = e.endTime)
        .payload("location", func e = e.location)
        .payload("timestamp", func e = e.timestamp)
        .controllerOnly()
        .build(),

      OQL.Entity.manual<Sovereign.NationTreasuryTransaction>("nationTreasuryTransaction", func () = nationTreasuryTransactions.values(), "NationTreasuryTransaction", "id")
        .sample({
          id = 0;
          nation = 0;
          direction = #income;
          category = "";
          amount = 0;
          description = "";
          timestamp = 0;
        })
        .payload("id", func t = t.id)
        .payload("nation", func t = t.nation)
        .payload(
          "direction",
          func t = switch (t.direction) {
            case (#income) "income";
            case (#expense) "expense";
          },
        )
        .payload("category", func t = t.category)
        .payload("amount", func t = t.amount)
        .payload("description", func t = t.description)
        .payload("timestamp", func t = t.timestamp)
        .controllerOnly()
        .build(),

      OQL.Entity.manual<Sovereign.PrivacySettings>("privacySettings", func () = privacySettings.values(), "PrivacySettings", "nation")
        .sample({
          nation = 0;
          proposalsVisible = false;
          discussionsVisible = false;
          documentsVisible = false;
          calendarVisible = false;
          treasuryVisible = false;
          timestamp = 0;
        })
        .payload("nation", func s = s.nation)
        .payload("proposalsVisible", func s = s.proposalsVisible)
        .payload("discussionsVisible", func s = s.discussionsVisible)
        .payload("documentsVisible", func s = s.documentsVisible)
        .payload("calendarVisible", func s = s.calendarVisible)
        .payload("treasuryVisible", func s = s.treasuryVisible)
        .payload("timestamp", func s = s.timestamp)
        .controllerOnly()
        .build(),

      OQL.Entity.manual<Sovereign.NetworkNationProfile>("networkNationProfile", func () = networkNationProfiles.values(), "NetworkNationProfile", "nation")
        .sample({
          nation = 0;
          name = "";
          shortDescription = "";
          region = "";
          collaborationInterests = [];
          networkOptIn = false;
          timestamp = 0;
        })
        .payload("nation", func p = p.nation)
        .payload("name", func p = p.name)
        .payload("shortDescription", func p = p.shortDescription)
        .payload("region", func p = p.region)
        .payload("networkOptIn", func p = p.networkOptIn)
        .payload("timestamp", func p = p.timestamp)
        .public_()
        .build(),

      // Nation ownership records — which principal created each Nation. This
      // is the write gate for Nation configuration, so it is controller-only:
      // the Data Intelligence agent can answer aggregate questions while no
      // end user reads raw ownership rows.
      OQL.Entity.manual<Sovereign.NationOwnership>("nationOwnership", func () = nationOwners.values(), "NationOwnership", "nation")
        .sample({ nation = 0; creator = anyP; timestamp = 0 })
        .payload("nation", func o = o.nation)
        .payload("creator", func o = o.creator)
        .payload("timestamp", func o = o.timestamp)
        .controllerOnly()
        .build(),

      // Nation visual themes — wallpaper and theme preferences, kept separate
      // from governance and identity settings. The Nation id lives in the map
      // key, so iterate entries and promote it. Controller-only.
      OQL.Entity.manual<(Sovereign.NationId, Sovereign.NationTheme)>("nationTheme", func () = nationThemes.entries(), "NationTheme", "nation")
        .sample((0, { themeKey = ""; wallpaperKey = ""; blurEnabled = false }))
        .payload("nation", func ((nation, _)) = nation)
        .payload("themeKey", func ((_, t)) = t.themeKey)
        .payload("wallpaperKey", func ((_, t)) = t.wallpaperKey)
        .payload("blurEnabled", func ((_, t)) = t.blurEnabled)
        .controllerOnly()
        .build(),

      // Nation membership and voting configuration from the launcher. The
      // Nation id lives in the map key, so iterate entries and promote it.
      // Controller-only.
      OQL.Entity.manual<(Sovereign.NationId, Sovereign.MembershipVotingConfig)>("nationMembershipVoting", func () = nationMembershipVoting.entries(), "MembershipVotingConfig", "nation")
        .sample((0, { membershipModel = ""; votingModel = ""; quorumPercent = 0; approvalThresholdPercent = 0 }))
        .payload("nation", func ((nation, _)) = nation)
        .payload("membershipModel", func ((_, c)) = c.membershipModel)
        .payload("votingModel", func ((_, c)) = c.votingModel)
        .payload("quorumPercent", func ((_, c)) = c.quorumPercent)
        .payload("approvalThresholdPercent", func ((_, c)) = c.approvalThresholdPercent)
        .controllerOnly()
        .build(),

      // -----------------------------------------------------------------
      // Nation Files — the shared document storage layer. Each Nation has
      // its own independent file namespace and files are private by
      // default, so every Files entity is controller-only: the Data
      // Intelligence agent (acting as controller) can answer aggregate
      // questions while no end user reads another Nation's file metadata.
      // The off-chain content reference (`content : ExternalBlob`) is an
      // opaque blob handle, not queryable data, so it is omitted from the
      // projected columns; the metadata that describes a file is exposed.
      // -----------------------------------------------------------------

      OQL.Entity.manual<Sovereign.NationFolder>("nationFolder", func () = nationFolders.values(), "NationFolder", "id")
        .sample({
          id = 0;
          nation = 0;
          parent = null;
          name = "";
          createdBy = anyP;
          timestamp = 0;
        })
        .payload("id", func f = f.id)
        .payload("nation", func f = f.nation)
        .payload("parent", func f = f.parent)
        .payload("name", func f = f.name)
        .payload("createdBy", func f = f.createdBy)
        .payload("timestamp", func f = f.timestamp)
        .controllerOnly()
        .build(),

      OQL.Entity.manual<Sovereign.NationFile>("nationFile", func () = nationFiles.values(), "NationFile", "id")
        .sample({
          id = 0;
          nation = 0;
          folder = null;
          name = "";
          size = 0;
          contentType = "";
          uploadedBy = anyP;
          content = "" : Sovereign.ExternalBlob;
          timestamp = 0;
        })
        .payload("id", func f = f.id)
        .payload("nation", func f = f.nation)
        .payload("folder", func f = f.folder)
        .payload("name", func f = f.name)
        .payload("size", func f = f.size)
        .payload("contentType", func f = f.contentType)
        .payload("uploadedBy", func f = f.uploadedBy)
        .payload("timestamp", func f = f.timestamp)
        .controllerOnly()
        .build(),

      OQL.Entity.manual<Sovereign.FileAttachment>("fileAttachment", func () = fileAttachments.values(), "FileAttachment", "id")
        .sample({
          id = 0;
          nation = 0;
          file = 0;
          target = #project(0);
          attachedBy = anyP;
          timestamp = 0;
        })
        .payload("id", func a = a.id)
        .payload("nation", func a = a.nation)
        .payload("file", func a = a.file)
        .payload(
          "target",
          func a = switch (a.target) {
            case (#proposal(id)) "proposal:" # id.toText();
            case (#discussionPost(id)) "discussionPost:" # id.toText();
            case (#project(id)) "project:" # id.toText();
            case (#calendarEvent(id)) "calendarEvent:" # id.toText();
            case (#document(id)) "document:" # id.toText();
          },
        )
        .payload("attachedBy", func a = a.attachedBy)
        .payload("timestamp", func a = a.timestamp)
        .controllerOnly()
        .build(),

      // -----------------------------------------------------------------
      // DAO Constitution & Governance — additive to the Nation workspace
      // layer. A Nation's constitution, its amendment history, its roles
      // and delegations, its governance proposals and votes, its execution
      // requests and audit trail, its appeals and its Participation Census
      // are all Nation-scoped and private by default, so every entity here
      // is controller-only: the Data Intelligence agent (acting as
      // controller) can answer aggregate questions while no end user reads
      // another Nation's governance records. Variant fields are projected
      // as Text tags; nested rule sets and evidence arrays are omitted from
      // the projected columns (arrays and nested records are not supported
      // OQL column types).
      // -----------------------------------------------------------------

      OQL.Entity.manual<Sovereign.Constitution>("constitution", func () = constitutions.values(), "Constitution", "id")
        .sample({
          id = 0;
          nation = 0;
          version = 0;
          rules = ConstitutionLib.defaultRuleSet("custom");
          templateKey = "";
          confirmedBy = anyP;
          active = false;
          ratifications = null;
          timestamp = 0;
        })
        .payload("id", func c = c.id)
        .payload("nation", func c = c.nation)
        .payload("version", func c = c.version)
        .payload("templateKey", func c = c.templateKey)
        .payload("confirmedBy", func c = c.confirmedBy)
        .payload("active", func c = c.active)
        .payload("timestamp", func c = c.timestamp)
        .controllerOnly()
        .build(),

      OQL.Entity.manual<Sovereign.Amendment>("amendment", func () = amendments.values(), "Amendment", "id")
        .sample({
          id = 0;
          nation = 0;
          resultingVersion = 0;
          previousVersion = 0;
          summary = "";
          previousRules = ConstitutionLib.defaultRuleSet("custom");
          newRules = ConstitutionLib.defaultRuleSet("custom");
          authorizedBy = anyP;
          timestamp = 0;
        })
        .payload("id", func a = a.id)
        .payload("nation", func a = a.nation)
        .payload("resultingVersion", func a = a.resultingVersion)
        .payload("previousVersion", func a = a.previousVersion)
        .payload("summary", func a = a.summary)
        .payload("authorizedBy", func a = a.authorizedBy)
        .payload("timestamp", func a = a.timestamp)
        .controllerOnly()
        .build(),

      OQL.Entity.manual<Sovereign.GovernanceRole>("governanceRole", func () = governanceRoles.values(), "GovernanceRole", "id")
        .sample({
          id = 0;
          nation = 0;
          kind = #member;
          roleName = "";
          description = "";
          capabilities = [];
          isCustom = false;
          timestamp = 0;
        })
        .payload("id", func r = r.id)
        .payload("nation", func r = r.nation)
        .payload(
          "kind",
          func r = switch (r.kind) {
            case (#foundingAuthority) "foundingAuthority";
            case (#membershipAuthority) "membershipAuthority";
            case (#member) "member";
            case (#governanceDelegate) "governanceDelegate";
            case (#proposalSteward) "proposalSteward";
            case (#executionAuthority) "executionAuthority";
            case (#treasurySteward) "treasurySteward";
            case (#documentSteward) "documentSteward";
            case (#auditor) "auditor";
            case (#observer) "observer";
            case (#custom(id)) "custom:" # id.toText();
          },
        )
        .payload("roleName", func r = r.roleName)
        .payload("description", func r = r.description)
        .payload("isCustom", func r = r.isCustom)
        .payload("timestamp", func r = r.timestamp)
        .controllerOnly()
        .build(),

      OQL.Entity.manual<Sovereign.RoleAssignment>("roleAssignment", func () = roleAssignments.values(), "RoleAssignment", "id")
        .sample({ id = 0; nation = 0; member = anyP; role = 0; grantedBy = anyP; timestamp = 0 })
        .payload("id", func a = a.id)
        .payload("nation", func a = a.nation)
        .payload("member", func a = a.member)
        .payload("role", func a = a.role)
        .payload("grantedBy", func a = a.grantedBy)
        .payload("timestamp", func a = a.timestamp)
        .controllerOnly()
        .build(),

      OQL.Entity.manual<Sovereign.RoleDelegation>("roleDelegation", func () = roleDelegations.values(), "RoleDelegation", "id")
        .sample({
          id = 0;
          nation = 0;
          delegator = anyP;
          delegate = anyP;
          role = 0;
          capabilities = [];
          expiresAt = 0;
          active = false;
          timestamp = 0;
        })
        .payload("id", func d = d.id)
        .payload("nation", func d = d.nation)
        .payload("delegator", func d = d.delegator)
        .payload("delegate", func d = d.delegate)
        .payload("role", func d = d.role)
        .payload("expiresAt", func d = d.expiresAt)
        .payload("active", func d = d.active)
        .payload("timestamp", func d = d.timestamp)
        .controllerOnly()
        .build(),

      OQL.Entity.manual<Sovereign.GovernanceProposal>("governanceProposal", func () = governanceProposals.values(), "GovernanceProposal", "id")
        .sample({
          id = 0;
          nation = 0;
          title = "";
          summary = "";
          classification = "";
          status = #draft;
          proposer = anyP;
          constitutionVersion = 0;
          reviewPeriodDays = 0;
          discussionPeriodDays = 0;
          quorumPercent = 0;
          approvalThresholdPercent = 0;
          abstentionsCount = false;
          tieBreakRule = "";
          votesInFavor = 0;
          votesAgainst = 0;
          votesAbstain = 0;
          outcome = null;
          timestamp = 0;
        })
        .payload("id", func p = p.id)
        .payload("nation", func p = p.nation)
        .payload("title", func p = p.title)
        .payload("summary", func p = p.summary)
        .payload("classification", func p = p.classification)
        .payload(
          "status",
          func p = switch (p.status) {
            case (#draft) "draft";
            case (#review) "review";
            case (#discussion) "discussion";
            case (#voting) "voting";
            case (#passed) "passed";
            case (#rejected) "rejected";
            case (#withdrawn) "withdrawn";
          },
        )
        .payload("proposer", func p = p.proposer)
        .payload("constitutionVersion", func p = p.constitutionVersion)
        .payload("quorumPercent", func p = p.quorumPercent)
        .payload("approvalThresholdPercent", func p = p.approvalThresholdPercent)
        .payload("votesInFavor", func p = p.votesInFavor)
        .payload("votesAgainst", func p = p.votesAgainst)
        .payload("votesAbstain", func p = p.votesAbstain)
        .payload(
          "outcome",
          func p = switch (p.outcome) {
            case (null) "none";
            case (?o) switch (o) {
              case (#approved) "approved";
              case (#rejected) "rejected";
              case (#noQuorum) "noQuorum";
              case (#tied) "tied";
            };
          },
        )
        .payload("timestamp", func p = p.timestamp)
        .controllerOnly()
        .build(),

      // Confidential votes are counted but their voter is withheld from
      // public reads; this entity is controller-only, so the Data
      // Intelligence agent can answer aggregate questions while no end user
      // reads another Nation's vote records.
      OQL.Entity.manual<Sovereign.GovernanceVote>("governanceVote", func () = governanceVotes.values(), "GovernanceVote", "voteKey")
        .sample({ proposal = 0; nation = 0; voter = anyP; choice = #inFavor; confidential = false; timestamp = 0 })
        .payload("voteKey", func v = v.proposal.toText() # ":" # v.voter.toText())
        .payload("proposal", func v = v.proposal)
        .payload("nation", func v = v.nation)
        .payload("voter", func v = v.voter)
        .payload(
          "choice",
          func v = switch (v.choice) {
            case (#inFavor) "inFavor";
            case (#against) "against";
            case (#abstain) "abstain";
          },
        )
        .payload("confidential", func v = v.confidential)
        .payload("timestamp", func v = v.timestamp)
        .controllerOnly()
        .build(),

      OQL.Entity.manual<Sovereign.ExecutionRequest>("executionRequest", func () = executionRequests.values(), "ExecutionRequest", "id")
        .sample({
          id = 0;
          nation = 0;
          proposal = 0;
          status = #pendingAuthorization;
          requestedBy = anyP;
          authorizedBy = null;
          highRisk = false;
          timelockUntil = null;
          cancelledBy = null;
          constitutionVersion = 0;
          timestamp = 0;
        })
        .payload("id", func e = e.id)
        .payload("nation", func e = e.nation)
        .payload("proposal", func e = e.proposal)
        .payload(
          "status",
          func e = switch (e.status) {
            case (#pendingAuthorization) "pendingAuthorization";
            case (#timelocked) "timelocked";
            case (#executed) "executed";
            case (#cancelled) "cancelled";
            case (#paused) "paused";
            case (#rejected) "rejected";
          },
        )
        .payload("requestedBy", func e = e.requestedBy)
        .payload("authorizedBy", func e = e.authorizedBy)
        .payload("highRisk", func e = e.highRisk)
        .payload("timelockUntil", func e = e.timelockUntil)
        .payload("cancelledBy", func e = e.cancelledBy)
        .payload("constitutionVersion", func e = e.constitutionVersion)
        .payload("timestamp", func e = e.timestamp)
        .controllerOnly()
        .build(),

      OQL.Entity.manual<Sovereign.ExecutionAuditEntry>("executionAudit", func () = executionAudit.values(), "ExecutionAuditEntry", "id")
        .sample({ id = 0; nation = 0; request = 0; action = ""; actorPrincipal = anyP; note = ""; timestamp = 0 })
        .payload("id", func a = a.id)
        .payload("nation", func a = a.nation)
        .payload("request", func a = a.request)
        .payload("action", func a = a.action)
        .payload("actorPrincipal", func a = a.actorPrincipal)
        .payload("note", func a = a.note)
        .payload("timestamp", func a = a.timestamp)
        .controllerOnly()
        .build(),

      OQL.Entity.manual<Sovereign.Appeal>("appeal", func () = appeals.values(), "Appeal", "id")
        .sample({
          id = 0;
          nation = 0;
          kind = #membershipRejection;
          status = #submitted;
          appellant = anyP;
          subjectId = 0;
          summary = "";
          evidence = [];
          recusals = [];
          decidedBy = null;
          decisionNote = null;
          timestamp = 0;
        })
        .payload("id", func a = a.id)
        .payload("nation", func a = a.nation)
        .payload(
          "kind",
          func a = switch (a.kind) {
            case (#membershipRejection) "membershipRejection";
            case (#inactivity) "inactivity";
            case (#governanceDecision) "governanceDecision";
          },
        )
        .payload(
          "status",
          func a = switch (a.status) {
            case (#submitted) "submitted";
            case (#underReview) "underReview";
            case (#upheld) "upheld";
            case (#denied) "denied";
            case (#withdrawn) "withdrawn";
          },
        )
        .payload("appellant", func a = a.appellant)
        .payload("subjectId", func a = a.subjectId)
        .payload("summary", func a = a.summary)
        .payload("decidedBy", func a = a.decidedBy)
        .payload("decisionNote", func a = a.decisionNote)
        .payload("timestamp", func a = a.timestamp)
        .controllerOnly()
        .build(),

      // The Participation Census is a privacy-aware accountability record:
      // confidential entries are recorded as participation without exposing
      // the detail. The entity is controller-only so the Data Intelligence
      // agent can answer aggregate questions while no end user reads another
      // Nation's census rows.
      OQL.Entity.manual<Sovereign.CensusEntry>("censusEntry", func () = censusEntries.values(), "CensusEntry", "id")
        .sample({
          id = 0;
          nation = 0;
          kind = #activity;
          subject = anyP;
          referenceId = 0;
          summary = "";
          confidential = false;
          constitutionVersion = 0;
          timestamp = 0;
        })
        .payload("id", func c = c.id)
        .payload("nation", func c = c.nation)
        .payload(
          "kind",
          func c = switch (c.kind) {
            case (#membershipApproval) "membershipApproval";
            case (#activity) "activity";
            case (#proposal) "proposal";
            case (#vote) "vote";
            case (#delegation) "delegation";
            case (#permissionChange) "permissionChange";
            case (#dispute) "dispute";
            case (#executionOutcome) "executionOutcome";
          },
        )
        .payload("subject", func c = c.subject)
        .payload("referenceId", func c = c.referenceId)
        .payload("summary", func c = c.summary)
        .payload("confidential", func c = c.confidential)
        .payload("constitutionVersion", func c = c.constitutionVersion)
        .payload("timestamp", func c = c.timestamp)
        .controllerOnly()
        .build(),

      // -----------------------------------------------------------------
      // Constitutional enforcement — membership onboarding, per-member
      // admission, one recorded vote per member per decision, and the
      // append-only per-Nation governance history. Every record is
      // Nation-scoped and private by default, so every entity here is
      // controller-only: the Data Intelligence agent (acting as controller)
      // can answer aggregate questions while no end user reads another
      // Nation's onboarding or governance records. Variant fields are
      // projected as Text tags; the `approvers : [Principal]` array on
      // JoinRequest is omitted (arrays are not a supported OQL column type).
      // -----------------------------------------------------------------

      OQL.Entity.manual<Sovereign.JoinRequest>("joinRequest", func () = joinRequests.values(), "JoinRequest", "id")
        .sample({
          id = 0;
          nation = 0;
          applicant = anyP;
          displayName = "";
          message = "";
          status = #pendingReview;
          approvers = [];
          requiredApprovals = 0;
          constitutionVersion = 0;
          expiresAt = 0;
          timestamp = 0;
        })
        .payload("id", func r = r.id)
        .payload("nation", func r = r.nation)
        .payload("applicant", func r = r.applicant)
        .payload("displayName", func r = r.displayName)
        .payload("message", func r = r.message)
        .payload(
          "status",
          func r = switch (r.status) {
            case (#pendingReview) "pendingReview";
            case (#underReview) "underReview";
            case (#approved) "approved";
            case (#active) "active";
            case (#rejected) "rejected";
            case (#withdrawn) "withdrawn";
            case (#expired) "expired";
          },
        )
        .payload("requiredApprovals", func r = r.requiredApprovals)
        .payload("constitutionVersion", func r = r.constitutionVersion)
        .payload("expiresAt", func r = r.expiresAt)
        .payload("timestamp", func r = r.timestamp)
        .controllerOnly()
        .build(),

      OQL.Entity.manual<Sovereign.MembershipInvitation>("membershipInvitation", func () = membershipInvitations.values(), "MembershipInvitation", "id")
        .sample({
          id = 0;
          nation = 0;
          token = "";
          invitedEmail = ?"";
          acceptedBy = null;
          issuedBy = anyP;
          expiresAt = 0;
          active = false;
          timestamp = 0;
        })
        .payload("id", func i = i.id)
        .payload("nation", func i = i.nation)
        .payload("invitedEmail", func i = i.invitedEmail)
        .payload("acceptedBy", func i = i.acceptedBy)
        .payload("issuedBy", func i = i.issuedBy)
        .payload("expiresAt", func i = i.expiresAt)
        .payload("active", func i = i.active)
        .payload("timestamp", func i = i.timestamp)
        .controllerOnly()
        .build(),

      OQL.Entity.manual<Sovereign.MemberAdmission>("memberAdmission", func () = memberAdmissions.values(), "MemberAdmission", "id")
        .sample({
          id = 0;
          nation = 0;
          member = anyP;
          admittedAt = 0;
          constitutionVersion = 0;
          timestamp = 0;
        })
        .payload("id", func a = a.id)
        .payload("nation", func a = a.nation)
        .payload("member", func a = a.member)
        .payload("admittedAt", func a = a.admittedAt)
        .payload("constitutionVersion", func a = a.constitutionVersion)
        .payload("timestamp", func a = a.timestamp)
        .controllerOnly()
        .build(),

      OQL.Entity.manual<Sovereign.RecordedVote>("recordedVote", func () = recordedVotes.values(), "RecordedVote", "id")
        .sample({
          id = 0;
          nation = 0;
          decision = #governanceProposal(0);
          voter = anyP;
          choice = #inFavor;
          confidential = false;
          timestamp = 0;
        })
        .payload("id", func v = v.id)
        .payload("nation", func v = v.nation)
        .payload(
          "decision",
          func v = switch (v.decision) {
            case (#governanceProposal(id)) "governanceProposal:" # id.toText();
            case (#nationProposal(id)) "nationProposal:" # id.toText();
          },
        )
        .payload("voter", func v = v.voter)
        .payload(
          "choice",
          func v = switch (v.choice) {
            case (#inFavor) "inFavor";
            case (#against) "against";
            case (#abstain) "abstain";
          },
        )
        .payload("confidential", func v = v.confidential)
        .payload("timestamp", func v = v.timestamp)
        .controllerOnly()
        .build(),

      OQL.Entity.manual<Sovereign.GovernanceHistoryEntry>("governanceHistory", func () = governanceHistory.values(), "GovernanceHistoryEntry", "id")
        .sample({
          id = 0;
          nation = 0;
          kind = #appointment;
          actorPrincipal = anyP;
          referenceId = 0;
          summary = "";
          constitutionVersion = 0;
          timestamp = 0;
        })
        .payload("id", func h = h.id)
        .payload("nation", func h = h.nation)
        .payload(
          "kind",
          func h = switch (h.kind) {
            case (#appointment) "appointment";
            case (#acceptance) "acceptance";
            case (#approval) "approval";
            case (#rejection) "rejection";
            case (#vote) "vote";
            case (#amendment) "amendment";
          },
        )
        .payload("actorPrincipal", func h = h.actorPrincipal)
        .payload("referenceId", func h = h.referenceId)
        .payload("summary", func h = h.summary)
        .payload("constitutionVersion", func h = h.constitutionVersion)
        .payload("timestamp", func h = h.timestamp)
        .controllerOnly()
        .build(),

      // -----------------------------------------------------------------
      // DAO lifecycle & constitutional continuity — member departures and
      // emergency suspensions. Both are Nation-scoped and private by
      // default, so each entity is controller-only: the Data Intelligence
      // agent (acting as controller) can answer aggregate questions while no
      // end user reads another Nation's departure or emergency records.
      // Variant fields are projected as Text tags; the `affectedAccounts`
      // and `affectedFunctions` arrays and the `auditTrail` array on
      // EmergencySuspension are omitted (arrays are not a supported OQL
      // column type).
      // -----------------------------------------------------------------

      OQL.Entity.manual<Sovereign.MemberDeparture>("memberDeparture", func () = memberDepartures.values(), "MemberDeparture", "id")
        .sample({
          id = 0;
          nation = 0;
          member = anyP;
          kind = #voluntaryDeparture;
          status = #notice;
          notice = "";
          reviewNote = "";
          appealReference = null;
          effectiveAt = 0;
          permissionRevokedAt = null;
          recordedBy = anyP;
          timestamp = 0;
        })
        .payload("id", func d = d.id)
        .payload("nation", func d = d.nation)
        .payload("member", func d = d.member)
        .payload(
          "kind",
          func d = switch (d.kind) {
            case (#voluntaryDeparture) "voluntaryDeparture";
            case (#retirement) "retirement";
            case (#suspension) "suspension";
            case (#constitutionalRemoval) "constitutionalRemoval";
          },
        )
        .payload(
          "status",
          func d = switch (d.status) {
            case (#notice) "notice";
            case (#underReview) "underReview";
            case (#effective) "effective";
            case (#appealed) "appealed";
            case (#withdrawn) "withdrawn";
          },
        )
        .payload("notice", func d = d.notice)
        .payload("reviewNote", func d = d.reviewNote)
        .payload("appealReference", func d = d.appealReference)
        .payload("effectiveAt", func d = d.effectiveAt)
        .payload("permissionRevokedAt", func d = d.permissionRevokedAt)
        .payload("recordedBy", func d = d.recordedBy)
        .payload("timestamp", func d = d.timestamp)
        .controllerOnly()
        .build(),

      OQL.Entity.manual<Sovereign.EmergencySuspension>("emergencySuspension", func () = emergencySuspensions.values(), "EmergencySuspension", "id")
        .sample({
          id = 0;
          nation = 0;
          reason = "";
          affectedAccounts = [];
          affectedFunctions = [];
          approvingAuthorities = [];
          status = #active;
          expiresAt = 0;
          auditTrail = [];
          restoration = null;
          requestedBy = anyP;
          timestamp = 0;
        })
        .payload("id", func s = s.id)
        .payload("nation", func s = s.nation)
        .payload("reason", func s = s.reason)
        .payload(
          "status",
          func s = switch (s.status) {
            case (#active) "active";
            case (#restored) "restored";
            case (#expired) "expired";
          },
        )
        .payload("expiresAt", func s = s.expiresAt)
        .payload("requestedBy", func s = s.requestedBy)
        .payload("timestamp", func s = s.timestamp)
        .controllerOnly()
        .build(),

      // -----------------------------------------------------------------
      // DAO lifecycle & constitutional continuity — lifecycle state,
      // authority positions and term events, the succession and recovery
      // plan, constitution versions, amendment proposals and dissolutions.
      // Every record is Nation-scoped and private by default, so each
      // entity is controller-only: the Data Intelligence agent (acting as
      // controller) can answer aggregate questions while no end user reads
      // another Nation's continuity records. Variant fields are projected
      // as Text tags; nested rule sets, change lists, ratification lists
      // and other arrays are omitted (arrays and nested records are not
      // supported OQL column types).
      // -----------------------------------------------------------------

      OQL.Entity.manual<Sovereign.NationLifecycle>("nationLifecycle", func () = nationLifecycles.values(), "NationLifecycle", "nation")
        .sample({
          nation = 0;
          state = #draft;
          enteredAt = 0;
          reason = "";
          causedBy = anyP;
          constitutionVersion = 0;
          timestamp = 0;
        })
        .payload("nation", func l = l.nation)
        .payload(
          "state",
          func l = switch (l.state) {
            case (#draft) "draft";
            case (#pendingActivation) "pendingActivation";
            case (#active) "active";
            case (#restrictedGovernance) "restrictedGovernance";
            case (#temporarilySuspended) "temporarilySuspended";
            case (#pendingDissolution) "pendingDissolution";
            case (#archived) "archived";
          },
        )
        .payload("enteredAt", func l = l.enteredAt)
        .payload("reason", func l = l.reason)
        .payload("causedBy", func l = l.causedBy)
        .payload("constitutionVersion", func l = l.constitutionVersion)
        .payload("timestamp", func l = l.timestamp)
        .controllerOnly()
        .build(),

      OQL.Entity.manual<Sovereign.AuthorityPosition>("authorityPosition", func () = authorityPositions.values(), "AuthorityPosition", "id")
        .sample({
          id = 0;
          nation = 0;
          seatLabel = "";
          termStart = 0;
          termEnd = 0;
          holder = null;
          holderDisplayLabel = "";
          status = #vacant;
          timestamp = 0;
        })
        .payload("id", func p = p.id)
        .payload("nation", func p = p.nation)
        .payload("seatLabel", func p = p.seatLabel)
        .payload("termStart", func p = p.termStart)
        .payload("termEnd", func p = p.termEnd)
        .payload("holder", func p = p.holder)
        .payload("holderDisplayLabel", func p = p.holderDisplayLabel)
        .payload(
          "status",
          func p = switch (p.status) {
            case (#vacant) "vacant";
            case (#filled) "filled";
            case (#suspended) "suspended";
            case (#retired) "retired";
          },
        )
        .payload("timestamp", func p = p.timestamp)
        .controllerOnly()
        .build(),

      OQL.Entity.manual<Sovereign.AuthorityTermEvent>("authorityTermEvent", func () = authorityTermEvents.values(), "AuthorityTermEvent", "id")
        .sample({
          id = 0;
          nation = 0;
          position = 0;
          kind = #appointment;
          subject = anyP;
          actingPrincipal = anyP;
          reason = "";
          approvals = [];
          constitutionVersion = 0;
          timestamp = 0;
        })
        .payload("id", func e = e.id)
        .payload("nation", func e = e.nation)
        .payload("position", func e = e.position)
        .payload(
          "kind",
          func e = switch (e.kind) {
            case (#appointment) "appointment";
            case (#acceptance) "acceptance";
            case (#resignation) "resignation";
            case (#retirement) "retirement";
            case (#replacement) "replacement";
            case (#removal) "removal";
          },
        )
        .payload("subject", func e = e.subject)
        .payload("actingPrincipal", func e = e.actingPrincipal)
        .payload("reason", func e = e.reason)
        .payload("constitutionVersion", func e = e.constitutionVersion)
        .payload("timestamp", func e = e.timestamp)
        .controllerOnly()
        .build(),

      OQL.Entity.manual<Sovereign.SuccessionRecoveryPlan>("successionPlan", func () = successionPlans.values(), "SuccessionRecoveryPlan", "nation")
        .sample({
          nation = 0;
          designatedSuccessors = [];
          alternateAuthorities = [];
          membershipCouncil = [];
          recoveryTrustees = [];
          recoveryApprovalThreshold = 0;
          identityRecoveryProcedure = "";
          ratifications = [];
          ratified = false;
          timestamp = 0;
        })
        .payload("nation", func p = p.nation)
        .payload("recoveryApprovalThreshold", func p = p.recoveryApprovalThreshold)
        .payload("identityRecoveryProcedure", func p = p.identityRecoveryProcedure)
        .payload("ratified", func p = p.ratified)
        .payload("timestamp", func p = p.timestamp)
        .controllerOnly()
        .build(),

      OQL.Entity.manual<Sovereign.ConstitutionVersion>("constitutionVersion", func () = constitutionVersions.values(), "ConstitutionVersion", "id")
        .sample({
          id = 0;
          nation = 0;
          version = 0;
          rules = ConstitutionLib.defaultRuleSet("custom");
          producedByAmendment = null;
          authorizingAuthority = anyP;
          effectiveDate = 0;
          ratifications = [];
          timestamp = 0;
        })
        .payload("id", func v = v.id)
        .payload("nation", func v = v.nation)
        .payload("version", func v = v.version)
        .payload("producedByAmendment", func v = v.producedByAmendment)
        .payload("authorizingAuthority", func v = v.authorizingAuthority)
        .payload("effectiveDate", func v = v.effectiveDate)
        .payload("timestamp", func v = v.timestamp)
        .controllerOnly()
        .build(),

      OQL.Entity.manual<Sovereign.AmendmentProposal>("amendmentProposal", func () = amendmentProposals.values(), "AmendmentProposal", "id")
        .sample({
          id = 0;
          nation = 0;
          title = "";
          summary = "";
          baseConstitutionVersion = 0;
          changes = [];
          discussionThread = null;
          votingEligibility = "";
          quorumPercent = 0;
          approvalThresholdPercent = 0;
          votingDeadline = 0;
          abstentionHandling = #excludedFromDenominator;
          status = #discussion;
          ratifications = [];
          effectiveDate = null;
          proposer = anyP;
          timestamp = 0;
        })
        .payload("id", func a = a.id)
        .payload("nation", func a = a.nation)
        .payload("title", func a = a.title)
        .payload("summary", func a = a.summary)
        .payload("baseConstitutionVersion", func a = a.baseConstitutionVersion)
        .payload("votingEligibility", func a = a.votingEligibility)
        .payload("quorumPercent", func a = a.quorumPercent)
        .payload("approvalThresholdPercent", func a = a.approvalThresholdPercent)
        .payload("votingDeadline", func a = a.votingDeadline)
        .payload(
          "abstentionHandling",
          func a = switch (a.abstentionHandling) {
            case (#countTowardQuorum) "countTowardQuorum";
            case (#excludedFromDenominator) "excludedFromDenominator";
          },
        )
        .payload(
          "status",
          func a = switch (a.status) {
            case (#discussion) "discussion";
            case (#voting) "voting";
            case (#ratified) "ratified";
            case (#rejected) "rejected";
            case (#withdrawn) "withdrawn";
          },
        )
        .payload("effectiveDate", func a = a.effectiveDate)
        .payload("proposer", func a = a.proposer)
        .payload("timestamp", func a = a.timestamp)
        .controllerOnly()
        .build(),

      OQL.Entity.manual<Sovereign.Dissolution>("dissolution", func () = dissolutions.values(), "Dissolution", "id")
        .sample({
          id = 0;
          nation = 0;
          proposal = "";
          explanation = "";
          memberNotifiedAt = null;
          status = #proposed;
          tally = {
            votesInFavor = 0;
            votesAgainst = 0;
            votesAbstain = 0;
            quorumPercent = 0;
            approvalThresholdPercent = 0;
          };
          coolingOffEnd = 0;
          obligationsReview = null;
          dataExportReference = null;
          finalConfirmation = null;
          archivedAt = null;
          proposer = anyP;
          timestamp = 0;
        })
        .payload("id", func d = d.id)
        .payload("nation", func d = d.nation)
        .payload("proposal", func d = d.proposal)
        .payload("explanation", func d = d.explanation)
        .payload("memberNotifiedAt", func d = d.memberNotifiedAt)
        .payload(
          "status",
          func d = switch (d.status) {
            case (#proposed) "proposed";
            case (#coolingOff) "coolingOff";
            case (#voting) "voting";
            case (#approved) "approved";
            case (#archived) "archived";
            case (#rejected) "rejected";
            case (#withdrawn) "withdrawn";
          },
        )
        .payload("votesInFavor", func d = d.tally.votesInFavor)
        .payload("votesAgainst", func d = d.tally.votesAgainst)
        .payload("votesAbstain", func d = d.tally.votesAbstain)
        .payload("coolingOffEnd", func d = d.coolingOffEnd)
        .payload("dataExportReference", func d = d.dataExportReference)
        .payload("archivedAt", func d = d.archivedAt)
        .payload("proposer", func d = d.proposer)
        .payload("timestamp", func d = d.timestamp)
        .controllerOnly()
        .build(),

      // -----------------------------------------------------------------
      // Founding council — the founding setup and the founding authority
      // appointments. Both are Nation-scoped and private by default, so each
      // entity is controller-only. Variant fields are projected as Text tags.
      // -----------------------------------------------------------------

      OQL.Entity.manual<Sovereign.FoundingSetup>("foundingSetup", func () = foundingSetups.values(), "FoundingSetup", "nation")
        .sample({
          nation = 0;
          status = #foundingSetup;
          foundingAuthority = anyP;
          setupExpiresAt = 0;
          activatedConstitutionVersion = null;
          timestamp = 0;
        })
        .payload("nation", func s = s.nation)
        .payload(
          "status",
          func s = switch (s.status) {
            case (#foundingSetup) "foundingSetup";
            case (#activated) "activated";
            case (#cancelled) "cancelled";
            case (#expired) "expired";
          },
        )
        .payload("foundingAuthority", func s = s.foundingAuthority)
        .payload("setupExpiresAt", func s = s.setupExpiresAt)
        .payload("activatedConstitutionVersion", func s = s.activatedConstitutionVersion)
        .payload("timestamp", func s = s.timestamp)
        .controllerOnly()
        .build(),

      OQL.Entity.manual<Sovereign.FoundingAppointment>("foundingAppointment", func () = foundingAppointments.values(), "FoundingAppointment", "id")
        .sample({
          id = 0;
          nation = 0;
          authority = anyP;
          appointmentLabel = "";
          status = #pending;
          expiresAt = 0;
          invitationToken = "";
          invitedEmail = null;
          acceptedAt = null;
          timestamp = 0;
        })
        .payload("id", func a = a.id)
        .payload("nation", func a = a.nation)
        .payload("authority", func a = a.authority)
        .payload("appointmentLabel", func a = a.appointmentLabel)
        .payload(
          "status",
          func a = switch (a.status) {
            case (#pending) "pending";
            case (#accepted) "accepted";
            case (#declined) "declined";
            case (#expired) "expired";
            case (#replaced) "replaced";
          },
        )
        .payload("expiresAt", func a = a.expiresAt)
        .payload("invitedEmail", func a = a.invitedEmail)
        .payload("acceptedAt", func a = a.acceptedAt)
        .payload("timestamp", func a = a.timestamp)
        .controllerOnly()
        .build(),
    ];
  });

  include ApiDocMixin();
};
