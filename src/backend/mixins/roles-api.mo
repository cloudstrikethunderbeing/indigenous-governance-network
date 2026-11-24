import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import Sovereign "../types/sovereign";
import RolesLib "../domains/roles";

// ---------------------------------------------------------------------
// DAO Constitution & Governance — Roles & Permissions public API.
//
// The ten built-in governance roles plus custom roles, scoped across the
// six capabilities (view, propose, approve, vote, modify, execute). A
// member may hold multiple roles; a delegation carries an expiry and can
// be revoked.
//
// Every capability check is enforced here, in the backend, against the
// caller's own recorded role assignments and delegations — never by
// frontend controls alone. A caller may not grant itself a role or a
// capability it does not itself hold, and no caller may act on another
// Nation's roles.
//
// Membership approvals are recorded in the Participation Census (the
// `#membershipApproval` entry kind) so the approval history is preserved
// after membership or authority changes. The example three-authority
// template requires three active authorized approvals.
// ---------------------------------------------------------------------

mixin (
  accessControlState : AccessControl.AccessControlState,
  governanceRoles : Map.Map<Sovereign.GovernanceRoleId, Sovereign.GovernanceRole>,
  roleAssignments : Map.Map<Sovereign.RoleAssignmentId, Sovereign.RoleAssignment>,
  roleDelegations : Map.Map<Sovereign.RoleDelegationId, Sovereign.RoleDelegation>,
  censusEntries : Map.Map<Sovereign.CensusEntryId, Sovereign.CensusEntry>,
  nationOwners : Map.Map<Sovereign.NationId, Sovereign.NationOwnership>,
  nationMembers : Map.Map<Sovereign.NationMemberId, Sovereign.NationMember>,
  joinRequests : Map.Map<Sovereign.JoinRequestId, Sovereign.JoinRequest>,
  membershipInvitations : Map.Map<Sovereign.MembershipInvitationId, Sovereign.MembershipInvitation>,
  memberAdmissions : Map.Map<Sovereign.MemberAdmissionId, Sovereign.MemberAdmission>,
  governanceHistory : Map.Map<Sovereign.GovernanceHistoryId, Sovereign.GovernanceHistoryEntry>,
  constitutions : Map.Map<Sovereign.ConstitutionId, Sovereign.Constitution>,
  counters : {
    var nextGovernanceRoleId : Nat;
    var nextRoleAssignmentId : Nat;
    var nextRoleDelegationId : Nat;
    var nextCensusEntryId : Nat;
    var nextNationMemberId : Nat;
    var nextJoinRequestId : Nat;
    var nextMembershipInvitationId : Nat;
    var nextMemberAdmissionId : Nat;
    var nextGovernanceHistoryId : Nat;
  },
) {
  // The result of a membership approval: the recorded approval's census id,
  // and whether the approval admitted the member.
  public type MembershipApprovalResult = {
    #ok : { approvalId : Nat; admitted : Bool };
    #err : Sovereign.GovernanceError;
  };

  // ---------------------------------------------------------------------
  // Authorization helpers
  // ---------------------------------------------------------------------

  // Whether the caller is a platform administrator.
  func isPlatformAdmin(caller : Principal) : Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  // Whether the caller is the Nation's recorded creator/owner.
  func isNationOwnerRoles(caller : Principal, nation : Sovereign.NationId) : Bool {
    switch (nationOwners.get(nation)) {
      case (?o) { Principal.equal(o.creator, caller) };
      case null { false };
    };
  };

  // Whether the caller may administer the given Nation: its recorded owner,
  // or a platform administrator.
  func canAdministerNationRoles(caller : Principal, nation : Sovereign.NationId) : Bool {
    if (isPlatformAdmin(caller)) { return true };
    isNationOwnerRoles(caller, nation);
  };

  // The roles defined for one Nation.
  func rolesForNation(nation : Sovereign.NationId) : [Sovereign.GovernanceRole] {
    governanceRoles.values().toArray().filter(func(r) = r.nation == nation);
  };

  // Look up a role by id, scoped to the Nation. Returns null when the role
  // does not exist or belongs to another Nation.
  func roleInNation(nation : Sovereign.NationId, role : Sovereign.GovernanceRoleId) : ?Sovereign.GovernanceRole {
    switch (governanceRoles.get(role)) {
      case (?r) { if (r.nation == nation) { ?r } else { null } };
      case null { null };
    };
  };

  // Seed the ten built-in roles for a Nation on first read. Idempotent: a
  // second call is a no-op once any role exists for the Nation.
  func seedDefaultRoles(nation : Sovereign.NationId) {
    if (governanceRoles.values().any(func(r) = r.nation == nation)) { return };
    let now = Time.now();
    for (kind in RolesLib.builtinKinds().values()) {
      let id = counters.nextGovernanceRoleId;
      counters.nextGovernanceRoleId += 1;
      governanceRoles.add(id, {
        id;
        nation;
        kind;
        roleName = RolesLib.builtinRoleName(kind);
        description = RolesLib.builtinRoleDescription(kind);
        capabilities = RolesLib.builtinCapabilities(kind);
        isCustom = false;
        timestamp = now;
      });
    };
  };

  // The union of capabilities the caller holds in a Nation, from every role
  // assigned to the caller and every active delegation made to the caller.
  func callerCapabilities(caller : Principal, nation : Sovereign.NationId) : [Sovereign.GovernanceCapability] {
    let now = Time.now();
    let acc = List.empty<Sovereign.GovernanceCapability>();
    let addCap = func(c : Sovereign.GovernanceCapability) {
      if (not acc.any(func(existing) = existing == c)) { acc.add(c) };
    };
    // Direct role assignments.
    for (a in roleAssignments.values()) {
      if (a.nation == nation and Principal.equal(a.member, caller)) {
        switch (roleInNation(nation, a.role)) {
          case (?r) { for (c in r.capabilities.values()) { addCap(c) } };
          case null {};
        };
      };
    };
    // Active delegations made to the caller.
    for (d in roleDelegations.values()) {
      if (d.nation == nation and Principal.equal(d.delegate, caller) and RolesLib.delegationActive(d, now)) {
        for (c in d.capabilities.values()) { addCap(c) };
      };
    };
    acc.toArray();
  };

  // Whether the caller holds a capability in a Nation. A Nation's owner and a
  // platform administrator hold every capability.
  func hasCapability(caller : Principal, nation : Sovereign.NationId, capability : Sovereign.GovernanceCapability) : Bool {
    if (canAdministerNationRoles(caller, nation)) { return true };
    callerCapabilities(caller, nation).any(func(c) = c == capability);
  };

  // The number of distinct active authorized approvals recorded for a member
  // in a Nation.
  func approvalCount(nation : Sovereign.NationId, member : Principal) : Nat {
    let summary = RolesLib.approvalSummary(member);
    var count = 0;
    for (e in censusEntries.values()) {
      if (e.nation == nation and e.kind == #membershipApproval and e.summary == summary) {
        count += 1;
      };
    };
    count;
  };

  // Whether an approver has already approved a member.
  func hasApproved(nation : Sovereign.NationId, approver : Principal, member : Principal) : Bool {
    let summary = RolesLib.approvalSummary(member);
    censusEntries.values().any(func(e) =
      e.nation == nation and e.kind == #membershipApproval and
      e.summary == summary and Principal.equal(e.subject, approver)
    );
  };

  // Record one approval in the Participation Census. The approver is the
  // entry's subject; the approved member is encoded in the summary so the
  // approval history survives membership and authority changes. Returns the
  // recorded census entry id.
  func recordApproval(nation : Sovereign.NationId, approver : Principal, member : Principal) : Nat {
    let id = counters.nextCensusEntryId;
    counters.nextCensusEntryId += 1;
    censusEntries.add(id, {
      id;
      nation;
      kind = #membershipApproval;
      subject = approver;
      referenceId = 0;
      summary = RolesLib.approvalSummary(member);
      confidential = false;
      constitutionVersion = 0;
      timestamp = Time.now();
    });
    id;
  };

  // The active constitution for a Nation, if any.
  func activeConstitution(nation : Sovereign.NationId) : ?Sovereign.Constitution {
    constitutions.values().find(func(c) = c.nation == nation and c.active);
  };

  // The constitution version in force for a Nation, or 0 when none.
  func activeConstitutionVersion(nation : Sovereign.NationId) : Nat {
    switch (activeConstitution(nation)) {
      case (?c) { c.version };
      case null { 0 };
    };
  };

  // The Nation's recorded owner principal, if any.
  func nationOwnerPrincipal(nation : Sovereign.NationId) : ?Principal {
    switch (nationOwners.get(nation)) {
      case (?o) { ?o.creator };
      case null { null };
    };
  };

  // The set of eligible approvers for a Nation, derived from its roles,
  // assignments and recorded owner.
  func eligibleApproversFor(nation : Sovereign.NationId) : [Principal] {
    RolesLib.eligibleApprovers(rolesForNation(nation), roleAssignments.values().toArray().filter(func(a) = a.nation == nation), nationOwnerPrincipal(nation));
  };

  // The number of distinct authorized approvals required to admit a member,
  // derived from the Nation's own constitution. Falls back to the default of
  // three when the Nation has no active constitution yet.
  func requiredApprovalsFor(nation : Sovereign.NationId) : Nat {
    switch (activeConstitution(nation)) {
      case (?c) { RolesLib.requiredMembershipApprovalsFor(c.rules, eligibleApproversFor(nation)) };
      case null { RolesLib.requiredMembershipApprovals() };
    };
  };

  // Whether the caller is a member of one specific Nation: recorded in that
  // Nation's own member roster, its recorded owner, or a platform
  // administrator.
  func isNationMemberRoles(caller : Principal, nation : Sovereign.NationId) : Bool {
    if (isPlatformAdmin(caller)) { return true };
    if (isNationOwnerRoles(caller, nation)) { return true };
    nationMembers.values().any(func(m) = m.nation == nation and Principal.equal(m.member, caller));
  };

  // The Nation's member record for a principal, if any.
  func nationMemberFor(nation : Sovereign.NationId, member : Principal) : ?Sovereign.NationMember {
    nationMembers.values().find(func(m) = m.nation == nation and Principal.equal(m.member, member));
  };

  // The admission record for a member in a Nation, if any.
  func admissionFor(nation : Sovereign.NationId, member : Principal) : ?Sovereign.MemberAdmission {
    memberAdmissions.values().find(func(a) = a.nation == nation and Principal.equal(a.member, member));
  };

  // The open (pending or under review) join request for an applicant, if any.
  func openJoinRequestFor(nation : Sovereign.NationId, applicant : Principal) : ?Sovereign.JoinRequest {
    joinRequests.values().find(func(r) = r.nation == nation and Principal.equal(r.applicant, applicant) and RolesLib.joinRequestOpen(r.status));
  };

  // Append one entry to the Nation's governance history.
  func recordHistory(
    nation : Sovereign.NationId,
    kind : Sovereign.GovernanceHistoryKind,
    actorPrincipal : Principal,
    referenceId : Nat,
    summary : Text,
  ) {
    let id = counters.nextGovernanceHistoryId;
    counters.nextGovernanceHistoryId += 1;
    governanceHistory.add(id, {
      id;
      nation;
      kind;
      actorPrincipal;
      referenceId;
      summary;
      constitutionVersion = activeConstitutionVersion(nation);
      timestamp = Time.now();
    });
  };

  // Admit a principal as an active member of a Nation: add the roster entry
  // (when absent), record the admission, and assign the built-in `#member`
  // role. Idempotent on the roster and admission; returns the admission id.
  func admitMember(nation : Sovereign.NationId, member : Principal, displayName : Text) : Nat {
    let now = Time.now();
    if (nationMemberFor(nation, member) == null) {
      let id = counters.nextNationMemberId;
      counters.nextNationMemberId += 1;
      nationMembers.add(id, {
        id;
        nation;
        member;
        displayName;
        roleLabel = "Member";
        permissionLabels = ["View workspace", "Create proposals", "Vote on proposals"];
        timestamp = now;
      });
    };
    let admissionId = switch (admissionFor(nation, member)) {
      case (?a) { a.id };
      case null {
        let id = counters.nextMemberAdmissionId;
        counters.nextMemberAdmissionId += 1;
        memberAdmissions.add(id, {
          id;
          nation;
          member;
          admittedAt = now;
          constitutionVersion = activeConstitutionVersion(nation);
          timestamp = now;
        });
        id;
      };
    };
    // Assign the built-in `#member` role once, so the member has a role.
    let memberRole = rolesForNation(nation).find(func(r) = r.kind == #member);
    switch (memberRole) {
      case (?r) {
        let already = roleAssignments.values().any(func(a) =
          a.nation == nation and Principal.equal(a.member, member) and a.role == r.id
        );
        if (not already) {
          let aid = counters.nextRoleAssignmentId;
          counters.nextRoleAssignmentId += 1;
          roleAssignments.add(aid, {
            id = aid;
            nation;
            member;
            role = r.id;
            grantedBy = member;
            timestamp = now;
          });
        };
      };
      case null {};
    };
    admissionId;
  };

  // ---------------------------------------------------------------------
  // Public read surface
  // ---------------------------------------------------------------------

  // List a Nation's roles with the capabilities each holds. The ten built-in
  // roles are seeded by `ensureNationRoles`.
  public query func listNationRoles(nation : Sovereign.NationId) : async [Sovereign.GovernanceRole] {
    rolesForNation(nation);
  };

  // Seed the ten built-in roles for a Nation and return them. Idempotent: a
  // second call is a no-op once any role exists for the Nation. This is an
  // update function because seeding writes state; the frontend calls it once
  // on first load, then reads `listNationRoles`.
  public shared func ensureNationRoles(nation : Sovereign.NationId) : async [Sovereign.GovernanceRole] {
    seedDefaultRoles(nation);
    rolesForNation(nation);
  };

  // Read one role, scoped to its Nation.
  public query func getNationRole(nation : Sovereign.NationId, role : Sovereign.GovernanceRoleId) : async ?Sovereign.GovernanceRole {
    roleInNation(nation, role);
  };

  // List a Nation's role assignments.
  public query func listRoleAssignments(nation : Sovereign.NationId) : async [Sovereign.RoleAssignment] {
    roleAssignments.values().toArray().filter(func(a) = a.nation == nation);
  };

  // List a Nation's role delegations.
  public query func listRoleDelegations(nation : Sovereign.NationId) : async [Sovereign.RoleDelegation] {
    roleDelegations.values().toArray().filter(func(d) = d.nation == nation);
  };

  // The capabilities the caller holds in a Nation, from every assigned role
  // and every active delegation.
  public query ({ caller }) func getCallerCapabilities(nation : Sovereign.NationId) : async [Sovereign.GovernanceCapability] {
    callerCapabilities(caller, nation);
  };

  // Whether the caller holds a capability in a Nation.
  public query ({ caller }) func callerHasCapability(
    nation : Sovereign.NationId,
    capability : Sovereign.GovernanceCapability,
  ) : async Bool {
    hasCapability(caller, nation, capability);
  };

  // The number of active authorized approvals recorded for a member, and the
  // number still required before the member is admitted. The required count
  // is derived from the Nation's own constitution (a configurable percentage
  // of eligible approvers, rounded up, never below three).
  public query func getMembershipApprovalStatus(
    nation : Sovereign.NationId,
    member : Principal,
  ) : async { approvals : Nat; required : Nat } {
    { approvals = approvalCount(nation, member); required = requiredApprovalsFor(nation) };
  };

  // ---------------------------------------------------------------------
  // Role management
  // ---------------------------------------------------------------------

  // Create a custom role for a Nation. Only a caller who may administer the
  // Nation, or who holds the `#modify` capability, may create a role, and the
  // role's capabilities must be a subset of the caller's own capabilities —
  // so a caller can never grant a capability it does not itself hold.
  public shared ({ caller }) func createCustomRole(
    nation : Sovereign.NationId,
    roleName : Text,
    description : Text,
    capabilities : [Sovereign.GovernanceCapability],
  ) : async Sovereign.SaveRoleResult {
    if (roleName.size() == 0) { return #err(#missingName) };
    if (not hasCapability(caller, nation, #modify)) { return #err(#notAuthorized) };
    if (not canAdministerNationRoles(caller, nation)) {
      if (not RolesLib.capabilitySubset(capabilities, callerCapabilities(caller, nation))) {
        return #err(#notAuthorized);
      };
    };
    let id = counters.nextGovernanceRoleId;
    counters.nextGovernanceRoleId += 1;
    governanceRoles.add(id, {
      id;
      nation;
      kind = #custom(id);
      roleName;
      description;
      capabilities;
      isCustom = true;
      timestamp = Time.now();
    });
    #ok(id);
  };

  // Update a role's capabilities. Only a caller who may administer the
  // Nation, or who holds `#modify`, may update a role, and the new
  // capabilities must be a subset of the caller's own capabilities.
  public shared ({ caller }) func updateRoleCapabilities(
    nation : Sovereign.NationId,
    role : Sovereign.GovernanceRoleId,
    capabilities : [Sovereign.GovernanceCapability],
  ) : async Sovereign.SaveRoleResult {
    if (not hasCapability(caller, nation, #modify)) { return #err(#notAuthorized) };
    let r = switch (roleInNation(nation, role)) {
      case (?r) { r };
      case null { return #err(#unknownRole) };
    };
    if (not canAdministerNationRoles(caller, nation)) {
      if (not RolesLib.capabilitySubset(capabilities, callerCapabilities(caller, nation))) {
        return #err(#notAuthorized);
      };
    };
    governanceRoles.add(role, { r with capabilities; timestamp = Time.now() });
    #ok(role);
  };

  // ---------------------------------------------------------------------
  // Role assignment
  // ---------------------------------------------------------------------

  // Assign a role to a member. Only a caller who may administer the Nation,
  // or who holds `#modify`, may assign a role, and the role's capabilities
  // must be a subset of the caller's own capabilities — so a caller can never
  // grant itself (or anyone) a capability it does not itself hold.
  public shared ({ caller }) func assignRole(
    nation : Sovereign.NationId,
    member : Principal,
    role : Sovereign.GovernanceRoleId,
  ) : async Sovereign.SaveRoleAssignmentResult {
    if (not hasCapability(caller, nation, #modify)) { return #err(#notAuthorized) };
    let r = switch (roleInNation(nation, role)) {
      case (?r) { r };
      case null { return #err(#unknownRole) };
    };
    if (not canAdministerNationRoles(caller, nation)) {
      if (not RolesLib.capabilitySubset(r.capabilities, callerCapabilities(caller, nation))) {
        return #err(#notAuthorized);
      };
    };
    let id = counters.nextRoleAssignmentId;
    counters.nextRoleAssignmentId += 1;
    roleAssignments.add(id, {
      id;
      nation;
      member;
      role;
      grantedBy = caller;
      timestamp = Time.now();
    });
    #ok(id);
  };

  // Revoke a role assignment. Only a caller who may administer the Nation, or
  // who holds `#modify`, may revoke an assignment.
  public shared ({ caller }) func revokeRole(
    nation : Sovereign.NationId,
    assignment : Sovereign.RoleAssignmentId,
  ) : async Sovereign.SaveRoleAssignmentResult {
    if (not hasCapability(caller, nation, #modify)) { return #err(#notAuthorized) };
    let a = switch (roleAssignments.get(assignment)) {
      case (?a) { a };
      case null { return #err(#unknownRole) };
    };
    if (a.nation != nation) { return #err(#notAuthorized) };
    roleAssignments.remove(assignment);
    #ok(assignment);
  };

  // ---------------------------------------------------------------------
  // Delegation
  // ---------------------------------------------------------------------

  // Create a scoped delegation of a role's authority to another principal.
  // The delegation carries an expiry and can be revoked before it expires.
  // Only a caller who holds the delegated capabilities may delegate them, and
  // the delegated capabilities must be a subset of the caller's own.
  public shared ({ caller }) func createRoleDelegation(
    nation : Sovereign.NationId,
    delegate : Principal,
    role : Sovereign.GovernanceRoleId,
    capabilities : [Sovereign.GovernanceCapability],
    expiresAt : Sovereign.Timestamp,
  ) : async Sovereign.SaveRoleDelegationResult {
    if (not hasCapability(caller, nation, #modify)) { return #err(#notAuthorized) };
    let r = switch (roleInNation(nation, role)) {
      case (?r) { r };
      case null { return #err(#unknownRole) };
    };
    if (expiresAt <= Time.now()) { return #err(#delegationExpired) };
    if (not canAdministerNationRoles(caller, nation)) {
      if (not RolesLib.capabilitySubset(capabilities, callerCapabilities(caller, nation))) {
        return #err(#notAuthorized);
      };
    };
    // The delegated capabilities must be a subset of the role's own.
    if (not RolesLib.capabilitySubset(capabilities, r.capabilities)) {
      return #err(#notAuthorized);
    };
    let id = counters.nextRoleDelegationId;
    counters.nextRoleDelegationId += 1;
    roleDelegations.add(id, {
      id;
      nation;
      delegator = caller;
      delegate;
      role;
      capabilities;
      expiresAt;
      active = true;
      timestamp = Time.now();
    });
    #ok(id);
  };

  // Revoke a delegation before it expires. Only the delegator, a caller who
  // may administer the Nation, or a caller holding `#modify` may revoke it.
  public shared ({ caller }) func revokeRoleDelegation(
    nation : Sovereign.NationId,
    delegation : Sovereign.RoleDelegationId,
  ) : async Sovereign.SaveRoleDelegationResult {
    let d = switch (roleDelegations.get(delegation)) {
      case (?d) { d };
      case null { return #err(#unknownRole) };
    };
    if (d.nation != nation) { return #err(#notAuthorized) };
    if (not (Principal.equal(d.delegator, caller) or hasCapability(caller, nation, #modify))) {
      return #err(#notAuthorized);
    };
    roleDelegations.add(delegation, { d with active = false; timestamp = Time.now() });
    #ok(delegation);
  };

  // ---------------------------------------------------------------------
  // Membership approval
  // ---------------------------------------------------------------------

  // Record one approval of a new member. Only a caller who holds the
  // `#approve` capability in the Nation may approve. Each approver counts
  // once; the approval is recorded in the Participation Census so the
  // history survives membership and authority changes. Once the required
  // number of active authorized approvals is reached, the member is added to
  // the Nation's roster.
  public shared ({ caller }) func approveMembership(
    nation : Sovereign.NationId,
    member : Principal,
  ) : async MembershipApprovalResult {
    if (not hasCapability(caller, nation, #approve)) { return #err(#notAuthorized) };
    if (Principal.equal(caller, member)) { return #err(#notAuthorized) };
    if (hasApproved(nation, caller, member)) { return #err(#notAuthorized) };
    let approvalId = recordApproval(nation, caller, member);
    let required = requiredApprovalsFor(nation);
    let count = approvalCount(nation, member);
    let admitted = RolesLib.approvalsSatisfied(required, count);
    if (admitted) {
      ignore admitMember(nation, member, "");
    };
    recordHistory(nation, #approval, caller, approvalId, "Membership approval recorded");
    #ok({ approvalId; admitted });
  };

  // ---------------------------------------------------------------------
  // Membership onboarding — join requests and invitations
  //
  // Workflow: Request -> Pending Review -> Required Approvals -> Role
  // Assignment -> Active Membership. Each authorized approver is counted
  // once; self-approval and duplicate membership are prevented. A request
  // may be rejected, withdrawn or expired before admission.
  // ---------------------------------------------------------------------

  // Submit a membership join request for a Nation. A signed-in caller may
  // request membership of a Nation it is not already a member of. The
  // request captures the required approvals and constitution version in
  // force at creation, so a later constitutional change never applies
  // retroactively.
  public shared ({ caller }) func submitJoinRequest(
    nation : Sovereign.NationId,
    displayName : Text,
    message : Text,
  ) : async Sovereign.SubmitJoinRequestResult {
    if (displayName.size() == 0) { return #err(#missingName) };
    if (isNationMemberRoles(caller, nation)) { return #err(#notAuthorized) };
    if (openJoinRequestFor(nation, caller) != null) { return #err(#notAuthorized) };
    let now = Time.now();
    let id = counters.nextJoinRequestId;
    counters.nextJoinRequestId += 1;
    joinRequests.add(id, {
      id;
      nation;
      applicant = caller;
      displayName;
      message;
      status = #pendingReview;
      approvers = [];
      requiredApprovals = requiredApprovalsFor(nation);
      constitutionVersion = activeConstitutionVersion(nation);
      expiresAt = now + (RolesLib.defaultJoinRequestWindowDays() * 24 * 60 * 60 * 1_000_000_000);
      timestamp = now;
    });
    #ok(id);
  };

  // Review a join request: record one distinct authorized approval, or
  // reject it. Only a caller holding the `#approve` capability may review.
  // The applicant may never approve its own request. Once the captured
  // required approvals are reached the request moves to `#approved`.
  public shared ({ caller }) func reviewJoinRequest(
    nation : Sovereign.NationId,
    request : Sovereign.JoinRequestId,
    approve : Bool,
  ) : async Sovereign.ReviewJoinRequestResult {
    if (not hasCapability(caller, nation, #approve)) { return #err(#notAuthorized) };
    let r = switch (joinRequests.get(request)) {
      case (?r) { r };
      case null { return #err(#unknownProposal) };
    };
    if (r.nation != nation) { return #err(#notAuthorized) };
    if (not RolesLib.joinRequestOpen(r.status)) { return #err(#notAuthorized) };
    let now = Time.now();
    if (now > r.expiresAt) {
      joinRequests.add(request, { r with status = #expired });
      return #ok(#expired);
    };
    if (not approve) {
      joinRequests.add(request, { r with status = #rejected });
      recordHistory(nation, #rejection, caller, request, "Join request rejected");
      return #ok(#rejected);
    };
    // Approve: the applicant may never approve its own request, and each
    // authorized approver counts once.
    if (Principal.equal(caller, r.applicant)) { return #err(#notAuthorized) };
    if (RolesLib.containsPrincipal(r.approvers, caller)) { return #err(#notAuthorized) };
    let approvers = r.approvers.concat([caller]);
    let satisfied = RolesLib.approvalsSatisfied(r.requiredApprovals, approvers.size());
    let status : Sovereign.JoinRequestStatus = if (satisfied) { #approved } else { #underReview };
    joinRequests.add(request, { r with approvers; status });
    recordHistory(nation, #approval, caller, request, "Join request approval recorded");
    if (satisfied) {
      ignore admitMember(nation, r.applicant, r.displayName);
      joinRequests.add(request, { r with approvers; status = #active });
      return #ok(#active);
    };
    #ok(status);
  };

  // Withdraw the caller's own pending join request.
  public shared ({ caller }) func withdrawJoinRequest(
    nation : Sovereign.NationId,
    request : Sovereign.JoinRequestId,
  ) : async Sovereign.ReviewJoinRequestResult {
    let r = switch (joinRequests.get(request)) {
      case (?r) { r };
      case null { return #err(#unknownProposal) };
    };
    if (r.nation != nation) { return #err(#notAuthorized) };
    if (not Principal.equal(r.applicant, caller)) { return #err(#notAuthorized) };
    if (not RolesLib.joinRequestOpen(r.status)) { return #err(#notAuthorized) };
    joinRequests.add(request, { r with status = #withdrawn });
    #ok(#withdrawn);
  };

  // List a Nation's join requests. Only a member of the Nation (or an
  // authorized administrator) may read them.
  public query ({ caller }) func listJoinRequests(nation : Sovereign.NationId) : async [Sovereign.JoinRequest] {
    if (not isNationMemberRoles(caller, nation)) { return [] };
    joinRequests.values().toArray().filter(func(r) = r.nation == nation);
  };

  // Issue a secure membership invitation. Only a caller holding the
  // `#approve` capability may invite. The invitation carries a single-use
  // token and an expiry window.
  public shared ({ caller }) func issueMembershipInvitation(
    nation : Sovereign.NationId,
    invitedEmail : Text,
  ) : async Sovereign.IssueInvitationResult {
    if (not hasCapability(caller, nation, #approve)) { return #err(#notAuthorized) };
    let now = Time.now();
    let id = counters.nextMembershipInvitationId;
    counters.nextMembershipInvitationId += 1;
    let token = "invite-" # id.toText() # "-" # now.toText();
    membershipInvitations.add(id, {
      id;
      nation;
      token;
      invitedEmail = if (invitedEmail.size() == 0) { null } else { ?invitedEmail };
      acceptedBy = null;
      issuedBy = caller;
      expiresAt = now + (RolesLib.defaultInvitationWindowDays() * 24 * 60 * 60 * 1_000_000_000);
      active = true;
      timestamp = now;
    });
    #ok(id);
  };

  // Accept a membership invitation through its single-use token. The token
  // binds the acceptance to the caller principal; an expired or already
  // consumed token is rejected. Acceptance admits the caller as an active
  // member and records the admission.
  public shared ({ caller }) func acceptMembershipInvitation(
    nation : Sovereign.NationId,
    token : Text,
  ) : async Sovereign.AcceptInvitationResult {
    let inv = switch (membershipInvitations.values().find(func(i) = i.nation == nation and i.token == token)) {
      case (?i) { i };
      case null { return #err(#notAuthorized) };
    };
    if (not inv.active) { return #err(#notAuthorized) };
    if (Time.now() > inv.expiresAt) {
      membershipInvitations.add(inv.id, { inv with active = false });
      return #err(#setupExpired);
    };
    membershipInvitations.add(inv.id, { inv with active = false; acceptedBy = ?caller });
    let admissionId = admitMember(nation, caller, "");
    #ok(admissionId);
  };
};
