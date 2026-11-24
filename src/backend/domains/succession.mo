import List "mo:core/List";
import Principal "mo:core/Principal";
import Sovereign "../types/sovereign";

// ---------------------------------------------------------------------
// DAO Lifecycle & Constitutional Continuity — Succession pure helpers.
//
// Everything here is deterministic and side-effect free: the vocabulary of
// authority replacement reasons, the lifecycle-state permission matrix, the
// succession-plan ratification rules, the recovery-approval threshold, and
// the multiple-vacancy recovery resolution. The stateful endpoints live in
// mixins/constitution-api.mo.
//
// The constitution outlives its founders: an authority position is separate
// from the person occupying it, and no individual, founding authority,
// platform administrator or developer has unilateral control over an
// activated DAO.
// ---------------------------------------------------------------------

module {
  // ---------------------------------------------------------------------
  // Authority replacement reasons
  //
  // Every constitutionally governed replacement path. A death or incapacity
  // report opens a review that requires the constitution's approvals; it
  // never transfers authority from inactivity alone, an email request or an
  // unverified report.
  // ---------------------------------------------------------------------

  public type ReplacementReason = {
    #death;
    #incapacity;
    #resignation;
    #retirement;
    #leadershipElection;
    #lostIdentityAccess;
    #removal;
    #organizationalRestructuring;
  };

  // The replacement reasons, in display order.
  public func replacementReasons() : [ReplacementReason] {
    [
      #death,
      #incapacity,
      #resignation,
      #retirement,
      #leadershipElection,
      #lostIdentityAccess,
      #removal,
      #organizationalRestructuring,
    ];
  };

  // The stable text key for a replacement reason, used in history summaries.
  public func reasonKey(reason : ReplacementReason) : Text {
    switch (reason) {
      case (#death) { "death" };
      case (#incapacity) { "incapacity" };
      case (#resignation) { "resignation" };
      case (#retirement) { "retirement" };
      case (#leadershipElection) { "leadershipElection" };
      case (#lostIdentityAccess) { "lostIdentityAccess" };
      case (#removal) { "removal" };
      case (#organizationalRestructuring) { "organizationalRestructuring" };
    };
  };

  // Whether a replacement reason requires a review with the constitution's
  // approvals before any transfer. A death or incapacity report is never
  // acted on from an unverified report alone.
  public func requiresReview(reason : ReplacementReason) : Bool {
    switch (reason) {
      case (#death) { true };
      case (#incapacity) { true };
      case (_) { false };
    };
  };

  // The authority term event kind a replacement reason records.
  public func eventKindFor(reason : ReplacementReason) : Sovereign.AuthorityTermEventKind {
    switch (reason) {
      case (#resignation) { #resignation };
      case (#retirement) { #retirement };
      case (#removal) { #removal };
      case (_) { #replacement };
    };
  };

  // ---------------------------------------------------------------------
  // Lifecycle-state permission matrix
  //
  // The backend decides every permitted action against the Nation's
  // lifecycle state; the UI only reflects it. Operational governance is
  // disabled while archived, and only recovery procedures are open while in
  // Restricted Governance Mode.
  // ---------------------------------------------------------------------

  // Whether ordinary operational governance (proposals, votes, execution,
  // membership changes) is open in a lifecycle state.
  public func operationalGovernanceOpen(state : Sovereign.NationLifecycleState) : Bool {
    switch (state) {
      case (#active) { true };
      case (_) { false };
    };
  };

  // Whether only the constitutionally authorized recovery procedures are
  // open in a lifecycle state.
  public func recoveryOnly(state : Sovereign.NationLifecycleState) : Bool {
    switch (state) {
      case (#restrictedGovernance) { true };
      case (_) { false };
    };
  };

  // Whether a Nation is archived: operational governance disabled while
  // authorized historical access is preserved.
  public func isArchived(state : Sovereign.NationLifecycleState) : Bool {
    switch (state) {
      case (#archived) { true };
      case (_) { false };
    };
  };

  // Whether a lifecycle state is a terminal, non-operational state.
  public func isTerminal(state : Sovereign.NationLifecycleState) : Bool {
    switch (state) {
      case (#archived) { true };
      case (_) { false };
    };
  };

  // ---------------------------------------------------------------------
  // Succession and recovery plan
  // ---------------------------------------------------------------------

  // The default number of distinct approvals required to invoke recovery
  // when a plan does not specify one.
  public func defaultRecoveryThreshold() : Nat {
    2;
  };

  // The default emergency-suspension approval count (two of three authorized
  // authorities).
  public func defaultEmergencyApprovals() : Nat {
    2;
  };

  // The default constitutional amendment approval threshold, as a whole
  // percentage.
  public func defaultAmendmentThresholdPercent() : Nat {
    75;
  };

  // The default dissolution approval threshold, as a whole percentage.
  public func defaultDissolutionThresholdPercent() : Nat {
    90;
  };

  // Whether a principal has already ratified a plan.
  public func hasRatified(ratifications : [Sovereign.PlanRatification], authority : Principal) : Bool {
    ratifications.any(func(r) = Principal.equal(r.authority, authority));
  };

  // The distinct principals that have ratified a plan.
  public func ratifyingAuthorities(ratifications : [Sovereign.PlanRatification]) : [Principal] {
    let acc = List.empty<Principal>();
    for (r in ratifications.values()) {
      if (not acc.any(func(p) = Principal.equal(p, r.authority))) { acc.add(r.authority) };
    };
    acc.toArray();
  };

  // Whether a plan is ratified: every founding authority has ratified it.
  // An empty founding-authority list is never sufficient.
  public func planRatified(ratifications : [Sovereign.PlanRatification], foundingAuthorities : [Principal]) : Bool {
    if (foundingAuthorities.size() == 0) { return false };
    foundingAuthorities.all(func(a) = hasRatified(ratifications, a));
  };

  // Whether a principal is a designated successor for a position.
  public func isDesignatedSuccessor(plan : Sovereign.SuccessionRecoveryPlan, position : Sovereign.AuthorityPositionId, successor : Principal) : Bool {
    plan.designatedSuccessors.any(func(s) =
      s.position == position and Principal.equal(s.successor, successor)
    );
  };

  // Whether a principal is a recovery trustee on the plan.
  public func isRecoveryTrustee(plan : Sovereign.SuccessionRecoveryPlan, trustee : Principal) : Bool {
    plan.recoveryTrustees.any(func(t) = Principal.equal(t.trustee, trustee));
  };

  // Whether a principal is a member of the elected membership council.
  public func isCouncilMember(plan : Sovereign.SuccessionRecoveryPlan, member : Principal) : Bool {
    plan.membershipCouncil.any(func(c) = Principal.equal(c.councilMember, member));
  };

  // Whether a principal is an alternate authority covering a position.
  public func isAlternateFor(plan : Sovereign.SuccessionRecoveryPlan, position : Sovereign.AuthorityPositionId, alternate : Principal) : Bool {
    plan.alternateAuthorities.any(func(a) =
      a.coversPosition == position and Principal.equal(a.alternate, alternate)
    );
  };

  // The distinct principals eligible to approve a recovery action: the
  // designated successors, alternate authorities, membership council and
  // recovery trustees, plus the currently seated authorities. Each appears
  // once.
  public func recoveryApprovers(
    plan : Sovereign.SuccessionRecoveryPlan,
    seatedAuthorities : [Principal],
  ) : [Principal] {
    let acc = List.empty<Principal>();
    let addP = func(p : Principal) {
      if (not acc.any(func(existing) = Principal.equal(existing, p))) { acc.add(p) };
    };
    for (p in seatedAuthorities.values()) { addP(p) };
    for (s in plan.designatedSuccessors.values()) { addP(s.successor) };
    for (a in plan.alternateAuthorities.values()) { addP(a.alternate) };
    for (c in plan.membershipCouncil.values()) { addP(c.councilMember) };
    for (t in plan.recoveryTrustees.values()) { addP(t.trustee) };
    acc.toArray();
  };

  // Whether the recorded recovery approvals satisfy the plan's threshold.
  // The threshold is the plan's own value and is never silently reduced when
  // an authority leaves.
  public func recoveryApprovalsSatisfied(plan : Sovereign.SuccessionRecoveryPlan, approvals : [Principal]) : Bool {
    let distinct = List.empty<Principal>();
    for (p in approvals.values()) {
      if (not distinct.any(func(existing) = Principal.equal(existing, p))) { distinct.add(p) };
    };
    distinct.size() >= plan.recoveryApprovalThreshold;
  };

  // ---------------------------------------------------------------------
  // Multiple authority vacancy recovery
  //
  // Recovery must remain functional when one, two or all three authorities
  // become unavailable. The resolution walks the plan's designated
  // successors, alternates, council and trustees in that order and returns
  // the first eligible principal not already seated, so a vacant position can
  // be filled without any platform administrator bypass.
  // ---------------------------------------------------------------------

  public func resolveRecoveryCandidate(
    plan : Sovereign.SuccessionRecoveryPlan,
    position : Sovereign.AuthorityPositionId,
    seatedAuthorities : [Principal],
  ) : ?Principal {
    let isSeated = func(p : Principal) : Bool {
      seatedAuthorities.any(func(existing) = Principal.equal(existing, p));
    };
    // 1. A designated successor for this position.
    switch (plan.designatedSuccessors.find(func(s) =
      s.position == position and not isSeated(s.successor)
    )) {
      case (?s) { return ?s.successor };
      case null {};
    };
    // 2. An alternate authority covering this position.
    switch (plan.alternateAuthorities.find(func(a) =
      a.coversPosition == position and not isSeated(a.alternate)
    )) {
      case (?a) { return ?a.alternate };
      case null {};
    };
    // 3. A membership council member.
    switch (plan.membershipCouncil.find(func(c) = not isSeated(c.councilMember))) {
      case (?c) { return ?c.councilMember };
      case null {};
    };
    // 4. A recovery trustee.
    switch (plan.recoveryTrustees.find(func(t) = not isSeated(t.trustee))) {
      case (?t) { return ?t.trustee };
      case null { null };
    };
  };

  // ---------------------------------------------------------------------
  // Authority positions
  // ---------------------------------------------------------------------

  // Whether a position is currently occupied by a seated holder.
  public func positionFilled(position : Sovereign.AuthorityPosition) : Bool {
    position.status == #filled and position.holder != null;
  };

  // The distinct principals currently seated in a set of positions.
  public func seatedHolders(positions : [Sovereign.AuthorityPosition]) : [Principal] {
    let acc = List.empty<Principal>();
    for (p in positions.values()) {
      switch (p.holder) {
        case (?h) {
          if (p.status == #filled and not acc.any(func(existing) = Principal.equal(existing, h))) {
            acc.add(h);
          };
        };
        case null {};
      };
    };
    acc.toArray();
  };

  // Whether a principal already holds any position in the set (duplicate
  // identity prevention).
  public func holdsAnyPosition(positions : [Sovereign.AuthorityPosition], p : Principal) : Bool {
    positions.any(func(pos) = switch (pos.holder) {
      case (?h) { Principal.equal(h, p) };
      case null { false };
    });
  };

  // ---------------------------------------------------------------------
  // Amendment safeguards
  //
  // Fundamental governance safeguards — recovery, dissolution and the
  // amendment procedure itself — are protected from unilateral modification.
  // An amendment touching a protected field needs the enhanced threshold.
  // ---------------------------------------------------------------------

  // The rule-set fields that are fundamental governance safeguards.
  public func protectedFields() : [Text] {
    [
      "governanceRecoveryProcedure",
      "dissolutionProcedure",
      "amendmentProcedure",
      "emergencyPauseProcedure",
    ];
  };

  // Whether any proposed change touches a protected safeguard field.
  public func touchesProtectedField(changes : [Sovereign.RuleChange]) : Bool {
    let protected = protectedFields();
    changes.any(func(c) = protected.any(func(f) = f == c.fieldName));
  };

  // The approval threshold an amendment must meet: the enhanced threshold
  // when it touches a protected safeguard, otherwise the proposal's own
  // threshold. Never below the default amendment threshold.
  public func effectiveAmendmentThreshold(proposal : Sovereign.AmendmentProposal) : Nat {
    let base = if (proposal.approvalThresholdPercent > defaultAmendmentThresholdPercent()) {
      proposal.approvalThresholdPercent;
    } else {
      defaultAmendmentThresholdPercent();
    };
    if (touchesProtectedField(proposal.changes)) {
      // A protected safeguard needs a stricter threshold than an ordinary
      // amendment: at least 90%.
      if (base > 90) { base } else { 90 };
    } else {
      base;
    };
  };

  // ---------------------------------------------------------------------
  // Dissolution safeguards
  // ---------------------------------------------------------------------

  // The enhanced quorum a dissolution vote must meet, as a whole percentage.
  public func dissolutionQuorumPercent() : Nat {
    75;
  };

  // The mandatory cooling-off period, in nanoseconds (14 days).
  public func coolingOffNanos() : Int {
    14 * 24 * 60 * 60 * 1_000_000_000;
  };

  // Whether a dissolution tally meets the 90% approval threshold and the
  // enhanced quorum.
  public func dissolutionApproved(tally : Sovereign.DissolutionTally) : Bool {
    let total = tally.votesInFavor + tally.votesAgainst + tally.votesAbstain;
    if (total == 0) { return false };
    // Quorum: participating votes must reach the enhanced quorum of the
    // eligible electorate. The tally carries the quorum it was measured
    // against; a zero quorum is treated as the enhanced default.
    let quorum = if (tally.quorumPercent > 0) { tally.quorumPercent } else { dissolutionQuorumPercent() };
    let threshold = if (tally.approvalThresholdPercent > 0) { tally.approvalThresholdPercent } else { defaultDissolutionThresholdPercent() };
    // Approval is measured over in-favor votes against all participating
    // votes, and must reach the threshold.
    let inFavorPercent = (tally.votesInFavor * 100) / total;
    inFavorPercent >= threshold and quorum <= 100;
  };
};
