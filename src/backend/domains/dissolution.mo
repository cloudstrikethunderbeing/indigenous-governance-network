import List "mo:core/List";
import Principal "mo:core/Principal";
import Sovereign "../types/sovereign";

// ---------------------------------------------------------------------
// DAO Lifecycle — Dissolution pure helpers.
//
// Everything here is deterministic and side-effect free: the default
// dissolution thresholds, the cooling-off window, the tally arithmetic and
// the lifecycle-state predicates the dissolution workflow is decided
// against. The stateful endpoints live in mixins/dissolution-api.mo.
//
// A dissolution is a constitutionally governed closure of the digital
// Nation workspace. Actual asset settlement and legal dissolution remain
// outside the simulated functionality: archiving closes the workspace and
// preserves authorized historical access; it never implies the dissolution
// of a Nation, the extinguishment of Indigenous rights or the surrender of
// sovereignty.
// ---------------------------------------------------------------------

module {
  // The default approval threshold for a dissolution, as a whole percentage.
  // Subject to the enhanced quorum below.
  public func defaultApprovalThresholdPercent() : Nat {
    90;
  };

  // The default enhanced quorum for a dissolution, as a whole percentage.
  // Higher than an ordinary decision's quorum because closure is the most
  // consequential action a Nation can take.
  public func defaultQuorumPercent() : Nat {
    75;
  };

  // The mandatory cooling-off window, in nanoseconds (14 days). Final
  // confirmation is rejected until this window has elapsed.
  public func coolingOffWindowNanos() : Int {
    14 * 24 * 60 * 60 * 1_000_000_000;
  };

  // The default tally for a new dissolution proposal: no votes yet, with the
  // default enhanced quorum and 90% approval threshold.
  public func defaultTally() : Sovereign.DissolutionTally {
    {
      votesInFavor = 0;
      votesAgainst = 0;
      votesAbstain = 0;
      quorumPercent = defaultQuorumPercent();
      approvalThresholdPercent = defaultApprovalThresholdPercent();
    };
  };

  // The total votes cast in a tally (in favour, against and abstaining).
  public func totalVotes(tally : Sovereign.DissolutionTally) : Nat {
    tally.votesInFavor + tally.votesAgainst + tally.votesAbstain;
  };

  // Whether the enhanced quorum is met: the votes cast are at least the
  // quorum percentage of the eligible voter count, rounded up.
  public func quorumMet(tally : Sovereign.DissolutionTally, eligibleVoters : Nat) : Bool {
    let scaled = eligibleVoters * tally.quorumPercent;
    let required = (scaled + 99) / 100;
    totalVotes(tally) >= required;
  };

  // Whether the approval threshold is met: the in-favour votes are at least
  // the approval percentage of the votes cast, rounded up. Abstentions are
  // counted in the denominator, so they can never help a dissolution pass.
  public func approvalMet(tally : Sovereign.DissolutionTally) : Bool {
    let cast = totalVotes(tally);
    if (cast == 0) { return false };
    let scaled = cast * tally.approvalThresholdPercent;
    let required = (scaled + 99) / 100;
    tally.votesInFavor >= required;
  };

  // Whether a dissolution proposal has passed: both the enhanced quorum and
  // the approval threshold are met.
  public func passed(tally : Sovereign.DissolutionTally, eligibleVoters : Nat) : Bool {
    quorumMet(tally, eligibleVoters) and approvalMet(tally);
  };

  // Whether the cooling-off period has elapsed at `now`.
  public func coolingOffElapsed(dissolution : Sovereign.Dissolution, now : Sovereign.Timestamp) : Bool {
    now >= dissolution.coolingOffEnd;
  };

  // Whether the dissolution is in a terminal state (archived, rejected or
  // withdrawn) and so can no longer progress.
  public func isTerminal(status : Sovereign.DissolutionStatus) : Bool {
    switch (status) {
      case (#archived) { true };
      case (#rejected) { true };
      case (#withdrawn) { true };
      case (_) { false };
    };
  };

  // Whether a lifecycle state permits operational governance. An archived
  // Nation has operational governance disabled while authorized historical
  // access is preserved.
  public func operationalGovernanceEnabled(state : Sovereign.NationLifecycleState) : Bool {
    switch (state) {
      case (#archived) { false };
      case (_) { true };
    };
  };

  // Whether a lifecycle state is an activated, operating Nation that may
  // begin a dissolution. A draft or pending-activation Nation is not
  // dissolved through this workflow; an unactivated draft is cancelled by
  // its creator instead.
  public func canBeginDissolution(state : Sovereign.NationLifecycleState) : Bool {
    switch (state) {
      case (#active) { true };
      case (#restrictedGovernance) { true };
      case (#temporarilySuspended) { true };
      case (_) { false };
    };
  };

  // Whether a lifecycle state is an unactivated draft that its authorized
  // creator may cancel.
  public func isUnactivatedDraft(state : Sovereign.NationLifecycleState) : Bool {
    switch (state) {
      case (#draft) { true };
      case (#pendingActivation) { true };
      case (_) { false };
    };
  };

  // The distinct principals in a list, preserving first-seen order.
  public func distinct(principals : [Principal]) : [Principal] {
    let acc = List.empty<Principal>();
    for (p in principals.values()) {
      if (not acc.any(func(existing) = Principal.equal(existing, p))) { acc.add(p) };
    };
    acc.toArray();
  };
};
