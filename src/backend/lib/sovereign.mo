import List "mo:core/List";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Sovereign "../types/sovereign";

// Pure helpers for the SOVEREIGN OS Nation workspace domain.
//
// Everything here is deterministic and side-effect free. The AI Copilot's
// answer is composed from stored workspace records only: it never mutates
// proposals, votes, membership or treasury, and it never invents activity.
module {
  // The selectable governance model options a Nation may choose from. These
  // are fixed platform options, not per-Nation state.
  public func governanceModelOptions() : [Sovereign.GovernanceModelOption] {
    [
      {
        modelKey = "consensusCouncil";
        labelText = "Consensus council";
        description = "A council of elected representatives seeks consensus before any decision is enacted.";
      },
      {
        modelKey = "directVote";
        labelText = "Direct community vote";
        description = "Every member votes directly on each proposal; the majority decides.";
      },
      {
        modelKey = "elderCouncil";
        labelText = "Elder council";
        description = "A council of elders holds decision authority, advised by the wider community.";
      },
      {
        modelKey = "hybrid";
        labelText = "Hybrid";
        description = "A council prepares proposals and the wider community ratifies them by vote.";
      },
      {
        modelKey = "stewardship";
        labelText = "Stewardship";
        description = "Designated stewards hold time-limited authority over defined areas of the workspace.";
      },
    ];
  };

  // The default roles-and-permissions matrix for a Nation. Each entry is one
  // cell: a role, a capability, and whether that role is allowed it.
  public func defaultRolePermissions() : [Sovereign.RolePermissionEntry] {
    let roles = ["Member", "Steward", "Elder", "Administrator"];
    let capabilities = [
      "View workspace",
      "Create proposals",
      "Vote on proposals",
      "Post in discussions",
      "Edit documents",
      "Manage members",
      "Manage treasury",
    ];
    let allowed = func(role : Text, capability : Text) : Bool {
      if (role == "Administrator") { return true };
      if (role == "Elder") {
        return capability != "Manage treasury";
      };
      if (role == "Steward") {
        return capability == "View workspace" or capability == "Create proposals" or
          capability == "Vote on proposals" or capability == "Post in discussions" or
          capability == "Edit documents";
      };
      // Member
      capability == "View workspace" or capability == "Vote on proposals" or
        capability == "Post in discussions";
    };
    let entries = List.empty<Sovereign.RolePermissionEntry>();
    for (role in roles.values()) {
      for (capability in capabilities.values()) {
        entries.add({
          roleLabel = role;
          capability;
          allowed = allowed(role, capability);
        });
      };
    };
    entries.toArray();
  };

  // The default privacy settings for a Nation: workspace content is private
  // to members until the Nation chooses otherwise.
  public func defaultPrivacySettings(nation : Sovereign.NationId, timestamp : Sovereign.Timestamp) : Sovereign.PrivacySettings {
    {
      nation;
      proposalsVisible = false;
      discussionsVisible = false;
      documentsVisible = false;
      calendarVisible = false;
      treasuryVisible = false;
      timestamp;
    };
  };

  // Compute a Nation's treasury summary from its stored transactions.
  // `balance` is floored at zero so a summary never reports a negative
  // balance.
  public func computeTreasurySummary(
    nation : Sovereign.NationId,
    transactions : [Sovereign.NationTreasuryTransaction],
  ) : Sovereign.NationTreasurySummary {
    var totalIncome = 0;
    var totalExpense = 0;
    var count = 0;
    for (t in transactions.values()) {
      if (t.nation == nation) {
        count += 1;
        switch (t.direction) {
          case (#income) { totalIncome += t.amount };
          case (#expense) { totalExpense += t.amount };
        };
      };
    };
    let balance = if (totalIncome > totalExpense) { Nat.sub(totalIncome, totalExpense) } else { 0 };
    {
      nation;
      totalIncome;
      totalExpense;
      balance;
      transactionCount = count;
    };
  };

  // Whether a Nation's workspace content of a given area is visible to
  // another Nation, according to the Nation's privacy settings. A Nation
  // always sees its own content.
  public func isAreaVisibleToOtherNations(
    settings : Sovereign.PrivacySettings,
    area : Text,
  ) : Bool {
    switch (area) {
      case ("proposals") { settings.proposalsVisible };
      case ("discussions") { settings.discussionsVisible };
      case ("documents") { settings.documentsVisible };
      case ("calendar") { settings.calendarVisible };
      case ("treasury") { settings.treasuryVisible };
      case (_) { false };
    };
  };

  // ---------------------------------------------------------------------
  // Nation OS launcher — defaults and validation
  // ---------------------------------------------------------------------

  // The default visual theme for a newly created Nation: the neutral default
  // wallpaper, system theme, no blur.
  public func defaultNationTheme() : Sovereign.NationTheme {
    {
      themeKey = "system";
      wallpaperKey = "neutral";
      blurEnabled = false;
    };
  };

  // The default membership and voting configuration for a newly created
  // Nation.
  public func defaultMembershipVotingConfig() : Sovereign.MembershipVotingConfig {
    {
      membershipModel = "approval";
      votingModel = "oneMemberOneVote";
      quorumPercent = 50;
      approvalThresholdPercent = 50;
    };
  };

  // The default application set for a newly created Nation. Governance,
  // Discussions, Members, Documents, Calendar and Treasury are working apps;
  // Projects and Conservation are labelled Preview until operational.
  public func defaultSelectedApps() : [Sovereign.SelectedApp] {
    [
      {
        appKey = "governance";
        displayName = "Governance";
        oneLineDescription = "Proposals, votes and community decisions.";
        status = #working;
        iconKey = "gavel";
      },
      {
        appKey = "discussions";
        displayName = "Discussions";
        oneLineDescription = "Threads and community conversation.";
        status = #working;
        iconKey = "chat";
      },
      {
        appKey = "members";
        displayName = "Members";
        oneLineDescription = "Roles, permissions and the community roster.";
        status = #working;
        iconKey = "users";
      },
      {
        appKey = "documents";
        displayName = "Documents";
        oneLineDescription = "Policies, charters and shared records.";
        status = #working;
        iconKey = "file-text";
      },
      {
        appKey = "calendar";
        displayName = "Calendar";
        oneLineDescription = "Meetings, gatherings and events.";
        status = #working;
        iconKey = "calendar";
      },
      {
        appKey = "treasury";
        displayName = "Treasury";
        oneLineDescription = "Income, spending and the community balance.";
        status = #working;
        iconKey = "wallet";
      },
      {
        appKey = "copilot";
        displayName = "AI Copilot";
        oneLineDescription = "Ask questions about this workspace.";
        status = #working;
        iconKey = "sparkles";
      },
      {
        appKey = "projects";
        displayName = "Projects";
        oneLineDescription = "Community initiatives and their progress.";
        status = #preview;
        iconKey = "layers";
      },
      {
        appKey = "conservation";
        displayName = "Conservation";
        oneLineDescription = "Land, water and stewardship programmes.";
        status = #preview;
        iconKey = "leaf";
      },
    ];
  };

  // Validate a launcher configuration. Returns the first validation error, or
  // null when the configuration is acceptable.
  public func validateLauncherConfig(config : Sovereign.NationLauncherConfig) : ?Sovereign.SovereignError {
    if (config.name.size() == 0) { return ?#missingName };
    if (config.governanceModelKey.size() == 0) { return ?#missingGovernanceModel };
    if (config.selectedApps.size() == 0) { return ?#missingApps };
    if (config.theme.themeKey.size() == 0 or config.theme.wallpaperKey.size() == 0) {
      return ?#invalidTheme;
    };
    if (config.membershipVoting.quorumPercent > 100 or config.membershipVoting.approvalThresholdPercent > 100) {
      return ?#invalidPrivacyLevel;
    };
    null;
  };

  // The honest collaboration display label for a Nation's opt-in state.
  public func collaborationLabel(optedIn : Bool) : Text {
    if (optedIn) { "Open to Collaboration" } else { "Private — Not Participating" };
  };

  // ---------------------------------------------------------------------
  // Nation Files — pure helpers
  // ---------------------------------------------------------------------

  // The maximum file name length. Bounds storage and keeps a name from
  // dominating a listing.
  public func maxFileNameLength() : Nat {
    255;
  };

  // Validate a folder or file name. Returns the first validation error, or
  // null when the name is acceptable.
  public func validateFileName(name : Text) : ?Sovereign.FileError {
    if (name.size() == 0) { return ?#missingName };
    if (name.size() > maxFileNameLength()) { return ?#nameTooLong };
    null;
  };

  // Compute a Nation's file-storage summary from its stored folders and
  // files. Only records belonging to `nation` are counted.
  public func computeFileSummary(
    nation : Sovereign.NationId,
    folders : [Sovereign.NationFolder],
    files : [Sovereign.NationFile],
  ) : Sovereign.NationFileSummary {
    var folderCount = 0;
    for (f in folders.values()) {
      if (f.nation == nation) { folderCount += 1 };
    };
    var fileCount = 0;
    var totalBytes = 0;
    for (f in files.values()) {
      if (f.nation == nation) {
        fileCount += 1;
        totalBytes += f.size;
      };
    };
    {
      nation;
      fileCount;
      folderCount;
      totalBytes;
    };
  };

  // Whether a folder is a descendant of `ancestor` within the same Nation.
  // Used to reject a move that would place a folder inside itself.
  public func isFolderDescendant(
    folders : [Sovereign.NationFolder],
    candidate : Sovereign.NationFolderId,
    ancestor : Sovereign.NationFolderId,
  ) : Bool {
    var current : ?Sovereign.NationFolderId = ?candidate;
    var guard = 0;
    while (guard < 1000) {
      switch (current) {
        case (null) { return false };
        case (?id) {
          if (id == ancestor) { return true };
          current := switch (folders.find(func(f) = f.id == id)) {
            case (?f) { f.parent };
            case null { null };
          };
        };
      };
      guard += 1;
    };
    false;
  };

  // Whether a file name is already used by another file in the same folder
  // of the same Nation. `exclude` skips the file being renamed or moved.
  public func isFileNameTaken(
    files : [Sovereign.NationFile],
    nation : Sovereign.NationId,
    folder : ?Sovereign.NationFolderId,
    name : Text,
    exclude : ?Sovereign.NationFileId,
  ) : Bool {
    files.any(func(f) =
      f.nation == nation and f.folder == folder and f.name == name and
      (switch (exclude) { case (?id) { f.id != id }; case null { true } })
    );
  };

  // ---------------------------------------------------------------------
  // AI Copilot — advisory answer composition
  //
  // The Copilot answers a question about one Nation's workspace using only
  // the stored workspace records. It returns the sources it drew on and is
  // always marked advisory. It never mutates proposals, votes, membership or
  // treasury, and it never invents activity: when the stored data does not
  // answer the question, the answer says so.
  // ---------------------------------------------------------------------

  // A workspace snapshot the Copilot composes its answer from.
  public type CopilotContext = {
    nation : Sovereign.Nation;
    proposals : [Sovereign.NationProposal];
    threads : [Sovereign.DiscussionThread];
    posts : [Sovereign.DiscussionPost];
    members : [Sovereign.NationMember];
    documents : [Sovereign.NationDocument];
    events : [Sovereign.CalendarEvent];
    treasury : Sovereign.NationTreasurySummary;
  };

  // Compose a deterministic, advisory answer from the stored workspace
  // records. The answer is grounded in the records and cites the sources it
  // drew on. This is the always-available path: it never calls an external
  // service and can never abort the caller.
  public func composeCopilotAnswer(
    question : Text,
    context : CopilotContext,
  ) : Sovereign.CopilotAnswer {
    let lower = question.toLower();
    let has = func(needle : Text) : Bool = lower.contains(#text needle);
    let sources = List.empty<Sovereign.CopilotSource>();
    let parts = List.empty<Text>();

    // Always open with the Nation's identity so the answer is scoped.
    parts.add(
      context.nation.name # " is a Nation workspace in " # context.nation.region #
      ", governed by " # context.nation.governanceModel # "."
    );

    // Proposals.
    if (has("proposal") or has("vote") or has("governance") or has("decision")) {
      let open = context.proposals.filter(func(p) = p.status == #open);
      parts.add(
        "There are " # context.proposals.size().toText() # " proposals on record, " #
        open.size().toText() # " of them open."
      );
      for (p in open.values()) {
        sources.add({ sourceKind = "proposal"; referenceId = p.id; title = p.title });
      };
    };

    // Discussions.
    if (has("discussion") or has("thread") or has("comment") or has("talk")) {
      parts.add(
        "The workspace has " # context.threads.size().toText() # " discussion threads with " #
        context.posts.size().toText() # " posts."
      );
      for (t in context.threads.values()) {
        sources.add({ sourceKind = "thread"; referenceId = t.id; title = t.title });
      };
    };

    // Membership.
    if (has("member") or has("role") or has("permission") or has("who")) {
      parts.add("The Nation has " # context.members.size().toText() # " members on record.");
      for (m in context.members.values()) {
        sources.add({ sourceKind = "member"; referenceId = m.id; title = m.displayName });
      };
    };

    // Documents.
    if (has("document") or has("policy") or has("charter") or has("record")) {
      parts.add("There are " # context.documents.size().toText() # " documents in the workspace.");
      for (d in context.documents.values()) {
        sources.add({ sourceKind = "document"; referenceId = d.id; title = d.title });
      };
    };

    // Calendar.
    if (has("event") or has("calendar") or has("meeting") or has("schedule")) {
      parts.add("There are " # context.events.size().toText() # " calendar events scheduled.");
      for (e in context.events.values()) {
        sources.add({ sourceKind = "event"; referenceId = e.id; title = e.title });
      };
    };

    // Treasury.
    if (has("treasury") or has("fund") or has("budget") or has("spend") or has("money")) {
      parts.add(
        "The Nation treasury records " # context.treasury.transactionCount.toText() #
        " transactions, with a balance of " # context.treasury.balance.toText() # "."
      );
      sources.add({ sourceKind = "treasury"; referenceId = context.nation.id; title = "Treasury summary" });
    };

    // When the question names no known area, answer with a workspace overview
    // grounded in the stored counts rather than inventing an answer.
    if (parts.size() == 1) {
      parts.add(
        "The workspace holds " # context.proposals.size().toText() # " proposals, " #
        context.threads.size().toText() # " discussion threads, " #
        context.members.size().toText() # " members, " #
        context.documents.size().toText() # " documents and " #
        context.events.size().toText() # " calendar events."
      );
    };

    parts.add("This answer is advisory only and changed no workspace state.");

    {
      nation = context.nation.id;
      question;
      answer = parts.toArray().values().join(" ");
      sources = sources.toArray();
      advisoryOnly = true;
      timestamp = 0;
    };
  };

  // =====================================================================
  // DAO Constitution & Governance — pure helpers
  //
  // Everything here is deterministic and side-effect free. The rule set is
  // the organization's own configurable governance policy; the templates are
  // examples, not assumptions about an organization's legal or traditional
  // governance authority.
  // =====================================================================

  // The selectable constitution templates. Each is an example starting
  // point, not a claim about an organization's authority.
  public func constitutionTemplates() : [Sovereign.GovernanceModelOption] {
    [
      {
        modelKey = "indigenousNation";
        labelText = "Indigenous Nation";
        description = "A starting point for a Nation or community: founding authorities, consensus-minded decisions and community-controlled data. An example only — the Nation defines its own authority.";
      },
      {
        modelKey = "nonprofit";
        labelText = "Nonprofit";
        description = "A starting point for a nonprofit: a board, member approval and transparent reporting. An example only — the organization defines its own rules.";
      },
      {
        modelKey = "cooperative";
        labelText = "Cooperative";
        description = "A starting point for a cooperative: one member one vote, elected stewards and shared treasury oversight. An example only.";
      },
      {
        modelKey = "business";
        labelText = "Business";
        description = "A starting point for a business: appointed leadership, defined roles and delegated authority. An example only.";
      },
      {
        modelKey = "community";
        labelText = "Community";
        description = "A starting point for a community group: open membership, simple majority votes and light-touch oversight. An example only.";
      },
      {
        modelKey = "custom";
        labelText = "Custom DAO";
        description = "Start from a neutral rule set and define every governance setting yourself.";
      },
    ];
  };

  // The default governance rule set for a template. Every setting is a plain
  // configurable value the organization may change before activation.
  public func defaultRuleSet(templateKey : Text) : Sovereign.GovernanceRuleSet {
    // Shared baseline: a neutral, plain-language rule set. Each template
    // overrides only the settings that differ.
    let base : Sovereign.GovernanceRuleSet = {
      foundingAuthorityProcedure = "The founding authority creates the DAO and appoints the other founding authorities, who each accept independently.";
      membershipEligibility = "Any person or organization the community accepts may apply to join.";
      identityVerification = "Members sign in with Internet Identity; no other personal data is required.";
      membershipApprovalThresholdPercent = 50;
      loginRequirement = "Members sign in at least once every 30 days to stay active.";
      participationRequirement = "Members cast one eligible vote every 30 days when an eligible proposal is open.";
      votingEligibility = "Active members may vote; new members wait before voting on proposals introduced after they join.";
      newMemberWaitingPeriodDays = 8;
      votingMethod = "oneMemberOneVote";
      delegationAllowed = false;
      votingWeight = "One eligible member, one vote.";
      proposalSubmissionPeriodDays = 7;
      proposalReviewPeriodDays = 3;
      proposalDiscussionPeriodDays = 7;
      quorumPercent = 50;
      approvalThresholdPercent = 50;
      abstentionsCount = false;
      tieBreakRule = "A tie is recorded as tied and returns to the community for a new decision.";
      proposalClassifications = ["general", "treasuryExpenditure", "constitutionalAmendment", "authorityChange", "destructiveAction"];
      approvalOutcomes = ["approved", "rejected", "noQuorum", "tied"];
      treasurySpendLimit = 0;
      treasuryAuthorization = "Treasury transfers require additional, independent authorization.";
      leadershipElectionProcedure = "Leadership is elected by the members and serves a fixed term.";
      leadershipTermDays = 365;
      leadershipRemovalProcedure = "Leadership may be removed by an approved governance decision.";
      documentAccess = "Documents are visible to members unless marked confidential.";
      confidentialityRule = "Confidential documents are visible only to the roles the community authorizes.";
      aiPermissions = "AI is advisory only and may never vote, execute or change membership.";
      humanOversight = "Every AI suggestion requires a human decision before it takes effect.";
      appealsProcedure = "A member may appeal a membership rejection, an inactivity decision or a governance decision.";
      disputeProcedure = "Disputes are reviewed by members without a conflict of interest.";
      evidenceReviewProcedure = "Evidence is submitted, reviewed and recorded before a decision.";
      emergencyPauseProcedure = "An authorized administrator may pause execution in an emergency.";
      governanceRecoveryProcedure = "Lost access or insufficient authorities are recovered through an approved governance decision; there is no hidden platform override.";
      amendmentProcedure = "The constitution is amended only through an approved governance decision.";
      collaborationDataSharing = "The organization shares data with other organizations only when it explicitly opts in.";
      dissolutionProcedure = "Dissolution requires an approved governance decision.";
      dataExportProcedure = "Members may export the organization's data at any time.";
    };
    switch (templateKey) {
      case ("indigenousNation") {
        {
          base with
          foundingAuthorityProcedure = "The founding authority creates the DAO and appoints the other founding authorities, who each accept independently through Internet Identity.";
          membershipApprovalThresholdPercent = 67;
          quorumPercent = 60;
          approvalThresholdPercent = 67;
          newMemberWaitingPeriodDays = 8;
          confidentialityRule = "Community knowledge is community-controlled; confidential records are visible only to the roles the Nation authorizes.";
          collaborationDataSharing = "The Nation shares data with other Nations only when an authorized administrator explicitly opts in.";
        };
      };
      case ("nonprofit") {
        {
          base with
          membershipApprovalThresholdPercent = 50;
          quorumPercent = 50;
          approvalThresholdPercent = 50;
          leadershipTermDays = 730;
        };
      };
      case ("cooperative") {
        {
          base with
          votingMethod = "oneMemberOneVote";
          delegationAllowed = true;
          quorumPercent = 50;
          approvalThresholdPercent = 50;
        };
      };
      case ("business") {
        {
          base with
          membershipEligibility = "Membership is by appointment of the organization's leadership.";
          membershipApprovalThresholdPercent = 50;
          votingMethod = "weighted";
          votingWeight = "Voting weight follows the member's defined stake.";
          delegationAllowed = true;
        };
      };
      case ("community") {
        {
          base with
          membershipApprovalThresholdPercent = 50;
          quorumPercent = 40;
          approvalThresholdPercent = 50;
          newMemberWaitingPeriodDays = 0;
        };
      };
      case (_) {
        // "custom" and any unknown key: the neutral baseline.
        base;
      };
    };
  };

  // The ten built-in governance roles, seeded per Nation. Each role carries
  // its scoped capabilities across view, propose, approve, vote, modify and
  // execute.
  public func defaultGovernanceRoles(nation : Sovereign.NationId) : [Sovereign.GovernanceRole] {
    // Deterministic built-in role ids 1..10, stable across Nations.
    let mk = func(
      id : Sovereign.GovernanceRoleId,
      kind : Sovereign.GovernanceRoleKind,
      roleName : Text,
      description : Text,
      capabilities : [Sovereign.GovernanceCapability],
    ) : Sovereign.GovernanceRole {
      {
        id;
        nation;
        kind;
        roleName;
        description;
        capabilities;
        isCustom = false;
        timestamp = 0;
      };
    };
    [
      mk(1, #foundingAuthority, "Founding Authority", "Creates the DAO, appoints the other founding authorities and confirms the constitution.", [#view, #propose, #approve, #vote, #modify, #execute]),
      mk(2, #membershipAuthority, "Membership Authority", "Reviews membership applications and approves or rejects new members.", [#view, #approve, #modify]),
      mk(3, #member, "Member", "Views the workspace, proposes and votes on decisions.", [#view, #propose, #vote]),
      mk(4, #governanceDelegate, "Governance Delegate", "Votes on behalf of members who delegated their vote, until the delegation expires.", [#view, #vote]),
      mk(5, #proposalSteward, "Proposal Steward", "Guides proposals through review and discussion and keeps the record accurate.", [#view, #propose, #modify]),
      mk(6, #executionAuthority, "Execution Authority", "Authorizes and carries out approved decisions after the vote has passed.", [#view, #approve, #execute]),
      mk(7, #treasurySteward, "Treasury Steward", "Manages the treasury within the limits the constitution sets.", [#view, #propose, #approve, #execute]),
      mk(8, #documentSteward, "Document Steward", "Maintains documents and controls access to confidential records.", [#view, #modify]),
      mk(9, #auditor, "Auditor", "Reviews decisions, execution and the Participation Census record.", [#view]),
      mk(10, #observer, "Observer", "May view the workspace without proposing, voting or executing.", [#view]),
    ];
  };

  // Validate a governance rule set. Returns the first validation error, or
  // null when the rule set is acceptable.
  public func validateRuleSet(rules : Sovereign.GovernanceRuleSet) : ?Sovereign.GovernanceError {
    if (rules.quorumPercent > 100 or rules.approvalThresholdPercent > 100 or
      rules.membershipApprovalThresholdPercent > 100) {
      return ?#invalidThreshold;
    };
    if (rules.proposalClassifications.size() == 0 or rules.approvalOutcomes.size() == 0) {
      return ?#invalidRuleSet;
    };
    if (rules.foundingAuthorityProcedure.size() == 0 or rules.amendmentProcedure.size() == 0) {
      return ?#invalidRuleSet;
    };
    null;
  };

  // Whether a role grants a capability.
  public func roleHasCapability(role : Sovereign.GovernanceRole, capability : Sovereign.GovernanceCapability) : Bool {
    role.capabilities.any(func(c) = c == capability);
  };

  // Whether a delegation is still active at `now` (not revoked, not
  // expired).
  public func isDelegationActive(delegation : Sovereign.RoleDelegation, now : Sovereign.Timestamp) : Bool {
    delegation.active and now < delegation.expiresAt;
  };

  // Decide a proposal's outcome from its tallies, quorum and thresholds.
  //
  // Quorum is the share of eligible voters who participated (favor +
  // against, plus abstentions when the rule counts them). Approval is the
  // share of the deciding votes that were in favor. A tie is resolved by
  // the tie rule only when the rule names a side; otherwise the outcome is
  // `#tied`.
  public func computeProposalOutcome(
    votesInFavor : Nat,
    votesAgainst : Nat,
    votesAbstain : Nat,
    quorumPercent : Nat,
    approvalThresholdPercent : Nat,
    abstentionsCount : Bool,
    eligibleVoters : Nat,
  ) : Sovereign.ProposalOutcome {
    let countedAbstain = if (abstentionsCount) { votesAbstain } else { 0 };
    let participating = votesInFavor + votesAgainst + countedAbstain;
    // Quorum: no eligible voters means no quorum can be met.
    if (eligibleVoters == 0) { return #noQuorum };
    if (participating * 100 < quorumPercent * eligibleVoters) {
      return #noQuorum;
    };
    // A tie among the deciding votes is resolved by the tie rule only when
    // the rule names a side; otherwise it is `#tied`.
    if (votesInFavor == votesAgainst) {
      return #tied;
    };
    let deciding = votesInFavor + votesAgainst;
    if (deciding == 0) { return #noQuorum };
    if (votesInFavor * 100 >= approvalThresholdPercent * deciding) {
      #approved;
    } else {
      #rejected;
    };
  };

  // Whether an execution request may proceed: authorized, past its timelock,
  // not paused, not cancelled, and not already executed.
  public func canExecute(request : Sovereign.ExecutionRequest, now : Sovereign.Timestamp) : Bool {
    if (request.status != #timelocked) { return false };
    switch (request.timelockUntil) {
      case (?until) { now >= until };
      case null { false };
    };
  };

  // Compute a Nation's Participation Census summary from its census entries.
  // Only entries belonging to `nation` are counted. Confidential entries are
  // counted as participation without exposing their detail.
  public func computeCensusSummary(
    nation : Sovereign.NationId,
    entries : [Sovereign.CensusEntry],
  ) : Sovereign.CensusSummary {
    var eligibleMembers = 0;
    var activeMembers = 0;
    var proposals = 0;
    var votes = 0;
    var delegations = 0;
    var disputes = 0;
    var executions = 0;
    for (e in entries.values()) {
      if (e.nation == nation) {
        switch (e.kind) {
          case (#membershipApproval) { eligibleMembers += 1 };
          case (#activity) { activeMembers += 1 };
          case (#proposal) { proposals += 1 };
          case (#vote) { votes += 1 };
          case (#delegation) { delegations += 1 };
          case (#permissionChange) {};
          case (#dispute) { disputes += 1 };
          case (#executionOutcome) { executions += 1 };
        };
      };
    };
    {
      nation;
      eligibleMembers;
      activeMembers;
      proposals;
      votes;
      delegations;
      disputes;
      executions;
    };
  };

  // Whether a reviewer must recuse from an appeal because of a documented
  // conflict of interest.
  public func mustRecuse(appeal : Sovereign.Appeal, reviewer : Principal) : Bool {
    appeal.recusals.any(func(r) = Principal.equal(r.reviewer, reviewer));
  };
};
