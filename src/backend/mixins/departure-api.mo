import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import Sovereign "../types/sovereign";
import DepartureLib "../domains/departure";
import GovernanceAudit "../domains/governance-audit";

// ---------------------------------------------------------------------
// DAO Lifecycle & Constitutional Continuity — Member departure and
// emergency governance public API.
//
// Voluntary departure, retirement, suspension and constitutional removal,
// plus restricted emergency suspension and its restoration. Every rule is
// enforced here, in the backend, against the caller's own recorded role
// assignments and the Nation's lifecycle state — never by frontend controls
// alone.
//
// Two constitutional guarantees are enforced:
//
//   1. When a departure becomes effective, the member's operational
//      permissions are revoked immediately: every role assignment and every
//      active delegation to or from the member is removed, and any later
//      administrative action by the departing member is rejected.
//
//   2. Emergency suspension is temporary, auditable and narrowly scoped. It
//      requires two of three authorized authorities by default, carries a
//      defined expiry, and can never amend the constitution, seize assets,
//      permanently remove authorities or dissolve the Nation.
//
// Historical contributions and governance records are preserved: a departure
// never deletes a member's census entries, recorded votes or governance
// history. A member may export its own authorized personal records.
// ---------------------------------------------------------------------

mixin (
  accessControlState : AccessControl.AccessControlState,
  nations : Map.Map<Sovereign.NationId, Sovereign.Nation>,
  nationMembers : Map.Map<Sovereign.NationMemberId, Sovereign.NationMember>,
  nationOwners : Map.Map<Sovereign.NationId, Sovereign.NationOwnership>,
  governanceRoles : Map.Map<Sovereign.GovernanceRoleId, Sovereign.GovernanceRole>,
  roleAssignments : Map.Map<Sovereign.RoleAssignmentId, Sovereign.RoleAssignment>,
  roleDelegations : Map.Map<Sovereign.RoleDelegationId, Sovereign.RoleDelegation>,
  memberAdmissions : Map.Map<Sovereign.MemberAdmissionId, Sovereign.MemberAdmission>,
  censusEntries : Map.Map<Sovereign.CensusEntryId, Sovereign.CensusEntry>,
  recordedVotes : Map.Map<Sovereign.RecordedVoteId, Sovereign.RecordedVote>,
  governanceHistory : Map.Map<Sovereign.GovernanceHistoryId, Sovereign.GovernanceHistoryEntry>,
  nationLifecycles : Map.Map<Sovereign.NationId, Sovereign.NationLifecycle>,
  memberDepartures : Map.Map<Sovereign.MemberDepartureId, Sovereign.MemberDeparture>,
  emergencySuspensions : Map.Map<Sovereign.EmergencySuspensionId, Sovereign.EmergencySuspension>,
  counters : {
    var nextMemberDepartureId : Nat;
    var nextEmergencySuspensionId : Nat;
    var nextGovernanceHistoryId : Nat;
  },
) {
  // Maximum free-text length for a departure notice or review note. Bounds
  // storage and keeps one record from dominating a listing. Transient: a
  // constant, not durable state.
  transient let maxDepartureTextLength : Nat = 4000;

  // ---------------------------------------------------------------------
  // Authorization helpers
  // ---------------------------------------------------------------------

  // Whether the caller is a platform administrator.
  func isPlatformAdminDeparture(caller : Principal) : Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  // Whether the caller is the Nation's recorded creator/owner.
  func isNationOwnerDeparture(caller : Principal, nation : Sovereign.NationId) : Bool {
    switch (nationOwners.get(nation)) {
      case (?o) { Principal.equal(o.creator, caller) };
      case null { false };
    };
  };

  // Whether the caller is a member of one specific Nation: recorded in that
  // Nation's own member roster, its recorded owner, or a platform
  // administrator. Per-Nation isolation — a member of another Nation is not
  // a member of this one.
  func isMemberOfNationDeparture(caller : Principal, nation : Sovereign.NationId) : Bool {
    if (isPlatformAdminDeparture(caller)) { return true };
    if (isNationOwnerDeparture(caller, nation)) { return true };
    nationMembers.values().any(func(m) =
      m.nation == nation and Principal.equal(m.member, caller)
    );
  };

  // Whether the caller may administer the given Nation: its recorded owner,
  // or a platform administrator.
  func canAdministerNationDeparture(caller : Principal, nation : Sovereign.NationId) : Bool {
    if (isPlatformAdminDeparture(caller)) { return true };
    isNationOwnerDeparture(caller, nation);
  };

  // The roles defined for one Nation.
  func rolesForNationDeparture(nation : Sovereign.NationId) : [Sovereign.GovernanceRole] {
    governanceRoles.values().toArray().filter(func(r) = r.nation == nation);
  };

  // Look up a role by id, scoped to the Nation.
  func roleInNationDeparture(nation : Sovereign.NationId, role : Sovereign.GovernanceRoleId) : ?Sovereign.GovernanceRole {
    switch (governanceRoles.get(role)) {
      case (?r) { if (r.nation == nation) { ?r } else { null } };
      case null { null };
    };
  };

  // The union of capabilities the caller holds in a Nation, from every role
  // assigned to the caller and every active delegation made to the caller.
  func callerCapabilitiesDeparture(caller : Principal, nation : Sovereign.NationId) : [Sovereign.GovernanceCapability] {
    let now = Time.now();
    let acc = List.empty<Sovereign.GovernanceCapability>();
    let addCap = func(c : Sovereign.GovernanceCapability) {
      if (not acc.any(func(existing) = existing == c)) { acc.add(c) };
    };
    for (a in roleAssignments.values()) {
      if (a.nation == nation and Principal.equal(a.member, caller)) {
        switch (roleInNationDeparture(nation, a.role)) {
          case (?r) { for (c in r.capabilities.values()) { addCap(c) } };
          case null {};
        };
      };
    };
    for (d in roleDelegations.values()) {
      if (d.nation == nation and Principal.equal(d.delegate, caller) and d.active and d.expiresAt > now) {
        for (c in d.capabilities.values()) { addCap(c) };
      };
    };
    acc.toArray();
  };

  // Whether the caller holds a capability in a Nation. A Nation's owner and a
  // platform administrator hold every capability.
  func hasCapabilityDeparture(caller : Principal, nation : Sovereign.NationId, capability : Sovereign.GovernanceCapability) : Bool {
    if (canAdministerNationDeparture(caller, nation)) { return true };
    callerCapabilitiesDeparture(caller, nation).any(func(c) = c == capability);
  };

  // The active constitution version in force for a Nation, or 0 when none.
  func activeConstitutionVersionDeparture(nation : Sovereign.NationId) : Nat {
    switch (nationLifecycles.get(nation)) {
      case (?l) { l.constitutionVersion };
      case null { 0 };
    };
  };

  // The Nation's current lifecycle state, or `#draft` when no record exists.
  func lifecycleStateDeparture(nation : Sovereign.NationId) : Sovereign.NationLifecycleState {
    switch (nationLifecycles.get(nation)) {
      case (?l) { l.state };
      case null { #draft };
    };
  };

  // Whether the Nation is archived: operational governance is disabled and
  // no departure or emergency action may be recorded.
  func isArchivedDeparture(nation : Sovereign.NationId) : Bool {
    switch (lifecycleStateDeparture(nation)) {
      case (#archived) { true };
      case (_) { false };
    };
  };

  // The set of authorized authorities for a Nation: the principals holding a
  // role that grants the `#approve` capability, plus the Nation's recorded
  // owner. Each principal appears once.
  func authorizedAuthorities(nation : Sovereign.NationId) : [Principal] {
    let acc = List.empty<Principal>();
    let addP = func(p : Principal) {
      if (not acc.any(func(existing) = Principal.equal(existing, p))) { acc.add(p) };
    };
    switch (nationOwners.get(nation)) {
      case (?o) { addP(o.creator) };
      case null {};
    };
    let roles = rolesForNationDeparture(nation);
    for (a in roleAssignments.values()) {
      if (a.nation == nation) {
        switch (roles.find(func(r) = r.id == a.role)) {
          case (?r) {
            if (r.capabilities.any(func(c) = c == #approve)) { addP(a.member) };
          };
          case null {};
        };
      };
    };
    acc.toArray();
  };

  // Whether the caller is an authorized authority of the Nation.
  func isAuthorizedAuthority(caller : Principal, nation : Sovereign.NationId) : Bool {
    if (canAdministerNationDeparture(caller, nation)) { return true };
    DepartureLib.containsPrincipal(authorizedAuthorities(nation), caller);
  };

  // The number of distinct authorized authorities required to approve an
  // emergency suspension. Defaults to two of three; never silently reduced.
  func emergencyApprovalThreshold(nation : Sovereign.NationId) : Nat {
    let authorities = authorizedAuthorities(nation).size();
    let base = DepartureLib.defaultEmergencyApprovalThreshold();
    if (authorities < base) { authorities } else { base };
  };

  // Append one entry to the Nation's governance history.
  func recordDepartureHistory(
    nation : Sovereign.NationId,
    kind : Sovereign.GovernanceHistoryKind,
    actorPrincipal : Principal,
    referenceId : Nat,
    summary : Text,
  ) {
    let id = counters.nextGovernanceHistoryId;
    counters.nextGovernanceHistoryId += 1;
    governanceHistory.add(id, GovernanceAudit.newEntry(
      id,
      nation,
      kind,
      actorPrincipal,
      referenceId,
      summary,
      activeConstitutionVersionDeparture(nation),
      Time.now(),
    ));
  };

  // The member's admission record in a Nation, if any.
  func admissionForDeparture(nation : Sovereign.NationId, member : Principal) : ?Sovereign.MemberAdmission {
    memberAdmissions.values().find(func(a) = a.nation == nation and Principal.equal(a.member, member));
  };

  // The Nation's member record for a principal, if any.
  func nationMemberForDeparture(nation : Sovereign.NationId, member : Principal) : ?Sovereign.NationMember {
    nationMembers.values().find(func(m) = m.nation == nation and Principal.equal(m.member, member));
  };

  // Whether a member has an effective departure recorded in a Nation.
  func hasEffectiveDeparture(nation : Sovereign.NationId, member : Principal) : Bool {
    memberDepartures.values().any(func(d) =
      d.nation == nation and Principal.equal(d.member, member) and
      DepartureLib.isEffective(d.status)
    );
  };

  // Revoke every operational permission a member holds in a Nation: remove
  // the member's role assignments, deactivate every delegation to or from the
  // member, and remove the member from the Nation's roster. Historical
  // records (census entries, recorded votes, governance history) are never
  // touched. Returns the revocation timestamp.
  func revokeMemberPermissions(nation : Sovereign.NationId, member : Principal) : Sovereign.Timestamp {
    let now = Time.now();
    // Remove the member's own role assignments.
    let assignmentIds = roleAssignments.values().toArray()
      .filter(func(a) = a.nation == nation and Principal.equal(a.member, member))
      .map(func(a) = a.id);
    for (id in assignmentIds.values()) {
      roleAssignments.remove(id);
    };
    // Deactivate every delegation the member made or received.
    for (d in roleDelegations.values()) {
      if (d.nation == nation and (Principal.equal(d.delegator, member) or Principal.equal(d.delegate, member)) and d.active) {
        roleDelegations.add(d.id, { d with active = false; timestamp = now });
      };
    };
    // Remove the member from the Nation's roster.
    let rosterIds = nationMembers.values().toArray()
      .filter(func(m) = m.nation == nation and Principal.equal(m.member, member))
      .map(func(m) = m.id);
    for (id in rosterIds.values()) {
      nationMembers.remove(id);
    };
    now;
  };

  // Make a departure effective: revoke the member's operational permissions
  func makeDepartureEffective(departure : Sovereign.MemberDeparture) : Sovereign.MemberDeparture {
    let revokedAt = switch (departure.permissionRevokedAt) {
      case (?t) { t };
      case null { revokeMemberPermissions(departure.nation, departure.member) };
    };
    {
      departure with
      status = #effective;
      permissionRevokedAt = ?revokedAt;
    };
  };

  // Apply an approved emergency suspension to the Nation's lifecycle: move
  // the Nation to `#temporarilySuspended` so operational governance is
  // restricted until the suspension is restored. A Nation that is already
  // archived is never changed.
  func applyEmergencySuspension(
    nation : Sovereign.NationId,
    causedBy : Principal,
    reason : Text,
    now : Sovereign.Timestamp,
  ) {
    switch (nationLifecycles.get(nation)) {
      case (?l) {
        if (l.state != #archived) {
          nationLifecycles.add(nation, {
            l with
            state = #temporarilySuspended;
            enteredAt = now;
            reason;
            causedBy;
            timestamp = now;
          });
        };
      };
      case null {};
    };
  };

  // ---------------------------------------------------------------------
  // Public read surface
  // ---------------------------------------------------------------------

  // List a Nation's member departures. Only a member of the Nation (or an
  // authorized administrator) may read them; a departing member may always
  // read its own departure record.
  public query ({ caller }) func listMemberDepartures(nation : Sovereign.NationId) : async [Sovereign.MemberDeparture] {
    let isMember = isMemberOfNationDeparture(caller, nation);
    memberDepartures.values().toArray().filter(func(d) =
      d.nation == nation and (isMember or Principal.equal(d.member, caller))
    );
  };

  // Read one departure record, scoped to its Nation. A member of the Nation,
  // an authorized administrator, or the departing member may read it.
  public query ({ caller }) func getMemberDeparture(departure : Sovereign.MemberDepartureId) : async ?Sovereign.MemberDeparture {
    switch (memberDepartures.get(departure)) {
      case (?d) {
        if (isMemberOfNationDeparture(caller, d.nation) or Principal.equal(d.member, caller)) {
          ?d;
        } else {
          null;
        };
      };
      case null { null };
    };
  };

  // Whether a member has an effective departure in a Nation. A member of the
  // Nation (or an authorized administrator) may read this.
  public query ({ caller }) func isMemberDeparted(nation : Sovereign.NationId, member : Principal) : async Bool {
    if (not isMemberOfNationDeparture(caller, nation)) { return false };
    hasEffectiveDeparture(nation, member);
  };

  // List a Nation's emergency suspensions. Only a member of the Nation (or an
  // authorized administrator) may read them.
  public query ({ caller }) func listEmergencySuspensions(nation : Sovereign.NationId) : async [Sovereign.EmergencySuspension] {
    if (not isMemberOfNationDeparture(caller, nation)) { return [] };
    emergencySuspensions.values().toArray().filter(func(s) = s.nation == nation);
  };

  // Read one emergency suspension, scoped to its Nation.
  public query ({ caller }) func getEmergencySuspension(suspension : Sovereign.EmergencySuspensionId) : async ?Sovereign.EmergencySuspension {
    switch (emergencySuspensions.get(suspension)) {
      case (?s) {
        if (isMemberOfNationDeparture(caller, s.nation)) { ?s } else { null };
      };
      case null { null };
    };
  };

  // ---------------------------------------------------------------------
  // Departure workflow
  //
  // Voluntary departure and retirement are the member's own act and may
  // become effective immediately. Suspension and constitutional removal are
  // involuntary: they start in `#notice`, pass through review, and give the
  // member an appeal path before they become final.
  // ---------------------------------------------------------------------

  // Record a departure. A member may record its own voluntary departure or
  // retirement; a caller holding the `#modify` capability (or an authorized
  // administrator) may record a suspension or constitutional removal. An
  // involuntary departure starts in `#notice` and never becomes effective on
  // this call.
  public shared ({ caller }) func recordMemberDeparture(
    nation : Sovereign.NationId,
    member : Principal,
    kind : Sovereign.DepartureKind,
    notice : Text,
  ) : async Sovereign.SaveMemberDepartureResult {
    if (notice.size() == 0) { return #err(#missingReason) };
    if (notice.size() > maxDepartureTextLength) { return #err(#missingReason) };
    if (isArchivedDeparture(nation)) { return #err(#invalidLifecycleTransition) };
    let voluntary = DepartureLib.isVoluntary(kind);
    if (voluntary) {
      // Only the member itself may record its own voluntary departure or
      // retirement.
      if (not Principal.equal(caller, member)) { return #err(#notAuthorized) };
    } else {
      // An involuntary departure requires the `#modify` capability.
      if (not hasCapabilityDeparture(caller, nation, #modify)) { return #err(#notAuthorized) };
      // A caller may never remove itself through an involuntary path.
      if (Principal.equal(caller, member)) { return #err(#selfApproval) };
    };
    if (hasEffectiveDeparture(nation, member)) { return #err(#invalidLifecycleTransition) };
    let now = Time.now();
    let id = counters.nextMemberDepartureId;
    counters.nextMemberDepartureId += 1;
    let effectiveAt = if (voluntary) {
      now;
    } else {
      now + DepartureLib.defaultReviewWindowNanos();
    };
    let departure : Sovereign.MemberDeparture = {
      id;
      nation;
      member;
      kind;
      status = if (voluntary) { #effective } else { #notice };
      notice;
      reviewNote = "";
      appealReference = null;
      effectiveAt;
      permissionRevokedAt = null;
      recordedBy = caller;
      timestamp = now;
    };
    // A voluntary departure is effective immediately: revoke permissions now.
    let stored = if (voluntary) { makeDepartureEffective(departure) } else { departure };
    memberDepartures.add(id, stored);
    recordDepartureHistory(
      nation,
      #rejection,
      caller,
      id,
      DepartureLib.departureHistorySummary(kind, stored.status),
    );
    #ok(id);
  };

  // Review an involuntary departure. A caller holding the `#modify` capability
  // (or an authorized administrator) records the review outcome. The member
  // may never review its own departure. A reviewed departure moves to
  // `#underReview`; it becomes effective only through `finalizeMemberDeparture`
  // after the review window, so the member keeps its appeal path.
  public shared ({ caller }) func reviewMemberDeparture(
    nation : Sovereign.NationId,
    departure : Sovereign.MemberDepartureId,
    reviewNote : Text,
  ) : async Sovereign.SaveMemberDepartureResult {
    if (isArchivedDeparture(nation)) { return #err(#invalidLifecycleTransition) };
    if (not hasCapabilityDeparture(caller, nation, #modify)) { return #err(#notAuthorized) };
    let d = switch (memberDepartures.get(departure)) {
      case (?d) { d };
      case null { return #err(#unknownDeparture) };
    };
    if (d.nation != nation) { return #err(#notAuthorized) };
    if (not DepartureLib.isOpen(d.status)) { return #err(#invalidLifecycleTransition) };
    if (Principal.equal(caller, d.member)) { return #err(#selfApproval) };
    memberDepartures.add(departure, { d with status = #underReview; reviewNote });
    recordDepartureHistory(
      nation,
      #approval,
      caller,
      departure,
      DepartureLib.departureHistorySummary(d.kind, #underReview),
    );
    #ok(departure);
  };

  // Finalize an involuntary departure once its review window has elapsed. A
  // caller holding the `#modify` capability (or an authorized administrator)
  // may finalize it. Finalizing revokes the member's operational permissions
  // immediately. A departure that is still in `#notice` (never reviewed) or
  // still inside its review window cannot be finalized.
  public shared ({ caller }) func finalizeMemberDeparture(
    nation : Sovereign.NationId,
    departure : Sovereign.MemberDepartureId,
  ) : async Sovereign.SaveMemberDepartureResult {
    if (isArchivedDeparture(nation)) { return #err(#invalidLifecycleTransition) };
    if (not hasCapabilityDeparture(caller, nation, #modify)) { return #err(#notAuthorized) };
    let d = switch (memberDepartures.get(departure)) {
      case (?d) { d };
      case null { return #err(#unknownDeparture) };
    };
    if (d.nation != nation) { return #err(#notAuthorized) };
    if (DepartureLib.isEffective(d.status)) { return #err(#invalidLifecycleTransition) };
    // An involuntary departure must have been reviewed first.
    if (DepartureLib.requiresReview(d.kind) and d.status == #notice) {
      return #err(#invalidLifecycleTransition);
    };
    let now = Time.now();
    if (now < d.effectiveAt) { return #err(#invalidLifecycleTransition) };
    let effective = makeDepartureEffective(d);
    memberDepartures.add(departure, effective);
    recordDepartureHistory(
      nation,
      #rejection,
      caller,
      departure,
      DepartureLib.departureHistorySummary(d.kind, #effective),
    );
    #ok(departure);
  };

  // Withdraw a departure. The member may withdraw its own departure before it
  // becomes effective; an authorized administrator may withdraw any open
  // departure. A departure that is already effective cannot be withdrawn.
  public shared ({ caller }) func withdrawMemberDeparture(
    nation : Sovereign.NationId,
    departure : Sovereign.MemberDepartureId,
  ) : async Sovereign.SaveMemberDepartureResult {
    let d = switch (memberDepartures.get(departure)) {
      case (?d) { d };
      case null { return #err(#unknownDeparture) };
    };
    if (d.nation != nation) { return #err(#notAuthorized) };
    if (DepartureLib.isEffective(d.status)) { return #err(#invalidLifecycleTransition) };
    if (not (Principal.equal(caller, d.member) or canAdministerNationDeparture(caller, nation))) {
      return #err(#notAuthorized);
    };
    memberDepartures.add(departure, { d with status = #withdrawn });
    recordDepartureHistory(
      nation,
      #rejection,
      caller,
      departure,
      DepartureLib.departureHistorySummary(d.kind, #withdrawn),
    );
    #ok(departure);
  };

  // Appeal an involuntary departure. The departing member files the appeal
  // before the departure becomes effective; the departure moves to
  // `#appealed` and cannot be finalized until the appeal is decided. The
  // appeal is recorded against the departure so the review path is auditable.
  public shared ({ caller }) func appealMemberDeparture(
    nation : Sovereign.NationId,
    departure : Sovereign.MemberDepartureId,
    summary : Text,
  ) : async Sovereign.SaveMemberDepartureResult {
    if (summary.size() == 0) { return #err(#missingSummary) };
    let d = switch (memberDepartures.get(departure)) {
      case (?d) { d };
      case null { return #err(#unknownDeparture) };
    };
    if (d.nation != nation) { return #err(#notAuthorized) };
    if (not Principal.equal(caller, d.member)) { return #err(#notAuthorized) };
    if (not DepartureLib.requiresReview(d.kind)) { return #err(#invalidLifecycleTransition) };
    if (DepartureLib.isEffective(d.status)) { return #err(#invalidLifecycleTransition) };
    if (d.status == #appealed) { return #err(#invalidLifecycleTransition) };
    memberDepartures.add(departure, { d with status = #appealed; reviewNote = summary });
    recordDepartureHistory(
      nation,
      #rejection,
      caller,
      departure,
      DepartureLib.departureHistorySummary(d.kind, #appealed),
    );
    #ok(departure);
  };

  // ---------------------------------------------------------------------
  // Personal record export
  //
  // A member may export its own authorized personal records: its admission
  // record, its census entries, its recorded votes and its departures. The
  // export is scoped to the caller — a caller can never export another
  // member's records.
  // ---------------------------------------------------------------------

  public type PersonalRecordExport = {
    nation : Sovereign.NationId;
    member : Principal;
    admission : ?Sovereign.MemberAdmission;
    censusEntries : [Sovereign.CensusEntry];
    recordedVotes : [Sovereign.RecordedVote];
    departures : [Sovereign.MemberDeparture];
    exportedAt : Sovereign.Timestamp;
  };

  // Export the caller's own authorized personal records for one Nation.
  public query ({ caller }) func exportMyRecords(nation : Sovereign.NationId) : async PersonalRecordExport {
    {
      nation;
      member = caller;
      admission = admissionForDeparture(nation, caller);
      censusEntries = censusEntries.values().toArray().filter(func(e) =
        e.nation == nation and Principal.equal(e.subject, caller)
      );
      recordedVotes = recordedVotes.values().toArray().filter(func(v) =
        v.nation == nation and Principal.equal(v.voter, caller)
      );
      departures = memberDepartures.values().toArray().filter(func(d) =
        d.nation == nation and Principal.equal(d.member, caller)
      );
      exportedAt = Time.now();
    };
  };

  // ---------------------------------------------------------------------
  // Emergency governance
  //
  // A restricted emergency suspension for suspected account compromise,
  // unauthorized activity or governance integrity threats. It requires two of
  // three authorized authorities by default, carries a defined expiry, and is
  // narrowly scoped. It can never amend the constitution, seize assets,
  // permanently remove authorities or dissolve the Nation.
  // ---------------------------------------------------------------------

  // Request an emergency suspension. An authorized authority requests it; the
  // request starts with the caller's own approval and stays `#active` only
  // once the required distinct authorities have approved. The scope is
  // validated: a request that would amend the constitution, seize assets,
  // remove authorities or dissolve the Nation is rejected.
  public shared ({ caller }) func requestEmergencySuspension(
    nation : Sovereign.NationId,
    reason : Text,
    affectedAccounts : [Principal],
    affectedFunctions : [Text],
  ) : async Sovereign.SaveEmergencySuspensionResult {
    if (reason.size() == 0) { return #err(#missingReason) };
    if (reason.size() > maxDepartureTextLength) { return #err(#missingReason) };
    if (isArchivedDeparture(nation)) { return #err(#invalidLifecycleTransition) };
    if (not isAuthorizedAuthority(caller, nation)) { return #err(#notAuthorized) };
    if (not DepartureLib.isEmergencyScopePermitted(affectedFunctions)) {
      return #err(#emergencyScopeExceeded);
    };
    let now = Time.now();
    let id = counters.nextEmergencySuspensionId;
    counters.nextEmergencySuspensionId += 1;
    let approvingAuthorities = [caller];
    let required = emergencyApprovalThreshold(nation);
    let satisfied = DepartureLib.approvalsSatisfied(required, approvingAuthorities);
    let auditTrail : [Sovereign.EmergencyAuditEntry] = [{
      action = "requested";
      actorPrincipal = caller;
      note = reason;
      timestamp = now;
    }];
    let suspension : Sovereign.EmergencySuspension = {
      id;
      nation;
      reason;
      affectedAccounts;
      affectedFunctions;
      approvingAuthorities;
      status = #active;
      expiresAt = now + DepartureLib.defaultEmergencyWindowNanos();
      auditTrail;
      restoration = null;
      requestedBy = caller;
      timestamp = now;
    };
    emergencySuspensions.add(id, suspension);
    // Only a suspension that already meets its approval threshold takes
    // effect; otherwise it stays recorded and awaits further approvals.
    if (satisfied) {
      applyEmergencySuspension(nation, caller, reason, now);
    };
    recordDepartureHistory(
      nation,
      #approval,
      caller,
      id,
      DepartureLib.emergencyHistorySummary("requested"),
    );
    #ok(id);
  };

  // Approve an emergency suspension. A distinct authorized authority approves;
  // each authority counts once and a caller may never approve its own request
  // twice. Once the required distinct authorities have approved, the
  // suspension is active and its expiry is set.
  public shared ({ caller }) func approveEmergencySuspension(
    nation : Sovereign.NationId,
    suspension : Sovereign.EmergencySuspensionId,
  ) : async Sovereign.SaveEmergencySuspensionResult {
    if (isArchivedDeparture(nation)) { return #err(#invalidLifecycleTransition) };
    if (not isAuthorizedAuthority(caller, nation)) { return #err(#notAuthorized) };
    let s = switch (emergencySuspensions.get(suspension)) {
      case (?s) { s };
      case null { return #err(#unknownSuspension) };
    };
    if (s.nation != nation) { return #err(#notAuthorized) };
    if (s.status != #active) { return #err(#invalidLifecycleTransition) };
    if (DepartureLib.containsPrincipal(s.approvingAuthorities, caller)) {
      return #err(#duplicateApproval);
    };
    let now = Time.now();
    let approvingAuthorities = s.approvingAuthorities.concat([caller]);
    let required = emergencyApprovalThreshold(nation);
    let satisfied = DepartureLib.approvalsSatisfied(required, approvingAuthorities);
    let auditTrail = s.auditTrail.concat([{
      action = "approved";
      actorPrincipal = caller;
      note = if (satisfied) { "approval threshold reached" } else { "approval recorded" };
      timestamp = now;
    }]);
    emergencySuspensions.add(suspension, {
      s with
      approvingAuthorities;
      auditTrail;
      expiresAt = if (satisfied) { now + DepartureLib.defaultEmergencyWindowNanos() } else { s.expiresAt };
    });
    if (satisfied) {
      applyEmergencySuspension(nation, caller, s.reason, now);
    };
    recordDepartureHistory(
      nation,
      #approval,
      caller,
      suspension,
      DepartureLib.emergencyHistorySummary("approved"),
    );
    #ok(suspension);
  };

  // Restore a suspended Nation. A caller holding the `#modify` capability (or
  // an authorized administrator) records the restoration, which returns the
  // Nation to Active. The restoration is recorded in the suspension's audit
  // trail and in the governance history.
  public shared ({ caller }) func restoreEmergencySuspension(
    nation : Sovereign.NationId,
    suspension : Sovereign.EmergencySuspensionId,
    note : Text,
  ) : async Sovereign.RestoreEmergencySuspensionResult {
    if (isArchivedDeparture(nation)) { return #err(#invalidLifecycleTransition) };
    if (not hasCapabilityDeparture(caller, nation, #modify)) { return #err(#notAuthorized) };
    let s = switch (emergencySuspensions.get(suspension)) {
      case (?s) { s };
      case null { return #err(#unknownSuspension) };
    };
    if (s.nation != nation) { return #err(#notAuthorized) };
    if (s.status != #active) { return #err(#invalidLifecycleTransition) };
    let now = Time.now();
    let auditTrail = s.auditTrail.concat([{
      action = "restored";
      actorPrincipal = caller;
      note;
      timestamp = now;
    }]);
    emergencySuspensions.add(suspension, {
      s with
      status = #restored;
      auditTrail;
      restoration = ?{ restoredBy = caller; note; restoredAt = now };
    });
    // Return the Nation to Active when it was temporarily suspended.
    switch (nationLifecycles.get(nation)) {
      case (?l) {
        if (l.state == #temporarilySuspended) {
          nationLifecycles.add(nation, {
            l with
            state = #active;
            enteredAt = now;
            reason = "Emergency suspension restored";
            causedBy = caller;
            timestamp = now;
          });
        };
      };
      case null {};
    };
    recordDepartureHistory(
      nation,
      #approval,
      caller,
      suspension,
      DepartureLib.emergencyHistorySummary("restored"),
    );
    #ok;
  };
};
