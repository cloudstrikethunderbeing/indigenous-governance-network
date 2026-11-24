import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import Sovereign "../types/sovereign";
import DissolutionLib "../domains/dissolution";
import GovernanceAudit "../domains/governance-audit";

// ---------------------------------------------------------------------
// DAO Lifecycle — Dissolution public API.
//
// A constitutionally governed closure workflow for a Nation's digital
// workspace. The workflow is enforced entirely in the backend:
//
//   proposed -> coolingOff -> voting -> approved -> archived
//
// A formal dissolution proposal carries a clear explanation and a member
// notification step. Voting requires the constitutionally authorized
// enhanced quorum and the default 90% approval threshold. A mandatory
// cooling-off period must elapse, an outstanding-obligations review and an
// authorized data export must be recorded, and the constitutionally
// required authorities must give a final confirmation before the Nation is
// archived.
//
// No unilateral deletion of an activated Nation is possible: a single
// authority's attempt to dissolve is rejected, and archiving is the only
// terminal closure. An unactivated draft is cancelled by its authorized
// creator instead, with safeguards for other founding participants.
//
// Archiving closes the digital Nation workspace only. Actual asset
// settlement and legal dissolution remain outside the simulated
// functionality, and closing a workspace never implies the dissolution of a
// Nation, the extinguishment of Indigenous rights or the surrender of
// sovereignty.
// ---------------------------------------------------------------------

mixin (
  accessControlState : AccessControl.AccessControlState,
  nations : Map.Map<Sovereign.NationId, Sovereign.Nation>,
  nationOwners : Map.Map<Sovereign.NationId, Sovereign.NationOwnership>,
  nationMembers : Map.Map<Sovereign.NationMemberId, Sovereign.NationMember>,
  nationLifecycles : Map.Map<Sovereign.NationId, Sovereign.NationLifecycle>,
  foundingSetups : Map.Map<Sovereign.NationId, Sovereign.FoundingSetup>,
  foundingAppointments : Map.Map<Nat, Sovereign.FoundingAppointment>,
  constitutions : Map.Map<Sovereign.ConstitutionId, Sovereign.Constitution>,
  dissolutions : Map.Map<Sovereign.DissolutionId, Sovereign.Dissolution>,
  governanceHistory : Map.Map<Sovereign.GovernanceHistoryId, Sovereign.GovernanceHistoryEntry>,
  counters : {
    var nextDissolutionId : Nat;
    var nextGovernanceHistoryId : Nat;
  },
) {
  // ---------------------------------------------------------------------
  // Authorization helpers
  // ---------------------------------------------------------------------

  // Whether the caller is a platform administrator. Administrators may read
  // a Nation's dissolution state but never bypass the constitutional
  // workflow: there is no administrator override for dissolution.
  func isDissolutionAdmin(caller : Principal) : Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  // Whether the caller is the Nation's recorded creator/owner.
  func isDissolutionNationOwner(caller : Principal, nation : Sovereign.NationId) : Bool {
    switch (nationOwners.get(nation)) {
      case (?o) { Principal.equal(o.creator, caller) };
      case null { false };
    };
  };

  // Whether the caller is a member of one specific Nation: recorded in that
  // Nation's own member roster, its recorded owner, or a platform
  // administrator. Per-Nation membership — a member of another Nation is not
  // a member of this one.
  func isDissolutionNationMember(caller : Principal, nation : Sovereign.NationId) : Bool {
    if (isDissolutionAdmin(caller)) { return true };
    if (isDissolutionNationOwner(caller, nation)) { return true };
    nationMembers.values().any(func(m) =
      m.nation == nation and Principal.equal(m.member, caller)
    );
  };

  // Whether the caller may read a Nation's dissolution state: a member of
  // that specific Nation, an administrator, or any visitor for the built-in
  // sample Nation. A Nation's dissolution is never readable by another
  // Nation.
  func canReadDissolution(caller : Principal, nation : Sovereign.NationId) : Bool {
    switch (nations.get(nation)) {
      case (null) { false };
      case (?n) {
        if (n.isSample) { return true };
        isDissolutionNationMember(caller, nation);
      };
    };
  };

  // The current lifecycle state of a Nation, defaulting to Draft when no
  // lifecycle record exists yet.
  func dissolutionLifecycleStateOf(nation : Sovereign.NationId) : Sovereign.NationLifecycleState {
    switch (nationLifecycles.get(nation)) {
      case (?l) { l.state };
      case null { #draft };
    };
  };

  // The constitution version in force for a Nation, or 0 when none.
  func constitutionVersionOf(nation : Sovereign.NationId) : Nat {
    var version = 0;
    for (c in constitutions.values()) {
      if (c.nation == nation and c.active and c.version > version) { version := c.version };
    };
    version;
  };

  // The distinct accepted founding authorities for a Nation. These are the
  // constitutionally required authorities whose final confirmation closes a
  // dissolution.
  func foundingAuthoritiesOf(nation : Sovereign.NationId) : [Principal] {
    let acc = List.empty<Principal>();
    for (a in foundingAppointments.values()) {
      if (a.nation == nation and a.status == #accepted and not acc.any(func(p) = Principal.equal(p, a.authority))) {
        acc.add(a.authority);
      };
    };
    acc.toArray();
  };

  // Whether the caller is one of the Nation's accepted founding authorities.
  func isFoundingAuthorityOf(caller : Principal, nation : Sovereign.NationId) : Bool {
    foundingAuthoritiesOf(nation).any(func(p) = Principal.equal(p, caller));
  };

  // The number of eligible voters for a dissolution: the Nation's distinct
  // recorded members plus its accepted founding authorities.
  func eligibleVoterCount(nation : Sovereign.NationId) : Nat {
    let acc = List.empty<Principal>();
    for (m in nationMembers.values()) {
      if (m.nation == nation and not acc.any(func(p) = Principal.equal(p, m.member))) {
        acc.add(m.member);
      };
    };
    for (p in foundingAuthoritiesOf(nation).values()) {
      if (not acc.any(func(existing) = Principal.equal(existing, p))) { acc.add(p) };
    };
    acc.toArray().size();
  };

  // The most recent dissolution for a Nation, if any.
  func latestDissolution(nation : Sovereign.NationId) : ?Sovereign.Dissolution {
    var found : ?Sovereign.Dissolution = null;
    for (d in dissolutions.values()) {
      if (d.nation == nation) {
        switch (found) {
          case (?current) { if (d.id > current.id) { found := ?d } };
          case null { found := ?d };
        };
      };
    };
    found;
  };

  // Look up a dissolution by id, scoped to the Nation.
  func dissolutionInNation(nation : Sovereign.NationId, id : Sovereign.DissolutionId) : ?Sovereign.Dissolution {
    switch (dissolutions.get(id)) {
      case (?d) { if (d.nation == nation) { ?d } else { null } };
      case null { null };
    };
  };

  // Append one governance history entry for a dissolution event.
  func recordDissolutionHistory(
    nation : Sovereign.NationId,
    actorPrincipal : Principal,
    referenceId : Nat,
    summary : Text,
    now : Sovereign.Timestamp,
  ) {
    let historyId = counters.nextGovernanceHistoryId;
    counters.nextGovernanceHistoryId += 1;
    governanceHistory.add(historyId, GovernanceAudit.newEntry(
      historyId,
      nation,
      #approval,
      actorPrincipal,
      referenceId,
      summary,
      constitutionVersionOf(nation),
      now,
    ));
  };

  // Move a Nation's lifecycle to a new state, recording the transition.
  func setLifecycle(
    nation : Sovereign.NationId,
    state : Sovereign.NationLifecycleState,
    reason : Text,
    causedBy : Principal,
    now : Sovereign.Timestamp,
  ) {
    nationLifecycles.add(nation, {
      nation;
      state;
      enteredAt = now;
      reason;
      causedBy;
      constitutionVersion = constitutionVersionOf(nation);
      timestamp = now;
    });
  };

  // ---------------------------------------------------------------------
  // Reads
  // ---------------------------------------------------------------------

  // Read the most recent dissolution proposal for a Nation, if any.
  public query ({ caller }) func getDissolution(nation : Sovereign.NationId) : async ?Sovereign.Dissolution {
    if (not canReadDissolution(caller, nation)) { return null };
    latestDissolution(nation);
  };

  // List a Nation's dissolution proposals, oldest first. Only a member of the
  // Nation (or an authorized administrator) may read them.
  public query ({ caller }) func listDissolutions(nation : Sovereign.NationId) : async [Sovereign.Dissolution] {
    if (not canReadDissolution(caller, nation)) { return [] };
    let list = dissolutions.values().toArray().filter(func(d) = d.nation == nation);
    list.sort(func(a, b) = Nat.compare(a.id, b.id));
  };

  // ---------------------------------------------------------------------
  // Dissolution workflow
  // ---------------------------------------------------------------------

  // Propose a formal dissolution of an activated Nation. Only a member of the
  // Nation may propose. The proposal carries a clear explanation and starts
  // the mandatory cooling-off period; members are notified in the same step.
  // A draft or pending-activation Nation is not dissolved through this
  // workflow.
  public shared ({ caller }) func proposeDissolution(
    nation : Sovereign.NationId,
    proposal : Text,
    explanation : Text,
  ) : async Sovereign.SaveDissolutionResult {
    if (not isDissolutionNationMember(caller, nation)) { return #err(#notAuthorized) };
    if (not nations.containsKey(nation)) { return #err(#unknownNation) };
    if (proposal.size() == 0) { return #err(#missingTitle) };
    if (explanation.size() == 0) { return #err(#missingSummary) };
    let state = dissolutionLifecycleStateOf(nation);
    if (not DissolutionLib.canBeginDissolution(state)) { return #err(#invalidLifecycleTransition) };
    // A Nation already in a live dissolution cannot start another.
    switch (latestDissolution(nation)) {
      case (?existing) {
        if (not DissolutionLib.isTerminal(existing.status)) { return #err(#invalidLifecycleTransition) };
      };
      case null {};
    };
    let now = Time.now();
    let id = counters.nextDissolutionId;
    counters.nextDissolutionId += 1;
    dissolutions.add(id, {
      id;
      nation;
      proposal;
      explanation;
      memberNotifiedAt = ?now;
      status = #coolingOff;
      tally = DissolutionLib.defaultTally();
      coolingOffEnd = now + DissolutionLib.coolingOffWindowNanos();
      obligationsReview = null;
      dataExportReference = null;
      finalConfirmation = null;
      archivedAt = null;
      proposer = caller;
      timestamp = now;
    });
    setLifecycle(nation, #pendingDissolution, "A dissolution proposal is in progress.", caller, now);
    recordDissolutionHistory(nation, caller, id, "Dissolution proposal opened; members notified.", now);
    #ok(id);
  };

  // Open voting on a dissolution proposal once its cooling-off period has
  // elapsed. Only a member of the Nation may open voting.
  public shared ({ caller }) func openDissolutionVoting(
    nation : Sovereign.NationId,
    dissolution : Sovereign.DissolutionId,
  ) : async Sovereign.SaveDissolutionResult {
    if (not isDissolutionNationMember(caller, nation)) { return #err(#notAuthorized) };
    let d = switch (dissolutionInNation(nation, dissolution)) {
      case (?d) { d };
      case null { return #err(#unknownDissolution) };
    };
    if (d.status != #coolingOff) { return #err(#invalidLifecycleTransition) };
    let now = Time.now();
    if (not DissolutionLib.coolingOffElapsed(d, now)) { return #err(#coolingOffNotElapsed) };
    dissolutions.add(d.id, { d with status = #voting; timestamp = now });
    recordDissolutionHistory(nation, caller, d.id, "Dissolution voting opened.", now);
    #ok(d.id);
  };

  // Record one member's vote on a dissolution proposal. Each eligible member
  // votes once; a duplicate vote is rejected. Voting is open only while the
  // proposal is in the voting state.
  public shared ({ caller }) func castDissolutionVote(
    nation : Sovereign.NationId,
    dissolution : Sovereign.DissolutionId,
    choice : Sovereign.VoteChoice,
  ) : async Sovereign.SaveDissolutionResult {
    if (not isDissolutionNationMember(caller, nation)) { return #err(#notAuthorized) };
    let d = switch (dissolutionInNation(nation, dissolution)) {
      case (?d) { d };
      case null { return #err(#unknownDissolution) };
    };
    if (d.status != #voting) { return #err(#invalidLifecycleTransition) };
    // One vote per member per dissolution. The tally is the only record of
    // votes, so a member's prior vote is tracked in the governance history.
    let alreadyVoted = governanceHistory.values().any(func(e) =
      e.nation == nation and e.referenceId == d.id and
      e.summary == "Dissolution vote cast by " # caller.toText()
    );
    if (alreadyVoted) { return #err(#duplicateApproval) };
    let now = Time.now();
    let tally = switch (choice) {
      case (#inFavor) { { d.tally with votesInFavor = d.tally.votesInFavor + 1 } };
      case (#against) { { d.tally with votesAgainst = d.tally.votesAgainst + 1 } };
      case (#abstain) { { d.tally with votesAbstain = d.tally.votesAbstain + 1 } };
    };
    dissolutions.add(d.id, { d with tally; timestamp = now });
    recordDissolutionHistory(nation, caller, d.id, "Dissolution vote cast by " # caller.toText(), now);
    #ok(d.id);
  };

  // Close voting on a dissolution proposal and record the outcome. The
  // proposal is approved only when the enhanced quorum and the 90% approval
  // threshold are both met; otherwise it is rejected. Only a member of the
  // Nation may close voting.
  public shared ({ caller }) func closeDissolutionVoting(
    nation : Sovereign.NationId,
    dissolution : Sovereign.DissolutionId,
  ) : async Sovereign.SaveDissolutionResult {
    if (not isDissolutionNationMember(caller, nation)) { return #err(#notAuthorized) };
    let d = switch (dissolutionInNation(nation, dissolution)) {
      case (?d) { d };
      case null { return #err(#unknownDissolution) };
    };
    if (d.status != #voting) { return #err(#invalidLifecycleTransition) };
    let now = Time.now();
    let eligible = eligibleVoterCount(nation);
    if (not DissolutionLib.quorumMet(d.tally, eligible)) {
      dissolutions.add(d.id, { d with status = #rejected; timestamp = now });
      setLifecycle(nation, #active, "Dissolution rejected: enhanced quorum not reached.", caller, now);
      recordDissolutionHistory(nation, caller, d.id, "Dissolution rejected: quorum not reached.", now);
      return #err(#quorumNotReached);
    };
    if (not DissolutionLib.approvalMet(d.tally)) {
      dissolutions.add(d.id, { d with status = #rejected; timestamp = now });
      setLifecycle(nation, #active, "Dissolution rejected: approval threshold not met.", caller, now);
      recordDissolutionHistory(nation, caller, d.id, "Dissolution rejected: approval threshold not met.", now);
      return #err(#approvalThresholdNotMet);
    };
    dissolutions.add(d.id, { d with status = #approved; timestamp = now });
    recordDissolutionHistory(nation, caller, d.id, "Dissolution approved by constitutional vote.", now);
    #ok(d.id);
  };

  // Record the outstanding-obligations review for an approved dissolution.
  // Required before final confirmation. Only a member of the Nation may
  // record it.
  public shared ({ caller }) func recordObligationsReview(
    nation : Sovereign.NationId,
    dissolution : Sovereign.DissolutionId,
    note : Text,
    outstandingObligations : [Text],
  ) : async Sovereign.SaveDissolutionResult {
    if (not isDissolutionNationMember(caller, nation)) { return #err(#notAuthorized) };
    let d = switch (dissolutionInNation(nation, dissolution)) {
      case (?d) { d };
      case null { return #err(#unknownDissolution) };
    };
    if (d.status != #approved) { return #err(#invalidLifecycleTransition) };
    if (note.size() == 0) { return #err(#missingSummary) };
    let now = Time.now();
    dissolutions.add(d.id, {
      d with
      obligationsReview = ?{
        reviewedBy = caller;
        note;
        outstandingObligations;
        reviewedAt = now;
      };
      timestamp = now;
    });
    recordDissolutionHistory(nation, caller, d.id, "Outstanding obligations reviewed.", now);
    #ok(d.id);
  };

  // Record the authorized data export reference for an approved dissolution.
  // Required before final confirmation. Only a member of the Nation may
  // record it.
  public shared ({ caller }) func recordDataExport(
    nation : Sovereign.NationId,
    dissolution : Sovereign.DissolutionId,
    exportReference : Text,
  ) : async Sovereign.SaveDissolutionResult {
    if (not isDissolutionNationMember(caller, nation)) { return #err(#notAuthorized) };
    let d = switch (dissolutionInNation(nation, dissolution)) {
      case (?d) { d };
      case null { return #err(#unknownDissolution) };
    };
    if (d.status != #approved) { return #err(#invalidLifecycleTransition) };
    if (exportReference.size() == 0) { return #err(#missingSummary) };
    let now = Time.now();
    dissolutions.add(d.id, { d with dataExportReference = ?exportReference; timestamp = now });
    recordDissolutionHistory(nation, caller, d.id, "Authorized data export recorded.", now);
    #ok(d.id);
  };

  // Give the final confirmation for an approved dissolution and archive the
  // Nation. Only an accepted founding authority of the Nation may confirm.
  // The cooling-off period must have elapsed, the obligations review and the
  // data export must be recorded, and the caller must be a constitutionally
  // required authority. Archiving disables operational governance while
  // preserving authorized historical access.
  public shared ({ caller }) func archiveDissolution(
    nation : Sovereign.NationId,
    dissolution : Sovereign.DissolutionId,
  ) : async Sovereign.ArchiveDissolutionResult {
    if (not isFoundingAuthorityOf(caller, nation)) { return #err(#notAuthorized) };
    let d = switch (dissolutionInNation(nation, dissolution)) {
      case (?d) { d };
      case null { return #err(#unknownDissolution) };
    };
    if (d.status == #archived) { return #err(#alreadyArchived) };
    if (d.status != #approved) { return #err(#invalidLifecycleTransition) };
    let now = Time.now();
    if (not DissolutionLib.coolingOffElapsed(d, now)) { return #err(#coolingOffNotElapsed) };
    switch (d.obligationsReview) {
      case (null) { return #err(#obligationsNotReviewed) };
      case (?_) {};
    };
    switch (d.dataExportReference) {
      case (null) { return #err(#obligationsNotReviewed) };
      case (?_) {};
    };
    dissolutions.add(d.id, {
      d with
      status = #archived;
      finalConfirmation = ?{ authority = caller; ratifiedAt = now };
      archivedAt = ?now;
      timestamp = now;
    });
    setLifecycle(
      nation,
      #archived,
      "Digital Nation workspace archived by constitutional dissolution. Asset settlement and legal dissolution remain outside the simulated functionality.",
      caller,
      now,
    );
    recordDissolutionHistory(nation, caller, d.id, "Dissolution confirmed; Nation workspace archived.", now);
    #ok;
  };

  // Withdraw a dissolution proposal before it is archived. Only the proposer
  // may withdraw it. The Nation returns to Active.
  public shared ({ caller }) func withdrawDissolution(
    nation : Sovereign.NationId,
    dissolution : Sovereign.DissolutionId,
  ) : async Sovereign.SaveDissolutionResult {
    let d = switch (dissolutionInNation(nation, dissolution)) {
      case (?d) { d };
      case null { return #err(#unknownDissolution) };
    };
    if (not Principal.equal(d.proposer, caller)) { return #err(#notAuthorized) };
    if (DissolutionLib.isTerminal(d.status)) { return #err(#invalidLifecycleTransition) };
    let now = Time.now();
    dissolutions.add(d.id, { d with status = #withdrawn; timestamp = now });
    setLifecycle(nation, #active, "Dissolution proposal withdrawn.", caller, now);
    recordDissolutionHistory(nation, caller, d.id, "Dissolution proposal withdrawn.", now);
    #ok(d.id);
  };

  // ---------------------------------------------------------------------
  // Unactivated draft cancellation
  // ---------------------------------------------------------------------

  // Cancel an unactivated draft Nation. Only the Nation's authorized creator
  // may cancel it, and only while it is still a draft or pending activation.
  // An activated Nation can never be cancelled this way — it must go through
  // the constitutional dissolution workflow. Other founding participants are
  // notified through the governance history.
  public shared ({ caller }) func cancelDraftNation(nation : Sovereign.NationId) : async Sovereign.ArchiveDissolutionResult {
    if (not isDissolutionNationOwner(caller, nation)) { return #err(#notAuthorized) };
    if (not nations.containsKey(nation)) { return #err(#unknownNation) };
    let state = dissolutionLifecycleStateOf(nation);
    if (not DissolutionLib.isUnactivatedDraft(state)) { return #err(#notActivatedDraft) };
    let now = Time.now();
    setLifecycle(nation, #archived, "Unactivated draft cancelled by its authorized creator.", caller, now);
    recordDissolutionHistory(nation, caller, nation, "Unactivated draft cancelled by its creator.", now);
    #ok;
  };
};
