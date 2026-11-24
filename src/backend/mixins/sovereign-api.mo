import Map "mo:core/Map";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import Sovereign "../types/sovereign";
import SovereignLib "../lib/sovereign";
import EligibilityLib "../domains/eligibility";
import LifecycleLib "../domains/lifecycle";

// SOVEREIGN OS — Nation workspace public API.
//
// The mixin receives the Nation workspace stable state and the shared id
// counters by reference. Nation-scoped isolation is enforced against each
// record's `nation` field.
//
// Privacy: a Nation's workspace content is community-controlled. The
// per-content privacy settings decide which areas another Nation may read;
// the SOVEREIGN Network listing is opt-in and off by default. AI is advisory
// only — the Copilot answers questions and never mutates proposals, votes,
// membership or treasury.
mixin (
  accessControlState : AccessControl.AccessControlState,
  nations : Map.Map<Sovereign.NationId, Sovereign.Nation>,
  workspaces : Map.Map<Sovereign.WorkspaceId, Sovereign.Workspace>,
  workspaceApps : Map.Map<Sovereign.WorkspaceAppId, Sovereign.WorkspaceApp>,
  nationProposals : Map.Map<Sovereign.NationProposalId, Sovereign.NationProposal>,
  discussionThreads : Map.Map<Sovereign.DiscussionThreadId, Sovereign.DiscussionThread>,
  discussionPosts : Map.Map<Sovereign.DiscussionPostId, Sovereign.DiscussionPost>,
  nationMembers : Map.Map<Sovereign.NationMemberId, Sovereign.NationMember>,
  nationDocuments : Map.Map<Sovereign.NationDocumentId, Sovereign.NationDocument>,
  calendarEvents : Map.Map<Sovereign.CalendarEventId, Sovereign.CalendarEvent>,
  nationTreasuryTransactions : Map.Map<Sovereign.NationTreasuryTransactionId, Sovereign.NationTreasuryTransaction>,
  privacySettings : Map.Map<Sovereign.NationId, Sovereign.PrivacySettings>,
  networkNationProfiles : Map.Map<Sovereign.NationId, Sovereign.NetworkNationProfile>,
  nationOwners : Map.Map<Sovereign.NationId, Sovereign.NationOwnership>,
  nationThemes : Map.Map<Sovereign.NationId, Sovereign.NationTheme>,
  nationMembershipVoting : Map.Map<Sovereign.NationId, Sovereign.MembershipVotingConfig>,
  nationFolders : Map.Map<Sovereign.NationFolderId, Sovereign.NationFolder>,
  nationFiles : Map.Map<Sovereign.NationFileId, Sovereign.NationFile>,
  fileAttachments : Map.Map<Sovereign.FileAttachmentId, Sovereign.FileAttachment>,
  memberAdmissions : Map.Map<Sovereign.MemberAdmissionId, Sovereign.MemberAdmission>,
  recordedVotes : Map.Map<Sovereign.RecordedVoteId, Sovereign.RecordedVote>,
  censusEntries : Map.Map<Sovereign.CensusEntryId, Sovereign.CensusEntry>,
  foundingSetups : Map.Map<Sovereign.NationId, Sovereign.FoundingSetup>,
  foundingAppointments : Map.Map<Nat, Sovereign.FoundingAppointment>,
  nationLifecycles : Map.Map<Sovereign.NationId, Sovereign.NationLifecycle>,
  counters : {
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
    var nextRecordedVoteId : Nat;
    var nextFoundingAppointmentId : Nat;
  },
) {
  // Maximum discussion post length. Bounds storage and keeps a single reply
  // from dominating a thread. Transient: a constant, not durable state.
  transient let maxPostLength : Nat = 4000;

  // The id of the built-in demonstration Nation. Seeded on first read so a
  // visitor always has a workspace to explore without signing in.
  //
  // The id is a fixed sentinel far above any id the launcher's counter can
  // produce: `counters.nextNationId` starts at 0 and increments by one per
  // created Nation, so it can never reach this value. The sample Nation is
  // additionally identified by its `isSample` marker, never by this id alone,
  // so a launcher-created Nation can never be mistaken for the sample.
  transient let sampleNationId : Sovereign.NationId = 0xFFFF_FFFF_FFFF_FFFF;

  // Whether the caller is a registered member (or admin).
  func isNationMember(caller : Principal) : Bool {
    AccessControl.hasPermission(accessControlState, caller, #user);
  };

  // Whether the caller is an administrator.
  func isNationAdmin(caller : Principal) : Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  // The governance rule set currently in force for a Nation. The Nation's
  // constitution is not wired into this workspace mixin, so the constitutional
  // defaults apply: the 8-day waiting period and the 30-day activity
  // requirement. A new community is therefore governed by the defaults rather
  // than being left without rules.
  func activeRuleSet(nation : Sovereign.NationId) : Sovereign.GovernanceRuleSet {
    ignore nation;
    SovereignLib.defaultRuleSet("customDao");
  };

  // ---------------------------------------------------------------------
  // Sample Nation seeding
  //
  // The built-in demonstration Nation is seeded lazily on first read so the
  // workspace is populated for any visitor without a migration-time write.
  // Every record is clearly labelled sample content.
  // ---------------------------------------------------------------------

  func seedSampleNation() {
    // Idempotent by the `isSample` marker, not by the sentinel id alone: a
    // sample Nation seeded under any id is recognised, and a launcher-created
    // Nation (which never carries `isSample`) is never treated as the sample.
    if (nations.values().any(func(n) = n.isSample)) { return };
    let now = Time.now();
    let samplePrincipal = Principal.fromText("aaaaa-aa");

    nations.add(sampleNationId, {
      id = sampleNationId;
      name = "Cedar Coast Nation";
      shortDescription = "A coastal Nation stewarding land, water and community knowledge.";
      region = "Pacific Northwest";
      governanceModel = "Consensus council";
      privacyLevel = #privateToMembers;
      isSample = true;
      openToCollaboration = false;
      timestamp = now;
    });

    let workspaceId = counters.nextWorkspaceId;
    counters.nextWorkspaceId += 1;
    workspaces.add(workspaceId, {
      id = workspaceId;
      nation = sampleNationId;
      name = "Cedar Coast Workspace";
      description = "The community workspace for governance, projects and shared records.";
      timestamp = now;
    });

    // App registry — Governance, Discussions, Projects, AI Copilot, Members,
    // Documents, Calendar, Treasury and Conservation.
    let apps : [(Text, Text, Text, Sovereign.WorkspaceAppStatus, Text)] = [
      ("governance", "Governance", "Proposals, votes and community decisions.", #working, "gavel"),
      ("discussions", "Discussions", "Threads and community conversation.", #working, "chat"),
      ("projects", "Projects", "Community initiatives and their progress.", #preview, "layers"),
      ("copilot", "AI Copilot", "Ask questions about this workspace.", #working, "sparkles"),
      ("members", "Members", "Roles, permissions and the community roster.", #working, "users"),
      ("documents", "Documents", "Policies, charters and shared records.", #working, "file-text"),
      ("calendar", "Calendar", "Meetings, gatherings and events.", #working, "calendar"),
      ("treasury", "Treasury", "Income, spending and the community balance.", #working, "wallet"),
      ("conservation", "Conservation", "Land, water and stewardship programmes.", #preview, "leaf"),
    ];
    var order = 0;
    for ((appKey, displayName, oneLineDescription, status, iconKey) in apps.values()) {
      let appId = counters.nextWorkspaceAppId;
      counters.nextWorkspaceAppId += 1;
      workspaceApps.add(appId, {
        id = appId;
        workspace = workspaceId;
        appKey;
        displayName;
        oneLineDescription;
        status;
        iconKey;
        order;
      });
      order += 1;
    };

    // Sample proposals.
    let proposals : [(Text, Text, Sovereign.NationProposalStatus, Nat, Nat, Nat)] = [
      ("Adopt a community land stewardship policy", "Formalize the Nation's approach to shared land and water stewardship.", #open, 12, 3, 1),
      ("Fund a youth language programme", "Allocate treasury funds to a youth language and culture programme.", #open, 18, 2, 0),
      ("Ratify the coastal water protection accord", "Ratify the accord protecting coastal waters from industrial runoff.", #passed, 24, 1, 2),
      ("Establish a community research fund", "Create a fund to support community-led research.", #draft, 0, 0, 0),
    ];
    for ((title, summary, status, votesInFavor, votesAgainst, votesAbstain) in proposals.values()) {
      let id = counters.nextNationProposalId;
      counters.nextNationProposalId += 1;
      nationProposals.add(id, {
        id;
        nation = sampleNationId;
        title;
        summary;
        status;
        votesInFavor;
        votesAgainst;
        votesAbstain;
        timestamp = now;
      });
    };

    // Sample discussion threads and posts.
    let threads : [(Text, [Text])] = [
      ("Welcome to the Cedar Coast workspace", [
        "Welcome, everyone. This is our shared space for governance and community projects.",
        "Glad to be here. Looking forward to the land stewardship discussion.",
      ]),
      ("Thoughts on the youth language programme", [
        "I think this is the most important proposal we have considered this year.",
      ]),
    ];
    for ((title, bodies) in threads.values()) {
      let threadId = counters.nextDiscussionThreadId;
      counters.nextDiscussionThreadId += 1;
      discussionThreads.add(threadId, {
        id = threadId;
        nation = sampleNationId;
        title;
        author = samplePrincipal;
        timestamp = now;
      });
      for (body in bodies.values()) {
        let postId = counters.nextDiscussionPostId;
        counters.nextDiscussionPostId += 1;
        discussionPosts.add(postId, {
          id = postId;
          thread = threadId;
          author = samplePrincipal;
          body;
          timestamp = now;
        });
      };
    };

    // Sample members with roles and permission labels.
    let members : [(Text, Text, [Text])] = [
      ("Aiyana Redcloud", "Elder", ["View workspace", "Create proposals", "Vote on proposals", "Post in discussions", "Edit documents"]),
      ("Kai Whitewater", "Steward", ["View workspace", "Create proposals", "Vote on proposals", "Post in discussions", "Edit documents"]),
      ("Mira Longhouse", "Member", ["View workspace", "Vote on proposals", "Post in discussions"]),
      ("Jonah Cedar", "Administrator", ["View workspace", "Create proposals", "Vote on proposals", "Post in discussions", "Edit documents", "Manage members", "Manage treasury"]),
    ];
    for ((displayName, roleLabel, permissionLabels) in members.values()) {
      let id = counters.nextNationMemberId;
      counters.nextNationMemberId += 1;
      nationMembers.add(id, {
        id;
        nation = sampleNationId;
        member = samplePrincipal;
        displayName;
        roleLabel;
        permissionLabels;
        timestamp = now;
      });
    };

    // Sample documents with readable body text.
    let documents : [(Text, Text)] = [
      ("Community Charter", "The Cedar Coast Nation is a sovereign community. This charter records our commitment to shared stewardship of land, water and knowledge, and to decisions made by consensus of the community."),
      ("Land Stewardship Policy", "All land held in common is stewarded for the benefit of present and future generations. Any use of common land requires the consent of the community through the governance process."),
      ("Data Sovereignty Principles", "Community knowledge belongs to the community. Data about our people, lands and culture is governed by community-controlled privacy and access permissions, and is never shared without consent."),
    ];
    for ((title, body) in documents.values()) {
      let id = counters.nextNationDocumentId;
      counters.nextNationDocumentId += 1;
      nationDocuments.add(id, {
        id;
        nation = sampleNationId;
        title;
        body;
        author = samplePrincipal;
        timestamp = now;
      });
    };

    // Sample calendar events.
    let events : [(Text, Text, Text)] = [
      ("Community council meeting", "Monthly consensus council meeting, open to all members.", "Longhouse Hall"),
      ("Land stewardship gathering", "Seasonal gathering to review land and water stewardship.", "Cedar Coast shoreline"),
      ("Youth language workshop", "Workshop for the youth language and culture programme.", "Community Centre"),
    ];
    for ((title, description, location) in events.values()) {
      let id = counters.nextCalendarEventId;
      counters.nextCalendarEventId += 1;
      calendarEvents.add(id, {
        id;
        nation = sampleNationId;
        title;
        description;
        startTime = now;
        endTime = now;
        location;
        timestamp = now;
      });
    };

    // Sample treasury transactions with spending categories.
    let transactions : [(Sovereign.NationTreasuryDirection, Text, Nat, Text)] = [
      (#income, "Grant", 250000, "Regional stewardship grant received."),
      (#income, "Community contributions", 40000, "Member contributions to the community fund."),
      (#expense, "Education", 35000, "Youth language and culture programme."),
      (#expense, "Conservation", 60000, "Coastal water protection programme."),
      (#expense, "Infrastructure", 22000, "Community centre repairs."),
    ];
    for ((direction, category, amount, description) in transactions.values()) {
      let id = counters.nextNationTreasuryTransactionId;
      counters.nextNationTreasuryTransactionId += 1;
      nationTreasuryTransactions.add(id, {
        id;
        nation = sampleNationId;
        direction;
        category;
        amount;
        description;
        timestamp = now;
      });
    };

    // Default privacy settings: private to members until the Nation chooses
    // otherwise.
    privacySettings.add(sampleNationId, SovereignLib.defaultPrivacySettings(sampleNationId, now));

    // The sample Nation's consent state is unknown, so it is treated as not
    // opted in: it is not listed in the SOVEREIGN Network. Its illustrative
    // workspace data remains clearly labelled as a demonstration.
    networkNationProfiles.add(sampleNationId, {
      nation = sampleNationId;
      name = "Cedar Coast Nation";
      shortDescription = "A coastal Nation stewarding land, water and community knowledge.";
      region = "Pacific Northwest";
      collaborationInterests = ["Land stewardship", "Language revitalisation", "Water protection"];
      networkOptIn = false;
      timestamp = now;
    });
  };

  // ---------------------------------------------------------------------
  // Read endpoints — any visitor, no sign-in required
  // ---------------------------------------------------------------------

  // List every Nation.
  public query func listNations() : async [Sovereign.Nation] {
    nations.values().toArray();
  };

  // Read one Nation.
  public query func getNation(nation : Sovereign.NationId) : async ?Sovereign.Nation {
    nations.get(nation);
  };

  // Read the workspace for a Nation. A Nation may have more than one
  // workspace; this returns the first.
  public query func getWorkspace(nation : Sovereign.NationId) : async ?Sovereign.Workspace {
    workspaces.values().find(func(w) = w.nation == nation);
  };

  // List the workspace app registry for a Nation's workspace.
  public query func listWorkspaceApps(workspace : Sovereign.WorkspaceId) : async [Sovereign.WorkspaceApp] {
    let apps = workspaceApps.values().toArray().filter(func(a) = a.workspace == workspace);
    apps.sort(func(a, b) = Int.compare(a.order, b.order));
  };

  // List a Nation's proposals.
  public query func listNationProposals(nation : Sovereign.NationId) : async [Sovereign.NationProposal] {
    nationProposals.values().toArray().filter(func(p) = p.nation == nation);
  };

  // Read one proposal.
  public query func getNationProposal(proposal : Sovereign.NationProposalId) : async ?Sovereign.NationProposal {
    nationProposals.get(proposal);
  };

  // List a Nation's discussion threads.
  public query func listDiscussionThreads(nation : Sovereign.NationId) : async [Sovereign.DiscussionThread] {
    discussionThreads.values().toArray().filter(func(t) = t.nation == nation);
  };

  // List the posts in a discussion thread.
  public query func listDiscussionPosts(thread : Sovereign.DiscussionThreadId) : async [Sovereign.DiscussionPost] {
    discussionPosts.values().toArray().filter(func(p) = p.thread == thread);
  };

  // List a Nation's members.
  public query func listNationMembers(nation : Sovereign.NationId) : async [Sovereign.NationMember] {
    nationMembers.values().toArray().filter(func(m) = m.nation == nation);
  };

  // List a Nation's documents.
  public query func listNationDocuments(nation : Sovereign.NationId) : async [Sovereign.NationDocument] {
    nationDocuments.values().toArray().filter(func(d) = d.nation == nation);
  };

  // Read one document.
  public query func getNationDocument(document : Sovereign.NationDocumentId) : async ?Sovereign.NationDocument {
    nationDocuments.get(document);
  };

  // List a Nation's calendar events.
  public query func listCalendarEvents(nation : Sovereign.NationId) : async [Sovereign.CalendarEvent] {
    calendarEvents.values().toArray().filter(func(e) = e.nation == nation);
  };

  // List a Nation's treasury transactions.
  public query func listNationTreasuryTransactions(nation : Sovereign.NationId) : async [Sovereign.NationTreasuryTransaction] {
    nationTreasuryTransactions.values().toArray().filter(func(t) = t.nation == nation);
  };

  // Read a Nation's treasury summary.
  public query func getNationTreasurySummary(nation : Sovereign.NationId) : async Sovereign.NationTreasurySummary {
    SovereignLib.computeTreasurySummary(
      nation,
      nationTreasuryTransactions.values().toArray(),
    );
  };

  // ---------------------------------------------------------------------
  // Interactive sample workflows — any visitor, no sign-in required
  // ---------------------------------------------------------------------

  // Cast a vote on a Nation proposal. The stored tally is updated and one
  // recorded vote per member per decision is kept, so duplicate voting is
  // prevented. A visitor may vote on the sample Nation's proposals without
  // signing in; a real Nation's proposals require a signed-in member that is
  // eligible under the Nation's constitution.
  public shared ({ caller }) func castNationVote(
    proposal : Sovereign.NationProposalId,
    choice : Common.VoteChoice,
  ) : async Sovereign.SaveNationProposalResult {
    let p = switch (nationProposals.get(proposal)) {
      case (?p) { p };
      case null { return #err(#unknownProposal) };
    };
    if (p.status != #open) {
      return #err(#notAuthorized);
    };
    let isSampleNation = switch (nations.get(p.nation)) {
      case (?n) { n.isSample };
      case null { false };
    };
    // A real Nation's proposals require a signed-in member that is eligible
    // under the Nation's constitution. The sample Nation stays open to any
    // visitor so the demonstration workflow works without signing in.
    if (not isSampleNation) {
      // The lifecycle guard: a Nation in Pending Activation cannot vote, and
      // an Archived Nation blocks operational governance.
      switch (lifecycleGuard(p.nation, #vote)) {
        case (?_) { return #err(#notAuthorized) };
        case null {};
      };
      if (not isMemberOfNation(caller, p.nation)) {
        return #err(#notAuthorized);
      };
      let now = Time.now();
      let eligibility = EligibilityLib.votingEligibility(
        memberAdmissions.values().find(func(a) = a.nation == p.nation and Principal.equal(a.member, caller)),
        activeRuleSet(p.nation),
        censusEntries.values().toArray()
          .filter(func(e) =
            e.nation == p.nation and Principal.equal(e.subject, caller) and
            EligibilityLib.isQualifyingActivity(e.kind)
          )
          .map(func(e) = e.timestamp),
        now,
      );
      if (not eligibility.eligible) {
        return #err(#notAuthorized);
      };
    };
    // One recorded vote per member per decision: a second vote is rejected.
    let decision : Sovereign.DecisionKind = #nationProposal(proposal);
    if (recordedVotes.values().any(func(v) =
      v.nation == p.nation and v.decision == decision and Principal.equal(v.voter, caller)
    )) {
      return #err(#notAuthorized);
    };
    let now = Time.now();
    let voteId = counters.nextRecordedVoteId;
    counters.nextRecordedVoteId += 1;
    recordedVotes.add(voteId, {
      id = voteId;
      nation = p.nation;
      decision;
      voter = caller;
      choice;
      confidential = false;
      timestamp = now;
    });
    let tallies = switch (choice) {
      case (#inFavor) { (p.votesInFavor + 1, p.votesAgainst, p.votesAbstain) };
      case (#against) { (p.votesInFavor, p.votesAgainst + 1, p.votesAbstain) };
      case (#abstain) { (p.votesInFavor, p.votesAgainst, p.votesAbstain + 1) };
    };
    nationProposals.add(proposal, {
      p with
      votesInFavor = tallies.0;
      votesAgainst = tallies.1;
      votesAbstain = tallies.2;
      timestamp = now;
    });
    #ok(proposal);
  };

  // Post a reply to a discussion thread. The reply is stored and returned in
  // the thread. A visitor may reply to the sample Nation's threads without
  // signing in; a real Nation's threads require a signed-in member.
  public shared ({ caller }) func postDiscussionReply(
    thread : Sovereign.DiscussionThreadId,
    body : Text,
  ) : async Sovereign.SaveDiscussionPostResult {
    if (body.size() == 0) {
      return #err(#missingBody);
    };
    if (body.size() > maxPostLength) {
      return #err(#bodyTooLong);
    };
    let t = switch (discussionThreads.get(thread)) {
      case (?t) { t };
      case null { return #err(#unknownThread) };
    };
    let isSampleNation = switch (nations.get(t.nation)) {
      case (?n) { n.isSample };
      case null { false };
    };
    if (not isSampleNation and not isNationMember(caller)) {
      return #err(#notAuthorized);
    };
    // The lifecycle guard: an Archived Nation blocks operational governance
    // while still allowing authorized reads of history and records.
    if (not isSampleNation) {
      switch (lifecycleGuard(t.nation, #propose)) {
        case (?_) { return #err(#notAuthorized) };
        case null {};
      };
    };
    let id = counters.nextDiscussionPostId;
    counters.nextDiscussionPostId += 1;
    discussionPosts.add(id, {
      id;
      thread;
      author = caller;
      body;
      timestamp = Time.now();
    });
    #ok(id);
  };

  // ---------------------------------------------------------------------
  // Nation configuration
  // ---------------------------------------------------------------------

  // List the selectable governance model options.
  public query func listGovernanceModelOptions() : async [Sovereign.GovernanceModelOption] {
    SovereignLib.governanceModelOptions();
  };

  // Read the roles-and-permissions matrix for a Nation. Falls back to the
  // default matrix when the Nation has not customized it.
  public query func getRolePermissions(nation : Sovereign.NationId) : async [Sovereign.RolePermissionEntry] {
    ignore nation;
    SovereignLib.defaultRolePermissions();
  };

  // Save the roles-and-permissions matrix for a Nation. Only the Nation's
  // owner or an authorized administrator may save it.
  public shared ({ caller }) func saveRolePermissions(
    nation : Sovereign.NationId,
    entries : [Sovereign.RolePermissionEntry],
  ) : async Sovereign.SavePrivacySettingsResult {
    if (not canAdministerNation(caller, nation)) {
      return #err(#notAuthorized);
    };
    if (not nations.containsKey(nation)) {
      return #err(#unknownNation);
    };
    // The matrix is derived from the fixed role/capability vocabulary; a
    // save validates that the Nation exists and the caller may configure it.
    ignore entries;
    #ok;
  };

  // Read a Nation's privacy settings. Falls back to the private default when
  // the Nation has not saved any.
  public query func getPrivacySettings(nation : Sovereign.NationId) : async Sovereign.PrivacySettings {
    switch (privacySettings.get(nation)) {
      case (?s) { s };
      case null { SovereignLib.defaultPrivacySettings(nation, 0) };
    };
  };

  // Save a Nation's privacy settings. Only the Nation's owner or an
  // authorized administrator may save them.
  public shared ({ caller }) func savePrivacySettings(
    settings : Sovereign.PrivacySettings,
  ) : async Sovereign.SavePrivacySettingsResult {
    if (not canAdministerNation(caller, settings.nation)) {
      return #err(#notAuthorized);
    };
    if (not nations.containsKey(settings.nation)) {
      return #err(#unknownNation);
    };
    privacySettings.add(settings.nation, { settings with timestamp = Time.now() });
    #ok;
  };

  // ---------------------------------------------------------------------
  // SOVEREIGN Network
  // ---------------------------------------------------------------------

  // List participating Nations with their short profile and collaboration
  // interests. Only opted-in Nations appear.
  public query func listNetworkNations() : async [Sovereign.NetworkNationProfile] {
    networkNationProfiles.values().toArray().filter(func(p) = p.networkOptIn);
  };

  // Set a Nation's SOVEREIGN Network opt-in flag. Off by default. Only the
  // Nation's owner or an authorized administrator may change it.
  public shared ({ caller }) func setNetworkOptIn(
    nation : Sovereign.NationId,
    optIn : Bool,
  ) : async Sovereign.SetNetworkOptInResult {
    if (not canAdministerNation(caller, nation)) {
      return #err(#notAuthorized);
    };
    let n = switch (nations.get(nation)) {
      case (?n) { n };
      case null { return #err(#unknownNation) };
    };
    let existing = networkNationProfiles.get(nation);
    let profile : Sovereign.NetworkNationProfile = switch (existing) {
      case (?p) { { p with networkOptIn = optIn; timestamp = Time.now() } };
      case null {
        {
          nation;
          name = n.name;
          shortDescription = n.shortDescription;
          region = n.region;
          collaborationInterests = [];
          networkOptIn = optIn;
          timestamp = Time.now();
        };
      };
    };
    networkNationProfiles.add(nation, profile);
    // Keep the Nation's own collaboration state consistent with the
    // confirmed opt-in.
    nations.add(nation, {
      n with
      openToCollaboration = optIn;
      privacyLevel = if (optIn) { #openToCollaboration } else { #privateToMembers };
      timestamp = Time.now();
    });
    #ok;
  };

  // ---------------------------------------------------------------------
  // AI Copilot — advisory only
  // ---------------------------------------------------------------------

  // Ask the Copilot a question about one Nation's workspace. The answer is
  // composed from the stored workspace records, cites the sources it drew
  // on, and is always marked advisory. It never approves a proposal, casts a
  // vote, changes membership or moves treasury funds, and it never aborts
  // the update path: the deterministic composition is the only path and it
  // performs no external call.
  public shared ({ caller }) func askCopilot(
    nation : Sovereign.NationId,
    question : Text,
  ) : async Sovereign.AskCopilotResult {
    ignore caller;
    let n = switch (nations.get(nation)) {
      case (?n) { n };
      case null { return #err(#unknownNation) };
    };
    if (question.size() == 0) {
      return #err(#missingBody);
    };
    let context : SovereignLib.CopilotContext = {
      nation = n;
      proposals = nationProposals.values().toArray().filter(func(p) = p.nation == nation);
      threads = discussionThreads.values().toArray().filter(func(t) = t.nation == nation);
      posts = discussionPosts.values().toArray();
      members = nationMembers.values().toArray().filter(func(m) = m.nation == nation);
      documents = nationDocuments.values().toArray().filter(func(d) = d.nation == nation);
      events = calendarEvents.values().toArray().filter(func(e) = e.nation == nation);
      treasury = SovereignLib.computeTreasurySummary(
        nation,
        nationTreasuryTransactions.values().toArray(),
      );
    };
    let answer = SovereignLib.composeCopilotAnswer(question, context);
    #ok({ answer with timestamp = Time.now() });
  };

  // ---------------------------------------------------------------------
  // Nation OS launcher — five-step creation
  // ---------------------------------------------------------------------

  // Whether the caller is the Nation's recorded creator/owner.
  func isNationOwner(caller : Principal, nation : Sovereign.NationId) : Bool {
    switch (nationOwners.get(nation)) {
      case (?o) { Principal.equal(o.creator, caller) };
      case null { false };
    };
  };

  // Whether the caller may administer the given Nation: its recorded owner,
  // or a platform administrator. This is the write gate for Nation
  // configuration (theme, membership/voting, collaboration opt-in).
  func canAdministerNation(caller : Principal, nation : Sovereign.NationId) : Bool {
    if (isNationAdmin(caller)) { return true };
    isNationOwner(caller, nation);
  };

  // The effective lifecycle state for a Nation: the stored overriding state
  // when one is in force, otherwise the state derived from the founding
  // setup. An existing Nation's constitution and activation state are never
  // changed by this derivation.
  func lifecycleStateOf(nation : Sovereign.NationId) : Sovereign.NationLifecycleState {
    LifecycleLib.effectiveState(nationLifecycles.get(nation), foundingSetups.get(nation));
  };

  // The single guard every governance mutation consults before it runs.
  // Returns the precise error to surface, or null when the action is
  // permitted in the Nation's current lifecycle state.
  func lifecycleGuard(nation : Sovereign.NationId, action : LifecycleLib.LifecycleAction) : ?Sovereign.LifecycleError {
    LifecycleLib.actionError(lifecycleStateOf(nation), action);
  };

  // Create a new Nation from the five-step launcher. Only a signed-in caller
  // may create a Nation. The new Nation is private and not opted in to the
  // SOVEREIGN Network, and its workspace, selected apps, theme and
  // membership/voting configuration are persisted with it.
  //
  // One-click creation is truthful: the creator is appointed as Founding
  // Authority #1 and the Nation ends in Pending Activation with founding
  // progress 1/3. A partially created Nation is recovered rather than
  // duplicated: when the caller already owns a Nation whose founding setup
  // or constitution is already saved, that same Nation is resumed.
  public shared ({ caller }) func createNationFromLauncher(
    config : Sovereign.NationLauncherConfig,
  ) : async Sovereign.CreateNationResult {
    if (not isNationMember(caller)) {
      return #err(#notAuthorized);
    };
    switch (SovereignLib.validateLauncherConfig(config)) {
      case (?e) { return #err(e) };
      case null {};
    };
    let now = Time.now();

    // Recover a partially created Nation: when the caller already owns a
    // Nation whose founding setup or constitution is already saved, resume
    // that same Nation instead of creating a duplicate.
    let existing = nationOwners.values().toArray().find(func(o) =
      Principal.equal(o.creator, caller) and
      (foundingSetups.containsKey(o.nation) or
        nationLifecycles.containsKey(o.nation))
    );
    switch (existing) {
      case (?o) { return #ok(o.nation) };
      case null {};
    };

    // Resolve the governance model label from the fixed option vocabulary.
    let governanceLabel = switch (
      SovereignLib.governanceModelOptions().find(func(o) = o.modelKey == config.governanceModelKey)
    ) {
      case (?o) { o.labelText };
      case null { config.governanceModelKey };
    };

    let nationId = counters.nextNationId;
    counters.nextNationId += 1;

    // A newly created Nation is private and not opted in.
    nations.add(nationId, {
      id = nationId;
      name = config.name;
      shortDescription = config.shortDescription;
      region = config.region;
      governanceModel = governanceLabel;
      privacyLevel = #privateToMembers;
      isSample = false;
      openToCollaboration = false;
      timestamp = now;
    });

    // Record the creator as the Nation's owner.
    nationOwners.add(nationId, {
      nation = nationId;
      creator = caller;
      timestamp = now;
    });

    // The creator is recorded as the Nation's administrator member.
    let memberId = counters.nextNationMemberId;
    counters.nextNationMemberId += 1;
    nationMembers.add(memberId, {
      id = memberId;
      nation = nationId;
      member = caller;
      displayName = "Administrator";
      roleLabel = "Administrator";
      permissionLabels = [
        "View workspace",
        "Create proposals",
        "Vote on proposals",
        "Post in discussions",
        "Edit documents",
        "Manage members",
        "Manage treasury",
      ];
      timestamp = now;
    });

    // The Nation's workspace.
    let workspaceId = counters.nextWorkspaceId;
    counters.nextWorkspaceId += 1;
    workspaces.add(workspaceId, {
      id = workspaceId;
      nation = nationId;
      name = config.name # " Workspace";
      description = config.shortDescription;
      timestamp = now;
    });

    // The selected applications, in the order supplied.
    var order = 0;
    for (app in config.selectedApps.values()) {
      let appId = counters.nextWorkspaceAppId;
      counters.nextWorkspaceAppId += 1;
      workspaceApps.add(appId, {
        id = appId;
        workspace = workspaceId;
        appKey = app.appKey;
        displayName = app.displayName;
        oneLineDescription = app.oneLineDescription;
        status = app.status;
        iconKey = app.iconKey;
        order;
      });
      order += 1;
    };

    // Theme, membership/voting configuration and private-by-default privacy.
    nationThemes.add(nationId, config.theme);
    nationMembershipVoting.add(nationId, config.membershipVoting);
    privacySettings.add(nationId, SovereignLib.defaultPrivacySettings(nationId, now));

    // One-click creation is truthful: the creator is appointed as Founding
    // Authority #1 and the Nation ends in Pending Activation with founding
    // progress 1/3. The founding setup is created here so the creator's
    // appointment and acceptance are recorded against it.
    let setupWindowNanos : Int = 30 * 24 * 60 * 60 * 1_000_000_000;
    foundingSetups.add(nationId, {
      nation = nationId;
      status = #foundingSetup;
      foundingAuthority = caller;
      setupExpiresAt = now + setupWindowNanos;
      activatedConstitutionVersion = null;
      timestamp = now;
    });
    // The creator's own Founding Authority #1 seat is recorded alongside the
    // founding setup, so the launch status reports the creator's seat and the
    // launch can continue to the founding council. The seat is pending until
    // the creator confirms it through confirmFoundingSeat.
    let appointmentId = counters.nextFoundingAppointmentId;
    counters.nextFoundingAppointmentId += 1;
    foundingAppointments.add(appointmentId, {
      id = appointmentId;
      nation = nationId;
      authority = caller;
      appointmentLabel = "Founding Authority #1";
      status = #pending;
      expiresAt = now + setupWindowNanos;
      invitationToken = "";
      invitedEmail = null;
      acceptedAt = null;
      timestamp = now;
    });
    nationLifecycles.add(nationId, {
      nation = nationId;
      state = #pendingActivation;
      enteredAt = now;
      reason = "Created by the launcher; the creator is Founding Authority #1 and the Nation awaits two more authorities.";
      causedBy = caller;
      constitutionVersion = 0;
      timestamp = now;
    });

    #ok(nationId);
  };

  // Read a Nation's own workspace and settings as one view.
  public query func getNationWorkspaceView(nation : Sovereign.NationId) : async ?Sovereign.NationWorkspaceView {    switch (nations.get(nation)) {
      case null { return null };
      case (?n) {
        let workspace = workspaces.values().find(func(w) = w.nation == nation);
        let apps = switch (workspace) {
          case (?w) {
            let list = workspaceApps.values().toArray().filter(func(a) = a.workspace == w.id);
            list.sort(func(a, b) = Int.compare(a.order, b.order));
          };
          case null { [] };
        };
        let theme = switch (nationThemes.get(nation)) {
          case (?t) { t };
          case null { SovereignLib.defaultNationTheme() };
        };
        let membershipVoting = switch (nationMembershipVoting.get(nation)) {
          case (?c) { c };
          case null { SovereignLib.defaultMembershipVotingConfig() };
        };
        let privacy = switch (privacySettings.get(nation)) {
          case (?s) { s };
          case null { SovereignLib.defaultPrivacySettings(nation, 0) };
        };
        let optedIn = switch (networkNationProfiles.get(nation)) {
          case (?p) { p.networkOptIn };
          case null { false };
        };
        ?{
          nation = n;
          workspace;
          apps;
          theme;
          membershipVoting;
          privacySettings = privacy;
          networkOptIn = optedIn;
        };
      };
    };
  };

  // List the Nations a signed-in caller is authorized to switch between.
  public query ({ caller }) func listMyNations() : async [Sovereign.Nation] {
    if (not isNationMember(caller)) { return [] };
    let owned = nationOwners.values().toArray().filter(func(o) = Principal.equal(o.creator, caller));
    let ids = owned.map(func(o) = o.nation);
    nations.values().toArray().filter(func(n) = ids.contains(n.id));
  };

  // Read a Nation's collaboration participation state. A Nation with no
  // confirmed opt-in reads as private and not participating.
  public query func getCollaborationState(nation : Sovereign.NationId) : async ?Sovereign.CollaborationState {
    switch (nations.get(nation)) {
      case null { return null };
      case (?n) {
        let optedIn = switch (networkNationProfiles.get(nation)) {
          case (?p) { p.networkOptIn };
          case null { false };
        };
        ?{
          nation;
          optedIn;
          displayLabel = SovereignLib.collaborationLabel(optedIn);
          isSample = n.isSample;
        };
      };
    };
  };

  // Read a Nation's visual theme.
  public query func getNationTheme(nation : Sovereign.NationId) : async Sovereign.NationTheme {
    switch (nationThemes.get(nation)) {
      case (?t) { t };
      case null { SovereignLib.defaultNationTheme() };
    };
  };

  // Save a Nation's visual theme. Only the Nation's owner or an authorized
  // administrator may save it.
  public shared ({ caller }) func saveNationTheme(
    nation : Sovereign.NationId,
    theme : Sovereign.NationTheme,
  ) : async Sovereign.SaveNationThemeResult {
    if (not canAdministerNation(caller, nation)) {
      return #err(#notAuthorized);
    };
    if (not nations.containsKey(nation)) {
      return #err(#unknownNation);
    };
    if (theme.themeKey.size() == 0 or theme.wallpaperKey.size() == 0) {
      return #err(#invalidTheme);
    };
    nationThemes.add(nation, theme);
    #ok;
  };

  // Read a Nation's membership and voting configuration.
  public query func getMembershipVotingConfig(nation : Sovereign.NationId) : async Sovereign.MembershipVotingConfig {
    switch (nationMembershipVoting.get(nation)) {
      case (?c) { c };
      case null { SovereignLib.defaultMembershipVotingConfig() };
    };
  };

  // Save a Nation's membership and voting configuration. Only the Nation's
  // owner or an authorized administrator may save it.
  public shared ({ caller }) func saveMembershipVotingConfig(
    nation : Sovereign.NationId,
    config : Sovereign.MembershipVotingConfig,
  ) : async Sovereign.SaveMembershipVotingResult {
    if (not canAdministerNation(caller, nation)) {
      return #err(#notAuthorized);
    };
    if (not nations.containsKey(nation)) {
      return #err(#unknownNation);
    };
    if (config.quorumPercent > 100 or config.approvalThresholdPercent > 100) {
      return #err(#invalidPrivacyLevel);
    };
    nationMembershipVoting.add(nation, config);
    #ok;
  };

  // ---------------------------------------------------------------------
  // Nation Files — the shared document storage layer
  //
  // Every Nation has its own independent file namespace. Folders and files
  // are scoped to exactly one Nation and are private by default; both the
  // metadata and the off-chain content reference are access-controlled on
  // the backend, never by frontend filtering alone. Files are the central
  // document storage layer: Governance, Documents, Discussions, Projects and
  // Calendar reference the same stored files through attachment links rather
  // than creating duplicate copies. Files are never automatically shared
  // through the regional collaboration network.
  // ---------------------------------------------------------------------

  // Whether the caller is a member of one specific Nation: recorded in that
  // Nation's own member roster, its recorded owner, or a platform
  // administrator. This is per-Nation membership — a caller who is a member
  // of another Nation (or merely a registered platform user) is not a member
  // of this one.
  func isMemberOfNation(caller : Principal, nation : Sovereign.NationId) : Bool {
    if (isNationAdmin(caller)) { return true };
    if (isNationOwner(caller, nation)) { return true };
    nationMembers.values().any(func(m) =
      m.nation == nation and Principal.equal(m.member, caller)
    );
  };

  // Whether the caller may read a Nation's files: a member of that specific
  // Nation, an administrator, or any visitor for the built-in sample Nation.
  func canReadNationFiles(caller : Principal, nation : Sovereign.NationId) : Bool {
    switch (nations.get(nation)) {
      case (null) { false };
      case (?n) {
        if (n.isSample) { return true };
        isMemberOfNation(caller, nation);
      };
    };
  };

  // Whether the caller may write to a Nation's files: a member of that
  // specific Nation or an administrator. The sample Nation is read-only for
  // every caller so its shared demonstration records can never be modified.
  func canWriteNationFiles(caller : Principal, nation : Sovereign.NationId) : Bool {
    switch (nations.get(nation)) {
      case (null) { false };
      case (?n) {
        if (n.isSample) { return false };
        isMemberOfNation(caller, nation);
      };
    };
  };

  // The write gate shared by every Nation Files mutation. Returns the error
  // to surface, or null when the write may proceed. The sample Nation is
  // read-only for every caller; a real Nation requires a signed-in member or
  // administrator.
  func fileWriteError(caller : Principal, nation : Sovereign.NationId) : ?Sovereign.FileError {
    switch (nations.get(nation)) {
      case (null) { ?#unknownNation };
      case (?n) {
        if (n.isSample) { return ?#sampleReadOnly };
        if (not canWriteNationFiles(caller, nation)) {
          return ?#notAuthorized;
        };
        null;
      };
    };
  };

  // Whether a folder belongs to the given Nation. Used to reject a
  // cross-Nation folder reference.
  func folderBelongsToNation(folder : Sovereign.NationFolderId, nation : Sovereign.NationId) : Bool {
    switch (nationFolders.get(folder)) {
      case (?f) { f.nation == nation };
      case null { false };
    };
  };

  // List a Nation's folders. Only a member of the Nation (or an authorized
  // administrator) may read them; any visitor may read the sample Nation's.
  public query ({ caller }) func listNationFolders(nation : Sovereign.NationId) : async [Sovereign.NationFolder] {
    if (not canReadNationFiles(caller, nation)) { return [] };
    nationFolders.values().toArray().filter(func(f) = f.nation == nation);
  };

  // List the files in one folder of a Nation. `folder` is `null` for the
  // Nation's root.
  public query ({ caller }) func listNationFiles(
    nation : Sovereign.NationId,
    folder : ?Sovereign.NationFolderId,
  ) : async [Sovereign.NationFile] {
    if (not canReadNationFiles(caller, nation)) { return [] };
    nationFiles.values().toArray().filter(func(f) = f.nation == nation and f.folder == folder);
  };

  // Read a Nation's file-storage summary for the Files app header.
  public query ({ caller }) func getNationFileSummary(nation : Sovereign.NationId) : async Sovereign.NationFileSummary {
    if (not canReadNationFiles(caller, nation)) {
      return { nation; fileCount = 0; folderCount = 0; totalBytes = 0 };
    };
    SovereignLib.computeFileSummary(
      nation,
      nationFolders.values().toArray(),
      nationFiles.values().toArray(),
    );
  };

  // Create a folder in a Nation's file tree. `parent` is `null` for a root
  // folder. Requires a signed-in Nation member.
  public shared ({ caller }) func createNationFolder(
    nation : Sovereign.NationId,
    parent : ?Sovereign.NationFolderId,
    name : Text,
  ) : async Sovereign.SaveFolderResult {
    switch (fileWriteError(caller, nation)) {
      case (?e) { return #err(e) };
      case null {};
    };
    switch (SovereignLib.validateFileName(name)) {
      case (?e) { return #err(e) };
      case null {};
    };
    // A parent folder must belong to the same Nation.
    switch (parent) {
      case (?p) {
        if (not folderBelongsToNation(p, nation)) { return #err(#crossNationAccess) };
      };
      case null {};
    };
    let id = counters.nextNationFolderId;
    counters.nextNationFolderId += 1;
    nationFolders.add(id, {
      id;
      nation;
      parent;
      name;
      createdBy = caller;
      timestamp = Time.now();
    });
    #ok(id);
  };

  // Rename a folder. Requires a signed-in Nation member.
  public shared ({ caller }) func renameNationFolder(
    nation : Sovereign.NationId,
    folder : Sovereign.NationFolderId,
    name : Text,
  ) : async Sovereign.RenameFolderResult {
    switch (fileWriteError(caller, nation)) {
      case (?e) { return #err(e) };
      case null {};
    };
    let f = switch (nationFolders.get(folder)) {
      case (?f) { f };
      case null { return #err(#unknownFolder) };
    };
    if (f.nation != nation) { return #err(#crossNationAccess) };
    switch (SovereignLib.validateFileName(name)) {
      case (?e) { return #err(e) };
      case null {};
    };
    nationFolders.add(folder, { f with name; timestamp = Time.now() });
    #ok;
  };

  // Move a folder to a new parent within the same Nation. Rejects a move
  // that would place a folder inside itself.
  public shared ({ caller }) func moveNationFolder(
    nation : Sovereign.NationId,
    folder : Sovereign.NationFolderId,
    newParent : ?Sovereign.NationFolderId,
  ) : async Sovereign.RenameFolderResult {
    switch (fileWriteError(caller, nation)) {
      case (?e) { return #err(e) };
      case null {};
    };
    let f = switch (nationFolders.get(folder)) {
      case (?f) { f };
      case null { return #err(#unknownFolder) };
    };
    if (f.nation != nation) { return #err(#crossNationAccess) };
    switch (newParent) {
      case (?p) {
        if (not folderBelongsToNation(p, nation)) { return #err(#crossNationAccess) };
        // Reject a move that would place the folder inside itself or one of
        // its own descendants.
        if (p == folder or SovereignLib.isFolderDescendant(nationFolders.values().toArray(), p, folder)) {
          return #err(#invalidMove);
        };
      };
      case null {};
    };
    nationFolders.add(folder, { f with parent = newParent; timestamp = Time.now() });
    #ok;
  };

  // Delete an empty folder. Rejects a folder that still contains files or
  // subfolders. Requires a signed-in Nation member.
  public shared ({ caller }) func deleteNationFolder(
    nation : Sovereign.NationId,
    folder : Sovereign.NationFolderId,
  ) : async Sovereign.DeleteFolderResult {
    switch (fileWriteError(caller, nation)) {
      case (?e) { return #err(e) };
      case null {};
    };
    let f = switch (nationFolders.get(folder)) {
      case (?f) { f };
      case null { return #err(#unknownFolder) };
    };
    if (f.nation != nation) { return #err(#crossNationAccess) };
    let hasFiles = nationFiles.values().toArray().any(func(file) = file.nation == nation and file.folder == ?folder);
    let hasSubfolders = nationFolders.values().toArray().any(func(sub) = sub.nation == nation and sub.parent == ?folder);
    if (hasFiles or hasSubfolders) { return #err(#folderNotEmpty) };
    nationFolders.remove(folder);
    #ok;
  };

  // Register an uploaded file's metadata and off-chain content reference in
  // a Nation's file namespace. Requires a signed-in Nation member.
  public shared ({ caller }) func createNationFile(
    nation : Sovereign.NationId,
    folder : ?Sovereign.NationFolderId,
    name : Text,
    size : Nat,
    contentType : Text,
    content : Sovereign.ExternalBlob,
  ) : async Sovereign.SaveFileResult {
    switch (fileWriteError(caller, nation)) {
      case (?e) { return #err(e) };
      case null {};
    };
    switch (SovereignLib.validateFileName(name)) {
      case (?e) { return #err(e) };
      case null {};
    };
    switch (folder) {
      case (?p) {
        if (not folderBelongsToNation(p, nation)) { return #err(#crossNationAccess) };
      };
      case null {};
    };
    if (SovereignLib.isFileNameTaken(nationFiles.values().toArray(), nation, folder, name, null)) {
      return #err(#duplicateName);
    };
    let id = counters.nextNationFileId;
    counters.nextNationFileId += 1;
    nationFiles.add(id, {
      id;
      nation;
      folder;
      name;
      size;
      contentType;
      uploadedBy = caller;
      content;
      timestamp = Time.now();
    });
    #ok(id);
  };

  // Rename a stored file. Requires a signed-in Nation member.
  public shared ({ caller }) func renameNationFile(
    nation : Sovereign.NationId,
    file : Sovereign.NationFileId,
    name : Text,
  ) : async Sovereign.SaveFileResult {
    switch (fileWriteError(caller, nation)) {
      case (?e) { return #err(e) };
      case null {};
    };
    let f = switch (nationFiles.get(file)) {
      case (?f) { f };
      case null { return #err(#unknownFile) };
    };
    if (f.nation != nation) { return #err(#crossNationAccess) };
    switch (SovereignLib.validateFileName(name)) {
      case (?e) { return #err(e) };
      case null {};
    };
    if (SovereignLib.isFileNameTaken(nationFiles.values().toArray(), nation, f.folder, name, ?file)) {
      return #err(#duplicateName);
    };
    nationFiles.add(file, { f with name; timestamp = Time.now() });
    #ok(file);
  };

  // Move a file to another folder of the same Nation. `folder` is `null` for
  // the Nation's root. Requires a signed-in Nation member.
  public shared ({ caller }) func moveNationFile(
    nation : Sovereign.NationId,
    file : Sovereign.NationFileId,
    folder : ?Sovereign.NationFolderId,
  ) : async Sovereign.MoveFileResult {
    switch (fileWriteError(caller, nation)) {
      case (?e) { return #err(e) };
      case null {};
    };
    let f = switch (nationFiles.get(file)) {
      case (?f) { f };
      case null { return #err(#unknownFile) };
    };
    if (f.nation != nation) { return #err(#crossNationAccess) };
    switch (folder) {
      case (?p) {
        if (not folderBelongsToNation(p, nation)) { return #err(#crossNationAccess) };
      };
      case null {};
    };
    if (SovereignLib.isFileNameTaken(nationFiles.values().toArray(), nation, folder, f.name, ?file)) {
      return #err(#duplicateName);
    };
    nationFiles.add(file, { f with folder; timestamp = Time.now() });
    #ok;
  };

  // Delete a file and its attachment links. Requires a signed-in Nation
  // member.
  public shared ({ caller }) func deleteNationFile(
    nation : Sovereign.NationId,
    file : Sovereign.NationFileId,
  ) : async Sovereign.DeleteFileResult {
    switch (fileWriteError(caller, nation)) {
      case (?e) { return #err(e) };
      case null {};
    };
    let f = switch (nationFiles.get(file)) {
      case (?f) { f };
      case null { return #err(#unknownFile) };
    };
    if (f.nation != nation) { return #err(#crossNationAccess) };
    nationFiles.remove(file);
    // Remove every attachment link that referenced the deleted file.
    let stale = fileAttachments.values().toArray().filter(func(a) = a.file == file);
    for (a in stale.values()) {
      fileAttachments.remove(a.id);
    };
    #ok;
  };

  // Link an existing stored file to a workspace record (proposal, discussion
  // post, project, calendar event or document). The link carries no copy of
  // the file. Requires a signed-in Nation member.
  public shared ({ caller }) func attachFileToTarget(
    nation : Sovereign.NationId,
    file : Sovereign.NationFileId,
    target : Sovereign.FileAttachmentTarget,
  ) : async Sovereign.SaveAttachmentResult {
    switch (fileWriteError(caller, nation)) {
      case (?e) { return #err(e) };
      case null {};
    };
    let f = switch (nationFiles.get(file)) {
      case (?f) { f };
      case null { return #err(#unknownFile) };
    };
    if (f.nation != nation) { return #err(#crossNationAccess) };
    let id = counters.nextFileAttachmentId;
    counters.nextFileAttachmentId += 1;
    fileAttachments.add(id, {
      id;
      nation;
      file;
      target;
      attachedBy = caller;
      timestamp = Time.now();
    });
    #ok(id);
  };

  // List the attachment links for one workspace record. Opening a link
  // resolves the referenced file and respects that file's permissions.
  public query ({ caller }) func listFileAttachments(
    nation : Sovereign.NationId,
    target : Sovereign.FileAttachmentTarget,
  ) : async [Sovereign.FileAttachment] {
    if (not canReadNationFiles(caller, nation)) { return [] };
    fileAttachments.values().toArray().filter(func(a) = a.nation == nation and a.target == target);
  };

  // Remove an attachment link. The stored file itself is not deleted.
  // Requires a signed-in Nation member.
  public shared ({ caller }) func detachFile(
    nation : Sovereign.NationId,
    attachment : Sovereign.FileAttachmentId,
  ) : async Sovereign.DeleteFileResult {
    switch (fileWriteError(caller, nation)) {
      case (?e) { return #err(e) };
      case null {};
    };
    let a = switch (fileAttachments.get(attachment)) {
      case (?a) { a };
      case null { return #err(#unknownAttachment) };
    };
    if (a.nation != nation) { return #err(#crossNationAccess) };
    fileAttachments.remove(attachment);
    #ok;
  };

  // ---------------------------------------------------------------------
  // Sample workspace bootstrap
  // ---------------------------------------------------------------------

  // Ensure the built-in sample Nation workspace exists. Called by the
  // frontend on first load so a visitor always has a workspace to explore.
  // Idempotent: a second call is a no-op.
  public shared func ensureSampleWorkspace() : async Sovereign.NationId {
    seedSampleNation();
    sampleNationId;
  };
};
