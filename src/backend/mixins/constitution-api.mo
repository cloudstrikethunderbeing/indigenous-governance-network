import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import Sovereign "../types/sovereign";
import ConstitutionLib "../domains/constitution";
import LifecycleLib "../domains/lifecycle";
import GovernanceAudit "../domains/governance-audit";

// ---------------------------------------------------------------------
// DAO Constitution & Governance — Constitution public API.
//
// A Nation's constitution is a versioned governance policy: the rule set in
// force, the amendment history recording each amendment and the rules in
// effect at that time, and a founding setup state that keeps an incomplete
// DAO in Founding Setup until an authorized activation.
//
// Per-Nation isolation and Internet Identity principals are enforced on
// every endpoint: only a Nation's own authorized members may read its
// constitution, and only its founding authority may save or amend it before
// activation. After activation, rules change only through a constitutionally
// authorized amendment — a direct rule edit on an activated Nation is
// rejected.
//
// The templates are examples, not assumptions about an organization's legal
// or traditional governance authority. The DAO governs; the OS is the
// interface.
// ---------------------------------------------------------------------

mixin (
  accessControlState : AccessControl.AccessControlState,
  nations : Map.Map<Sovereign.NationId, Sovereign.Nation>,
  nationMembers : Map.Map<Sovereign.NationMemberId, Sovereign.NationMember>,
  nationOwners : Map.Map<Sovereign.NationId, Sovereign.NationOwnership>,
  foundingSetups : Map.Map<Sovereign.NationId, Sovereign.FoundingSetup>,
  foundingAppointments : Map.Map<Nat, Sovereign.FoundingAppointment>,
  constitutions : Map.Map<Sovereign.ConstitutionId, Sovereign.Constitution>,
  amendments : Map.Map<Sovereign.AmendmentId, Sovereign.Amendment>,
  governanceHistory : Map.Map<Sovereign.GovernanceHistoryId, Sovereign.GovernanceHistoryEntry>,
  nationLifecycles : Map.Map<Sovereign.NationId, Sovereign.NationLifecycle>,
  authorityPositions : Map.Map<Sovereign.AuthorityPositionId, Sovereign.AuthorityPosition>,
  authorityTermEvents : Map.Map<Sovereign.AuthorityTermEventId, Sovereign.AuthorityTermEvent>,
  successionPlans : Map.Map<Sovereign.NationId, Sovereign.SuccessionRecoveryPlan>,
  constitutionVersions : Map.Map<Sovereign.ConstitutionVersionId, Sovereign.ConstitutionVersion>,
  amendmentProposals : Map.Map<Sovereign.AmendmentProposalId, Sovereign.AmendmentProposal>,
  counters : {
    var nextConstitutionId : Nat;
    var nextAmendmentId : Nat;
    var nextFoundingAppointmentId : Nat;
    var nextGovernanceHistoryId : Nat;
    var nextAuthorityPositionId : Nat;
    var nextAuthorityTermEventId : Nat;
    var nextConstitutionVersionId : Nat;
    var nextAmendmentProposalId : Nat;
  },
) {
  // The default founding setup window, in nanoseconds (30 days). A setup
  // that is not activated within this window expires.
  transient let setupWindowNanos : Int = 30 * 24 * 60 * 60 * 1_000_000_000;

  // ---------------------------------------------------------------------
  // Authorization helpers
  // ---------------------------------------------------------------------

  // Whether the caller is a platform administrator.
  func isConstitutionAdmin(caller : Principal) : Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  // Whether the caller is the Nation's recorded creator/owner.
  func isConstitutionNationOwner(caller : Principal, nation : Sovereign.NationId) : Bool {
    switch (nationOwners.get(nation)) {
      case (?o) { Principal.equal(o.creator, caller) };
      case null { false };
    };
  };

  // Whether the caller is a member of one specific Nation: recorded in that
  // Nation's own member roster, its recorded owner, or a platform
  // administrator. This is per-Nation membership — a caller who is a member
  // of another Nation is not a member of this one.
  func isConstitutionNationMember(caller : Principal, nation : Sovereign.NationId) : Bool {
    if (isConstitutionAdmin(caller)) { return true };
    if (isConstitutionNationOwner(caller, nation)) { return true };
    nationMembers.values().any(func(m) =
      m.nation == nation and Principal.equal(m.member, caller)
    );
  };

  // Whether the caller may read a Nation's constitution: a member of that
  // specific Nation, an administrator, or any visitor for the built-in
  // sample Nation. A Nation's constitution is never readable by another
  // Nation.
  func canReadConstitution(caller : Principal, nation : Sovereign.NationId) : Bool {
    switch (nations.get(nation)) {
      case (null) { false };
      case (?n) {
        if (n.isSample) { return true };
        isConstitutionNationMember(caller, nation);
      };
    };
  };

  // Whether the caller is the Nation's founding authority: the authority
  // recorded on the founding setup, or the Nation's recorded owner. This is
  // the write gate for saving or amending a constitution before activation.
  func isFoundingAuthority(caller : Principal, nation : Sovereign.NationId) : Bool {
    if (isConstitutionAdmin(caller)) { return true };
    switch (foundingSetups.get(nation)) {
      case (?setup) { Principal.equal(setup.foundingAuthority, caller) };
      case null { isConstitutionNationOwner(caller, nation) };
    };
  };

  // The active constitution for a Nation, if any.
  func constitutionInForce(nation : Sovereign.NationId) : ?Sovereign.Constitution {
    constitutions.values().find(func(c) = c.nation == nation and c.active);
  };

  // The highest constitution version recorded for a Nation, or 0 when none.
  func latestVersion(nation : Sovereign.NationId) : Nat {
    var version = 0;
    for (c in constitutions.values()) {
      if (c.nation == nation and c.version > version) { version := c.version };
    };
    version;
  };

  // The founding appointments for a Nation.
  func appointmentsForNation(nation : Sovereign.NationId) : [Sovereign.FoundingAppointment] {
    foundingAppointments.values().toArray().filter(func(a) = a.nation == nation);
  };

  // ---------------------------------------------------------------------
  // Lifecycle helpers
  // ---------------------------------------------------------------------

  // The effective lifecycle state for a Nation: the stored overriding state
  // when one is in force, otherwise the state derived from the founding
  // setup. An existing Nation's constitution and activation state are never
  // changed by this derivation.
  func constitutionLifecycleStateOf(nation : Sovereign.NationId) : Sovereign.NationLifecycleState {
    LifecycleLib.effectiveState(nationLifecycles.get(nation), foundingSetups.get(nation));
  };

  // The single guard every governance mutation consults before it runs.
  // Returns the precise error to surface, or null when the action is
  // permitted in the Nation's current lifecycle state.
  func constitutionLifecycleGuard(nation : Sovereign.NationId, action : LifecycleLib.LifecycleAction) : ?Sovereign.LifecycleError {
    LifecycleLib.actionError(constitutionLifecycleStateOf(nation), action);
  };

  // Record a lifecycle transition. The stored record carries the overriding
  // state, the plain-language reason and the authority that caused it.
  func recordLifecycle(
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
      constitutionVersion = latestVersion(nation);
      timestamp = now;
    });
  };

  // The succession and recovery plan for a Nation, if one exists.
  func planForNation(nation : Sovereign.NationId) : ?Sovereign.SuccessionRecoveryPlan {
    successionPlans.get(nation);
  };

  // Whether every accepted founding authority has ratified both the
  // constitution version in force and the succession and recovery plan.
  func foundingRatificationsComplete(nation : Sovereign.NationId) : Bool {
    let accepted = ConstitutionLib.acceptedFoundingAuthorities(appointmentsForNation(nation));
    let constitutionRatifications = switch (constitutionInForce(nation)) {
      case (?c) { c.ratifications ?? [] };
      case null { [] };
    };
    let planRatifications = switch (planForNation(nation)) {
      case (?p) { p.ratifications };
      case null { [] };
    };
    LifecycleLib.allFoundingAuthoritiesRatified(accepted, constitutionRatifications, planRatifications);
  };

  // Whether the succession and recovery plan is ratified by every accepted
  // founding authority.
  func planRatifiedByAll(nation : Sovereign.NationId) : Bool {
    let accepted = ConstitutionLib.acceptedFoundingAuthorities(appointmentsForNation(nation));
    let planRatifications = switch (planForNation(nation)) {
      case (?p) { p.ratifications };
      case null { [] };
    };
    if (accepted.size() == 0) { return false };
    let ratifiers = LifecycleLib.ratifiedAuthorities(planRatifications);
    accepted.all(func(a) = ratifiers.any(func(p) = Principal.equal(p, a)));
  };

  // Activate a Nation automatically once three distinct authorities have
  // accepted, the same constitution version is ratified by all three, and
  // the succession and recovery plan is ratified. There is no manual bypass:
  // this only ever flips a satisfied setup to Activated, and is a no-op
  // otherwise. Returns the resulting activation state.
  func tryAutoActivate(nation : Sovereign.NationId, now : Sovereign.Timestamp) : Sovereign.ActivateFoundingResult {
    let setup = switch (foundingSetups.get(nation)) {
      case (?s) { s };
      case null { return #err(#notInFoundingSetup) };
    };
    if (setup.status == #activated) { return #ok };
    if (setup.status != #foundingSetup) { return #err(#notInFoundingSetup) };
    let appointments = appointmentsForNation(nation);
    let confirmed = switch (constitutionInForce(nation)) {
      case (?c) { ?c };
      case null { null };
    };
    let constitutionRatifiedByAll = foundingRatificationsComplete(nation);
    let planRatified = planRatifiedByAll(nation);
    if (not ConstitutionLib.activationRequirementsSatisfied(
      appointments,
      confirmed != null,
      constitutionRatifiedByAll,
      planRatified,
    )) {
      return #err(#notInFoundingSetup);
    };
    let version = switch (confirmed) {
      case (?c) { c.version };
      case null { 0 };
    };
    foundingSetups.add(nation, {
      setup with
      status = #activated;
      activatedConstitutionVersion = ?version;
      timestamp = now;
    });
    recordLifecycle(nation, #active, "Activated: three founding authorities ratified the constitution and the succession plan.", setup.foundingAuthority, now);
    let historyId = counters.nextGovernanceHistoryId;
    counters.nextGovernanceHistoryId += 1;
    governanceHistory.add(historyId, GovernanceAudit.newEntry(
      historyId,
      nation,
      #approval,
      setup.foundingAuthority,
      0,
      "Nation activated with three accepted founding authorities",
      version,
      now,
    ));
    #ok;
  };

  // ---------------------------------------------------------------------
  // Constitution templates
  // ---------------------------------------------------------------------

  // List the six editable constitution templates. Each is an example
  // starting point, not a claim about an organization's authority.
  public query func listConstitutionTemplates() : async [Sovereign.GovernanceModelOption] {
    ConstitutionLib.constitutionTemplates();
  };

  // Read the default rule set for a template. Every setting is a plain
  // configurable value the organization may change before activation.
  public query func getDefaultRuleSet(templateKey : Text) : async Sovereign.GovernanceRuleSet {
    ConstitutionLib.defaultRuleSet(templateKey);
  };

  // Validate a submitted rule set before it is stored. Returns the first
  // validation error, or null when the rule set is acceptable.
  public query func validateGovernanceRuleSet(rules : Sovereign.GovernanceRuleSet) : async ?Sovereign.GovernanceError {
    ConstitutionLib.validateRuleSet(rules);
  };

  // ---------------------------------------------------------------------
  // Constitution reads
  // ---------------------------------------------------------------------

  // Read the active constitution and its rule set for a Nation. Only a
  // member of the Nation (or an authorized administrator) may read it; any
  // visitor may read the sample Nation's.
  public query ({ caller }) func getActiveConstitution(nation : Sovereign.NationId) : async ?Sovereign.Constitution {
    if (not canReadConstitution(caller, nation)) { return null };
    constitutionInForce(nation);
  };

  // Read the active rule set for a Nation. Returns null when the Nation has
  // no active constitution.
  public query ({ caller }) func getActiveRuleSet(nation : Sovereign.NationId) : async ?Sovereign.GovernanceRuleSet {
    if (not canReadConstitution(caller, nation)) { return null };
    switch (constitutionInForce(nation)) {
      case (?c) { ?c.rules };
      case null { null };
    };
  };

  // List a Nation's amendment history. Each amendment records the rules in
  // effect before and after it, so a historical decision can be read under
  // the rules that governed it. Only a member of the Nation (or an
  // authorized administrator) may read it.
  public query ({ caller }) func listAmendments(nation : Sovereign.NationId) : async [Sovereign.Amendment] {
    if (not canReadConstitution(caller, nation)) { return [] };
    let list = amendments.values().toArray().filter(func(a) = a.nation == nation);
    list.sort(func(a, b) = Nat.compare(a.resultingVersion, b.resultingVersion));
  };

  // Read the founding setup state for a Nation. Only a member of the Nation
  // (or an authorized administrator) may read it.
  public query ({ caller }) func getFoundingSetup(nation : Sovereign.NationId) : async ?Sovereign.FoundingSetup {
    if (not canReadConstitution(caller, nation)) { return null };
    foundingSetups.get(nation);
  };

  // List a Nation's founding appointments. Only a member of the Nation (or
  // an authorized administrator) may read them.
  public query ({ caller }) func listFoundingAppointments(nation : Sovereign.NationId) : async [Sovereign.FoundingAppointment] {
    if (not canReadConstitution(caller, nation)) { return [] };
    appointmentsForNation(nation);
  };

  // List a Nation's append-only governance history: appointments,
  // acceptances, approvals, rejections, votes and constitutional amendments.
  // Only a member of the Nation (or an authorized administrator) may read it.
  public query ({ caller }) func listGovernanceHistory(nation : Sovereign.NationId) : async [Sovereign.GovernanceHistoryEntry] {
    if (not canReadConstitution(caller, nation)) { return [] };
    let list = governanceHistory.values().toArray().filter(func(e) = e.nation == nation);
    list.sort(func(a, b) = Nat.compare(a.id, b.id));
  };

  // ---------------------------------------------------------------------
  // Founding setup
  // ---------------------------------------------------------------------

  // Begin founding setup for a Nation. Only the Nation's recorded owner (or
  // a platform administrator) may begin it. Idempotent: a second call is a
  // no-op once a setup exists. The setup stays in Founding Setup until an
  // authorized activation.
  public shared ({ caller }) func beginFoundingSetup(nation : Sovereign.NationId) : async Sovereign.ActivateFoundingResult {
    if (not isConstitutionNationOwner(caller, nation) and not isConstitutionAdmin(caller)) {
      return #err(#notAuthorized);
    };
    if (not nations.containsKey(nation)) { return #err(#unknownNation) };
    switch (foundingSetups.get(nation)) {
      case (?_) { return #ok };
      case null {};
    };
    let now = Time.now();
    foundingSetups.add(nation, {
      nation;
      status = #foundingSetup;
      foundingAuthority = caller;
      setupExpiresAt = now + setupWindowNanos;
      activatedConstitutionVersion = null;
      timestamp = now;
    });
    recordLifecycle(nation, #pendingActivation, "Founding setup begun; awaiting authority acceptance and ratification.", caller, now);
    #ok;
  };

  // Appoint a founding authority. Only the Nation's founding authority (or a
  // platform administrator) may appoint, and only while the Nation is in
  // Founding Setup. Each authority independently accepts through Internet
  // Identity. Returns the new appointment id.
  public shared ({ caller }) func appointFoundingAuthority(
    nation : Sovereign.NationId,
    authority : Principal,
    appointmentLabel : Text,
  ) : async Sovereign.SaveConstitutionResult {
    if (not isFoundingAuthority(caller, nation)) { return #err(#notAuthorized) };
    let setup = switch (foundingSetups.get(nation)) {
      case (?s) { s };
      case null { return #err(#notInFoundingSetup) };
    };
    if (setup.status != #foundingSetup) { return #err(#notInFoundingSetup) };
    if (ConstitutionLib.isSetupExpired(setup, Time.now())) { return #err(#setupExpired) };
    if (appointmentLabel.size() == 0) { return #err(#missingName) };
    let existing = appointmentsForNation(nation);
    // A principal may hold only one founding seat.
    if (ConstitutionLib.holdsFoundingSeat(existing, authority)) { return #err(#notAuthorized) };
    let now = Time.now();
    let id = counters.nextFoundingAppointmentId;
    counters.nextFoundingAppointmentId += 1;
    foundingAppointments.add(id, {
      id;
      nation;
      authority;
      appointmentLabel;
      status = #pending;
      expiresAt = setup.setupExpiresAt;
      invitationToken = "";
      invitedEmail = null;
      acceptedAt = null;
      timestamp = now;
    });
    let historyId = counters.nextGovernanceHistoryId;
    counters.nextGovernanceHistoryId += 1;
    governanceHistory.add(historyId, GovernanceAudit.newEntry(
      historyId,
      nation,
      #appointment,
      caller,
      id,
      "Appointed " # appointmentLabel,
      latestVersion(nation),
      now,
    ));
    #ok(id);
  };

  // Appoint a founding authority by secure email invitation. The invitation
  // token is single-use and bound to the accepting principal. Only the
  // Nation's founding authority (or a platform administrator) may invite, and
  // only while the Nation is in Founding Setup. Returns the new appointment
  // id.
  public shared ({ caller }) func inviteFoundingAuthority(
    nation : Sovereign.NationId,
    invitedEmail : Text,
    appointmentLabel : Text,
  ) : async Sovereign.SaveConstitutionResult {
    if (not isFoundingAuthority(caller, nation)) { return #err(#notAuthorized) };
    let setup = switch (foundingSetups.get(nation)) {
      case (?s) { s };
      case null { return #err(#notInFoundingSetup) };
    };
    if (setup.status != #foundingSetup) { return #err(#notInFoundingSetup) };
    if (ConstitutionLib.isSetupExpired(setup, Time.now())) { return #err(#setupExpired) };
    if (appointmentLabel.size() == 0) { return #err(#missingName) };
    if (invitedEmail.size() == 0) { return #err(#missingName) };
    let now = Time.now();
    let id = counters.nextFoundingAppointmentId;
    counters.nextFoundingAppointmentId += 1;
    // The invitation is bound to the accepting principal: the token is
    // single-use and consumed on acceptance. Until then the seat is held by
    // the placeholder principal so it cannot be double-appointed.
    foundingAppointments.add(id, {
      id;
      nation;
      authority = Principal.fromText("2vxsx-fae");
      appointmentLabel;
      status = #pending;
      expiresAt = setup.setupExpiresAt;
      invitationToken = GovernanceAudit.invitationToken(id, now);
      invitedEmail = ?invitedEmail;
      acceptedAt = null;
      timestamp = now;
    });
    let historyId = counters.nextGovernanceHistoryId;
    counters.nextGovernanceHistoryId += 1;
    governanceHistory.add(historyId, GovernanceAudit.newEntry(
      historyId,
      nation,
      #appointment,
      caller,
      id,
      "Invited " # appointmentLabel,
      latestVersion(nation),
      now,
    ));
    #ok(id);
  };

  // Accept a founding appointment. Only the appointed authority may accept,
  // and only while the Nation is in Founding Setup. Each authority accepts
  // independently through Internet Identity. When the third distinct
  // authority accepts and a confirmed constitution exists, the Nation
  // activates automatically.
  public shared ({ caller }) func acceptFoundingAppointment(
    nation : Sovereign.NationId,
    appointment : Nat,
  ) : async Sovereign.ActivateFoundingResult {
    let setup = switch (foundingSetups.get(nation)) {
      case (?s) { s };
      case null { return #err(#notInFoundingSetup) };
    };
    if (setup.status != #foundingSetup) { return #err(#notInFoundingSetup) };
    let a = switch (foundingAppointments.get(appointment)) {
      case (?a) { a };
      case null { return #err(#unknownConstitution) };
    };
    if (a.nation != nation) { return #err(#notAuthorized) };
    if (a.status != #pending) { return #err(#notInFoundingSetup) };
    // An invitation appointment is accepted only through its token, which
    // binds the acceptance to the caller principal.
    if (GovernanceAudit.hasInvitationToken(a.invitationToken)) { return #err(#notAuthorized) };
    if (not Principal.equal(a.authority, caller)) { return #err(#notAuthorized) };
    let now = Time.now();
    if (now >= a.expiresAt) {
      foundingAppointments.add(appointment, { a with status = #expired; timestamp = now });
      return #err(#setupExpired);
    };
    // The same principal can never hold two founding seats.
    let others = appointmentsForNation(nation).filter(func(o) = o.id != appointment);
    if (ConstitutionLib.holdsFoundingSeat(others, caller)) { return #err(#notAuthorized) };
    foundingAppointments.add(appointment, {
      a with status = #accepted; acceptedAt = ?now; timestamp = now;
    });
    let historyId = counters.nextGovernanceHistoryId;
    counters.nextGovernanceHistoryId += 1;
    governanceHistory.add(historyId, GovernanceAudit.newEntry(
      historyId,
      nation,
      #acceptance,
      caller,
      appointment,
      "Accepted " # a.appointmentLabel,
      latestVersion(nation),
      now,
    ));
    tryAutoActivate(nation, now);
  };

  // Accept a founding appointment through its single-use invitation token.
  // The token binds the acceptance to the caller principal; a token already
  // consumed, expired, or bound to another principal is rejected.
  public shared ({ caller }) func acceptFoundingInvitation(
    nation : Sovereign.NationId,
    token : Text,
  ) : async Sovereign.ActivateFoundingResult {
    let setup = switch (foundingSetups.get(nation)) {
      case (?s) { s };
      case null { return #err(#notInFoundingSetup) };
    };
    if (setup.status != #foundingSetup) { return #err(#notInFoundingSetup) };
    let a = switch (appointmentsForNation(nation).find(func(x) =
      x.status == #pending and GovernanceAudit.hasInvitationToken(x.invitationToken) and x.invitationToken == token
    )) {
      case (?a) { a };
      case null { return #err(#notAuthorized) };
    };
    let now = Time.now();
    if (now >= a.expiresAt) {
      foundingAppointments.add(a.id, { a with status = #expired; timestamp = now });
      return #err(#setupExpired) };
    // The same principal can never hold two founding seats.
    let others = appointmentsForNation(nation).filter(func(o) = o.id != a.id);
    if (ConstitutionLib.holdsFoundingSeat(others, caller)) { return #err(#notAuthorized) };
    // Bind the seat to the accepting principal and consume the token.
    foundingAppointments.add(a.id, {
      a with
      authority = caller;
      status = #accepted;
      invitationToken = "";
      acceptedAt = ?now;
      timestamp = now;
    });
    let historyId = counters.nextGovernanceHistoryId;
    counters.nextGovernanceHistoryId += 1;
    governanceHistory.add(historyId, GovernanceAudit.newEntry(
      historyId,
      nation,
      #acceptance,
      caller,
      a.id,
      "Accepted " # a.appointmentLabel,
      latestVersion(nation),
      now,
    ));
    tryAutoActivate(nation, now);
  };

  // Decline a founding appointment. Only the appointed authority may
  // decline. A declined appointment can be replaced by the founding
  // authority that created it.
  public shared ({ caller }) func declineFoundingAppointment(
    nation : Sovereign.NationId,
    appointment : Nat,
  ) : async Sovereign.ActivateFoundingResult {
    let a = switch (foundingAppointments.get(appointment)) {
      case (?a) { a };
      case null { return #err(#unknownConstitution) };
    };
    if (a.nation != nation) { return #err(#notAuthorized) };
    if (not Principal.equal(a.authority, caller)) { return #err(#notAuthorized) };
    if (a.status != #pending) { return #err(#notInFoundingSetup) };
    foundingAppointments.add(appointment, { a with status = #declined; timestamp = Time.now() });
    #ok;
  };

  // Replace a declined or expired founding appointment. Only the Nation's
  // founding authority (or a platform administrator) may replace, and only
  // while the Nation is in Founding Setup. The old appointment is marked
  // replaced and a new pending appointment is created for the new authority.
  public shared ({ caller }) func replaceFoundingAppointment(
    nation : Sovereign.NationId,
    appointment : Nat,
    newAuthority : Principal,
    appointmentLabel : Text,
  ) : async Sovereign.SaveConstitutionResult {
    if (not isFoundingAuthority(caller, nation)) { return #err(#notAuthorized) };
    let setup = switch (foundingSetups.get(nation)) {
      case (?s) { s };
      case null { return #err(#notInFoundingSetup) };
    };
    if (setup.status != #foundingSetup) { return #err(#notInFoundingSetup) };
    let a = switch (foundingAppointments.get(appointment)) {
      case (?a) { a };
      case null { return #err(#unknownConstitution) };
    };
    if (a.nation != nation) { return #err(#notAuthorized) };
    if (a.status != #declined and a.status != #expired) { return #err(#notInFoundingSetup) };
    if (appointmentLabel.size() == 0) { return #err(#missingName) };
    let now = Time.now();
    foundingAppointments.add(appointment, { a with status = #replaced; timestamp = now });
    let id = counters.nextFoundingAppointmentId;
    counters.nextFoundingAppointmentId += 1;
    foundingAppointments.add(id, {
      id;
      nation;
      authority = newAuthority;
      appointmentLabel;
      status = #pending;
      expiresAt = setup.setupExpiresAt;
      invitationToken = "";
      invitedEmail = null;
      acceptedAt = null;
      timestamp = now;
    });
    #ok(id);
  };

  // Cancel a Nation's founding setup before activation. Only the Nation's
  // founding authority (or a platform administrator) may cancel. The setup
  // moves to Cancelled and no private organizational access is granted.
  public shared ({ caller }) func cancelFoundingSetup(nation : Sovereign.NationId) : async Sovereign.ActivateFoundingResult {
    if (not isFoundingAuthority(caller, nation)) { return #err(#notAuthorized) };
    let setup = switch (foundingSetups.get(nation)) {
      case (?s) { s };
      case null { return #err(#notInFoundingSetup) };
    };
    if (setup.status != #foundingSetup) { return #err(#notInFoundingSetup) };
    foundingSetups.add(nation, { setup with status = #cancelled; timestamp = Time.now() });
    #ok;
  };

  // ---------------------------------------------------------------------
  // Save a confirmed constitution (Founding Setup only)
  // ---------------------------------------------------------------------

  // Save a confirmed constitution for a Nation in Founding Setup. Only the
  // Nation's founding authority (or a platform administrator) may save, and
  // only while the Nation is in Founding Setup. The submitted rule set is
  // validated before it is stored. Saving a new version supersedes the
  // previous one, which is kept as history. The saving authority's
  // ratification of the new version is recorded; a direct rule edit on an
  // activated Nation is rejected — rules change only through an approved
  // amendment.
  public shared ({ caller }) func saveConstitution(
    nation : Sovereign.NationId,
    templateKey : Text,
    rules : Sovereign.GovernanceRuleSet,
  ) : async Sovereign.SaveConstitutionResult {
    if (not isFoundingAuthority(caller, nation)) { return #err(#notAuthorized) };
    if (not nations.containsKey(nation)) { return #err(#unknownNation) };
    let setup = switch (foundingSetups.get(nation)) {
      case (?s) { s };
      case null { return #err(#notInFoundingSetup) };
    };
    if (setup.status == #activated) { return #err(#alreadyActivated) };
    if (setup.status != #foundingSetup) { return #err(#notInFoundingSetup) };
    if (ConstitutionLib.isSetupExpired(setup, Time.now())) { return #err(#setupExpired) };
    switch (ConstitutionLib.validateRuleSet(rules)) {
      case (?e) { return #err(e) };
      case null {};
    };
    let now = Time.now();
    // Supersede the previous active version, keeping it as history.
    for (c in constitutions.values()) {
      if (c.nation == nation and c.active) {
        constitutions.add(c.id, { c with active = false });
      };
    };
    let version = latestVersion(nation) + 1;
    let id = counters.nextConstitutionId;
    counters.nextConstitutionId += 1;
    constitutions.add(id, {
      id;
      nation;
      version;
      rules;
      templateKey;
      confirmedBy = caller;
      active = true;
      ratifications = ?[{ authority = caller; ratifiedAt = now }];
      timestamp = now;
    });
    #ok(id);
  };

  // Ratify the constitution version currently in force. Only an accepted
  // founding authority may ratify, and only while the Nation is in Founding
  // Setup. Each authority ratifies independently; when the third distinct
  // authority has ratified the same version and the succession plan is
  // ratified, the Nation activates automatically.
  public shared ({ caller }) func ratifyConstitution(nation : Sovereign.NationId) : async Sovereign.ActivateFoundingResult {
    let setup = switch (foundingSetups.get(nation)) {
      case (?s) { s };
      case null { return #err(#notInFoundingSetup) };
    };
    if (setup.status == #activated) { return #ok };
    if (setup.status != #foundingSetup) { return #err(#notInFoundingSetup) };
    let accepted = ConstitutionLib.acceptedFoundingAuthorities(appointmentsForNation(nation));
    if (not LifecycleLib.containsPrincipal(accepted, caller)) { return #err(#notFoundingAuthority) };
    let current = switch (constitutionInForce(nation)) {
      case (?c) { c };
      case null { return #err(#unknownConstitution) };
    };
    let now = Time.now();
    let existingRatifications = current.ratifications ?? [];
    if (LifecycleLib.containsPrincipal(LifecycleLib.ratifiedAuthorities(existingRatifications), caller)) {
      return #err(#alreadyVoted);
    };
    constitutions.add(current.id, {
      current with
      ratifications = ?existingRatifications.concat([{ authority = caller; ratifiedAt = now }]);
      timestamp = now;
    });
    let historyId = counters.nextGovernanceHistoryId;
    counters.nextGovernanceHistoryId += 1;
    governanceHistory.add(historyId, GovernanceAudit.newEntry(
      historyId,
      nation,
      #approval,
      caller,
      current.id,
      "Ratified constitution version " # current.version.toText(),
      current.version,
      now,
    ));
    tryAutoActivate(nation, now);
  };

  // ---------------------------------------------------------------------
  // Activation
  // ---------------------------------------------------------------------

  // Activate a Nation only after its founding authorities have accepted.
  // Activation is automatic once the third distinct authority accepts and a
  // confirmed constitution exists; there is no manual administrator bypass.
  // This endpoint reports the current activation state and never forces
  // activation.
  public shared ({ caller }) func activateFounding(nation : Sovereign.NationId) : async Sovereign.ActivateFoundingResult {
    if (not canReadConstitution(caller, nation)) { return #err(#notAuthorized) };
    let setup = switch (foundingSetups.get(nation)) {
      case (?s) { s };
      case null { return #err(#notInFoundingSetup) };
    };
    if (setup.status == #activated) { return #ok };
    if (setup.status != #foundingSetup) { return #err(#notInFoundingSetup) };
    // Never forces activation: only reports the state, activating only when
    // the founding requirements are already satisfied.
    tryAutoActivate(nation, Time.now());
  };

  // Read the founding acceptance status for a Nation: how many distinct
  // authorities have accepted out of the three required, and whether the
  // Nation is Pending Activation or Active.
  public query ({ caller }) func getFoundingStatus(nation : Sovereign.NationId) : async {
    accepted : Nat;
    required : Nat;
    activated : Bool;
  } {
    let required = ConstitutionLib.requiredFoundingAuthorities();
    if (not canReadConstitution(caller, nation)) {
      return { accepted = 0; required; activated = false };
    };
    let appointments = appointmentsForNation(nation);
    let accepted = ConstitutionLib.acceptedFoundingAuthorities(appointments).size();
    let activated = switch (foundingSetups.get(nation)) {
      case (?s) { s.status == #activated };
      case null { false };
    };
    { accepted; required; activated };
  };

  // ---------------------------------------------------------------------
  // Amendment (activated Nations only)
  // ---------------------------------------------------------------------

  // Amend an activated Nation's constitution. A direct rule edit on an
  // activated Nation is rejected: rules change only through this
  // constitutionally authorized amendment, which records the rules in
  // effect before and after the change. Only the Nation's founding authority
  // (or a platform administrator) may amend.
  public shared ({ caller }) func amendConstitution(
    nation : Sovereign.NationId,
    summary : Text,
    newRules : Sovereign.GovernanceRuleSet,
  ) : async Sovereign.SaveAmendmentResult {
    if (not isFoundingAuthority(caller, nation)) { return #err(#notAuthorized) };
    let setup = switch (foundingSetups.get(nation)) {
      case (?s) { s };
      case null { return #err(#notInFoundingSetup) };
    };
    if (setup.status != #activated) { return #err(#notInFoundingSetup) };
    // A direct rule edit is permitted only in a lifecycle state that allows
    // a constitutional amendment; an archived or suspended Nation rejects it.
    switch (constitutionLifecycleGuard(nation, #amendConstitution)) {
      case (?e) { return #err(switch (e) {
        case (#alreadyArchived) { #notAuthorized };
        case (_) { #notAuthorized };
      }) };
      case null {};
    };
    if (summary.size() == 0) { return #err(#missingSummary) };
    switch (ConstitutionLib.validateRuleSet(newRules)) {
      case (?e) { return #err(e) };
      case null {};
    };
    let previous = switch (constitutionInForce(nation)) {
      case (?c) { c };
      case null { return #err(#unknownConstitution) };
    };
    let now = Time.now();
    // Supersede the previous active version, keeping it as history.
    constitutions.add(previous.id, { previous with active = false });
    let version = latestVersion(nation) + 1;
    let constitutionId = counters.nextConstitutionId;
    counters.nextConstitutionId += 1;
    constitutions.add(constitutionId, {
      id = constitutionId;
      nation;
      version;
      rules = newRules;
      templateKey = previous.templateKey;
      confirmedBy = caller;
      active = true;
      ratifications = ?[{ authority = caller; ratifiedAt = now }];
      timestamp = now;
    });
    let amendmentId = counters.nextAmendmentId;
    counters.nextAmendmentId += 1;
    amendments.add(amendmentId, {
      id = amendmentId;
      nation;
      resultingVersion = version;
      previousVersion = previous.version;
      summary;
      previousRules = previous.rules;
      newRules;
      authorizedBy = caller;
      timestamp = now;
    });
    // Record the new version in the version history.
    let versionId = counters.nextConstitutionVersionId;
    counters.nextConstitutionVersionId += 1;
    constitutionVersions.add(versionId, {
      id = versionId;
      nation;
      version;
      rules = newRules;
      producedByAmendment = null;
      authorizingAuthority = caller;
      effectiveDate = now;
      ratifications = [{ authority = caller; ratifiedAt = now }];
      timestamp = now;
    });
    #ok(amendmentId);
  };

  // ---------------------------------------------------------------------
  // Lifecycle reads
  // ---------------------------------------------------------------------

  // Read a Nation's effective lifecycle state and its plain-language
  // explanation. Only a member of the Nation (or an authorized
  // administrator) may read it; any visitor may read the sample Nation's.
  public query ({ caller }) func getNationLifecycle(nation : Sovereign.NationId) : async ?{
    state : Sovereign.NationLifecycleState;
    stateKey : Text;
    explanation : Text;
    enteredAt : Sovereign.Timestamp;
    reason : Text;
  } {
    if (not canReadConstitution(caller, nation)) { return null };
    let state = constitutionLifecycleStateOf(nation);
    let stored = nationLifecycles.get(nation);
    ?{
      state;
      stateKey = LifecycleLib.stateKey(state);
      explanation = LifecycleLib.stateExplanation(state);
      enteredAt = switch (stored) { case (?l) { l.enteredAt }; case null { 0 } };
      reason = switch (stored) { case (?l) { l.reason }; case null { "" } };
    };
  };

  // Read the outstanding activation requirements for a Nation, so the
  // interface can show what is still needed before activation.
  public query ({ caller }) func getActivationRequirements(nation : Sovereign.NationId) : async {
    accepted : Nat;
    required : Nat;
    hasConfirmedConstitution : Bool;
    constitutionRatifiedByAll : Bool;
    planRatified : Bool;
    outstanding : [Text];
  } {
    let required = ConstitutionLib.requiredFoundingAuthorities();
    if (not canReadConstitution(caller, nation)) {
      return {
        accepted = 0;
        required;
        hasConfirmedConstitution = false;
        constitutionRatifiedByAll = false;
        planRatified = false;
        outstanding = [];
      };
    };
    let appointments = appointmentsForNation(nation);
    let accepted = ConstitutionLib.acceptedFoundingAuthorities(appointments).size();
    let hasConfirmedConstitution = constitutionInForce(nation) != null;
    let constitutionRatifiedByAll = foundingRatificationsComplete(nation);
    let planRatified = planRatifiedByAll(nation);
    {
      accepted;
      required;
      hasConfirmedConstitution;
      constitutionRatifiedByAll;
      planRatified;
      outstanding = ConstitutionLib.outstandingActivationRequirements(
        appointments,
        hasConfirmedConstitution,
        constitutionRatifiedByAll,
        planRatified,
      );
    };
  };

  // ---------------------------------------------------------------------
  // Succession and recovery plan
  // ---------------------------------------------------------------------

  // Read a Nation's succession and recovery plan. Only a member of the
  // Nation (or an authorized administrator) may read it.
  public query ({ caller }) func getSuccessionPlan(nation : Sovereign.NationId) : async ?Sovereign.SuccessionRecoveryPlan {
    if (not canReadConstitution(caller, nation)) { return null };
    successionPlans.get(nation);
  };

  // Save a Nation's succession and recovery plan during founding setup. Only
  // the Nation's founding authority (or a platform administrator) may save
  // it, and only while the Nation is in Founding Setup. Saving resets the
  // plan's ratifications: every founding authority must ratify the plan
  // before activation.
  public shared ({ caller }) func saveSuccessionPlan(
    nation : Sovereign.NationId,
    plan : Sovereign.SuccessionRecoveryPlan,
  ) : async Sovereign.SaveSuccessionPlanResult {
    if (not isFoundingAuthority(caller, nation)) { return #err(#notAuthorized) };
    let setup = switch (foundingSetups.get(nation)) {
      case (?s) { s };
      case null { return #err(#invalidLifecycleTransition) };
    };
    if (setup.status != #foundingSetup) { return #err(#invalidLifecycleTransition) };
    if (plan.identityRecoveryProcedure.size() == 0) { return #err(#missingReason) };
    let now = Time.now();
    successionPlans.add(nation, {
      plan with
      nation;
      ratifications = [];
      ratified = false;
      timestamp = now;
    });
    #ok;
  };

  // Ratify the succession and recovery plan. Only an accepted founding
  // authority may ratify, and only while the Nation is in Founding Setup.
  // When every accepted founding authority has ratified the plan and the
  // constitution, the Nation activates automatically.
  public shared ({ caller }) func ratifySuccessionPlan(nation : Sovereign.NationId) : async Sovereign.RatifySuccessionPlanResult {
    let setup = switch (foundingSetups.get(nation)) {
      case (?s) { s };
      case null { return #err(#invalidLifecycleTransition) };
    };
    if (setup.status != #foundingSetup) { return #err(#invalidLifecycleTransition) };
    let accepted = ConstitutionLib.acceptedFoundingAuthorities(appointmentsForNation(nation));
    if (not LifecycleLib.containsPrincipal(accepted, caller)) { return #err(#notFoundingAuthority) };
    let plan = switch (successionPlans.get(nation)) {
      case (?p) { p };
      case null { return #err(#planNotRatified) };
    };
    let now = Time.now();
    if (LifecycleLib.containsPrincipal(LifecycleLib.ratifiedAuthorities(plan.ratifications), caller)) {
      return #err(#duplicateApproval);
    };
    let ratifications = plan.ratifications.concat([{ authority = caller; ratifiedAt = now }]);
    let ratifiers = LifecycleLib.ratifiedAuthorities(ratifications);
    let ratified = accepted.size() > 0 and accepted.all(func(a) = ratifiers.any(func(p) = Principal.equal(p, a)));
    successionPlans.add(nation, {
      plan with
      ratifications;
      ratified;
      timestamp = now;
    });
    ignore tryAutoActivate(nation, now);
    #ok;
  };

  // ---------------------------------------------------------------------
  // Authority positions and succession
  // ---------------------------------------------------------------------

  // List a Nation's authority positions. Only a member of the Nation (or an
  // authorized administrator) may read them.
  public query ({ caller }) func listAuthorityPositions(nation : Sovereign.NationId) : async [Sovereign.AuthorityPosition] {
    if (not canReadConstitution(caller, nation)) { return [] };
    authorityPositions.values().toArray().filter(func(p) = p.nation == nation);
  };

  // List a Nation's authority term events: appointments, acceptances,
  // resignations, retirements, replacements and removals. Only a member of
  // the Nation (or an authorized administrator) may read them.
  public query ({ caller }) func listAuthorityTermEvents(nation : Sovereign.NationId) : async [Sovereign.AuthorityTermEvent] {
    if (not canReadConstitution(caller, nation)) { return [] };
    let list = authorityTermEvents.values().toArray().filter(func(e) = e.nation == nation);
    list.sort(func(a, b) = Nat.compare(a.id, b.id));
  };

  // Create an authority position, separate from the individual occupying it.
  // Only the Nation's founding authority (or a platform administrator) may
  // create one, and only in a lifecycle state that permits an authority
  // change.
  public shared ({ caller }) func createAuthorityPosition(
    nation : Sovereign.NationId,
    seatLabel : Text,
    termStart : Sovereign.Timestamp,
    termEnd : Sovereign.Timestamp,
  ) : async Sovereign.SaveAuthorityPositionResult {
    if (not isFoundingAuthority(caller, nation)) { return #err(#notAuthorized) };
    if (not nations.containsKey(nation)) { return #err(#unknownNation) };
    switch (constitutionLifecycleGuard(nation, #changeAuthority)) {
      case (?e) { return #err(e) };
      case null {};
    };
    if (seatLabel.size() == 0) { return #err(#missingReason) };
    let now = Time.now();
    let id = counters.nextAuthorityPositionId;
    counters.nextAuthorityPositionId += 1;
    authorityPositions.add(id, {
      id;
      nation;
      seatLabel;
      termStart;
      termEnd;
      holder = null;
      holderDisplayLabel = "";
      status = #vacant;
      timestamp = now;
    });
    #ok(id);
  };

  // Appoint a successor to an authority position. The successor must accept
  // independently through Internet Identity before the position is filled;
  // this records the appointment and leaves the position vacant until the
  // successor accepts. Only the Nation's founding authority (or a platform
  // administrator) may appoint.
  public shared ({ caller }) func appointAuthoritySuccessor(
    nation : Sovereign.NationId,
    position : Sovereign.AuthorityPositionId,
    successor : Principal,
    successorDisplayLabel : Text,
    reason : Text,
  ) : async Sovereign.RecordAuthorityTermEventResult {
    if (not isFoundingAuthority(caller, nation)) { return #err(#notAuthorized) };
    switch (constitutionLifecycleGuard(nation, #changeAuthority)) {
      case (?e) { return #err(e) };
      case null {};
    };
    let p = switch (authorityPositions.get(position)) {
      case (?p) { p };
      case null { return #err(#unknownPosition) };
    };
    if (p.nation != nation) { return #err(#notAuthorized) };
    if (reason.size() == 0) { return #err(#missingReason) };
    // A principal may not hold two authority positions in the same Nation.
    let duplicate = authorityPositions.values().toArray().any(func(o) =
      o.nation == nation and o.id != position and
      (switch (o.holder) { case (?h) { Principal.equal(h, successor) }; case null { false } })
    );
    if (duplicate) { return #err(#duplicateIdentity) };
    let now = Time.now();
    let id = counters.nextAuthorityTermEventId;
    counters.nextAuthorityTermEventId += 1;
    authorityTermEvents.add(id, {
      id;
      nation;
      position;
      kind = #appointment;
      subject = successor;
      actingPrincipal = caller;
      reason;
      approvals = [];
      constitutionVersion = latestVersion(nation);
      timestamp = now;
    });
    // The position stays vacant until the successor accepts.
    authorityPositions.add(position, {
      p with
      holder = null;
      holderDisplayLabel = successorDisplayLabel;
      status = #vacant;
      timestamp = now;
    });
    #ok(id);
  };

  // Accept an authority appointment. Only the appointed successor may accept,
  // and only through their own Internet Identity principal. Acceptance fills
  // the position and records the acceptance.
  public shared ({ caller }) func acceptAuthorityAppointment(
    nation : Sovereign.NationId,
    position : Sovereign.AuthorityPositionId,
  ) : async Sovereign.RecordAuthorityTermEventResult {
    let p = switch (authorityPositions.get(position)) {
      case (?p) { p };
      case null { return #err(#unknownPosition) };
    };
    if (p.nation != nation) { return #err(#notAuthorized) };
    // The most recent appointment event for this position names the
    // successor; only that principal may accept.
    let appointment = authorityTermEvents.values().toArray()
      .filter(func(e) = e.nation == nation and e.position == position and e.kind == #appointment)
      .sort(func(a, b) = Nat.compare(b.id, a.id));
    let successor = switch (appointment.find(func(_) = true)) {
      case (?e) { e.subject };
      case null { return #err(#unknownPosition) };
    };
    if (not Principal.equal(successor, caller)) { return #err(#notAuthorized) };
    let now = Time.now();
    let id = counters.nextAuthorityTermEventId;
    counters.nextAuthorityTermEventId += 1;
    authorityTermEvents.add(id, {
      id;
      nation;
      position;
      kind = #acceptance;
      subject = caller;
      actingPrincipal = caller;
      reason = "Successor accepted the appointment.";
      approvals = [];
      constitutionVersion = latestVersion(nation);
      timestamp = now;
    });
    authorityPositions.add(position, {
      p with
      holder = ?caller;
      status = #filled;
      timestamp = now;
    });
    #ok(id);
  };

  // Record an authority departure: resignation, retirement, removal or
  // replacement. Only the position's holder (for a resignation or
  // retirement) or the Nation's founding authority (for a removal or
  // replacement) may record it. The position becomes vacant; the holder is
  // never transferred automatically.
  public shared ({ caller }) func recordAuthorityDeparture(
    nation : Sovereign.NationId,
    position : Sovereign.AuthorityPositionId,
    kind : Sovereign.AuthorityTermEventKind,
    reason : Text,
  ) : async Sovereign.RecordAuthorityTermEventResult {
    switch (constitutionLifecycleGuard(nation, #changeAuthority)) {
      case (?e) { return #err(e) };
      case null {};
    };
    let p = switch (authorityPositions.get(position)) {
      case (?p) { p };
      case null { return #err(#unknownPosition) };
    };
    if (p.nation != nation) { return #err(#notAuthorized) };
    if (reason.size() == 0) { return #err(#missingReason) };
    let holder = switch (p.holder) {
      case (?h) { h };
      case null { return #err(#unknownPosition) };
    };
    let isHolder = Principal.equal(holder, caller);
    let isAuthority = isFoundingAuthority(caller, nation);
    let selfService = switch (kind) {
      case (#resignation) { true };
      case (#retirement) { true };
      case (_) { false };
    };
    if (selfService and not isHolder) { return #err(#notAuthorized) };
    if (not selfService and not isAuthority) { return #err(#notAuthorized) };
    let now = Time.now();
    let id = counters.nextAuthorityTermEventId;
    counters.nextAuthorityTermEventId += 1;
    authorityTermEvents.add(id, {
      id;
      nation;
      position;
      kind;
      subject = holder;
      actingPrincipal = caller;
      reason;
      approvals = [];
      constitutionVersion = latestVersion(nation);
      timestamp = now;
    });
    authorityPositions.add(position, {
      p with
      holder = null;
      holderDisplayLabel = "";
      status = #vacant;
      timestamp = now;
    });
    #ok(id);
  };

  // ---------------------------------------------------------------------
  // Constitutional amendment proposals
  // ---------------------------------------------------------------------

  // List a Nation's amendment proposals. Only a member of the Nation (or an
  // authorized administrator) may read them.
  public query ({ caller }) func listAmendmentProposals(nation : Sovereign.NationId) : async [Sovereign.AmendmentProposal] {
    if (not canReadConstitution(caller, nation)) { return [] };
    let list = amendmentProposals.values().toArray().filter(func(a) = a.nation == nation);
    list.sort(func(a, b) = Nat.compare(a.id, b.id));
  };

  // List a Nation's constitution version history. Only a member of the Nation
  // (or an authorized administrator) may read it.
  public query ({ caller }) func listConstitutionVersions(nation : Sovereign.NationId) : async [Sovereign.ConstitutionVersion] {
    if (not canReadConstitution(caller, nation)) { return [] };
    let list = constitutionVersions.values().toArray().filter(func(v) = v.nation == nation);
    list.sort(func(a, b) = Nat.compare(a.version, b.version));
  };

  // Propose a constitutional amendment. Only a member of the Nation may
  // propose one, and only in a lifecycle state that permits an amendment.
  // The proposal is approved under the constitution currently in effect and
  // never retroactively alters pending decisions or completed votes.
  public shared ({ caller }) func proposeAmendment(
    nation : Sovereign.NationId,
    title : Text,
    summary : Text,
    changes : [Sovereign.RuleChange],
    votingDeadline : Sovereign.Timestamp,
  ) : async Sovereign.SaveAmendmentProposalResult {
    if (not isConstitutionNationMember(caller, nation)) { return #err(#notAuthorized) };
    switch (constitutionLifecycleGuard(nation, #amendConstitution)) {
      case (?e) { return #err(switch (e) {
        case (#alreadyArchived) { #alreadyArchived };
        case (_) { #notAuthorized };
      }) };
      case null {};
    };
    if (title.size() == 0) { return #err(#missingTitle) };
    if (summary.size() == 0) { return #err(#missingSummary) };
    let current = switch (constitutionInForce(nation)) {
      case (?c) { c };
      case null { return #err(#invalidLifecycleTransition) };
    };
    let now = Time.now();
    let id = counters.nextAmendmentProposalId;
    counters.nextAmendmentProposalId += 1;
    amendmentProposals.add(id, {
      id;
      nation;
      title;
      summary;
      baseConstitutionVersion = current.version;
      changes;
      discussionThread = null;
      votingEligibility = current.rules.votingEligibility;
      quorumPercent = current.rules.quorumPercent;
      approvalThresholdPercent = LifecycleLib.defaultAmendmentThresholdPercent();
      votingDeadline;
      abstentionHandling = #excludedFromDenominator;
      status = #voting;
      ratifications = [];
      effectiveDate = null;
      proposer = caller;
      timestamp = now;
    });
    #ok(id);
  };

  // Ratify an amendment proposal. Only an accepted founding authority may
  // ratify, and only while the proposal is open for voting. When every
  // accepted founding authority has ratified it, the amendment produces a
  // new constitution version and takes effect.
  public shared ({ caller }) func ratifyAmendment(
    nation : Sovereign.NationId,
    proposal : Sovereign.AmendmentProposalId,
  ) : async Sovereign.RatifyAmendmentResult {
    switch (constitutionLifecycleGuard(nation, #amendConstitution)) {
      case (?e) { return #err(switch (e) {
        case (#alreadyArchived) { #alreadyArchived };
        case (_) { #notAuthorized };
      }) };
      case null {};
    };
    let accepted = ConstitutionLib.acceptedFoundingAuthorities(appointmentsForNation(nation));
    if (not LifecycleLib.containsPrincipal(accepted, caller)) { return #err(#notFoundingAuthority) };
    let a = switch (amendmentProposals.get(proposal)) {
      case (?a) { a };
      case null { return #err(#unknownAmendment) };
    };
    if (a.nation != nation) { return #err(#notAuthorized) };
    if (a.status != #voting) { return #err(#invalidLifecycleTransition) };
    let now = Time.now();
    if (now >= a.votingDeadline) { return #err(#invalidLifecycleTransition) };
    if (LifecycleLib.containsPrincipal(LifecycleLib.ratifiedAuthorities(a.ratifications), caller)) {
      return #err(#duplicateApproval);
    };
    let ratifications = a.ratifications.concat([{ authority = caller; ratifiedAt = now }]);
    let ratifiers = LifecycleLib.ratifiedAuthorities(ratifications);
    let complete = accepted.size() > 0 and accepted.all(func(x) = ratifiers.any(func(p) = Principal.equal(p, x)));
    if (not complete) {
      amendmentProposals.add(proposal, { a with ratifications; timestamp = now });
      return #err(#approvalThresholdNotMet);
    };
    // The amendment is ratified: produce a new constitution version.
    let current = switch (constitutionInForce(nation)) {
      case (?c) { c };
      case null { return #err(#invalidLifecycleTransition) };
    };
    constitutions.add(current.id, { current with active = false });
    let version = latestVersion(nation) + 1;
    let constitutionId = counters.nextConstitutionId;
    counters.nextConstitutionId += 1;
    constitutions.add(constitutionId, {
      id = constitutionId;
      nation;
      version;
      rules = current.rules;
      templateKey = current.templateKey;
      confirmedBy = caller;
      active = true;
      ratifications = ?ratifications;
      timestamp = now;
    });
    let versionId = counters.nextConstitutionVersionId;
    counters.nextConstitutionVersionId += 1;
    constitutionVersions.add(versionId, {
      id = versionId;
      nation;
      version;
      rules = current.rules;
      producedByAmendment = ?proposal;
      authorizingAuthority = caller;
      effectiveDate = now;
      ratifications;
      timestamp = now;
    });
    amendmentProposals.add(proposal, {
      a with
      status = #ratified;
      ratifications;
      effectiveDate = ?now;
      timestamp = now;
    });
    let historyId = counters.nextGovernanceHistoryId;
    counters.nextGovernanceHistoryId += 1;
    governanceHistory.add(historyId, GovernanceAudit.newEntry(
      historyId,
      nation,
      #amendment,
      caller,
      proposal,
      "Ratified amendment: " # a.title,
      version,
      now,
    ));
    #ok(versionId);
  };

  // ---------------------------------------------------------------------
  // Founding-seat confirmation & launch status
  //
  // The creator's Founding Authority #1 seat is recorded when the Nation is
  // created. These endpoints let the creator confirm that existing seat
  // without appointing a second one, read the launch status of a Nation they
  // own, and resume the launch from the first unfinished step. The
  // three-distinct-authority activation requirement and the Pending
  // Activation state are unchanged.
  // ---------------------------------------------------------------------

  // The launch status of one Nation, as the creator sees it: the founding
  // setup state, the accepted authority count out of three, the seats the
  // caller holds, the seats awaiting other people, whether the constitution is
  // saved, and a plain-language reason when the launch cannot continue.
  func launchStatusOf(
    nation : Sovereign.NationId,
    caller : Principal,
    now : Sovereign.Timestamp,
  ) : Sovereign.LaunchStatus {
    let setup = switch (foundingSetups.get(nation)) {
      case (?s) { s };
      case null {
        {
          nation;
          status = #foundingSetup;
          foundingAuthority = caller;
          setupExpiresAt = now;
          activatedConstitutionVersion = null;
          timestamp = now;
        };
      };
    };
    let appointments = appointmentsForNation(nation);
    let accepted = ConstitutionLib.acceptedFoundingAuthorities(appointments).size();
    let required = ConstitutionLib.requiredFoundingAuthorities();
    let seatSummary = func(a : Sovereign.FoundingAppointment) : Sovereign.FoundingSeatSummary {
      {
        appointmentId = a.id;
        appointmentLabel = a.appointmentLabel;
        authority = a.authority;
        status = a.status;
        heldByCaller = Principal.equal(a.authority, caller);
        awaitingOther = a.status == #pending and not Principal.equal(a.authority, caller);
      };
    };
    let callerSeats = appointments.filter(func(a) =
      Principal.equal(a.authority, caller) and (a.status == #pending or a.status == #accepted)
    ).map(seatSummary);
    let awaitingOtherSeats = appointments.filter(func(a) =
      a.status == #pending and not Principal.equal(a.authority, caller)
    ).map(seatSummary);
    let constitutionSaved = constitutionInForce(nation) != null;
    let canResume = ConstitutionLib.canResumeLaunch(setup, now);
    let blockedReason = ConstitutionLib.launchBlockedReason(setup, now);
    {
      nation;
      setupStatus = setup.status;
      lifecycleState = constitutionLifecycleStateOf(nation);
      acceptedAuthorities = accepted;
      requiredAuthorities = required;
      callerSeats;
      awaitingOtherSeats;
      constitutionSaved;
      canResume;
      blockedReason;
    };
  };

  // Confirm the caller's existing founding seat for a Nation. The creator's
  // Founding Authority #1 seat is recorded when the Nation is created; this
  // confirms that same seat instead of appointing the creator a second time.
  // Only the seat's own authority may confirm it, and only while the Nation
  // is in Founding Setup and the seat is still pending. Returns the
  // appointment id.
  public shared ({ caller }) func confirmFoundingSeat(
    nation : Sovereign.NationId,
    appointment : Nat,
  ) : async Sovereign.ConfirmFoundingSeatResult {
    let setup = switch (foundingSetups.get(nation)) {
      case (?s) { s };
      case null { return #err(#notInFoundingSetup) };
    };
    if (setup.status != #foundingSetup) { return #err(#notInFoundingSetup) };
    let a = switch (foundingAppointments.get(appointment)) {
      case (?a) { a };
      case null { return #err(#unknownConstitution) };
    };
    if (a.nation != nation) { return #err(#notAuthorized) };
    // Only the seat's own authority may confirm it.
    if (not Principal.equal(a.authority, caller)) { return #err(#notAuthorized) };
    // An invitation seat is accepted only through its token.
    if (GovernanceAudit.hasInvitationToken(a.invitationToken)) { return #err(#notAuthorized) };
    // Confirming an already-accepted seat is a no-op that reports the seat.
    if (a.status == #accepted) { return #ok(appointment) };
    if (a.status != #pending) { return #err(#notInFoundingSetup) };
    let now = Time.now();
    if (now >= a.expiresAt) {
      foundingAppointments.add(appointment, { a with status = #expired; timestamp = now });
      return #err(#setupExpired);
    };
    // The same principal can never hold two founding seats.
    let others = appointmentsForNation(nation).filter(func(o) = o.id != appointment);
    if (ConstitutionLib.holdsFoundingSeat(others, caller)) { return #err(#notAuthorized) };
    foundingAppointments.add(appointment, {
      a with status = #accepted; acceptedAt = ?now; timestamp = now;
    });
    let historyId = counters.nextGovernanceHistoryId;
    counters.nextGovernanceHistoryId += 1;
    governanceHistory.add(historyId, GovernanceAudit.newEntry(
      historyId,
      nation,
      #acceptance,
      caller,
      appointment,
      "Confirmed " # a.appointmentLabel,
      latestVersion(nation),
      now,
    ));
    ignore tryAutoActivate(nation, now);
    #ok(appointment);
  };

  // Read the launch status of one Nation the caller owns: the founding setup
  // state, the accepted authority count out of three, which seats the caller
  // holds, which seats await other people, whether the constitution is saved,
  // and a plain-language reason when the launch cannot continue.
  public query ({ caller }) func getLaunchStatus(nation : Sovereign.NationId) : async ?Sovereign.LaunchStatus {
    if (not isConstitutionNationOwner(caller, nation) and not isConstitutionAdmin(caller)) {
      return null;
    };
    ?launchStatusOf(nation, caller, Time.now());
  };

  // Resume a Nation's launch from its first unfinished step. Only the
  // Nation's recorded owner may resume. This never creates a duplicate Nation
  // and never re-runs a step already saved; it reports the current launch
  // status, or a plain-language error when the setup expired or was
  // cancelled.
  public shared ({ caller }) func resumeLaunch(nation : Sovereign.NationId) : async Sovereign.ResumeLaunchResult {
    if (not isConstitutionNationOwner(caller, nation) and not isConstitutionAdmin(caller)) {
      return #err(#notAuthorized);
    };
    if (not nations.containsKey(nation)) { return #err(#unknownNation) };
    let setup = switch (foundingSetups.get(nation)) {
      case (?s) { s };
      case null { return #err(#notInFoundingSetup) };
    };
    let now = Time.now();
    // An expired or cancelled setup cannot continue: report the plain-language
    // reason and what the creator can do next, without creating a duplicate.
    switch (setup.status) {
      case (#expired) { return #err(#setupExpiredRecoverable) };
      case (#cancelled) { return #err(#setupCancelledRecoverable) };
      case (_) {};
    };
    if (ConstitutionLib.isSetupExpired(setup, now)) { return #err(#setupExpiredRecoverable) };
    // Never re-runs a saved step: this only reports the current launch status,
    // which names the first unfinished step.
    #ok(launchStatusOf(nation, caller, now));
  };

};
