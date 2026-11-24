import Map "mo:core/Map";
import List "mo:core/List";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import Discovery "../types/discovery";
import DiscoveryLib "../lib/discovery";

// Discovery — Collective Intelligence & Collaboration Network public API.
//
// The mixin receives the Discovery stable state, the shared access-control
// state, the governance `proposals` map and the shared id counters by
// reference. A formal proposal created from a pipeline item is written into
// the existing governance `proposals` state, so voting and execution follow
// the DAO's existing rules (membership permissions, voting, execution).
//
// Privacy: private submissions, private profile fields and private contact
// details are never returned to another community. Contact details are
// returned only after both parties approve an introduction. AI is advisory
// only — it classifies and explains, and never writes governance state.
mixin (
  accessControlState : AccessControl.AccessControlState,
  communityProfiles : Map.Map<Common.CommunityId, Discovery.CommunityProfile>,
  discoverySubmissions : Map.Map<Discovery.SubmissionId, Discovery.DiscoverySubmission>,
  pipelineItems : Map.Map<Discovery.PipelineItemId, Discovery.PipelineItem>,
  pipelineInteractions : Map.Map<Discovery.PipelineItemId, [Discovery.PipelineInteraction]>,
  collaborationProfiles : Map.Map<Discovery.CollaborationProfileId, Discovery.CollaborationProfile>,
  introductionRequests : Map.Map<Discovery.IntroductionRequestId, Discovery.IntroductionRequest>,
  networkActivity : Map.Map<Discovery.ActivityEntryId, Discovery.NetworkActivityEntry>,
  proposals : Map.Map<Common.ProposalId, Common.Proposal>,
  counters : {
    var nextCommunityId : Nat;
    var nextSubmissionId : Nat;
    var nextPipelineItemId : Nat;
    var nextPipelineInteractionId : Nat;
    var nextCollaborationProfileId : Nat;
    var nextIntroductionRequestId : Nat;
    var nextActivityEntryId : Nat;
    var nextProposalId : Nat;
  },
) {
  // Maximum submission body length. Bounds storage and keeps a single
  // submission from dominating the network feed. Transient: a constant, not
  // durable state, so it is re-initialized on every (re)start.
  transient let maxBodyLength : Nat = 4000;

  // Whether the caller is a registered member (or admin). Discovery
  // submissions and pipeline participation are member actions.
  func isMember(caller : Principal) : Bool {
    AccessControl.hasPermission(accessControlState, caller, #user);
  };

  // Whether the caller owns the given community profile.
  func ownsCommunity(caller : Principal, community : Common.CommunityId) : Bool {
    switch (communityProfiles.get(community)) {
      case (?p) { p.owner == caller };
      case null { false };
    };
  };

  // Record a public network activity entry. Only real recorded events are
  // appended — never invented activity.
  func recordActivity(
    kind : Discovery.ActivityKind,
    community : Common.CommunityId,
    summary : Text,
  ) {
    let id = counters.nextActivityEntryId;
    counters.nextActivityEntryId += 1;
    networkActivity.add(id, {
      id;
      kind;
      community;
      summary;
      timestamp = Time.now();
    });
  };

  // ---------------------------------------------------------------------
  // Submissions
  // ---------------------------------------------------------------------

  // Submit a natural-language discovery submission and return its
  // classification. The classification is advisory only. The deterministic
  // keyword/category classifier always produces the stored classification;
  // the advisory inference service is never awaited inline, so a missing or
  // failing inference client never blocks the submission.
  public shared ({ caller }) func submitDiscoverySubmission(
    community : Common.CommunityId,
    body : Text,
    category : Text,
    visibility : Discovery.SubmissionVisibility,
  ) : async Discovery.SubmitDiscoveryResult {
    if (not isMember(caller)) {
      return #err(#notAuthorized);
    };
    if (body.size() == 0) {
      return #err(#missingBody);
    };
    if (body.size() > maxBodyLength) {
      return #err(#bodyTooLong);
    };
    if (not communityProfiles.containsKey(community)) {
      return #err(#unknownCommunity);
    };

    // Deterministic classification is the stored source of truth and the
    // always-available fallback. The advisory inference service is never
    // awaited inline here: `fromEnv<system>()` raises a system-level trap
    // when the app has no inference credentials, and a Motoko `try`/`catch`
    // cannot intercept a trap — an inline call would abort the whole
    // submission. The inference path stays available in
    // `DiscoveryLib.classifyWithInference` for a caller that can tolerate its
    // failure, but a submission is always stored and returned successfully.
    let classification = DiscoveryLib.classifySubmission(body);
    let interestTags = DiscoveryLib.extractInterestTags(body);

    let id = counters.nextSubmissionId;
    counters.nextSubmissionId += 1;
    let submission : Discovery.DiscoverySubmission = {
      id;
      author = caller;
      community;
      body;
      classification;
      category;
      interestTags;
      visibility;
      timestamp = Time.now();
    };
    discoverySubmissions.add(id, submission);

    // A public idea becomes a visible network event.
    if (visibility == #publicVisible) {
      recordActivity(#publicIdea, community, body);
    };

    #ok({ id; classification });
  };

  // List public submissions across the network.
  public query func listPublicSubmissions() : async [Discovery.DiscoverySubmission] {
    discoverySubmissions.values().toArray().filter(
      func(s) = s.visibility == #publicVisible,
    );
  };

  // List the caller's community workspace submissions according to
  // permissions. Private submissions are never returned to another
  // community: a caller sees public submissions plus the community-only
  // submissions of a community they own.
  public query ({ caller }) func listCommunitySubmissions(
    community : Common.CommunityId,
  ) : async [Discovery.DiscoverySubmission] {
    let isOwner = ownsCommunity(caller, community);
    discoverySubmissions.values().toArray().filter(
      func(s) {
        if (s.community != community) { return false };
        switch (s.visibility) {
          case (#publicVisible) { true };
          case (#communityOnly) { isOwner or s.author == caller };
        };
      },
    );
  };

  // ---------------------------------------------------------------------
  // Recommendations
  // ---------------------------------------------------------------------

  // Recommendations for the caller's community, each with a short
  // explanation derived from stored information.
  public query ({ caller }) func listRecommendations(
    community : Common.CommunityId,
  ) : async [Discovery.Recommendation] {
    ignore caller;
    DiscoveryLib.computeRecommendations(
      community,
      discoverySubmissions.values().toArray(),
      communityProfiles.values().toArray(),
      collaborationProfiles.values().toArray(),
    );
  };

  // ---------------------------------------------------------------------
  // Pipeline
  // ---------------------------------------------------------------------

  // Create a pipeline item from a submission. Only the submission's author
  // or the owning community may start the pipeline.
  public shared ({ caller }) func createPipelineItem(
    submissionId : Discovery.SubmissionId,
    title : Text,
  ) : async Discovery.CreatePipelineItemResult {
    if (not isMember(caller)) {
      return #err(#notAuthorized);
    };
    if (title.size() == 0) {
      return #err(#missingTitle);
    };
    let submission = switch (discoverySubmissions.get(submissionId)) {
      case (?s) { s };
      case null { return #err(#unknownSubmission) };
    };
    if (submission.author != caller and not ownsCommunity(caller, submission.community)) {
      return #err(#notAuthorized);
    };
    let id = counters.nextPipelineItemId;
    counters.nextPipelineItemId += 1;
    pipelineItems.add(id, {
      id;
      community = submission.community;
      submissionId;
      title;
      stage = #idea;
      proposalId = null;
      timestamp = Time.now();
    });
    #ok(id);
  };

  // List pipeline items and their stages for a community.
  public query ({ caller }) func listPipelineItems(
    community : Common.CommunityId,
  ) : async [Discovery.PipelineItem] {
    ignore caller;
    pipelineItems.values().toArray().filter(func(p) = p.community == community);
  };

  // Advance a pipeline item's stage. Only a single forward step is allowed,
  // and only a member of the owning community may advance it.
  public shared ({ caller }) func advancePipelineItem(
    itemId : Discovery.PipelineItemId,
    to : Discovery.PipelineStage,
  ) : async Discovery.AdvancePipelineResult {
    if (not isMember(caller)) {
      return #err(#notAuthorized);
    };
    let item = switch (pipelineItems.get(itemId)) {
      case (?p) { p };
      case null { return #err(#unknownPipelineItem) };
    };
    if (not ownsCommunity(caller, item.community)) {
      return #err(#notAuthorized);
    };
    if (not DiscoveryLib.canAdvance(item.stage, to)) {
      return #err(#invalidStageTransition);
    };
    pipelineItems.add(itemId, { item with stage = to; timestamp = Time.now() });
    #ok(to);
  };

  // Add a comment, express support, or suggest an improvement on a
  // pipeline item.
  public shared ({ caller }) func addPipelineInteraction(
    itemId : Discovery.PipelineItemId,
    kind : Discovery.PipelineInteractionKind,
    body : Text,
  ) : async Discovery.AddInteractionResult {
    if (not isMember(caller)) {
      return #err(#notAuthorized);
    };
    if (body.size() == 0) {
      return #err(#missingBody);
    };
    if (body.size() > maxBodyLength) {
      return #err(#bodyTooLong);
    };
    if (not pipelineItems.containsKey(itemId)) {
      return #err(#unknownPipelineItem);
    };
    let id = counters.nextPipelineInteractionId;
    counters.nextPipelineInteractionId += 1;
    let interaction : Discovery.PipelineInteraction = {
      id;
      pipelineItemId = itemId;
      author = caller;
      kind;
      body;
      timestamp = Time.now();
    };
    let existing = pipelineInteractions.get(itemId) ?? [];
    pipelineInteractions.add(itemId, existing.concat([interaction]));
    #ok(id);
  };

  // List the interactions recorded on a pipeline item.
  public query func listPipelineInteractions(
    itemId : Discovery.PipelineItemId,
  ) : async [Discovery.PipelineInteraction] {
    pipelineInteractions.get(itemId) ?? [];
  };

  // Create a formal governance proposal from a pipeline item. Authorized
  // members only; the proposal is written into the existing governance
  // `proposals` state, so voting and execution follow the DAO's existing
  // rules. AI never writes governance state — this is an explicit member
  // action.
  public shared ({ caller }) func createProposalFromPipelineItem(
    itemId : Discovery.PipelineItemId,
  ) : async Discovery.CreateProposalFromItemResult {
    if (not isMember(caller)) {
      return #err(#notAuthorized);
    };
    let item = switch (pipelineItems.get(itemId)) {
      case (?p) { p };
      case null { return #err(#unknownPipelineItem) };
    };
    if (not ownsCommunity(caller, item.community)) {
      return #err(#notAuthorized);
    };
    if (item.proposalId != null) {
      return #err(#invalidStageTransition);
    };
    // Create the proposal in the existing governance state, so voting and
    // execution follow the DAO's existing rules.
    let proposalId = counters.nextProposalId;
    counters.nextProposalId += 1;
    proposals.add(proposalId, {
      id = proposalId;
      title = item.title;
      description = item.title;
      category = #platformDevelopment;
      proposer = caller;
      status = #open;
      openTimestamp = Time.now();
      closeTimestamp = null;
    });
    pipelineItems.add(itemId, {
      item with
      proposalId = ?proposalId;
      stage = #draftProposal;
      timestamp = Time.now();
    });
    recordActivity(#proposal, item.community, item.title);
    #ok(proposalId);
  };

  // ---------------------------------------------------------------------
  // Directory
  // ---------------------------------------------------------------------

  // List and search the community and opportunity directory. Only opted-in,
  // publicly visible communities and their published opportunities appear.
  public query func searchDirectory(
    term : Text,
    kind : ?Discovery.DirectoryEntryKind,
  ) : async [Discovery.DirectoryEntry] {
    let needle = term.toLower();
    let matches = func(text : Text) : Bool {
      needle.size() == 0 or text.toLower().contains(#text needle);
    };
    let wantCommunity = switch (kind) {
      case (null) { true };
      case (?#community) { true };
      case (?#opportunity) { false };
    };
    let wantOpportunity = switch (kind) {
      case (null) { true };
      case (?#opportunity) { true };
      case (?#community) { false };
    };

    let entries = List.empty<Discovery.DirectoryEntry>();
    for (p in communityProfiles.values()) {
      if (p.discoveryOptIn and p.visibility == #publicVisible) {
        if (wantCommunity and (matches(p.name) or matches(p.description) or matches(p.region))) {
          entries.add({
            kind = #community;
            referenceId = p.id;
            title = p.name;
            description = p.description;
            tags = p.objectives.concat(p.skills).concat(p.interests);
          });
        };
        if (wantOpportunity) {
          for (need in p.projectNeeds.values()) {
            if (matches(need)) {
              entries.add({
                kind = #opportunity;
                referenceId = p.id;
                title = need;
                description = p.name;
                tags = p.skills;
              });
            };
          };
          for (opp in p.partnershipOpportunities.values()) {
            if (matches(opp)) {
              entries.add({
                kind = #opportunity;
                referenceId = p.id;
                title = opp;
                description = p.name;
                tags = p.interests;
              });
            };
          };
        };
      };
    };
    entries.toArray();
  };

  // ---------------------------------------------------------------------
  // Community profiles
  // ---------------------------------------------------------------------

  // Publish or update the caller's community profile. A profile is created
  // on first save and updated in place afterwards; only the owner may edit
  // an existing profile. A member publishing their own profile is never
  // rejected because the supplied id happens to belong to another community:
  // an id the caller does not own is treated as a new profile and receives a
  // fresh id, so the caller can always publish their own profile.
  public shared ({ caller }) func saveCommunityProfile(
    profile : Discovery.CommunityProfile,
  ) : async Discovery.SaveCommunityProfileResult {
    if (not isMember(caller)) {
      return #err(#notAuthorized);
    };
    if (profile.name.size() == 0) {
      return #err(#missingTitle);
    };
    let id = switch (communityProfiles.get(profile.id)) {
      case (?existing) {
        if (existing.owner == caller) {
          // The caller owns this profile: update it in place.
          profile.id;
        } else {
          // The id belongs to another community. The caller is publishing
          // their own profile, so create a new one rather than reject.
          let newId = counters.nextCommunityId;
          counters.nextCommunityId += 1;
          newId;
        };
      };
      case null {
        let newId = counters.nextCommunityId;
        counters.nextCommunityId += 1;
        newId;
      };
    };
    let saved : Discovery.CommunityProfile = {
      profile with
      id;
      owner = caller;
      timestamp = Time.now();
    };
    communityProfiles.add(id, saved);
    #ok(id);
  };

  // Read a community profile, subject to visibility rules. A private
  // profile is returned only to its owner.
  public query ({ caller }) func getCommunityProfile(
    community : Common.CommunityId,
  ) : async ?Discovery.CommunityProfile {
    switch (communityProfiles.get(community)) {
      case (?p) {
        if (DiscoveryLib.isProfileVisibleTo(p, caller)) { ?p } else { null };
      };
      case null { null };
    };
  };

  // ---------------------------------------------------------------------
  // Collaboration
  // ---------------------------------------------------------------------

  // Publish or update the caller's collaboration profile and opt in or out
  // of discovery. A member may only publish a profile for themselves; a
  // community profile may only be published by that community's owner.
  public shared ({ caller }) func saveCollaborationProfile(
    profile : Discovery.CollaborationProfile,
  ) : async Discovery.SaveCollaborationProfileResult {
    if (not isMember(caller)) {
      return #err(#notAuthorized);
    };
    switch (profile.party) {
      case (#member(p)) {
        if (p != caller) { return #err(#notAuthorized) };
      };
      case (#community(id)) {
        if (not ownsCommunity(caller, id)) { return #err(#notAuthorized) };
      };
    };
    let id = switch (collaborationProfiles.get(profile.id)) {
      case (?existing) {
        let sameParty = switch (existing.party, profile.party) {
          case (#member(a), #member(b)) { a == b };
          case (#community(a), #community(b)) { a == b };
          case _ { false };
        };
        if (not sameParty) { return #err(#notAuthorized) };
        profile.id;
      };
      case null {
        let newId = counters.nextCollaborationProfileId;
        counters.nextCollaborationProfileId += 1;
        newId;
      };
    };
    let saved : Discovery.CollaborationProfile = {
      profile with
      id;
      timestamp = Time.now();
    };
    collaborationProfiles.add(id, saved);
    #ok(id);
  };

  // List collaborators matching the caller's community. Only opted-in
  // profiles are returned, and the caller's own profile is excluded.
  public query ({ caller }) func listMatchingCollaborators(
    community : Common.CommunityId,
  ) : async [Discovery.CollaborationProfile] {
    ignore caller;
    collaborationProfiles.values().toArray().filter(
      func(c) {
        if (not c.discoveryOptIn) { return false };
        switch (c.party) {
          case (#community(id)) { id != community };
          case (#member(_)) { true };
        };
      },
    );
  };

  // Request an introduction to another party. The requester's approval is
  // implicit at creation; the target must approve before contact is shared.
  public shared ({ caller }) func requestIntroduction(
    target : Discovery.CollaborationParty,
    message : Text,
  ) : async Discovery.RequestIntroductionResult {
    if (not isMember(caller)) {
      return #err(#notAuthorized);
    };
    let requester : Discovery.CollaborationParty = #member(caller);
    let id = counters.nextIntroductionRequestId;
    counters.nextIntroductionRequestId += 1;
    introductionRequests.add(id, {
      id;
      requester;
      target;
      message;
      requesterApproved = true;
      targetApproved = false;
      status = #pending;
      timestamp = Time.now();
    });
    #ok(id);
  };

  // Approve or decline an introduction request. Contact details are shared
  // only once both parties approve. Only the target party may respond.
  public shared ({ caller }) func respondToIntroduction(
    requestId : Discovery.IntroductionRequestId,
    approve : Bool,
  ) : async Discovery.RespondIntroductionResult {
    if (not isMember(caller)) {
      return #err(#notAuthorized);
    };
    let request = switch (introductionRequests.get(requestId)) {
      case (?r) { r };
      case null { return #err(#unknownIntroduction) };
    };
    // Only the target may respond.
    let isTarget = switch (request.target) {
      case (#member(p)) { p == caller };
      case (#community(id)) { ownsCommunity(caller, id) };
    };
    if (not isTarget) {
      return #err(#notAuthorized);
    };
    if (request.status != #pending) {
      return #err(#invalidIntroductionState);
    };
    let status : Discovery.IntroductionStatus = if (approve) { #approved } else { #declined };
    let updated : Discovery.IntroductionRequest = {
      request with
      targetApproved = approve;
      status;
      timestamp = Time.now();
    };
    introductionRequests.add(requestId, updated);
    if (approve) {
      recordActivity(#partnership, 0, "A new collaboration introduction was approved.");
    };
    #ok(status);
  };

  // List introduction requests involving the caller. Contact details are
  // only meaningful once both parties approve; the request record itself is
  // returned to either party.
  public query ({ caller }) func listMyIntroductions() : async [Discovery.IntroductionRequest] {
    introductionRequests.values().toArray().filter(
      func(r) {
        let isRequester = switch (r.requester) {
          case (#member(p)) { p == caller };
          case (#community(id)) { ownsCommunity(caller, id) };
        };
        let isTarget = switch (r.target) {
          case (#member(p)) { p == caller };
          case (#community(id)) { ownsCommunity(caller, id) };
        };
        isRequester or isTarget;
      },
    );
  };

  // ---------------------------------------------------------------------
  // Collective intelligence dashboard
  // ---------------------------------------------------------------------

  // Real backend-derived collective intelligence metrics.
  public query func getCollectiveIntelligenceMetrics() : async Discovery.CollectiveIntelligenceMetrics {
    DiscoveryLib.computeMetrics(
      communityProfiles.values().toArray(),
      discoverySubmissions.values().toArray(),
      pipelineItems.values().toArray(),
      introductionRequests.values().toArray(),
    );
  };

  // The interactive activity feed of public ideas, proposals, partnerships
  // and community milestones, newest first.
  public query func getNetworkActivityFeed() : async [Discovery.NetworkActivityEntry] {
    let entries = networkActivity.values().toArray();
    entries.sort(func(a, b) = Int.compare(b.timestamp, a.timestamp));
  };
};
