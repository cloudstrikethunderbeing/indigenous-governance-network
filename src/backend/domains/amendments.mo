import List "mo:core/List";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Sovereign "../types/sovereign";

// ---------------------------------------------------------------------
// DAO Constitution & Governance — Constitutional amendments pure helpers.
//
// Everything here is deterministic and side-effect free: the default
// amendment thresholds, the field-level change application onto a rule set,
// the enhanced-safeguard classification, the vote tally and the outcome
// computation. The stateful endpoints live in mixins/constitution-api.mo.
//
// An amendment is approved under the constitution in force when it was
// proposed (its `baseConstitutionVersion`), never under a later one, and it
// never retroactively alters pending decisions or completed votes. A new
// constitution version is created only after ratification.
// ---------------------------------------------------------------------

module {
  // The default amendment approval threshold, as a whole percentage. Subject
  // to the constitution's defined quorum.
  public func defaultApprovalThresholdPercent() : Nat {
    75;
  };

  // The default amendment quorum, as a whole percentage. Used only when the
  // constitution does not define one.
  public func defaultQuorumPercent() : Nat {
    50;
  };

  // The enhanced approval threshold applied to amendments that touch
  // recovery, dissolution or a fundamental governance safeguard. Higher than
  // the ordinary amendment threshold so those safeguards cannot be lowered
  // by an ordinary amendment.
  public func enhancedApprovalThresholdPercent() : Nat {
    90;
  };

  // The rule-set fields that are fundamental governance safeguards. An
  // amendment that changes any of these requires enhanced approval, and an
  // amendment that would lower one of them is rejected without it.
  public func safeguardFields() : [Text] {
    [
      "governanceRecoveryProcedure",
      "dissolutionProcedure",
      "emergencyPauseProcedure",
      "amendmentProcedure",
      "quorumPercent",
      "approvalThresholdPercent",
      "membershipApprovalThresholdPercent",
      "abstentionsCount",
      "tieBreakRule",
      "dataExportProcedure",
    ];
  };

  // Whether a field name is a fundamental governance safeguard.
  public func isSafeguardField(fieldName : Text) : Bool {
    safeguardFields().any(func(f) = f == fieldName);
  };

  // Whether any of the proposed changes touches a fundamental safeguard.
  public func touchesSafeguard(changes : [Sovereign.RuleChange]) : Bool {
    changes.any(func(c) = isSafeguardField(c.fieldName));
  };

  // The approval threshold an amendment must meet: the enhanced threshold
  // when it touches a safeguard, otherwise the ordinary amendment threshold.
  public func requiredApprovalThreshold(changes : [Sovereign.RuleChange], ordinaryThreshold : Nat) : Nat {
    if (touchesSafeguard(changes)) {
      let enhanced = enhancedApprovalThresholdPercent();
      if (enhanced > ordinaryThreshold) { enhanced } else { ordinaryThreshold };
    } else {
      ordinaryThreshold;
    };
  };

  // ---------------------------------------------------------------------
  // Field-level change application
  //
  // A change names a rule-set field and its before/after values as text. The
  // before value must match the current rule set, so a stale or forged
  // change is rejected rather than silently applied. Numeric and boolean
  // fields are parsed from their text form; an unparseable value is
  // rejected.
  // ---------------------------------------------------------------------

  // Parse a whole non-negative number from text, or null when the text is
  // not a plain decimal number.
  func parseNat(value : Text) : ?Nat {
    if (value.size() == 0) { return null };
    var acc : Nat = 0;
    for (c in value.toIter()) {
      let digit = switch (c) {
        case ('0') { 0 };
        case ('1') { 1 };
        case ('2') { 2 };
        case ('3') { 3 };
        case ('4') { 4 };
        case ('5') { 5 };
        case ('6') { 6 };
        case ('7') { 7 };
        case ('8') { 8 };
        case ('9') { 9 };
        case (_) { return null };
      };
      acc := acc * 10 + digit;
    };
    ?acc;
  };

  // Parse a boolean from its text form ("true" / "false").
  func parseBool(value : Text) : ?Bool {
    if (value == "true") { return ?true };
    if (value == "false") { return ?false };
    null;
  };

  // Render a Nat as text.
  func natText(value : Nat) : Text {
    value.toText();
  };

  // Render a Bool as text.
  func boolText(value : Bool) : Text {
    if (value) { "true" } else { "false" };
  };

  // Render a text array as a comma-separated list.
  func textArrayText(values : [Text]) : Text {
    values.values().join(",");
  };

  // Parse a comma-separated list into a text array. An empty string yields
  // an empty array.
  func parseTextArray(value : Text) : [Text] {
    if (value.size() == 0) { return [] };
    value.split(#char ',').toArray();
  };

  // The current text value of a rule-set field, or null when the field name
  // is not a known rule-set field.
  public func fieldValue(rules : Sovereign.GovernanceRuleSet, fieldName : Text) : ?Text {
    switch (fieldName) {
      case ("foundingAuthorityProcedure") { ?rules.foundingAuthorityProcedure };
      case ("membershipEligibility") { ?rules.membershipEligibility };
      case ("identityVerification") { ?rules.identityVerification };
      case ("membershipApprovalThresholdPercent") { ?natText(rules.membershipApprovalThresholdPercent) };
      case ("loginRequirement") { ?rules.loginRequirement };
      case ("participationRequirement") { ?rules.participationRequirement };
      case ("votingEligibility") { ?rules.votingEligibility };
      case ("newMemberWaitingPeriodDays") { ?natText(rules.newMemberWaitingPeriodDays) };
      case ("votingMethod") { ?rules.votingMethod };
      case ("delegationAllowed") { ?boolText(rules.delegationAllowed) };
      case ("votingWeight") { ?rules.votingWeight };
      case ("proposalSubmissionPeriodDays") { ?natText(rules.proposalSubmissionPeriodDays) };
      case ("proposalReviewPeriodDays") { ?natText(rules.proposalReviewPeriodDays) };
      case ("proposalDiscussionPeriodDays") { ?natText(rules.proposalDiscussionPeriodDays) };
      case ("quorumPercent") { ?natText(rules.quorumPercent) };
      case ("approvalThresholdPercent") { ?natText(rules.approvalThresholdPercent) };
      case ("abstentionsCount") { ?boolText(rules.abstentionsCount) };
      case ("tieBreakRule") { ?rules.tieBreakRule };
      case ("proposalClassifications") { ?textArrayText(rules.proposalClassifications) };
      case ("approvalOutcomes") { ?textArrayText(rules.approvalOutcomes) };
      case ("treasurySpendLimit") { ?natText(rules.treasurySpendLimit) };
      case ("treasuryAuthorization") { ?rules.treasuryAuthorization };
      case ("leadershipElectionProcedure") { ?rules.leadershipElectionProcedure };
      case ("leadershipTermDays") { ?natText(rules.leadershipTermDays) };
      case ("leadershipRemovalProcedure") { ?rules.leadershipRemovalProcedure };
      case ("documentAccess") { ?rules.documentAccess };
      case ("confidentialityRule") { ?rules.confidentialityRule };
      case ("aiPermissions") { ?rules.aiPermissions };
      case ("humanOversight") { ?rules.humanOversight };
      case ("appealsProcedure") { ?rules.appealsProcedure };
      case ("disputeProcedure") { ?rules.disputeProcedure };
      case ("evidenceReviewProcedure") { ?rules.evidenceReviewProcedure };
      case ("emergencyPauseProcedure") { ?rules.emergencyPauseProcedure };
      case ("governanceRecoveryProcedure") { ?rules.governanceRecoveryProcedure };
      case ("amendmentProcedure") { ?rules.amendmentProcedure };
      case ("collaborationDataSharing") { ?rules.collaborationDataSharing };
      case ("dissolutionProcedure") { ?rules.dissolutionProcedure };
      case ("dataExportProcedure") { ?rules.dataExportProcedure };
      case (_) { null };
    };
  };

  // Apply one field-level change to a rule set. Returns the updated rule set,
  // or null when the field is unknown, the before value does not match the
  // current value, or the after value cannot be parsed for the field's type.
  public func applyChange(rules : Sovereign.GovernanceRuleSet, change : Sovereign.RuleChange) : ?Sovereign.GovernanceRuleSet {
    let current = switch (fieldValue(rules, change.fieldName)) {
      case (?v) { v };
      case null { return null };
    };
    if (current != change.beforeValue) { return null };
    let after = change.afterValue;
    switch (change.fieldName) {
      case ("foundingAuthorityProcedure") { ?{ rules with foundingAuthorityProcedure = after } };
      case ("membershipEligibility") { ?{ rules with membershipEligibility = after } };
      case ("identityVerification") { ?{ rules with identityVerification = after } };
      case ("membershipApprovalThresholdPercent") {
        switch (parseNat(after)) {
          case (?n) { ?{ rules with membershipApprovalThresholdPercent = n } };
          case null { null };
        };
      };
      case ("loginRequirement") { ?{ rules with loginRequirement = after } };
      case ("participationRequirement") { ?{ rules with participationRequirement = after } };
      case ("votingEligibility") { ?{ rules with votingEligibility = after } };
      case ("newMemberWaitingPeriodDays") {
        switch (parseNat(after)) {
          case (?n) { ?{ rules with newMemberWaitingPeriodDays = n } };
          case null { null };
        };
      };
      case ("votingMethod") { ?{ rules with votingMethod = after } };
      case ("delegationAllowed") {
        switch (parseBool(after)) {
          case (?b) { ?{ rules with delegationAllowed = b } };
          case null { null };
        };
      };
      case ("votingWeight") { ?{ rules with votingWeight = after } };
      case ("proposalSubmissionPeriodDays") {
        switch (parseNat(after)) {
          case (?n) { ?{ rules with proposalSubmissionPeriodDays = n } };
          case null { null };
        };
      };
      case ("proposalReviewPeriodDays") {
        switch (parseNat(after)) {
          case (?n) { ?{ rules with proposalReviewPeriodDays = n } };
          case null { null };
        };
      };
      case ("proposalDiscussionPeriodDays") {
        switch (parseNat(after)) {
          case (?n) { ?{ rules with proposalDiscussionPeriodDays = n } };
          case null { null };
        };
      };
      case ("quorumPercent") {
        switch (parseNat(after)) {
          case (?n) { ?{ rules with quorumPercent = n } };
          case null { null };
        };
      };
      case ("approvalThresholdPercent") {
        switch (parseNat(after)) {
          case (?n) { ?{ rules with approvalThresholdPercent = n } };
          case null { null };
        };
      };
      case ("abstentionsCount") {
        switch (parseBool(after)) {
          case (?b) { ?{ rules with abstentionsCount = b } };
          case null { null };
        };
      };
      case ("tieBreakRule") { ?{ rules with tieBreakRule = after } };
      case ("proposalClassifications") { ?{ rules with proposalClassifications = parseTextArray(after) } };
      case ("approvalOutcomes") { ?{ rules with approvalOutcomes = parseTextArray(after) } };
      case ("treasurySpendLimit") {
        switch (parseNat(after)) {
          case (?n) { ?{ rules with treasurySpendLimit = n } };
          case null { null };
        };
      };
      case ("treasuryAuthorization") { ?{ rules with treasuryAuthorization = after } };
      case ("leadershipElectionProcedure") { ?{ rules with leadershipElectionProcedure = after } };
      case ("leadershipTermDays") {
        switch (parseNat(after)) {
          case (?n) { ?{ rules with leadershipTermDays = n } };
          case null { null };
        };
      };
      case ("leadershipRemovalProcedure") { ?{ rules with leadershipRemovalProcedure = after } };
      case ("documentAccess") { ?{ rules with documentAccess = after } };
      case ("confidentialityRule") { ?{ rules with confidentialityRule = after } };
      case ("aiPermissions") { ?{ rules with aiPermissions = after } };
      case ("humanOversight") { ?{ rules with humanOversight = after } };
      case ("appealsProcedure") { ?{ rules with appealsProcedure = after } };
      case ("disputeProcedure") { ?{ rules with disputeProcedure = after } };
      case ("evidenceReviewProcedure") { ?{ rules with evidenceReviewProcedure = after } };
      case ("emergencyPauseProcedure") { ?{ rules with emergencyPauseProcedure = after } };
      case ("governanceRecoveryProcedure") { ?{ rules with governanceRecoveryProcedure = after } };
      case ("amendmentProcedure") { ?{ rules with amendmentProcedure = after } };
      case ("collaborationDataSharing") { ?{ rules with collaborationDataSharing = after } };
      case ("dissolutionProcedure") { ?{ rules with dissolutionProcedure = after } };
      case ("dataExportProcedure") { ?{ rules with dataExportProcedure = after } };
      case (_) { null };
    };
  };

  // Apply every change in order. Returns the updated rule set, or null when
  // any change is invalid (unknown field, stale before value or unparseable
  // after value).
  public func applyChanges(rules : Sovereign.GovernanceRuleSet, changes : [Sovereign.RuleChange]) : ?Sovereign.GovernanceRuleSet {
    var current = rules;
    for (change in changes.values()) {
      let next = switch (applyChange(current, change)) {
        case (?r) { r };
        case null { return null };
      };
      current := next;
    };
    ?current;
  };

  // Whether a proposed change would lower a fundamental safeguard. A
  // safeguard is lowered when a numeric safeguard field's after value is
  // below its before value, or when a safeguard procedure text is emptied.
  public func lowersSafeguard(change : Sovereign.RuleChange) : Bool {
    if (not isSafeguardField(change.fieldName)) { return false };
    switch (parseNat(change.beforeValue), parseNat(change.afterValue)) {
      case (?before, ?after) { after < before };
      case (_, _) {
        // A procedure text safeguard is lowered when it is emptied.
        change.afterValue.size() == 0 and change.beforeValue.size() > 0;
      };
    };
  };

  // Whether any proposed change lowers a fundamental safeguard.
  public func anyLowersSafeguard(changes : [Sovereign.RuleChange]) : Bool {
    changes.any(func(c) = lowersSafeguard(c));
  };

  // ---------------------------------------------------------------------
  // Vote tally and outcome
  // ---------------------------------------------------------------------

  // The distinct ratifying authorities recorded on an amendment proposal.
  public func ratifierCount(ratifications : [Sovereign.PlanRatification]) : Nat {
    let acc = List.empty<Principal>();
    for (r in ratifications.values()) {
      if (not acc.any(func(p) = Principal.equal(p, r.authority))) {
        acc.add(r.authority);
      };
    };
    acc.size();
  };

  // Whether a principal has already ratified the amendment.
  public func hasRatified(ratifications : [Sovereign.PlanRatification], authority : Principal) : Bool {
    ratifications.any(func(r) = Principal.equal(r.authority, authority));
  };

  // The outcome of an amendment vote, computed against the eligible voter
  // count and the proposal's own captured thresholds.
  //
  // Denominator rules:
  // - Quorum is measured against the eligible voter count. When abstentions
  //   count toward quorum, every recorded ratification counts; otherwise only
  //   in-favor and against ratifications count. (An amendment ratification is
  //   a yes; a rejection is recorded by the proposal being rejected, so the
  //   tally here is the set of ratifying authorities.)
  // - The approval denominator is the eligible voter count, or — when
  //   abstentions are excluded from the denominator — the eligible count
  //   minus abstentions. Since a ratification is an approval, abstentions do
  //   not appear in the ratification list; the denominator is therefore the
  //   eligible count in both modes, and the difference is only in quorum.
  public func outcome(
    eligibleVoters : Nat,
    ratifications : Nat,
    quorumPercent : Nat,
    approvalThresholdPercent : Nat,
  ) : Sovereign.ProposalOutcome {
    if (eligibleVoters == 0) { return #noQuorum };
    // Quorum: ratifications / eligible >= quorumPercent / 100.
    let quorumScaled = eligibleVoters * quorumPercent;
    let quorumMet = ratifications * 100 >= quorumScaled;
    if (not quorumMet) { return #noQuorum };
    // Approval: ratifications / eligible >= approvalThresholdPercent / 100.
    let approvalScaled = eligibleVoters * approvalThresholdPercent;
    let approved = ratifications * 100 >= approvalScaled;
    if (approved) { #approved } else { #rejected };
  };

  // Whether the voting deadline has passed at `now`.
  public func isDeadlinePassed(deadline : Sovereign.Timestamp, now : Sovereign.Timestamp) : Bool {
    now >= deadline;
  };
};
