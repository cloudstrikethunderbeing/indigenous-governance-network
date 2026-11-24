import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import Sovereign "../types/sovereign";
import Census "../domains/census";

// SOVEREIGN OS — Participation Census public API.
//
// The Participation Census is a privacy-aware governance accountability
// record: who is eligible, who participates, what decisions are made and
// whether approved actions are executed. It is Nation-scoped and private by
// default; only a Nation's own authorized members may read its census.
//
// Privacy: a census entry marked confidential records that participation
// occurred without ever exposing how the individual voted — the stored
// summary of a confidential entry is redacted on every read. Historical
// entries are never deleted, and each entry carries the constitution version
// in force when the event occurred, so a past decision is always shown under
// the rules that applied at the time.
//
// The mixin receives the Nation workspace stable state and the shared id
// counters by reference. Nation-scoped isolation is enforced against each
// record's `nation` field.
mixin (
  accessControlState : AccessControl.AccessControlState,
  nations : Map.Map<Sovereign.NationId, Sovereign.Nation>,
  nationMembers : Map.Map<Sovereign.NationMemberId, Sovereign.NationMember>,
  nationOwners : Map.Map<Sovereign.NationId, Sovereign.NationOwnership>,
  censusEntries : Map.Map<Sovereign.CensusEntryId, Sovereign.CensusEntry>,
  counters : { var nextCensusEntryId : Nat },
) {
  // Whether the caller is a platform administrator.
  func isCensusAdmin(caller : Principal) : Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  // Whether the caller is the Nation's recorded creator/owner.
  func isCensusNationOwner(caller : Principal, nation : Sovereign.NationId) : Bool {
    switch (nationOwners.get(nation)) {
      case (?o) { Principal.equal(o.creator, caller) };
      case null { false };
    };
  };

  // Whether the caller is a member of one specific Nation: recorded in that
  // Nation's own member roster, its recorded owner, or a platform
  // administrator. This is per-Nation membership — a caller who is a member
  // of another Nation is not a member of this one.
  func isCensusNationMember(caller : Principal, nation : Sovereign.NationId) : Bool {
    if (isCensusAdmin(caller)) { return true };
    if (isCensusNationOwner(caller, nation)) { return true };
    nationMembers.values().any(func(m) =
      m.nation == nation and Principal.equal(m.member, caller)
    );
  };

  // Whether the caller may read a Nation's census: a member of that specific
  // Nation, an administrator, or any visitor for the built-in sample Nation.
  // A Nation's census is never readable by another Nation.
  func canReadCensus(caller : Principal, nation : Sovereign.NationId) : Bool {
    switch (nations.get(nation)) {
      case (null) { false };
      case (?n) {
        if (n.isSample) { return true };
        isCensusNationMember(caller, nation);
      };
    };
  };

  // Record one Participation Census entry for a Nation. Covers membership
  // approvals, activity, proposals, votes, delegations, permission changes,
  // disputes and execution outcomes. `constitutionVersion` is the version in
  // force when the event occurred, so the entry is always read under the
  // rules that applied at the time. `confidential` marks an entry whose
  // detail must never be exposed (for example a confidential vote).
  //
  // A real Nation requires a signed-in member; the built-in sample Nation is
  // open to any visitor, matching the other interactive sample workflows.
  // Each successful call creates a new record (not idempotent).
  public shared ({ caller }) func recordCensusEntry(
    nation : Sovereign.NationId,
    kind : Sovereign.CensusEventKind,
    subject : Principal,
    referenceId : Nat,
    summary : Text,
    confidential : Bool,
    constitutionVersion : Nat,
  ) : async Census.RecordCensusResult {
    let n = switch (nations.get(nation)) {
      case (?n) { n };
      case null { return #err(#unknownNation) };
    };
    if (not n.isSample and not isCensusNationMember(caller, nation)) {
      return #err(#notAuthorized);
    };
    switch (Census.validateSummary(summary)) {
      case (?e) { return #err(e) };
      case null {};
    };
    let id = counters.nextCensusEntryId;
    counters.nextCensusEntryId += 1;
    censusEntries.add(id, {
      id;
      nation;
      kind;
      subject;
      referenceId;
      summary;
      confidential;
      constitutionVersion;
      timestamp = Time.now();
    });
    #ok(id);
  };

  // List a Nation's Participation Census entries. Only a member of the Nation
  // (or an authorized administrator) may read them; any visitor may read the
  // sample Nation's. A confidential entry's stored summary is redacted, so
  // the individual's choice is never exposed. Historical entries are
  // preserved after membership or authority changes.
  public query ({ caller }) func listCensusEntries(nation : Sovereign.NationId) : async [Sovereign.CensusEntry] {
    if (not canReadCensus(caller, nation)) { return [] };
    censusEntries.values().toArray()
      .filter(func(e) = e.nation == nation)
      .map(Census.redactEntry);
  };

  // Read a Nation's Participation Census summary for the accountability
  // dashboard. Only a member of the Nation (or an authorized administrator)
  // may read it; any visitor may read the sample Nation's. Every figure is
  // exactly zero when the caller may not read the Nation.
  public query ({ caller }) func getCensusSummary(nation : Sovereign.NationId) : async Sovereign.CensusSummary {
    if (not canReadCensus(caller, nation)) {
      return {
        nation;
        eligibleMembers = 0;
        activeMembers = 0;
        proposals = 0;
        votes = 0;
        delegations = 0;
        disputes = 0;
        executions = 0;
      };
    };
    let entries = censusEntries.values().toArray().filter(func(e) = e.nation == nation);
    let eligible = nationMembers.values().toArray().filter(func(m) = m.nation == nation).size();
    Census.computeSummary(nation, entries, eligible);
  };
};
