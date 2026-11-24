import List "mo:core/List";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import { fromEnv } "mo:caffeineai-inference-client/Config";
import ChatApi "mo:caffeineai-inference-client/Apis/ChatApi";
import ChatCompletionRequest "mo:caffeineai-inference-client/Models/ChatCompletionRequest";
import ChatCompletionRequestMessageOneOf2 "mo:caffeineai-inference-client/Models/ChatCompletionRequestMessageOneOf2";
import Common "../types/common";
import Discovery "../types/discovery";

// Pure helpers for the Discovery domain.
//
// Everything here is deterministic and side-effect free: the advisory
// intelligence service may refine a classification or an explanation, but
// these functions are the always-available fallback and the source of truth
// for stored data. AI is advisory only — nothing here writes governance
// state.
module {
  // A small fixed vocabulary of interest keywords. Matching is
  // case-insensitive and substring-based, so "renewable energy" and
  // "renewables" both surface the `energy` tag.
  let keywordTags : [(Text, Text)] = [
    ("housing", "housing"),
    ("home", "housing"),
    ("shelter", "housing"),
    ("funding", "funding"),
    ("grant", "funding"),
    ("finance", "funding"),
    ("budget", "funding"),
    ("youth", "youth"),
    ("young", "youth"),
    ("education", "education"),
    ("school", "education"),
    ("training", "education"),
    ("energy", "energy"),
    ("renewable", "energy"),
    ("solar", "energy"),
    ("wind", "energy"),
    ("water", "water"),
    ("climate", "climate"),
    ("environment", "climate"),
    ("health", "health"),
    ("wellness", "health"),
    ("food", "food"),
    ("agriculture", "food"),
    ("land", "land"),
    ("treaty", "treaty"),
    ("rights", "rights"),
    ("sovereignty", "sovereignty"),
    ("governance", "governance"),
    ("culture", "culture"),
    ("language", "culture"),
    ("heritage", "culture"),
    ("technology", "technology"),
    ("digital", "technology"),
    ("data", "data"),
    ("research", "research"),
    ("partnership", "partnership"),
    ("collaboration", "partnership"),
    ("collaborate", "partnership"),
    ("infrastructure", "infrastructure"),
    ("transport", "infrastructure"),
    ("business", "business"),
    ("employment", "employment"),
    ("jobs", "employment"),
  ];

  // Deterministic keyword/category/interest classification used as the
  // fallback when the advisory inference service is unavailable.
  //
  // Order matters: an explicit proposal intent is checked first, then an
  // offer/partnership (opportunity), then a request for help (need), then a
  // suggestion (feedback), and finally a new idea. Matching is
  // case-insensitive and substring-based, so both "need" and "needs" match.
  public func classifySubmission(body : Text) : Common.DiscoveryClassification {
    let lower = body.toLower();
    let has = func(needle : Text) : Bool = lower.contains(#text needle);

    // An explicit proposal intent.
    if (has("proposal") or has("propose") or has("motion") or has("vote on")) {
      return #potentialProposal;
    };
    // An offer of resources, a partnership, or a search for partners reads
    // as an opportunity.
    if (
      has("we offer") or has("we can offer") or has("opportunity") or has("available to") or
      has("partnership") or has("partner") or has("collaborate") or has("collaboration")
    ) {
      return #opportunity;
    };
    // A request for help or a stated need reads as a need. "need"/"needs"
    // and "looking for" cover both first- and third-person phrasing.
    if (
      has("need") or has("require") or has("looking for") or has("seeking") or has("support for")
    ) {
      return #need;
    };
    // A suggestion for how something should work reads as feedback.
    if (has("should") or has("suggest") or has("improve") or has("feedback") or has("better if")) {
      return #feedback;
    };
    // Default: a new idea.
    #idea;
  };

  // Extract interest tags from a free-text submission body. Tags are
  // lowercased, de-duplicated and returned in first-match order.
  public func extractInterestTags(body : Text) : [Text] {
    let lower = body.toLower();
    let found = keywordTags.filter(func((needle, _tag)) = lower.contains(#text needle));
    let tags = found.map(func((_needle, tag)) = tag);
    // De-duplicate while preserving order.
    let unique = tags.foldLeft(
      [],
      func(acc : [Text], tag : Text) : [Text] {
        if (acc.contains(tag)) { acc } else { acc.concat([tag]) };
      },
    );
    unique;
  };

  // The first shared tag between two lists, if any.
  func firstSharedTag(a : [Text], b : [Text]) : ?Text {
    a.find(func(tag) = b.contains(tag));
  };

  // Derive recommendations for a community from stored submissions,
  // proposals, collaboration profiles and community profiles. Each
  // recommendation carries a short explanation derived from the stored
  // records — never invented activity.
  public func computeRecommendations(
    community : Common.CommunityId,
    submissions : [Discovery.DiscoverySubmission],
    profiles : [Discovery.CommunityProfile],
    collaborations : [Discovery.CollaborationProfile],
  ) : [Discovery.Recommendation] {
    // The requesting community's own submissions and profile.
    let mine = submissions.filter(func(s) = s.community == community);
    let myTags = mine.foldLeft(
      [],
      func(acc : [Text], s : Discovery.DiscoverySubmission) : [Text] {
        s.interestTags.foldLeft(acc, func(a : [Text], t : Text) : [Text] {
          if (a.contains(t)) { a } else { a.concat([t]) };
        });
      },
    );
    let recs = List.empty<Discovery.Recommendation>();

    // 1. Similar ideas already submitted by other communities.
    for (s in submissions.values()) {
      if (s.community != community and s.visibility == #publicVisible) {
        switch (firstSharedTag(s.interestTags, myTags)) {
          case (?tag) {
            recs.add({
              kind = #similarIdea;
              referenceId = s.id;
              title = s.body;
              explanation = "Another community is exploring " # tag # ".";
            });
          };
          case null {};
        };
      };
    };

    // 2. Other communities with shared objectives.
    for (p in profiles.values()) {
      if (p.id != community and p.discoveryOptIn and p.visibility == #publicVisible) {
        switch (firstSharedTag(p.objectives, myTags)) {
          case (?tag) {
            recs.add({
              kind = #sharedObjective;
              referenceId = p.id;
              title = p.name;
              explanation = "Both communities are exploring " # tag # ".";
            });
          };
          case null {};
        };
      };
    };

    // 3. Potential collaboration partners (opted-in parties with shared
    //    skills or interests).
    for (c in collaborations.values()) {
      if (c.discoveryOptIn) {
        let isSelf = switch (c.party) {
          case (#community(id)) { id == community };
          case (#member(_)) { false };
        };
        if (not isSelf) {
          let overlap = c.skills.concat(c.interests);
          switch (firstSharedTag(overlap, myTags)) {
            case (?tag) {
              recs.add({
                kind = #collaborationPartner;
                referenceId = c.id;
                title = c.displayName;
                explanation = "Shares an interest in " # tag # ".";
              });
            };
            case null {};
          };
        };
      };
    };

    // 4. Suggested next step: turn the community's own most recent idea
    //    into a pipeline item.
    switch (mine.find(func(s) = s.classification == #idea or s.classification == #potentialProposal)) {
      case (?s) {
        recs.add({
          kind = #suggestedNextStep;
          referenceId = s.id;
          title = "Develop this idea into a proposal";
          explanation = "Your community submitted an idea that could become a draft proposal.";
        });
      };
      case null {};
    };

    recs.toArray();
  };

  // Derive the collective intelligence metrics from stored records. Every
  // figure is a real count; an empty network reports zeros.
  public func computeMetrics(
    communities : [Discovery.CommunityProfile],
    submissions : [Discovery.DiscoverySubmission],
    pipelineItems : [Discovery.PipelineItem],
    introductions : [Discovery.IntroductionRequest],
  ) : Discovery.CollectiveIntelligenceMetrics {
    let activeCommunities = communities.filter(func(c) = c.discoveryOptIn).size();
    let ideasSubmitted = submissions.size();
    let collaborationOpportunities = communities.foldLeft(
      0,
      func(acc : Nat, c : Discovery.CommunityProfile) : Nat {
        acc + c.partnershipOpportunities.size();
      },
    );
    let activeProposals = pipelineItems.filter(
      func(p) = p.stage == #draftProposal or p.stage == #governanceVote,
    ).size();
    let successfulPartnerships = introductions.filter(
      func(r) = r.status == #approved,
    ).size();
    let completedInitiatives = pipelineItems.filter(func(p) = p.stage == #results).size();
    {
      activeCommunities;
      ideasSubmitted;
      collaborationOpportunities;
      activeProposals;
      successfulPartnerships;
      completedInitiatives;
    };
  };

  // The seven-stage pipeline in order.
  let stageOrder : [Discovery.PipelineStage] = [
    #idea,
    #communityFeedback,
    #collaboration,
    #draftProposal,
    #governanceVote,
    #approvedAction,
    #results,
  ];

  func stageIndex(stage : Discovery.PipelineStage) : ?Nat {
    stageOrder.findIndex(func(s) = s == stage);
  };

  // Whether a pipeline stage may advance to the next stage. Only a
  // single forward step is allowed; skipping stages or moving backwards is
  // rejected.
  public func canAdvance(from : Discovery.PipelineStage, to : Discovery.PipelineStage) : Bool {
    switch (stageIndex(from), stageIndex(to)) {
      case (?f, ?t) { t == f + 1 };
      case _ { false };
    };
  };

  // Whether an introduction is mutually approved and contact may be shared.
  public func isMutuallyApproved(request : Discovery.IntroductionRequest) : Bool {
    request.requesterApproved and request.targetApproved and request.status == #approved;
  };

  // Whether a community profile is visible to the given caller. The owner
  // always sees their own profile; a public, opted-in profile is visible to
  // everyone; a private profile is visible only to its owner.
  public func isProfileVisibleTo(
    profile : Discovery.CommunityProfile,
    caller : Principal,
  ) : Bool {
    if (profile.owner == caller) { return true };
    profile.discoveryOptIn and profile.visibility == #publicVisible;
  };

  // ---------------------------------------------------------------------
  // Advisory intelligence (Caffeine Inference)
  //
  // The model is advisory only: it may refine a submission's classification,
  // but the deterministic classification above is always stored and is the
  // fallback whenever the model is unavailable or returns an unusable
  // answer. Nothing here writes governance state.
  // ---------------------------------------------------------------------

  // Parse the model's answer into a classification. Returns null when the
  // answer does not name one of the five known classifications, so the
  // caller falls back to the deterministic result.
  func parseClassification(answer : Text) : ?Common.DiscoveryClassification {
    let lower = answer.toLower();
    if (lower.contains(#text "potentialproposal") or lower.contains(#text "potential proposal")) {
      return ?#potentialProposal;
    };
    if (lower.contains(#text "opportunity")) { return ?#opportunity };
    if (lower.contains(#text "feedback")) { return ?#feedback };
    if (lower.contains(#text "need")) { return ?#need };
    if (lower.contains(#text "idea")) { return ?#idea };
    null;
  };

  // Ask the advisory inference service to classify a submission body.
  // Returns null when the model is unavailable or returns an unusable
  // answer; the caller must then use the deterministic classification.
  // `fromEnv<system>()` traps when the app has no inference credentials —
  // the caller wraps this call so a model failure never blocks a submission.
  public func classifyWithInference<system>(body : Text) : async* ?Common.DiscoveryClassification {
    let config = fromEnv<system>();
    let prompt = "Classify the following community submission into exactly one of these categories: idea, feedback, need, opportunity, potentialProposal. Reply with only the category word.\n\nSubmission: " # body;
    let userMessage = ChatCompletionRequestMessageOneOf2.JSON.init({
      content = #string(prompt);
      role = #user;
    });
    let req = ChatCompletionRequest.JSON.init({
      messages = [#user(userMessage)];
      model = "router";
    });
    let resp = await* ChatApi.createChatCompletion(config, req);
    if (resp.choices.size() == 0) { return null };
    switch (resp.choices[0].message.content) {
      case (?content) { parseClassification(content) };
      case null { null };
    };
  };
};
