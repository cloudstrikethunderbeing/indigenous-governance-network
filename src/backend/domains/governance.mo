import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";

// ---------------------------------------------------------------------
// DAO governance domain: proposal creation, public listing with a live
// vote tally, one-member-one-vote casting, vote delegation, and
// admin-only proposal closing. Voting power is a simple one-member-
// one-vote count — there is no real token-weighted voting live in this
// build.
// ---------------------------------------------------------------------

mixin (
  accessControlState : AccessControl.AccessControlState,
  proposals : Map.Map<Common.ProposalId, Common.Proposal>,
  votes : Map.Map<Common.ProposalId, Map.Map<Principal, Common.Vote>>,
  delegations : Map.Map<Principal, Common.VoteDelegation>,
  counters : {
    var nextSrcTransactionId : Nat;
    var nextContributionId : Nat;
    var nextAssignmentId : Nat;
    var nextTreasuryTransactionId : Nat;
    var nextProposalId : Nat;
    var nextStakingId : Nat;
  },
) {
  type ProposalTally = {
    inFavor : Nat;
    against : Nat;
    abstain : Nat;
  };

  type ProposalView = {
    id : Common.ProposalId;
    title : Text;
    description : Text;
    category : Common.ProposalCategory;
    proposer : Principal;
    status : Common.ProposalStatus;
    openTimestamp : Common.Timestamp;
    closeTimestamp : ?Common.Timestamp;
    tally : ProposalTally;
  };

  // Live tally for a proposal: every explicit vote counts once. A member
  // who has an active delegation and has NOT cast their own vote on this
  // proposal inherits their delegate's choice (single-level delegation —
  // no delegation chains). Each distinct member still contributes at
  // most one vote, so this stays a one-member-one-vote count.
  func computeTally(proposalId : Common.ProposalId) : ProposalTally {
    var inFavor = 0;
    var against = 0;
    var abstain = 0;
    let countChoice = func(choice : Common.VoteChoice) {
      switch (choice) {
        case (#inFavor) { inFavor += 1 };
        case (#against) { against += 1 };
        case (#abstain) { abstain += 1 };
      };
    };
    switch (votes.get(proposalId)) {
      case (?voterMap) {
        for ((_voter, vote) in voterMap.entries()) {
          countChoice(vote.choice);
        };
        for ((delegator, delegation) in delegations.entries()) {
          if (delegation.active and not voterMap.containsKey(delegator)) {
            switch (voterMap.get(delegation.delegate)) {
              case (?delegateVote) { countChoice(delegateVote.choice) };
              case null {};
            };
          };
        };
      };
      case null {};
    };
    { inFavor; against; abstain };
  };

  func toView(p : Common.Proposal) : ProposalView {
    {
      id = p.id;
      title = p.title;
      description = p.description;
      category = p.category;
      proposer = p.proposer;
      status = p.status;
      openTimestamp = p.openTimestamp;
      closeTimestamp = p.closeTimestamp;
      tally = computeTally(p.id);
    };
  };

  public shared ({ caller }) func createProposal(title : Text, description : Text, category : Common.ProposalCategory) : async Common.ProposalId {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered members can create a proposal");
    };
    let id = counters.nextProposalId;
    counters.nextProposalId += 1;
    let proposal : Common.Proposal = {
      id;
      title;
      description;
      category;
      proposer = caller;
      status = #open;
      openTimestamp = Time.now();
      closeTimestamp = null;
    };
    proposals.add(id, proposal);
    id;
  };

  public query func listProposals() : async [ProposalView] {
    proposals.values().toArray().map(toView);
  };

  public query func getProposal(id : Common.ProposalId) : async ?ProposalView {
    switch (proposals.get(id)) {
      case (?p) { ?toView(p) };
      case null { null };
    };
  };

  public shared ({ caller }) func castVote(proposalId : Common.ProposalId, choice : Common.VoteChoice) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered members can vote");
    };
    let proposal = proposals.get(proposalId) ?? Runtime.trap("Proposal not found");
    if (proposal.status != #open) {
      Runtime.trap("Voting is closed for this proposal");
    };
    let voterMap = switch (votes.get(proposalId)) {
      case (?m) { m };
      case null {
        let m = Map.empty<Principal, Common.Vote>();
        votes.add(proposalId, m);
        m;
      };
    };
    voterMap.add(caller, { proposalId; voter = caller; choice; timestamp = Time.now() });
  };

  public shared ({ caller }) func delegateVote(delegate : Principal) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered members can delegate their vote");
    };
    if (delegate == caller) {
      Runtime.trap("Cannot delegate your vote to yourself");
    };
    delegations.add(caller, { delegator = caller; delegate; active = true; timestamp = Time.now() });
  };

  public query ({ caller }) func getMyDelegation() : async ?Common.VoteDelegation {
    switch (delegations.get(caller)) {
      case (?d) { if (d.active) ?d else null };
      case null { null };
    };
  };

  public shared ({ caller }) func revokeDelegation() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered members can revoke a delegation");
    };
    switch (delegations.get(caller)) {
      case (?d) {
        if (d.active) {
          delegations.add(caller, { d with active = false; timestamp = Time.now() });
        };
      };
      case null {};
    };
  };

  public shared ({ caller }) func closeProposal(proposalId : Common.ProposalId) : async Common.ProposalStatus {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can close a proposal");
    };
    let proposal = proposals.get(proposalId) ?? Runtime.trap("Proposal not found");
    if (proposal.status != #open) {
      Runtime.trap("Proposal is already closed");
    };
    let tally = computeTally(proposalId);
    let finalStatus : Common.ProposalStatus = if (tally.inFavor > tally.against) { #passed } else { #rejected };
    proposals.add(proposalId, { proposal with status = finalStatus; closeTimestamp = ?Time.now() });
    finalStatus;
  };
};
