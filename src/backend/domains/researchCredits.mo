import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";

// SOVEREIGN Research Credits (SRC) ledger, verified-contribution review
// workflow and SRC-funded research assignment queue. SRC are an internal,
// non-transferable contribution-tracking unit — they are NOT the proposed
// SOVEREIGN token and do not represent money or treasury funds.
mixin (
  accessControlState : AccessControl.AccessControlState,
  reviewers : Set.Set<Principal>,
  srcBalances : Map.Map<Principal, Common.SrcBalance>,
  srcTransactions : Map.Map<Common.SrcTransactionId, Common.SrcTransaction>,
  contributions : Map.Map<Common.ContributionId, Common.Contribution>,
  assignments : Map.Map<Common.AssignmentId, Common.Assignment>,
  counters : {
    var nextSrcTransactionId : Nat;
    var nextContributionId : Nat;
    var nextAssignmentId : Nat;
    var nextTreasuryTransactionId : Nat;
    var nextProposalId : Nat;
    var nextStakingId : Nat;
  },
) {

  func requireMember(caller : Principal) {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: sign in as a registered member to use SOVEREIGN Research Credits");
    };
  };

  func isReviewerOrAdmin(caller : Principal) : Bool {
    AccessControl.isAdmin(accessControlState, caller) or reviewers.contains(caller);
  };

  func requireReviewer(caller : Principal) {
    if (not isReviewerOrAdmin(caller)) {
      Runtime.trap("Unauthorized: only admins or reviewers can review contributions");
    };
  };

  func requireAdmin(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: only admins can perform this action");
    };
  };

  func recordSrcTransaction(
    member : Principal,
    txType : Common.SrcTransactionType,
    amount : Nat,
    reference : Common.SrcReference,
  ) {
    let id = counters.nextSrcTransactionId;
    counters.nextSrcTransactionId += 1;
    srcTransactions.add(
      id,
      {
        id;
        member;
        txType;
        amount;
        reference;
        timestamp = Time.now();
      },
    );
  };

  // ---------------------------------------------------------------------
  // SRC ledger — own balance and full earn/spend transaction history
  // ---------------------------------------------------------------------

  public query ({ caller }) func getCallerSrcBalance() : async Common.SrcBalance {
    requireMember(caller);
    srcBalances.get(caller) ?? 0;
  };

  public query ({ caller }) func getCallerSrcTransactions() : async [Common.SrcTransaction] {
    requireMember(caller);
    srcTransactions.values().filter(func tx = tx.member == caller).toArray();
  };

  // ---------------------------------------------------------------------
  // Contribution submission
  // ---------------------------------------------------------------------

  public shared ({ caller }) func submitContribution(
    contributionType : Common.ContributionType,
    notes : Text,
    links : [Text],
  ) : async Common.ContributionId {
    requireMember(caller);
    let id = counters.nextContributionId;
    counters.nextContributionId += 1;
    contributions.add(
      id,
      {
        id;
        contributor = caller;
        contributionType;
        notes;
        links;
        status = #pending;
        reviewer = null;
        rationale = null;
        srcAwarded = null;
        timestamp = Time.now();
      },
    );
    id;
  };

  public query ({ caller }) func getCallerContributions() : async [Common.Contribution] {
    requireMember(caller);
    contributions.values().filter(func c = c.contributor == caller).toArray();
  };

  // ---------------------------------------------------------------------
  // Admin / reviewer verified-contribution workflow
  // ---------------------------------------------------------------------

  public query ({ caller }) func listPendingContributions() : async [Common.Contribution] {
    requireReviewer(caller);
    contributions.values().filter(func c = c.status == #pending).toArray();
  };

  public shared ({ caller }) func reviewContribution(
    contributionId : Common.ContributionId,
    decision : { #approve : Nat; #reject },
    rationale : Text,
  ) : async () {
    requireReviewer(caller);
    let contribution = contributions.get(contributionId) ?? Runtime.trap("Contribution not found");
    if (contribution.status != #pending) {
      Runtime.trap("Contribution has already been reviewed");
    };
    switch (decision) {
      case (#approve(amount)) {
        let current = srcBalances.get(contribution.contributor) ?? 0;
        srcBalances.add(contribution.contributor, current + amount);
        recordSrcTransaction(contribution.contributor, #earn, amount, #contribution(contributionId));
        contributions.add(
          contributionId,
          {
            contribution with
            status = #approved;
            reviewer = ?caller;
            rationale = ?rationale;
            srcAwarded = ?amount;
          },
        );
      };
      case (#reject) {
        contributions.add(
          contributionId,
          {
            contribution with
            status = #rejected;
            reviewer = ?caller;
            rationale = ?rationale;
          },
        );
      };
    };
  };

  // ---------------------------------------------------------------------
  // Research assignment requests — spend SRC to commission or prioritize
  // ---------------------------------------------------------------------

  public shared ({ caller }) func requestAssignment(
    title : Text,
    description : Text,
    srcToSpend : Nat,
    priority : Common.AssignmentPriority,
  ) : async Common.AssignmentId {
    requireMember(caller);
    let current = srcBalances.get(caller) ?? 0;
    if (srcToSpend > current) {
      Runtime.trap("Insufficient SRC balance to request this assignment");
    };
    srcBalances.add(caller, Nat.sub(current, srcToSpend));
    let id = counters.nextAssignmentId;
    counters.nextAssignmentId += 1;
    assignments.add(
      id,
      {
        id;
        title;
        description;
        requestedBy = caller;
        priority;
        srcSpent = srcToSpend;
        status = #queuedAwaitingFunding;
        timestamp = Time.now();
      },
    );
    recordSrcTransaction(caller, #spend, srcToSpend, #assignment(id));
    id;
  };

  public shared ({ caller }) func raiseAssignmentPriority(
    assignmentId : Common.AssignmentId,
    additionalSrc : Nat,
    newPriority : Common.AssignmentPriority,
  ) : async () {
    requireMember(caller);
    let assignment = assignments.get(assignmentId) ?? Runtime.trap("Assignment not found");
    if (assignment.requestedBy != caller) {
      Runtime.trap("Unauthorized: can only raise priority on your own assignment requests");
    };
    if (assignment.status != #queuedAwaitingFunding and assignment.status != #queued) {
      Runtime.trap("Only a queued assignment's priority can be raised");
    };
    let current = srcBalances.get(caller) ?? 0;
    if (additionalSrc > current) {
      Runtime.trap("Insufficient SRC balance to raise priority");
    };
    srcBalances.add(caller, Nat.sub(current, additionalSrc));
    assignments.add(
      assignmentId,
      {
        assignment with
        priority = newPriority;
        srcSpent = assignment.srcSpent + additionalSrc;
      },
    );
    recordSrcTransaction(caller, #spend, additionalSrc, #assignment(assignmentId));
  };

  // ---------------------------------------------------------------------
  // Assignment queue
  // ---------------------------------------------------------------------

  public query ({ caller }) func listAssignments() : async [Common.Assignment] {
    requireMember(caller);
    if (isReviewerOrAdmin(caller)) {
      assignments.values().toArray();
    } else {
      assignments.values().filter(func a = a.requestedBy == caller).toArray();
    };
  };

  public shared ({ caller }) func advanceAssignmentStatus(
    assignmentId : Common.AssignmentId,
    newStatus : Common.AssignmentStatus,
  ) : async () {
    requireAdmin(caller);
    let assignment = assignments.get(assignmentId) ?? Runtime.trap("Assignment not found");
    assignments.add(assignmentId, { assignment with status = newStatus });
  };

  // ---------------------------------------------------------------------
  // Reviewer role management (admin-only) — gates the review workflow above
  // ---------------------------------------------------------------------

  public shared ({ caller }) func setReviewerRole(user : Principal, isReviewer : Bool) : async () {
    requireAdmin(caller);
    if (isReviewer) {
      reviewers.add(user);
    } else {
      reviewers.remove(user);
    };
  };

  public query ({ caller }) func isCallerReviewer() : async Bool {
    isReviewerOrAdmin(caller);
  };
};
