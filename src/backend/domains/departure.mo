import List "mo:core/List";
import Principal "mo:core/Principal";
import Sovereign "../types/sovereign";


// ---------------------------------------------------------------------
// DAO Lifecycle & Constitutional Continuity — Member departure and
// emergency governance pure helpers.
//
// Everything here is deterministic and side-effect free: the departure
// vocabulary, the notice/review/appeal state machine, the emergency
// suspension approval rule and the emergency scope guard. The stateful
// endpoints live in mixins/departure-api.mo.
//
// Two constitutional principles are encoded here:
//
//   1. A departure is never final on a single report. An involuntary
//      departure (suspension or constitutional removal) must pass through
//      notice, review and an appeal path before it becomes effective.
//      A voluntary departure or retirement is the member's own act and may
//      become effective immediately.
//
//   2. Emergency powers are temporary, auditable and narrowly scoped. They
//      can never amend the constitution, seize assets, permanently remove
//      authorities or dissolve the Nation.
// ---------------------------------------------------------------------

module {
  // The default number of distinct authorized authorities required to
  // approve an emergency suspension: two of three.
  public func defaultEmergencyApprovalThreshold() : Nat {
    2;
  };

  // The default emergency suspension window, in nanoseconds (72 hours). An
  // emergency suspension is temporary: it expires unless restored or
  // re-authorized.
  public func defaultEmergencyWindowNanos() : Nat {
    72 * 60 * 60 * 1_000_000_000;
  };

  // The default review window for an involuntary departure, in nanoseconds
  // (7 days). The member has this long to appeal before the departure
  // becomes final.
  public func defaultReviewWindowNanos() : Nat {
    7 * 24 * 60 * 60 * 1_000_000_000;
  };

  // Whether a departure kind is the member's own voluntary act. A voluntary
  // departure or retirement may become effective immediately; a suspension
  // or constitutional removal may not.
  public func isVoluntary(kind : Sovereign.DepartureKind) : Bool {
    switch (kind) {
      case (#voluntaryDeparture) { true };
      case (#retirement) { true };
      case (#suspension) { false };
      case (#constitutionalRemoval) { false };
    };
  };

  // Whether a departure kind is involuntary and therefore requires the
  // notice -> review -> appeal path before it becomes effective.
  public func requiresReview(kind : Sovereign.DepartureKind) : Bool {
    not isVoluntary(kind);
  };

  // Whether a departure is still open (notice or under review) and may still
  // be reviewed, appealed or withdrawn.
  public func isOpen(status : Sovereign.DepartureStatus) : Bool {
    switch (status) {
      case (#notice) { true };
      case (#underReview) { true };
      case (#appealed) { true };
      case (_) { false };
    };
  };

  // Whether a departure has become effective: operational permissions are
  // revoked and the member may no longer act administratively.
  public func isEffective(status : Sovereign.DepartureStatus) : Bool {
    switch (status) {
      case (#effective) { true };
      case (_) { false };
    };
  };

  // The next status after a review step. A reviewed involuntary departure
  // moves to `#underReview`; the caller decides whether to make it effective
  // or leave it open for appeal.
  public func reviewedStatus() : Sovereign.DepartureStatus {
    #underReview;
  };

  // Whether a principal is recorded in a list of principals.
  public func containsPrincipal(list : [Principal], p : Principal) : Bool {
    list.any(func(existing) = Principal.equal(existing, p));
  };

  // The number of distinct principals in a list.
  public func distinctCount(list : [Principal]) : Nat {
    let acc = List.empty<Principal>();
    for (p in list.values()) {
      if (not containsPrincipal(acc.toArray(), p)) { acc.add(p) };
    };
    acc.size();
  };

  // Whether the collected approvals satisfy the required threshold. Each
  // authority counts once; the threshold is never silently reduced.
  public func approvalsSatisfied(required : Nat, approvals : [Principal]) : Bool {
    distinctCount(approvals) >= required;
  };

  // Whether an emergency action's scope is permitted. Emergency powers are
  // narrowly scoped: they may suspend accounts or functions, but they may
  // never amend the constitution, seize assets, permanently remove
  // authorities or dissolve the Nation. The forbidden function labels are
  // matched case-insensitively against the requested affected functions.
  public func isEmergencyScopePermitted(affectedFunctions : [Text]) : Bool {
    let forbidden = [
      "amendConstitution",
      "amend",
      "seizeAssets",
      "seize",
      "removeAuthority",
      "removeAuthorities",
      "dissolve",
      "dissolution",
      "archive",
    ];
    not affectedFunctions.any(func(f) =
      forbidden.any(func(bad) = f.toLower() == bad.toLower())
    );
  };

  // The plain-language notice recorded for a departure. The notice names the
  // kind and the member's right to appeal an involuntary departure.
  public func departureNotice(kind : Sovereign.DepartureKind, member : Principal) : Text {
    let kindLabel = switch (kind) {
      case (#voluntaryDeparture) { "voluntary departure" };
      case (#retirement) { "retirement" };
      case (#suspension) { "suspension" };
      case (#constitutionalRemoval) { "constitutional removal" };
    };
    let appealNote = if (requiresReview(kind)) {
      " You may appeal this decision before it becomes final."
    } else {
      ""
    };
    "Recorded " # kindLabel # " for " # member.toText() # "." # appealNote;
  };

  // The plain-language summary recorded in the governance history for a
  // departure event.
  public func departureHistorySummary(kind : Sovereign.DepartureKind, status : Sovereign.DepartureStatus) : Text {
    let kindLabel = switch (kind) {
      case (#voluntaryDeparture) { "Voluntary departure" };
      case (#retirement) { "Retirement" };
      case (#suspension) { "Suspension" };
      case (#constitutionalRemoval) { "Constitutional removal" };
    };
    let statusLabel = switch (status) {
      case (#notice) { "notice recorded" };
      case (#underReview) { "under review" };
      case (#effective) { "effective; permissions revoked" };
      case (#appealed) { "appealed" };
      case (#withdrawn) { "withdrawn" };
    };
    kindLabel # " " # statusLabel;
  };

  // The plain-language summary recorded in the governance history for an
  // emergency suspension event.
  public func emergencyHistorySummary(action : Text) : Text {
    "Emergency suspension " # action;
  };
};
