import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Sovereign "../types/sovereign";

// ---------------------------------------------------------------------
// DAO Constitution & Governance — decisions, execution and appeals.
//
// Pure, deterministic helpers for the execution domain. Everything here is
// side-effect free; the public endpoints live in mixins/execution-api.mo.
//
// Core product principle (LESS IS MORE): passing a vote NEVER implies
// execution. A passed proposal creates a separate execution request that
// defaults to manual authorization and is never executed automatically by
// the passing vote. High-risk actions (treasury transfers, constitutional
// changes, authority changes and destructive actions) require additional
// authorization. There is no hidden platform administrator override.
// ---------------------------------------------------------------------
module {
  // The default timelock applied to an authorized high-risk execution
  // request, in nanoseconds (24 hours). A timelock delays execution so a
  // community can cancel a harmful action before it runs.
  public func defaultTimelockNanos() : Int {
    86_400_000_000_000;
  };

  // Whether a proposal classification is high-risk and therefore requires
  // additional, independent authorization before execution. Treasury
  // transfers, constitutional changes, authority changes and destructive
  // actions are high-risk.
  public func isHighRiskClassification(classification : Text) : Bool {
    let lower = classification.toLower();
    lower.contains(#text "treasury") or lower.contains(#text "constitution") or
      lower.contains(#text "amendment") or lower.contains(#text "authority") or
      lower.contains(#text "destructive") or lower.contains(#text "dissolution") or
      lower.contains(#text "emergency");
  };

  // The constitution version currently in force for a Nation, or 0 when the
  // Nation has no active constitution yet.
  public func activeConstitutionVersion(
    nation : Sovereign.NationId,
    constitutions : [Sovereign.Constitution],
  ) : Nat {
    switch (constitutions.find(func(c) = c.nation == nation and c.active)) {
      case (?c) { c.version };
      case null { 0 };
    };
  };

  // Whether an execution request may be authorized: it is still awaiting
  // authorization, and a high-risk request is not authorized by its own
  // requester (independent authorization).
  public func canAuthorize(request : Sovereign.ExecutionRequest, caller : Principal) : Bool {
    if (request.status != #pendingAuthorization) { return false };
    if (request.highRisk and Principal.equal(request.requestedBy, caller)) {
      return false;
    };
    true;
  };
};
