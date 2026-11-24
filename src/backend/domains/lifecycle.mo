import List "mo:core/List";
import Principal "mo:core/Principal";
import Sovereign "../types/sovereign";

// ---------------------------------------------------------------------
// DAO Lifecycle & Constitutional Continuity — pure lifecycle helpers.
//
// Everything here is deterministic and side-effect free: the seven
// backend-enforced lifecycle states, the permitted-action matrix for each
// state, the single guard every governance mutation consults, the
// derivation of a Nation's lifecycle state from its founding setup, and the
// constitutional thresholds for amendments, emergency suspension and
// dissolution.
//
// The constitution outlives its founders: no individual, founding
// authority, platform administrator or developer has unilateral control
// over an activated DAO. The stateful endpoints live in
// mixins/constitution-api.mo.
// ---------------------------------------------------------------------

module {
  // The seven lifecycle states, in display order.
  public func lifecycleStates() : [Sovereign.NationLifecycleState] {
    [
      #draft,
      #pendingActivation,
      #active,
      #restrictedGovernance,
      #temporarilySuspended,
      #pendingDissolution,
      #archived,
    ];
  };

  // A stable, human-readable key for a lifecycle state.
  public func stateKey(state : Sovereign.NationLifecycleState) : Text {
    switch (state) {
      case (#draft) { "draft" };
      case (#pendingActivation) { "pendingActivation" };
      case (#active) { "active" };
      case (#restrictedGovernance) { "restrictedGovernance" };
      case (#temporarilySuspended) { "temporarilySuspended" };
      case (#pendingDissolution) { "pendingDissolution" };
      case (#archived) { "archived" };
    };
  };

  // A plain-language explanation of what a lifecycle state means.
  public func stateExplanation(state : Sovereign.NationLifecycleState) : Text {
    switch (state) {
      case (#draft) {
        "The DAO has been created but has not begun founding setup. Only its creator may configure or cancel it.";
      };
      case (#pendingActivation) {
        "Founding authorities are being appointed and the constitution is being ratified. Voting, admitting members and amending the constitution are not yet available.";
      };
      case (#active) {
        "The DAO is fully activated and operating under its constitution.";
      };
      case (#restrictedGovernance) {
        "Normal governance quorum cannot be reached. Only the constitutionally authorized recovery procedures are open.";
      };
      case (#temporarilySuspended) {
        "Operations are temporarily suspended by an authorized emergency action. The suspension is temporary, auditable and narrowly scoped.";
      };
      case (#pendingDissolution) {
        "A dissolution proposal is in progress: cooling-off, obligations review and the constitutional vote.";
      };
      case (#archived) {
        "The DAO is closed. Operational governance is disabled; authorized historical records remain readable.";
      };
    };
  };

  // ---------------------------------------------------------------------
  // Permitted actions
  //
  // Every governance mutation names the action it performs; the single guard
  // `actionAllowed` decides whether the Nation's current lifecycle state
  // permits it. Reads of history and records are never blocked by the
  // lifecycle state.
  // ---------------------------------------------------------------------

  public type LifecycleAction = {
    // Cast a vote on a proposal or decision.
    #vote;
    // Admit a member (approve a join request or accept an invitation).
    #admitMember;
    // Amend the constitution.
    #amendConstitution;
    // Create or edit a governance proposal.
    #propose;
    // Record a member departure.
    #recordDeparture;
    // Invoke an emergency suspension.
    #emergencySuspend;
    // Propose dissolution.
    #proposeDissolution;
    // Replace or appoint an authority.
    #changeAuthority;
    // Invoke a constitutional recovery procedure.
    #recover;
    // Read historical records and the constitution.
    #readHistory;
  };

  // Whether a lifecycle state permits an action. This is the single guard
  // every governance mutation consults before it runs.
  public func actionAllowed(state : Sovereign.NationLifecycleState, action : LifecycleAction) : Bool {
    switch (action) {
      // Reads of history and records are always allowed, in every state.
      case (#readHistory) { true };
      case (#vote) {
        switch (state) {
          case (#active) { true };
          case (#restrictedGovernance) { true };
          case (_) { false };
        };
      };
      case (#admitMember) {
        switch (state) {
          case (#active) { true };
          case (_) { false };
        };
      };
      case (#amendConstitution) {
        switch (state) {
          case (#active) { true };
          case (_) { false };
        };
      };
      case (#propose) {
        switch (state) {
          case (#active) { true };
          case (#restrictedGovernance) { true };
          case (_) { false };
        };
      };
      case (#recordDeparture) {
        switch (state) {
          case (#active) { true };
          case (#restrictedGovernance) { true };
          case (_) { false };
        };
      };
      case (#emergencySuspend) {
        switch (state) {
          case (#active) { true };
          case (#restrictedGovernance) { true };
          case (_) { false };
        };
      };
      case (#proposeDissolution) {
        switch (state) {
          case (#active) { true };
          case (_) { false };
        };
      };
      case (#changeAuthority) {
        switch (state) {
          case (#active) { true };
          case (#restrictedGovernance) { true };
          case (_) { false };
        };
      };
      case (#recover) {
        switch (state) {
          case (#restrictedGovernance) { true };
          case (#active) { true };
          case (_) { false };
        };
      };
    };
  };

  // The precise error a disallowed action returns, or null when the action
  // is permitted. An archived Nation blocks operational governance while
  // still allowing authorized reads of history and records.
  public func actionError(state : Sovereign.NationLifecycleState, action : LifecycleAction) : ?Sovereign.LifecycleError {
    if (actionAllowed(state, action)) { return null };
    switch (state) {
      case (#archived) { ?#alreadyArchived };
      case (_) { ?#invalidLifecycleTransition };
    };
  };

  // ---------------------------------------------------------------------
  // Derivation from the founding setup
  //
  // A Nation's lifecycle state is derived from its current founding setup so
  // an existing Nation's constitution and activation state are never changed
  // by this layer. A stored lifecycle record may override the derived state
  // only for the states this layer itself enters (restricted governance,
  // temporary suspension, pending dissolution, archived).
  // ---------------------------------------------------------------------

  public func deriveLifecycleState(setup : ?Sovereign.FoundingSetup) : Sovereign.NationLifecycleState {
    switch (setup) {
      case (null) { #draft };
      case (?s) {
        switch (s.status) {
          case (#foundingSetup) { #pendingActivation };
          case (#activated) { #active };
          case (#expired) { #draft };
          case (#cancelled) { #draft };
        };
      };
    };
  };

  // Whether a stored lifecycle state is one this layer entered itself, and
  // therefore takes precedence over the state derived from the founding
  // setup.
  public func isOverridingState(state : Sovereign.NationLifecycleState) : Bool {
    switch (state) {
      case (#restrictedGovernance) { true };
      case (#temporarilySuspended) { true };
      case (#pendingDissolution) { true };
      case (#archived) { true };
      case (_) { false };
    };
  };

  // The effective lifecycle state for a Nation: the stored overriding state
  // when one is in force, otherwise the state derived from the founding
  // setup.
  public func effectiveState(
    stored : ?Sovereign.NationLifecycle,
    setup : ?Sovereign.FoundingSetup,
  ) : Sovereign.NationLifecycleState {
    switch (stored) {
      case (?l) {
        if (isOverridingState(l.state)) { l.state } else { deriveLifecycleState(setup) };
      };
      case (null) { deriveLifecycleState(setup) };
    };
  };

  // ---------------------------------------------------------------------
  // Constitutional thresholds
  // ---------------------------------------------------------------------

  // The default constitutional amendment approval threshold (75%).
  public func defaultAmendmentThresholdPercent() : Nat {
    75;
  };

  // The default dissolution approval threshold (90%).
  public func defaultDissolutionThresholdPercent() : Nat {
    90;
  };

  // The default emergency suspension approval count (two of three).
  public func defaultEmergencyApprovals() : Nat {
    2;
  };

  // The number of distinct authorities required to approve an emergency
  // suspension: two of three authorized authorities.
  public func requiredEmergencyApprovals(authorityCount : Nat) : Nat {
    if (authorityCount >= 3) { defaultEmergencyApprovals() } else { authorityCount };
  };

  // Whether a tally meets a whole-percentage approval threshold. The
  // denominator excludes abstentions; a zero denominator never approves.
  public func approvalThresholdMet(inFavor : Nat, against : Nat, thresholdPercent : Nat) : Bool {
    let decided = inFavor + against;
    if (decided == 0) { return false };
    inFavor * 100 >= decided * thresholdPercent;
  };

  // Whether a tally meets a whole-percentage quorum of the eligible voters.
  public func quorumMet(cast : Nat, eligible : Nat, quorumPercent : Nat) : Bool {
    if (eligible == 0) { return false };
    cast * 100 >= eligible * quorumPercent;
  };

  // ---------------------------------------------------------------------
  // Founding ratification
  //
  // Activation requires three distinct accepted founding authorities, the
  // same constitution version ratified by all three, and a ratified
  // succession and recovery plan.
  // ---------------------------------------------------------------------

  // The distinct principals that ratified a constitution version.
  public func ratifiedAuthorities(ratifications : [Sovereign.PlanRatification]) : [Principal] {
    let acc = List.empty<Principal>();
    for (r in ratifications.values()) {
      if (not acc.any(func(p) = Principal.equal(p, r.authority))) {
        acc.add(r.authority);
      };
    };
    acc.toArray();
  };

  // Whether every accepted founding authority has ratified the constitution
  // version and the succession and recovery plan.
  public func allFoundingAuthoritiesRatified(
    acceptedAuthorities : [Principal],
    constitutionRatifications : [Sovereign.PlanRatification],
    planRatifications : [Sovereign.PlanRatification],
  ) : Bool {
    if (acceptedAuthorities.size() == 0) { return false };
    let constitutionRatifiers = ratifiedAuthorities(constitutionRatifications);
    let planRatifiers = ratifiedAuthorities(planRatifications);
    acceptedAuthorities.all(func(a) =
      constitutionRatifiers.any(func(p) = Principal.equal(p, a)) and
      planRatifiers.any(func(p) = Principal.equal(p, a))
    );
  };

  // The outstanding activation requirements, as plain-language labels, so
  // the interface can show what is still needed.
  public func outstandingRequirements(
    acceptedCount : Nat,
    requiredCount : Nat,
    hasConfirmedConstitution : Bool,
    constitutionRatifiedByAll : Bool,
    planRatified : Bool,
  ) : [Text] {
    let acc = List.empty<Text>();
    if (acceptedCount < requiredCount) {
      acc.add("Founding authorities accepted: " # acceptedCount.toText() # "/" # requiredCount.toText());
    };
    if (not hasConfirmedConstitution) {
      acc.add("A confirmed constitution is required.");
    };
    if (not constitutionRatifiedByAll) {
      acc.add("Every founding authority must ratify the same constitution version.");
    };
    if (not planRatified) {
      acc.add("The succession and recovery plan must be ratified by every founding authority.");
    };
    acc.toArray();
  };

  // Whether a principal already appears in a list of principals.
  public func containsPrincipal(list : [Principal], p : Principal) : Bool {
    list.any(func(x) = Principal.equal(x, p));
  };
};
