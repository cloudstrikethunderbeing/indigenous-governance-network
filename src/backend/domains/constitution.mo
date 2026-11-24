import List "mo:core/List";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Sovereign "../types/sovereign";

// ---------------------------------------------------------------------
// DAO Constitution & Governance — Constitution pure helpers.
//
// Everything here is deterministic and side-effect free: the six editable
// constitution templates, the default rule set for each, the rule-set
// validation, and the founding-setup helpers. The stateful endpoints live
// in mixins/constitution-api.mo.
//
// The templates are example starting points, not assumptions about an
// organization's legal or traditional governance authority. Every setting
// is a plain configurable value the organization may change before
// activation, and after activation only through its own approved
// amendment process.
// ---------------------------------------------------------------------

module {
  // The six editable constitution templates, in display order. Each is an
  // example starting point with sensible defaults.
  public func templateKeys() : [Text] {
    [
      "indigenousNation",
      "nonprofit",
      "cooperative",
      "business",
      "community",
      "customDao",
    ];
  };

  // The selectable constitution templates. Each is an example starting
  // point, not a claim about an organization's authority.
  public func constitutionTemplates() : [Sovereign.GovernanceModelOption] {
    [
      {
        modelKey = "indigenousNation";
        labelText = "Indigenous Nation";
        description = "An example starting point for a Nation or community that governs by its own traditions and consent. Every rule is editable.";
      },
      {
        modelKey = "nonprofit";
        labelText = "Nonprofit";
        description = "An example starting point for a charitable or mission-driven organization with a board and member approvals.";
      },
      {
        modelKey = "cooperative";
        labelText = "Cooperative";
        description = "An example starting point for a member-owned cooperative with one member, one vote.";
      },
      {
        modelKey = "business";
        labelText = "Business";
        description = "An example starting point for a company with defined roles, treasury limits and leadership terms.";
      },
      {
        modelKey = "community";
        labelText = "Community";
        description = "An example starting point for a community group with lightweight membership and voting rules.";
      },
      {
        modelKey = "customDao";
        labelText = "Custom DAO";
        description = "A blank example starting point. Define every governance rule yourself before activation.";
      },
    ];
  };

  // The default governance rule set for a template. Every setting is a
  // plain configurable value the organization may change before activation.
  // An unknown template key falls back to the Custom DAO defaults.
  public func defaultRuleSet(templateKey : Text) : Sovereign.GovernanceRuleSet {
    let base : Sovereign.GovernanceRuleSet = {
      foundingAuthorityProcedure = "The founding authority creates the DAO, appoints the other authorities and confirms the constitution before activation.";
      membershipEligibility = "Any person or organization the community accepts may apply for membership.";
      identityVerification = "Each member signs in with Internet Identity so their principal is verified.";
      membershipApprovalThresholdPercent = 60;
      loginRequirement = "Members sign in at least once every 30 days to stay active.";
      participationRequirement = "Members cast one eligible proposal vote every 30 days, with exemptions when no eligible vote exists.";
      votingEligibility = "Active members may vote. New members cannot vote on proposals already open when they join.";
      newMemberWaitingPeriodDays = 8;
      votingMethod = "One member, one vote.";
      delegationAllowed = true;
      votingWeight = "Every eligible member carries equal weight.";
      proposalSubmissionPeriodDays = 7;
      proposalReviewPeriodDays = 3;
      proposalDiscussionPeriodDays = 7;
      quorumPercent = 50;
      approvalThresholdPercent = 50;
      abstentionsCount = false;
      tieBreakRule = "A tied vote is not approved; the proposal may be reintroduced.";
      proposalClassifications = ["General", "Treasury expenditure", "Constitutional amendment", "Membership", "Leadership"];
      approvalOutcomes = ["Approved", "Rejected", "No quorum", "Tied"];
      treasurySpendLimit = 10000;
      treasuryAuthorization = "Spending above the limit requires independent authorization from the Treasury Steward.";
      leadershipElectionProcedure = "Leaders are elected by a majority vote of active members.";
      leadershipTermDays = 365;
      leadershipRemovalProcedure = "A leader may be removed by a two-thirds vote of active members.";
      documentAccess = "Documents are readable by members unless marked confidential.";
      confidentialityRule = "Confidential documents are readable only by the roles named in the document's access rule.";
      aiPermissions = "AI is advisory only. It answers questions and never votes, approves, executes or changes membership.";
      humanOversight = "Every AI-assisted decision is reviewed and confirmed by a human authority.";
      appealsProcedure = "A member may appeal a membership, inactivity or governance decision within 30 days.";
      disputeProcedure = "Disputes are reviewed by an authority with no conflict of interest.";
      evidenceReviewProcedure = "Each party may submit evidence; a reviewer with a conflict of interest must recuse.";
      emergencyPauseProcedure = "An authorized authority may pause execution during an emergency; the pause is recorded and reviewed.";
      governanceRecoveryProcedure = "Lost access or insufficient authorities are recovered through a governance-approved procedure. There is no hidden platform override.";
      amendmentProcedure = "After activation, rules change only through a constitutionally authorized amendment.";
      collaborationDataSharing = "The Nation shares data with other Nations only when it opts in and confirms each share.";
      dissolutionProcedure = "Dissolution requires a two-thirds vote of active members.";
      dataExportProcedure = "Members may export the Nation's records at any time.";
    };
    switch (templateKey) {
      case ("indigenousNation") {
        {
          base with
          membershipEligibility = "Membership is decided by the community under its own traditions and consent.";
          votingMethod = "Consensus is sought; where consensus is not reached, the community's agreed fallback applies.";
          quorumPercent = 60;
          approvalThresholdPercent = 60;
          newMemberWaitingPeriodDays = 8;
          collaborationDataSharing = "Community knowledge is shared only with explicit community consent.";
        };
      };
      case ("nonprofit") {
        {
          base with
          membershipApprovalThresholdPercent = 66;
          leadershipTermDays = 730;
          treasurySpendLimit = 25000;
        };
      };
      case ("cooperative") {
        {
          base with
          votingMethod = "One member, one vote, regardless of contribution.";
          votingWeight = "Every member carries equal weight.";
          quorumPercent = 50;
        };
      };
      case ("business") {
        {
          base with
          membershipEligibility = "Membership is granted by the organization's leadership.";
          votingWeight = "Voting weight follows the organization's defined share structure.";
          treasurySpendLimit = 50000;
          leadershipTermDays = 365;
        };
      };
      case ("community") {
        {
          base with
          membershipApprovalThresholdPercent = 50;
          newMemberWaitingPeriodDays = 0;
          quorumPercent = 40;
          treasurySpendLimit = 5000;
        };
      };
      case (_) { base };
    };
  };

  // Validate a governance rule set. Returns the first validation error, or
  // null when the rule set is acceptable. Percentages must be whole values
  // in 0-100; the required procedure texts must be present.
  public func validateRuleSet(rules : Sovereign.GovernanceRuleSet) : ?Sovereign.GovernanceError {
    if (rules.membershipApprovalThresholdPercent > 100) { return ?#invalidThreshold };
    if (rules.quorumPercent > 100) { return ?#invalidThreshold };
    if (rules.approvalThresholdPercent > 100) { return ?#invalidThreshold };
    if (rules.foundingAuthorityProcedure.size() == 0) { return ?#invalidRuleSet };
    if (rules.membershipEligibility.size() == 0) { return ?#invalidRuleSet };
    if (rules.votingMethod.size() == 0) { return ?#invalidRuleSet };
    if (rules.amendmentProcedure.size() == 0) { return ?#invalidRuleSet };
    if (rules.proposalClassifications.size() == 0) { return ?#invalidRuleSet };
    if (rules.approvalOutcomes.size() == 0) { return ?#invalidRuleSet };
    null;
  };

  // Whether a founding setup is still in Founding Setup (not activated,
  // expired or cancelled).
  public func isInFoundingSetup(setup : Sovereign.FoundingSetup) : Bool {
    setup.status == #foundingSetup;
  };

  // Whether a founding setup has expired at `now`.
  public func isSetupExpired(setup : Sovereign.FoundingSetup, now : Sovereign.Timestamp) : Bool {
    setup.status == #foundingSetup and now >= setup.setupExpiresAt;
  };

  // Whether every founding appointment for a Nation has been accepted. An
  // empty appointment list is not sufficient: at least one appointment must
  // exist and all must be accepted.
  public func allAppointmentsAccepted(appointments : [Sovereign.FoundingAppointment]) : Bool {
    if (appointments.size() == 0) { return false };
    appointments.all(func(a) = a.status == #accepted);
  };

  // The number of founding appointments still pending acceptance.
  public func pendingAppointmentCount(appointments : [Sovereign.FoundingAppointment]) : Nat {
    var count = 0;
    for (a in appointments.values()) {
      if (a.status == #pending) { count += 1 };
    };
    count;
  };

  // ---------------------------------------------------------------------
  // Constitutional approval rules
  //
  // The required number of distinct approvals is derived from the Nation's
  // own constitution: a configurable percentage of eligible approvers,
  // rounded up, with a default of three distinct authorized approvals. A
  // decision already pending keeps the requirement it started with — the
  // caller passes the requirement captured at creation, never a recomputed
  // one.
  // ---------------------------------------------------------------------

  // The default number of distinct authorized approvals when a constitution
  // does not specify a percentage.
  public func defaultRequiredApprovals() : Nat {
    3;
  };

  // The required number of distinct approvals for a decision, given the
  // Nation's constitution rule set and the eligible approvers. The
  // percentage is applied to the eligible approver count and rounded up; the
  // result is never below the default of three distinct approvals.
  public func requiredApprovals(rules : Sovereign.GovernanceRuleSet, eligibleApprovers : [Principal]) : Nat {
    let eligible = eligibleApprovers.size();
    let percent = rules.membershipApprovalThresholdPercent;
    // ceil(eligible * percent / 100)
    let scaled = eligible * percent;
    let roundedUp = (scaled + 99) / 100;
    if (roundedUp > defaultRequiredApprovals()) { roundedUp } else { defaultRequiredApprovals() };
  };

  // The approval requirement for a decision: the required count and the
  // eligible approvers it was computed against.
  public func approvalRequirement(rules : Sovereign.GovernanceRuleSet, eligibleApprovers : [Principal]) : Sovereign.ApprovalRequirement {
    {
      required = requiredApprovals(rules, eligibleApprovers);
      eligibleApprovers;
    };
  };

  // Whether a decision that started with `capturedRequired` distinct
  // approvals is satisfied by `recordedApprovals`. A pending decision keeps
  // the requirement it started with, so the captured value is used, never a
  // freshly recomputed one.
  public func approvalsSatisfied(capturedRequired : Nat, recordedApprovals : Nat) : Bool {
    recordedApprovals >= capturedRequired;
  };

  // ---------------------------------------------------------------------
  // Founding authority rules
  //
  // Exactly three distinct accepted authorities are required. A principal may
  // hold only one founding seat. Activation happens automatically once the
  // third distinct authority accepts and a confirmed constitution exists.
  // ---------------------------------------------------------------------

  // The number of distinct founding authorities required for activation.
  public func requiredFoundingAuthorities() : Nat {
    3;
  };

  // The distinct principals holding an accepted founding appointment.
  public func acceptedFoundingAuthorities(appointments : [Sovereign.FoundingAppointment]) : [Principal] {
    let acc = List.empty<Principal>();
    for (a in appointments.values()) {
      if (a.status == #accepted and not acc.any(func(p) = Principal.equal(p, a.authority))) {
        acc.add(a.authority);
      };
    };
    acc.toArray();
  };

  // Whether a principal already holds a founding seat (any appointment that
  // is not replaced or declined).
  public func holdsFoundingSeat(appointments : [Sovereign.FoundingAppointment], authority : Principal) : Bool {
    appointments.any(func(a) =
      Principal.equal(a.authority, authority) and
      (a.status == #pending or a.status == #accepted)
    );
  };

  // Whether the founding requirements are satisfied: exactly three distinct
  // accepted authorities and a confirmed constitution exists.
  public func foundingRequirementsSatisfied(
    appointments : [Sovereign.FoundingAppointment],
    hasConfirmedConstitution : Bool,
  ) : Bool {
    hasConfirmedConstitution and
    acceptedFoundingAuthorities(appointments).size() >= requiredFoundingAuthorities();
  };

  // ---------------------------------------------------------------------
  // Full activation requirements
  //
  // Activation requires three distinct accepted founding authorities, the
  // same constitution version ratified by all three, and a ratified
  // succession and recovery plan. A confirmed constitution alone is not
  // enough: every accepted authority must ratify both the constitution
  // version and the plan.
  // ---------------------------------------------------------------------

  public func activationRequirementsSatisfied(
    appointments : [Sovereign.FoundingAppointment],
    hasConfirmedConstitution : Bool,
    constitutionRatifiedByAll : Bool,
    planRatified : Bool,
  ) : Bool {
    hasConfirmedConstitution and
    constitutionRatifiedByAll and
    planRatified and
    acceptedFoundingAuthorities(appointments).size() >= requiredFoundingAuthorities();
  };

  // The outstanding activation requirements, as plain-language labels, so
  // the interface can show what is still needed.
  public func outstandingActivationRequirements(
    appointments : [Sovereign.FoundingAppointment],
    hasConfirmedConstitution : Bool,
    constitutionRatifiedByAll : Bool,
    planRatified : Bool,
  ) : [Text] {
    let acc = List.empty<Text>();
    let accepted = acceptedFoundingAuthorities(appointments).size();
    let required = requiredFoundingAuthorities();
    if (accepted < required) {
      acc.add("Founding authorities accepted: " # accepted.toText() # "/" # required.toText());
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

  // ---------------------------------------------------------------------
  // Founding-seat confirmation & launch status
  //
  // The creator's Founding Authority #1 seat is recorded when the Nation is
  // created. These helpers let the creator confirm that existing seat without
  // appointing a second one, and report the launch status in plain language.
  // The three-distinct-authority activation requirement is unchanged.
  // ---------------------------------------------------------------------

  // The caller's own founding seat for a Nation, if the caller holds one.
  // A seat is held when the caller is the appointment's authority and the
  // appointment is pending or accepted.
  public func callerFoundingSeat(
    appointments : [Sovereign.FoundingAppointment],
    caller : Principal,
  ) : ?Sovereign.FoundingAppointment {
    appointments.find(func(a) =
      Principal.equal(a.authority, caller) and
      (a.status == #pending or a.status == #accepted)
    );
  };

  // Whether the caller's existing founding seat can be confirmed: the seat
  // exists, is still pending, and carries no invitation token (an invitation
  // seat is accepted only through its token).
  public func canConfirmFoundingSeat(
    appointments : [Sovereign.FoundingAppointment],
    caller : Principal,
  ) : Bool {
    switch (callerFoundingSeat(appointments, caller)) {
      case (?a) { a.status == #pending and a.invitationToken.size() == 0 };
      case null { false };
    };
  };

  // The plain-language reason a launch cannot continue, or empty when it can.
  // Expired and cancelled setups name what the creator can do next.
  public func launchBlockedReason(
    setup : Sovereign.FoundingSetup,
    now : Sovereign.Timestamp,
  ) : Text {
    switch (setup.status) {
      case (#foundingSetup) {
        if (isSetupExpired(setup, now)) {
          "The founding setup window has expired. Start a fresh founding setup for this Nation to continue."
        } else {
          ""
        };
      };
      case (#activated) { "" };
      case (#expired) {
        "The founding setup expired before activation. Start a fresh founding setup for this Nation to continue."
      };
      case (#cancelled) {
        "The founding setup was cancelled before activation. Start a fresh founding setup for this Nation to continue."
      };
    };
  };

  // Whether a launch can continue from its first unfinished step: the setup
  // is still in Founding Setup and has not expired.
  public func canResumeLaunch(
    setup : Sovereign.FoundingSetup,
    now : Sovereign.Timestamp,
  ) : Bool {
    setup.status == #foundingSetup and not isSetupExpired(setup, now);
  };
};
