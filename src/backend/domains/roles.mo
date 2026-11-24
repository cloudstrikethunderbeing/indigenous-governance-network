import List "mo:core/List";
import Principal "mo:core/Principal";
import Sovereign "../types/sovereign";

// ---------------------------------------------------------------------
// DAO Constitution & Governance — Roles & Permissions pure helpers.
//
// Everything here is deterministic and side-effect free: the built-in role
// vocabulary, the capability checks, and the membership-approval encoding.
// The stateful endpoints live in mixins/roles-api.mo.
//
// The ten built-in governance roles are the platform's default role
// definitions; a Nation may create custom roles within the same six-
// capability vocabulary. These are example policies, not assumptions about
// an organization's legal or traditional governance authority.
// ---------------------------------------------------------------------

module {
  // The default number of distinct authorized approvals required before a new
  // member is admitted when the Nation's constitution does not specify a
  // percentage. This is an example policy, not a mandatory requirement for
  // every DAO.
  public func requiredMembershipApprovals() : Nat {
    3;
  };

  // The number of distinct authorized approvals required to admit a member,
  // derived from the Nation's own constitution: a configurable percentage of
  // eligible approvers, rounded up, never below the default of three. A
  // decision already pending keeps the requirement it started with, so the
  // caller passes the captured requirement, never a recomputed one.
  public func requiredMembershipApprovalsFor(
    rules : Sovereign.GovernanceRuleSet,
    eligibleApprovers : [Principal],
  ) : Nat {
    let eligible = eligibleApprovers.size();
    let percent = rules.membershipApprovalThresholdPercent;
    let scaled = eligible * percent;
    let roundedUp = (scaled + 99) / 100;
    if (roundedUp > requiredMembershipApprovals()) { roundedUp } else { requiredMembershipApprovals() };
  };

  // The set of eligible approvers for a Nation: the principals holding a role
  // that grants the `#approve` capability, plus the Nation's recorded owner.
  // Each principal appears once.
  public func eligibleApprovers(
    roles : [Sovereign.GovernanceRole],
    assignments : [Sovereign.RoleAssignment],
    nationOwner : ?Principal,
  ) : [Principal] {
    let acc = List.empty<Principal>();
    let addP = func(p : Principal) {
      if (not acc.any(func(existing) = Principal.equal(existing, p))) { acc.add(p) };
    };
    switch (nationOwner) {
      case (?owner) { addP(owner) };
      case null {};
    };
    for (a in assignments.values()) {
      switch (roles.find(func(r) = r.id == a.role)) {
        case (?r) {
          if (r.capabilities.any(func(c) = c == #approve)) { addP(a.member) };
        };
        case null {};
      };
    };
    acc.toArray();
  };

  // Whether a decision that started with `capturedRequired` distinct
  // approvals is satisfied by `recordedApprovals`.
  public func approvalsSatisfied(capturedRequired : Nat, recordedApprovals : Nat) : Bool {
    recordedApprovals >= capturedRequired;
  };

  // The default number of days a membership join request stays open before it
  // expires undecided.
  public func defaultJoinRequestWindowDays() : Nat {
    30;
  };

  // The default number of days a membership invitation stays valid.
  public func defaultInvitationWindowDays() : Nat {
    14;
  };

  // Whether a join request is still open for review (pending or under review).
  public func joinRequestOpen(status : Sovereign.JoinRequestStatus) : Bool {
    switch (status) {
      case (#pendingReview) { true };
      case (#underReview) { true };
      case (_) { false };
    };
  };

  // Whether a principal is already recorded in a list of principals.
  public func containsPrincipal(list : [Principal], p : Principal) : Bool {
    list.any(func(existing) = Principal.equal(existing, p));
  };

  // The prefix used to encode an approved member's principal inside a
  // Participation Census summary, so an approval is preserved as history.
  public func approvalPrefix() : Text {
    "membershipApproval:";
  };

  // The Participation Census summary that records one member's approval.
  public func approvalSummary(member : Principal) : Text {
    approvalPrefix() # member.toText();
  };

  // The ten built-in role kinds, in display order.
  public func builtinKinds() : [Sovereign.GovernanceRoleKind] {
    [
      #foundingAuthority,
      #membershipAuthority,
      #member,
      #governanceDelegate,
      #proposalSteward,
      #executionAuthority,
      #treasurySteward,
      #documentSteward,
      #auditor,
      #observer,
    ];
  };

  // The capabilities granted to each built-in role.
  public func builtinCapabilities(kind : Sovereign.GovernanceRoleKind) : [Sovereign.GovernanceCapability] {
    switch (kind) {
      case (#foundingAuthority) { [#view, #propose, #approve, #modify, #execute] };
      case (#membershipAuthority) { [#view, #approve, #modify] };
      case (#member) { [#view, #propose, #vote] };
      case (#governanceDelegate) { [#view, #propose, #vote] };
      case (#proposalSteward) { [#view, #propose, #approve, #modify] };
      case (#executionAuthority) { [#view, #approve, #execute] };
      case (#treasurySteward) { [#view, #propose, #approve, #modify, #execute] };
      case (#documentSteward) { [#view, #propose, #modify] };
      case (#auditor) { [#view] };
      case (#observer) { [#view] };
      case (#custom(_)) { [#view] };
    };
  };

  // The human-readable name of each built-in role.
  public func builtinRoleName(kind : Sovereign.GovernanceRoleKind) : Text {
    switch (kind) {
      case (#foundingAuthority) { "Founding Authority" };
      case (#membershipAuthority) { "Membership Authority" };
      case (#member) { "Member" };
      case (#governanceDelegate) { "Governance Delegate" };
      case (#proposalSteward) { "Proposal Steward" };
      case (#executionAuthority) { "Execution Authority" };
      case (#treasurySteward) { "Treasury Steward" };
      case (#documentSteward) { "Document Steward" };
      case (#auditor) { "Auditor" };
      case (#observer) { "Observer" };
      case (#custom(_)) { "Custom Role" };
    };
  };

  // The plain-language explanation of each built-in role.
  public func builtinRoleDescription(kind : Sovereign.GovernanceRoleKind) : Text {
    switch (kind) {
      case (#foundingAuthority) { "Creates the DAO, appoints the other authorities and confirms the constitution." };
      case (#membershipAuthority) { "Reviews and approves new members under the Nation's approval threshold." };
      case (#member) { "Views the workspace, proposes and votes on governance decisions." };
      case (#governanceDelegate) { "Votes on behalf of members who delegate their voting authority." };
      case (#proposalSteward) { "Reviews proposals and moves them through the governance process." };
      case (#executionAuthority) { "Authorizes the execution of approved proposals." };
      case (#treasurySteward) { "Manages the Nation's treasury within its constitutional limits." };
      case (#documentSteward) { "Maintains the Nation's documents and confidentiality rules." };
      case (#auditor) { "Reads governance records and the Participation Census for accountability." };
      case (#observer) { "Reads the workspace without proposing, voting or modifying anything." };
      case (#custom(_)) { "A custom role defined by the Nation within platform security constraints." };
    };
  };

  // Whether a role grants a capability.
  public func roleGrantsCapability(role : Sovereign.GovernanceRole, capability : Sovereign.GovernanceCapability) : Bool {
    role.capabilities.any(func(c) = c == capability);
  };

  // Whether a delegation is still active at `now` (not revoked, not expired).
  public func delegationActive(delegation : Sovereign.RoleDelegation, now : Sovereign.Timestamp) : Bool {
    delegation.active and delegation.expiresAt > now;
  };

  // Whether every capability in `sub` is present in `super`.
  public func capabilitySubset(
    sub : [Sovereign.GovernanceCapability],
    super : [Sovereign.GovernanceCapability],
  ) : Bool {
    sub.all(func(c) = super.any(func(s) = s == c));
  };
};
