import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import Sovereign "../types/sovereign";
import SovereignLib "../lib/sovereign";
import ExecutionLib "../domains/execution";
import EligibilityLib "../domains/eligibility";

// ---------------------------------------------------------------------
// DAO Constitution & Governance — decisions, execution and appeals.
//
// The public governance endpoints for proposals, votes, execution requests
// and appeals. Additive to the Nation workspace layer: every record is
// scoped to exactly one Nation and is private by default.
//
// Core product principle (LESS IS MORE): passing a vote NEVER implies
// execution. A passed proposal creates a separate execution request that
// defaults to manual authorization and is never executed automatically by
// the passing vote. High-risk actions (treasury transfers, constitutional
// changes, authority changes and destructive actions) require additional
// authorization. There is no hidden platform administrator override.
// ---------------------------------------------------------------------
mixin (
  accessControlState : AccessControl.AccessControlState,
  nations : Map.Map<Sovereign.NationId, Sovereign.Nation>,
  nationMembers : Map.Map<Sovereign.NationMemberId, Sovereign.NationMember>,
  nationOwners : Map.Map<Sovereign.NationId, Sovereign.NationOwnership>,
  constitutions : Map.Map<Sovereign.ConstitutionId, Sovereign.Constitution>,
  governanceProposals : Map.Map<Sovereign.GovernanceProposalId, Sovereign.GovernanceProposal>,
  governanceVotes : Map.Map<Nat, Sovereign.GovernanceVote>,
  executionRequests : Map.Map<Sovereign.ExecutionRequestId, Sovereign.ExecutionRequest>,
  executionAudit : Map.Map<Nat, Sovereign.ExecutionAuditEntry>,
  appeals : Map.Map<Sovereign.AppealId, Sovereign.Appeal>,
  censusEntries : Map.Map<Sovereign.CensusEntryId, Sovereign.CensusEntry>,
  memberAdmissions : Map.Map<Sovereign.MemberAdmissionId, Sovereign.MemberAdmission>,
  recordedVotes : Map.Map<Sovereign.RecordedVoteId, Sovereign.RecordedVote>,
  governanceHistory : Map.Map<Sovereign.GovernanceHistoryId, Sovereign.GovernanceHistoryEntry>,
  counters : {
    var nextGovernanceProposalId : Nat;
    var nextExecutionRequestId : Nat;
    var nextExecutionAuditId : Nat;
    var nextAppealId : Nat;
    var nextCensusEntryId : Nat;
    var nextRecordedVoteId : Nat;
    var nextGovernanceHistoryId : Nat;
  },
) {
  // Maximum free-text length for a proposal summary, appeal summary or
  // evidence detail. Bounds storage and keeps one record from dominating a
  // listing. Transient: a constant, not durable state.
  transient let maxTextLength : Nat = 4000;

  // ---------------------------------------------------------------------
  // Authorization helpers
  // ---------------------------------------------------------------------

  // Whether the caller is a platform administrator.
  func isPlatformAdminExecution(caller : Principal) : Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  // Whether the caller is the Nation's recorded creator/owner.
  func isNationOwnerExecution(caller : Principal, nation : Sovereign.NationId) : Bool {
    switch (nationOwners.get(nation)) {
      case (?o) { Principal.equal(o.creator, caller) };
      case null { false };
    };
  };

  // Whether the caller is a member of one specific Nation: recorded in that
  // Nation's own member roster, its recorded owner, or a platform
  // administrator. Per-Nation isolation — a member of another Nation is not
  // a member of this one.
  func isMemberOfNationExecution(caller : Principal, nation : Sovereign.NationId) : Bool {
    if (isPlatformAdminExecution(caller)) { return true };
    if (isNationOwnerExecution(caller, nation)) { return true };
    nationMembers.values().any(func(m) =
      m.nation == nation and Principal.equal(m.member, caller)
    );
  };

  // Whether the caller may administer the given Nation: its recorded owner,
  // or a platform administrator.
  func canAdministerNationExecution(caller : Principal, nation : Sovereign.NationId) : Bool {
    if (isPlatformAdminExecution(caller)) { return true };
    isNationOwnerExecution(caller, nation);
  };

  // The constitution version currently in force for a Nation.
  func executionConstitutionVersion(nation : Sovereign.NationId) : Nat {
    ExecutionLib.activeConstitutionVersion(nation, constitutions.values().toArray());
  };

  // The governance rule set currently in force for a Nation. Falls back to
  // the constitutional defaults when the Nation has no active constitution,
  // so a new community is governed by the default waiting period and
  // activity requirement rather than being left without rules.
  func executionRuleSet(nation : Sovereign.NationId) : Sovereign.GovernanceRuleSet {
    switch (constitutions.values().find(func(c) = c.nation == nation and c.active)) {
      case (?c) { c.rules };
      case null { SovereignLib.defaultRuleSet("customDao") };
    };
  };

  // The member's admission record in a Nation, if any.
  func executionAdmissionFor(nation : Sovereign.NationId, member : Principal) : ?Sovereign.MemberAdmission {
    memberAdmissions.values().find(func(a) = a.nation == nation and Principal.equal(a.member, member));
  };

  // The timestamps of a member's qualifying activity in a Nation. Only the
  // explicitly defined qualifying kinds count (see EligibilityLib).
  func qualifyingActivityTimestamps(nation : Sovereign.NationId, member : Principal) : [Sovereign.Timestamp] {
    censusEntries.values().toArray()
      .filter(func(e) =
        e.nation == nation and Principal.equal(e.subject, member) and
        EligibilityLib.isQualifyingActivity(e.kind)
      )
      .map(func(e) = e.timestamp);
  };

  // Compute a member's voting eligibility under the Nation's constitution.
  func eligibilityFor(nation : Sovereign.NationId, member : Principal, now : Sovereign.Timestamp) : Sovereign.VotingEligibility {
    EligibilityLib.votingEligibility(
      executionAdmissionFor(nation, member),
      executionRuleSet(nation),
      qualifyingActivityTimestamps(nation, member),
      now,
    );
  };

  // Append one entry to the Nation's governance history.
  func recordExecutionHistory(
    nation : Sovereign.NationId,
    kind : Sovereign.GovernanceHistoryKind,
    actorPrincipal : Principal,
    referenceId : Nat,
    summary : Text,
  ) {
    let id = counters.nextGovernanceHistoryId;
    counters.nextGovernanceHistoryId += 1;
    governanceHistory.add(id, {
      id;
      nation;
      kind;
      actorPrincipal;
      referenceId;
      summary;
      constitutionVersion = executionConstitutionVersion(nation);
      timestamp = Time.now();
    });
  };

  // ---------------------------------------------------------------------
  // Participation Census — append-only accountability record
  // ---------------------------------------------------------------------

  // Record one Participation Census entry. Confidential entries record that
  // an event occurred without exposing its detail.
  func recordCensus(
    nation : Sovereign.NationId,
    kind : Sovereign.CensusEventKind,
    subject : Principal,
    referenceId : Nat,
    summary : Text,
    confidential : Bool,
  ) {
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
      constitutionVersion = executionConstitutionVersion(nation);
      timestamp = Time.now();
    });
  };

  // ---------------------------------------------------------------------
  // Execution audit trail
  // ---------------------------------------------------------------------

  // Append one entry to an execution request's audit trail. Every state
  // change to an execution request is recorded.
  func recordAudit(
    nation : Sovereign.NationId,
    request : Sovereign.ExecutionRequestId,
    action : Text,
    actorPrincipal : Principal,
    note : Text,
  ) {
    let id = counters.nextExecutionAuditId;
    counters.nextExecutionAuditId += 1;
    executionAudit.add(id, {
      id;
      nation;
      request;
      action;
      actorPrincipal;
      note;
      timestamp = Time.now();
    });
  };

  // ---------------------------------------------------------------------
  // Proposals — create, list, read
  // ---------------------------------------------------------------------

  // Create a governance proposal. The proposal carries its classification,
  // review and discussion periods, quorum, thresholds, abstentions and tie
  // rule, and the constitution version in force when it was created. Only a
  // signed-in member of the Nation may propose.
  public shared ({ caller }) func createGovernanceProposal(
    nation : Sovereign.NationId,
    title : Text,
    summary : Text,
    classification : Text,
    reviewPeriodDays : Nat,
    discussionPeriodDays : Nat,
    quorumPercent : Nat,
    approvalThresholdPercent : Nat,
    abstentionsCount : Bool,
    tieBreakRule : Text,
  ) : async Sovereign.SaveGovernanceProposalResult {
    if (not isMemberOfNationExecution(caller, nation)) {
      return #err(#notAuthorized);
    };
    if (not nations.containsKey(nation)) {
      return #err(#unknownNation);
    };
    if (title.size() == 0) { return #err(#missingTitle) };
    if (summary.size() == 0) { return #err(#missingSummary) };
    if (summary.size() > maxTextLength) { return #err(#invalidRuleSet) };
    if (quorumPercent > 100 or approvalThresholdPercent > 100) {
      return #err(#invalidThreshold);
    };
    let id = counters.nextGovernanceProposalId;
    counters.nextGovernanceProposalId += 1;
    governanceProposals.add(id, {
      id;
      nation;
      title;
      summary;
      classification;
      status = #voting;
      proposer = caller;
      constitutionVersion = executionConstitutionVersion(nation);
      reviewPeriodDays;
      discussionPeriodDays;
      quorumPercent;
      approvalThresholdPercent;
      abstentionsCount;
      tieBreakRule;
      votesInFavor = 0;
      votesAgainst = 0;
      votesAbstain = 0;
      outcome = null;
      timestamp = Time.now();
    });
    recordCensus(nation, #proposal, caller, id, "Proposal created: " # title, false);
    #ok(id);
  };

  // List a Nation's governance proposals.
  public query func listGovernanceProposals(nation : Sovereign.NationId) : async [Sovereign.GovernanceProposal] {
    governanceProposals.values().toArray().filter(func(p) = p.nation == nation);
  };

  // Read one governance proposal.
  public query func getGovernanceProposal(proposal : Sovereign.GovernanceProposalId) : async ?Sovereign.GovernanceProposal {
    governanceProposals.get(proposal);
  };

  // ---------------------------------------------------------------------
  // Voting — cast a vote, close the vote and record the outcome
  // ---------------------------------------------------------------------

  // Cast a vote on a governance proposal. One vote per member per proposal;
  // a later call by the same voter replaces the earlier choice. A
  // confidential vote is counted but its voter is withheld from public
  // reads. Only a signed-in member of the Nation may vote, and the member
  // must be eligible under the Nation's constitution (waiting period and
  // activity requirement). Eligibility is validated here, in the backend,
  // before the vote is accepted.
  public shared ({ caller }) func castGovernanceVote(
    proposal : Sovereign.GovernanceProposalId,
    choice : Common.VoteChoice,
    confidential : Bool,
  ) : async Sovereign.SaveGovernanceProposalResult {
    let p = switch (governanceProposals.get(proposal)) {
      case (?p) { p };
      case null { return #err(#unknownProposal) };
    };
    if (not isMemberOfNationExecution(caller, p.nation)) {
      return #err(#notAuthorized);
    };
    if (p.status != #voting) {
      return #err(#notAuthorized);
    };
    // Eligibility is validated in the backend before the vote is accepted:
    // the waiting period and the activity requirement are enforced here.
    let now = Time.now();
    let eligibility = eligibilityFor(p.nation, caller, now);
    if (not eligibility.eligible) {
      return #err(#notAuthorized);
    };
    // One vote per member per decision. A second vote on the same decision
    // is rejected; a member cannot vote twice.
    let decision : Sovereign.DecisionKind = #governanceProposal(proposal);
    if (recordedVotes.values().any(func(v) =
      v.nation == p.nation and v.decision == decision and Principal.equal(v.voter, caller)
    )) {
      return #err(#alreadyVoted);
    };
    // Record the vote and update the stored tallies.
    let voteId = counters.nextRecordedVoteId;
    counters.nextRecordedVoteId += 1;
    recordedVotes.add(voteId, {
      id = voteId;
      nation = p.nation;
      decision;
      voter = caller;
      choice;
      confidential;
      timestamp = now;
    });
    let tallies = switch (choice) {
      case (#inFavor) { (p.votesInFavor + 1, p.votesAgainst, p.votesAbstain) };
      case (#against) { (p.votesInFavor, p.votesAgainst + 1, p.votesAbstain) };
      case (#abstain) { (p.votesInFavor, p.votesAgainst, p.votesAbstain + 1) };
    };
    governanceProposals.add(proposal, {
      p with
      votesInFavor = tallies.0;
      votesAgainst = tallies.1;
      votesAbstain = tallies.2;
      timestamp = now;
    });
    recordCensus(
      p.nation,
      #vote,
      caller,
      proposal,
      if (confidential) { "Confidential vote recorded" } else { "Vote recorded" },
      confidential,
    );
    recordExecutionHistory(p.nation, #vote, caller, proposal, "Vote cast on proposal " # proposal.toText());
    #ok(proposal);
  };

  // Read the caller's voting eligibility in a Nation: whether the caller may
  // vote, and the specific reason for any restriction (waiting period,
  // inactivity, or no admission record).
  public query ({ caller }) func getVotingEligibility(nation : Sovereign.NationId) : async Sovereign.VotingEligibility {
    eligibilityFor(nation, caller, Time.now());
  };

  // List the recorded votes for one decision. A confidential vote's voter is
  // withheld. Only a member of the Nation may read them.
  public query ({ caller }) func listRecordedVotes(
    nation : Sovereign.NationId,
    decision : Sovereign.DecisionKind,
  ) : async [Sovereign.RecordedVote] {
    if (not isMemberOfNationExecution(caller, nation)) { return [] };
    recordedVotes.values().toArray()
      .filter(func(v) = v.nation == nation and v.decision == decision)
      .map(func(v) =
        if (v.confidential) {
          { v with voter = Principal.fromText("aaaaa-aa") };
        } else {
          v;
        }
      );
  };

  // Close a proposal's vote and record its outcome. The outcome is computed
  // from the stored tallies, quorum and thresholds. Closing a vote NEVER
  // executes the proposal: an approved proposal moves to `#passed` and
  // awaits a separate execution request. Only a member of the Nation may
  // close the vote.
  public shared ({ caller }) func closeGovernanceProposal(
    proposal : Sovereign.GovernanceProposalId,
  ) : async Sovereign.SaveGovernanceProposalResult {
    let p = switch (governanceProposals.get(proposal)) {
      case (?p) { p };
      case null { return #err(#unknownProposal) };
    };
    if (not isMemberOfNationExecution(caller, p.nation)) {
      return #err(#notAuthorized);
    };
    if (p.status != #voting) {
      return #err(#notAuthorized);
    };
    // Eligible voters: the Nation's recorded members.
    let eligible = nationMembers.values().toArray().filter(func(m) = m.nation == p.nation).size();
    let outcome = SovereignLib.computeProposalOutcome(
      p.votesInFavor,
      p.votesAgainst,
      p.votesAbstain,
      p.quorumPercent,
      p.approvalThresholdPercent,
      p.abstentionsCount,
      eligible,
    );
    let status : Sovereign.GovernanceProposalStatus = switch (outcome) {
      case (#approved) { #passed };
      case (_) { #rejected };
    };
    governanceProposals.add(proposal, {
      p with
      status;
      outcome = ?outcome;
      timestamp = Time.now();
    });
    recordCensus(
      p.nation,
      #proposal,
      caller,
      proposal,
      "Proposal closed: " # p.title,
      false,
    );
    #ok(proposal);
  };

  // ---------------------------------------------------------------------
  // Execution — separate from voting, manual by default
  // ---------------------------------------------------------------------

  // Request execution of a passed proposal. This is a separate step from
  // voting: a passed proposal is never executed automatically. The request
  // starts in `#pendingAuthorization` and must be authorized separately.
  // Only a member of the Nation may request execution.
  public shared ({ caller }) func requestExecution(
    proposal : Sovereign.GovernanceProposalId,
  ) : async Sovereign.SaveExecutionRequestResult {
    let p = switch (governanceProposals.get(proposal)) {
      case (?p) { p };
      case null { return #err(#unknownProposal) };
    };
    if (not isMemberOfNationExecution(caller, p.nation)) {
      return #err(#notAuthorized);
    };
    // A request may only be created for a proposal that actually passed.
    if (p.status != #passed) {
      return #err(#proposalNotPassed);
    };
    // Reject a duplicate execution request for the same proposal.
    if (executionRequests.values().any(func(r) =
      r.proposal == proposal and r.status != #cancelled and r.status != #rejected
    )) {
      return #err(#duplicateExecution);
    };
    let id = counters.nextExecutionRequestId;
    counters.nextExecutionRequestId += 1;
    let highRisk = ExecutionLib.isHighRiskClassification(p.classification);
    executionRequests.add(id, {
      id;
      nation = p.nation;
      proposal;
      status = #pendingAuthorization;
      requestedBy = caller;
      authorizedBy = null;
      highRisk;
      timelockUntil = null;
      cancelledBy = null;
      constitutionVersion = p.constitutionVersion;
      timestamp = Time.now();
    });
    recordAudit(p.nation, id, "requested", caller, "Execution requested for proposal " # proposal.toText());
    #ok(id);
  };

  // Authorize an execution request. High-risk actions require additional,
  // independent authorization: the authorizer must not be the requester.
  // A non-high-risk request may be authorized by any member. Authorization
  // applies a timelock before execution may proceed.
  public shared ({ caller }) func authorizeExecution(
    request : Sovereign.ExecutionRequestId,
  ) : async Sovereign.SaveExecutionRequestResult {
    let r = switch (executionRequests.get(request)) {
      case (?r) { r };
      case null { return #err(#unknownExecutionRequest) };
    };
    if (not isMemberOfNationExecution(caller, r.nation)) {
      return #err(#notAuthorized);
    };
    if (not ExecutionLib.canAuthorize(r, caller)) {
      return #err(#duplicateExecution);
    };
    // The constitution version must still match the version in force.
    if (r.constitutionVersion != executionConstitutionVersion(r.nation)) {
      return #err(#invalidRuleSet);
    };
    let now = Time.now();
    executionRequests.add(request, {
      r with
      status = #timelocked;
      authorizedBy = ?caller;
      timelockUntil = ?(now + ExecutionLib.defaultTimelockNanos());
      timestamp = now;
    });
    recordAudit(r.nation, request, "authorized", caller, "Execution authorized");
    #ok(request);
  };

  // Execute an authorized request once its timelock has passed. Execution
  // is a separate, explicit step: it never happens automatically when a vote
  // passes. Rejects an unauthorized, duplicate, paused or still-timelocked
  // request, and a request whose constitution version no longer matches.
  public shared ({ caller }) func executeRequest(
    request : Sovereign.ExecutionRequestId,
  ) : async Sovereign.SaveExecutionRequestResult {
    let r = switch (executionRequests.get(request)) {
      case (?r) { r };
      case null { return #err(#unknownExecutionRequest) };
    };
    if (not isMemberOfNationExecution(caller, r.nation)) {
      return #err(#notAuthorized);
    };
    // Reject a request that has not been authorized, is paused, cancelled,
    // rejected or already executed.
    if (r.status == #paused) { return #err(#executionPaused) };
    if (r.status != #timelocked) { return #err(#duplicateExecution) };
    // The constitution version must still match the version in force.
    if (r.constitutionVersion != executionConstitutionVersion(r.nation)) {
      return #err(#invalidRuleSet);
    };
    let now = Time.now();
    switch (r.timelockUntil) {
      case (?until) {
        if (now < until) { return #err(#invalidTimelock) };
      };
      case null { return #err(#invalidTimelock) };
    };
    executionRequests.add(request, {
      r with
      status = #executed;
      timestamp = now;
    });
    recordAudit(r.nation, request, "executed", caller, "Execution completed");
    recordCensus(r.nation, #executionOutcome, caller, request, "Execution completed", false);
    #ok(request);
  };

  // Cancel an execution request before it executes. Only the Nation's owner
  // or a platform administrator may cancel.
  public shared ({ caller }) func cancelExecution(
    request : Sovereign.ExecutionRequestId,
  ) : async Sovereign.SaveExecutionRequestResult {
    let r = switch (executionRequests.get(request)) {
      case (?r) { r };
      case null { return #err(#unknownExecutionRequest) };
    };
    if (not canAdministerNationExecution(caller, r.nation)) {
      return #err(#notAuthorized);
    };
    if (r.status == #executed or r.status == #cancelled) {
      return #err(#duplicateExecution);
    };
    executionRequests.add(request, {
      r with
      status = #cancelled;
      cancelledBy = ?caller;
      timestamp = Time.now();
    });
    recordAudit(r.nation, request, "cancelled", caller, "Execution cancelled");
    #ok(request);
  };

  // Pause or resume execution for a Nation (emergency pause). While paused,
  // no execution request may proceed. Only the Nation's owner or a platform
  // administrator may pause or resume.
  public shared ({ caller }) func setExecutionPaused(
    nation : Sovereign.NationId,
    paused : Bool,
  ) : async Sovereign.SaveExecutionRequestResult {
    if (not canAdministerNationExecution(caller, nation)) {
      return #err(#notAuthorized);
    };
    if (not nations.containsKey(nation)) {
      return #err(#unknownNation);
    };
    // Move every pending/timelocked request to `#paused` (or back to
    // `#pendingAuthorization` when resuming).
    let affected = executionRequests.values().toArray().filter(func(r) =
      r.nation == nation and (r.status == #pendingAuthorization or r.status == #timelocked or r.status == #paused)
    );
    for (r in affected.values()) {
      if (paused) {
        executionRequests.add(r.id, { r with status = #paused; timestamp = Time.now() });
        recordAudit(nation, r.id, "paused", caller, "Emergency pause");
      } else if (r.status == #paused) {
        executionRequests.add(r.id, { r with status = #pendingAuthorization; timestamp = Time.now() });
        recordAudit(nation, r.id, "resumed", caller, "Emergency pause lifted");
      };
    };
    #ok(0);
  };

  // List a Nation's execution requests.
  public query func listExecutionRequests(nation : Sovereign.NationId) : async [Sovereign.ExecutionRequest] {
    executionRequests.values().toArray().filter(func(r) = r.nation == nation);
  };

  // Read one execution request.
  public query func getExecutionRequest(request : Sovereign.ExecutionRequestId) : async ?Sovereign.ExecutionRequest {
    executionRequests.get(request);
  };

  // List the audit trail for one execution request.
  public query func listExecutionAudit(request : Sovereign.ExecutionRequestId) : async [Sovereign.ExecutionAuditEntry] {
    executionAudit.values().toArray().filter(func(e) = e.request == request);
  };

  // ---------------------------------------------------------------------
  // Appeals — membership rejection, inactivity and governance decisions
  // ---------------------------------------------------------------------

  // File an appeal. An appeal covers a membership rejection, an inactivity
  // decision or a governance decision, and carries a summary and optional
  // evidence. Only a signed-in member of the Nation may file.
  public shared ({ caller }) func fileAppeal(
    nation : Sovereign.NationId,
    kind : Sovereign.AppealKind,
    subjectId : Nat,
    summary : Text,
  ) : async Sovereign.SaveAppealResult {
    if (not isMemberOfNationExecution(caller, nation)) {
      return #err(#notAuthorized);
    };
    if (not nations.containsKey(nation)) {
      return #err(#unknownNation);
    };
    if (summary.size() == 0) { return #err(#missingSummary) };
    if (summary.size() > maxTextLength) { return #err(#invalidRuleSet) };
    let id = counters.nextAppealId;
    counters.nextAppealId += 1;
    appeals.add(id, {
      id;
      nation;
      kind;
      status = #submitted;
      appellant = caller;
      subjectId;
      summary;
      evidence = [];
      recusals = [];
      decidedBy = null;
      decisionNote = null;
      timestamp = Time.now();
    });
    recordCensus(nation, #dispute, caller, id, "Appeal filed", false);
    #ok(id);
  };

  // Add a piece of evidence to an appeal. Only a member of the Nation may
  // add evidence.
  public shared ({ caller }) func addAppealEvidence(
    appeal : Sovereign.AppealId,
    evidenceLabel : Text,
    detail : Text,
  ) : async Sovereign.SaveAppealResult {
    let a = switch (appeals.get(appeal)) {
      case (?a) { a };
      case null { return #err(#unknownAppeal) };
    };
    if (not isMemberOfNationExecution(caller, a.nation)) {
      return #err(#notAuthorized);
    };
    if (a.status == #upheld or a.status == #denied or a.status == #withdrawn) {
      return #err(#notAuthorized);
    };
    if (evidenceLabel.size() == 0 or detail.size() == 0) {
      return #err(#missingSummary);
    };
    let entry : Sovereign.AppealEvidence = {
      evidenceLabel;
      detail;
      submittedBy = caller;
      timestamp = Time.now();
    };
    appeals.add(appeal, {
      a with
      evidence = a.evidence.concat([entry]);
      status = if (a.status == #submitted) { #underReview } else { a.status };
      timestamp = Time.now();
    });
    #ok(appeal);
  };

  // Record a reviewer's recusal from an appeal because of a documented
  // conflict of interest. Only a member of the Nation may recuse.
  public shared ({ caller }) func recuseFromAppeal(
    appeal : Sovereign.AppealId,
    reason : Text,
  ) : async Sovereign.SaveAppealResult {
    let a = switch (appeals.get(appeal)) {
      case (?a) { a };
      case null { return #err(#unknownAppeal) };
    };
    if (not isMemberOfNationExecution(caller, a.nation)) {
      return #err(#notAuthorized);
    };
    if (reason.size() == 0) { return #err(#missingSummary) };
    let recusal : Sovereign.AppealRecusal = {
      reviewer = caller;
      reason;
      timestamp = Time.now();
    };
    appeals.add(appeal, {
      a with
      recusals = a.recusals.concat([recusal]);
      timestamp = Time.now();
    });
    #ok(appeal);
  };

  // Decide an appeal. A reviewer with a documented conflict of interest must
  // recuse and may not decide. Only a member of the Nation may decide.
  public shared ({ caller }) func decideAppeal(
    appeal : Sovereign.AppealId,
    uphold : Bool,
    decisionNote : Text,
  ) : async Sovereign.SaveAppealResult {
    let a = switch (appeals.get(appeal)) {
      case (?a) { a };
      case null { return #err(#unknownAppeal) };
    };
    if (not isMemberOfNationExecution(caller, a.nation)) {
      return #err(#notAuthorized);
    };
    if (a.status == #upheld or a.status == #denied or a.status == #withdrawn) {
      return #err(#notAuthorized);
    };
    // A reviewer who has recused from this appeal may not decide it.
    if (SovereignLib.mustRecuse(a, caller)) {      return #err(#conflictOfInterest);
    };
    appeals.add(appeal, {
      a with
      status = if (uphold) { #upheld } else { #denied };
      decidedBy = ?caller;
      decisionNote = ?decisionNote;
      timestamp = Time.now();
    });
    recordCensus(a.nation, #dispute, caller, appeal, "Appeal decided", false);
    #ok(appeal);
  };

  // List a Nation's appeals.
  public query func listAppeals(nation : Sovereign.NationId) : async [Sovereign.Appeal] {
    appeals.values().toArray().filter(func(a) = a.nation == nation);
  };

  // Read one appeal.
  public query func getAppeal(appeal : Sovereign.AppealId) : async ?Sovereign.Appeal {
    appeals.get(appeal);
  };
};
