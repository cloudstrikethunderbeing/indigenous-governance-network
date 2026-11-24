// SOVEREIGN Discovery — Collective Intelligence & Collaboration Network.
//
// This module defines the Discovery data model only. It is additive to the
// existing DAO economy, governance, treasury, staking, waitlist and visitor
// domains: nothing here changes or replaces an existing type.
//
// Privacy model: a community's private submissions, private profile fields
// and private contact details are never returned to another community.
// Contact details are returned only after both parties approve an
// introduction. AI is advisory only — it classifies and explains, and never
// writes governance state.
import Common "common";

module {
  // Shared types reused from the common module: `Timestamp` (Int
  // nanoseconds) and `ProposalId` (the governance proposal identifier a
  // pipeline item links to once a formal proposal exists).
  public type Timestamp = Common.Timestamp;
  public type ProposalId = Common.ProposalId;

  // ---------------------------------------------------------------------
  // Identifiers
  // ---------------------------------------------------------------------

  public type CommunityId = Nat;
  public type SubmissionId = Nat;
  public type PipelineItemId = Nat;
  public type CollaborationProfileId = Nat;
  public type IntroductionRequestId = Nat;
  public type ActivityEntryId = Nat;

  // ---------------------------------------------------------------------
  // Community profile
  //
  // A community's published identity for discovery. `discoveryOptIn` gates
  // whether the community appears in the network at all; `visibility`
  // controls whether the profile is readable by every community or only by
  // communities the owner has approved.
  // ---------------------------------------------------------------------

  public type CommunityVisibility = { #publicVisible; #privateVisible };

  public type CommunityProfile = {
    id : CommunityId;
    // The principal that owns and may edit this profile.
    owner : Principal;
    name : Text;
    description : Text;
    region : Text;
    objectives : [Text];
    // Skills the community publishes for matching.
    skills : [Text];
    interests : [Text];
    // Concrete needs the community is seeking help with.
    projectNeeds : [Text];
    // Partnership opportunities the community is offering.
    partnershipOpportunities : [Text];
    // Opt-in flag: false keeps the community out of discovery entirely.
    discoveryOptIn : Bool;
    visibility : CommunityVisibility;
    timestamp : Timestamp;
  };

  // ---------------------------------------------------------------------
  // Discovery submissions
  //
  // A natural-language idea, feedback note, need, opportunity or potential
  // proposal. The classification is produced by the advisory intelligence
  // service (with deterministic keyword matching as the fallback) and is
  // never a governance decision.
  // ---------------------------------------------------------------------

  public type SubmissionClassification = {
    #idea;
    #feedback;
    #need;
    #opportunity;
    #potentialProposal;
  };

  public type SubmissionVisibility = { #publicVisible; #communityOnly };

  public type DiscoverySubmission = {
    id : SubmissionId;
    author : Principal;
    // The community the submission belongs to. Community-level isolation is
    // enforced against this field.
    community : CommunityId;
    body : Text;
    classification : SubmissionClassification;
    category : Text;
    interestTags : [Text];
    visibility : SubmissionVisibility;
    timestamp : Timestamp;
  };

  // ---------------------------------------------------------------------
  // Idea-to-proposal pipeline
  //
  // A visible progression: Idea -> Community Feedback -> Collaboration ->
  // Draft Proposal -> Governance Vote -> Approved Action -> Results. Once a
  // formal proposal exists, `proposalId` links to the governance proposal
  // created by the existing governance domain.
  // ---------------------------------------------------------------------

  public type PipelineStage = {
    #idea;
    #communityFeedback;
    #collaboration;
    #draftProposal;
    #governanceVote;
    #approvedAction;
    #results;
  };

  public type PipelineItem = {
    id : PipelineItemId;
    community : CommunityId;
    // The submission that originated this pipeline item.
    submissionId : SubmissionId;
    title : Text;
    stage : PipelineStage;
    // Set once a formal governance proposal has been created from this item.
    proposalId : ?ProposalId;
    timestamp : Timestamp;
  };

  // A comment, support expression or improvement suggestion on a pipeline
  // item. `kind` distinguishes the three interaction types.
  public type PipelineInteractionKind = {
    #comment;
    #support;
    #improvement;
  };

  public type PipelineInteraction = {
    id : Nat;
    pipelineItemId : PipelineItemId;
    author : Principal;
    kind : PipelineInteractionKind;
    body : Text;
    timestamp : Timestamp;
  };

  // ---------------------------------------------------------------------
  // Collaboration profiles and introductions
  //
  // Members and communities may publish skills, interests, needs and
  // partnership opportunities, and opt in to discovery. An introduction
  // request between two parties requires mutual approval before any private
  // contact details are shared.
  // ---------------------------------------------------------------------

  public type CollaborationParty = { #member : Principal; #community : CommunityId };

  public type CollaborationProfile = {
    id : CollaborationProfileId;
    party : CollaborationParty;
    displayName : Text;
    skills : [Text];
    interests : [Text];
    needs : [Text];
    partnershipOpportunities : [Text];
    // Opt-in flag: false keeps this party out of collaborator matching.
    discoveryOptIn : Bool;
    timestamp : Timestamp;
  };

  public type IntroductionStatus = { #pending; #approved; #declined };

  public type IntroductionRequest = {
    id : IntroductionRequestId;
    requester : CollaborationParty;
    // The party the requester wants to be introduced to.
    target : CollaborationParty;
    message : Text;
    // The requester's approval is implicit at creation; `targetApproved`
    // records the other side. Both must be true before contact is shared.
    requesterApproved : Bool;
    targetApproved : Bool;
    status : IntroductionStatus;
    timestamp : Timestamp;
  };

  // ---------------------------------------------------------------------
  // Network activity feed
  //
  // Public ideas, proposals, partnerships and community milestones. Only
  // real recorded events appear here — never invented activity.
  // ---------------------------------------------------------------------

  public type ActivityKind = {
    #publicIdea;
    #proposal;
    #partnership;
    #communityMilestone;
  };

  public type NetworkActivityEntry = {
    id : ActivityEntryId;
    kind : ActivityKind;
    community : CommunityId;
    summary : Text;
    timestamp : Timestamp;
  };

  // ---------------------------------------------------------------------
  // Recommendations
  //
  // A recommendation is always derived from stored information and carries
  // a short human-readable explanation, for example "Both communities are
  // exploring renewable energy."
  // ---------------------------------------------------------------------

  public type RecommendationKind = {
    #similarIdea;
    #relevantProposal;
    #collaborationPartner;
    #matchingMember;
    #sharedObjective;
    #suggestedNextStep;
  };

  public type Recommendation = {
    kind : RecommendationKind;
    // The referenced entity id, interpreted according to `kind`.
    referenceId : Nat;
    title : Text;
    explanation : Text;
  };

  // ---------------------------------------------------------------------
  // Collective intelligence metrics
  //
  // Every metric is derived from stored records. Empty states are reported
  // as zero, never as fabricated statistics.
  // ---------------------------------------------------------------------

  public type CollectiveIntelligenceMetrics = {
    activeCommunities : Nat;
    ideasSubmitted : Nat;
    collaborationOpportunities : Nat;
    activeProposals : Nat;
    successfulPartnerships : Nat;
    completedInitiatives : Nat;
  };

  // ---------------------------------------------------------------------
  // Directory search
  // ---------------------------------------------------------------------

  public type DirectoryEntryKind = { #community; #opportunity };

  public type DirectoryEntry = {
    kind : DirectoryEntryKind;
    referenceId : Nat;
    title : Text;
    description : Text;
    tags : [Text];
  };

  // ---------------------------------------------------------------------
  // Submission results and errors
  //
  // Validation and authorization failures are returned to the caller as
  // variants rather than traps, so the frontend can present an actionable
  // message and the caller can retry.
  // ---------------------------------------------------------------------

  public type DiscoveryError = {
    #missingBody;
    #bodyTooLong;
    #missingTitle;
    #unknownCommunity;
    #unknownSubmission;
    #unknownPipelineItem;
    #unknownIntroduction;
    #unknownProfile;
    #notAuthorized;
    #notCommunityMember;
    #alreadyApproved;
    #invalidStageTransition;
    #invalidIntroductionState;
  };

  public type SubmitDiscoveryResult = {
    #ok : { id : SubmissionId; classification : SubmissionClassification };
    #err : DiscoveryError;
  };

  public type CreatePipelineItemResult = {
    #ok : PipelineItemId;
    #err : DiscoveryError;
  };

  public type AdvancePipelineResult = {
    #ok : PipelineStage;
    #err : DiscoveryError;
  };

  public type AddInteractionResult = {
    #ok : Nat;
    #err : DiscoveryError;
  };

  public type CreateProposalFromItemResult = {
    #ok : ProposalId;
    #err : DiscoveryError;
  };

  public type SaveCommunityProfileResult = {
    #ok : CommunityId;
    #err : DiscoveryError;
  };

  public type SaveCollaborationProfileResult = {
    #ok : CollaborationProfileId;
    #err : DiscoveryError;
  };

  public type RequestIntroductionResult = {
    #ok : IntroductionRequestId;
    #err : DiscoveryError;
  };

  public type RespondIntroductionResult = {
    #ok : IntroductionStatus;
    #err : DiscoveryError;
  };
};
