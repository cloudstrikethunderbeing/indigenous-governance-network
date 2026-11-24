import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import EmailClient "mo:caffeineai-email/emailClient";
import Common "../types/common";
import VisitorLib "../lib/visitor";

// Visitor participation experience and lead-capture public API.
//
// Public write surface: anonymous participation (impressions, challenge
// starts, challenge responses), comment submission and comment reporting.
// Public read surface: approved public comments and the current weekly
// challenge. Administrator-only surface: weekly-challenge configuration,
// comment moderation, lead listing/status/notes, and analytics.
mixin (
  accessControlState : AccessControl.AccessControlState,
  challengeImpressions : Map.Map<Nat, Common.ChallengeImpression>,
  challengeStarts : Map.Map<Nat, Common.ChallengeStart>,
  challengeResponses : Map.Map<Nat, Common.ChallengeResponse>,
  publicComments : Map.Map<Nat, Common.PublicComment>,
  commentReports : Map.Map<Nat, Common.CommentReport>,
  weeklyChallengeState : { var challenge : ?Common.WeeklyChallenge },
  leads : Map.Map<Common.LeadId, Common.Lead>,
  counters : {
    var nextChallengeImpressionId : Nat;
    var nextChallengeStartId : Nat;
    var nextChallengeResponseId : Nat;
    var nextCommentId : Nat;
    var nextCommentReportId : Nat;
    var nextLeadId : Nat;
  },
) {
  // Team notification address for new leads. A constant, not stable state —
  // kept in the mixin body as a transient binding. Placeholder until a real
  // SOVEREIGN team address is supplied.
  transient let leadNotificationAddress = "waitlist@sovereign.example";

  // The participant principal recorded on an event: the caller when signed
  // in, null for an anonymous visitor. Anonymous participation is fully
  // supported and never requires sign-in.
  func participantOf(caller : Principal) : ?Principal {
    if (caller.isAnonymous()) { null } else { ?caller };
  };

  // The week key of the active challenge, or "" when none is configured.
  func activeWeekKey() : Text {
    switch (VisitorLib.getActiveChallenge(weeklyChallengeState)) {
      case (?challenge) challenge.weekKey;
      case null "";
    };
  };

  // Minimal, deliberately permissive email shape check: a non-empty local
  // part, a single "@", and a dotted domain with no whitespace. This is a
  // sanity gate for a demo lead form, not full RFC 5322 validation.
  func isValidLeadEmail(email : Text) : Bool {
    let trimmed = email.trim(#char ' ');
    if (trimmed.size() == 0) { return false };
    if (trimmed.contains(#char ' ')) { return false };
    let parts = trimmed.split(#char '@').toArray();
    if (parts.size() != 2) { return false };
    let local = parts[0];
    let domain = parts[1];
    if (local.size() == 0 or domain.size() == 0) { return false };
    let domainParts = domain.split(#char '.').toArray();
    if (domainParts.size() < 2) { return false };
    domainParts.all(func(part) = part.size() > 0);
  };

  // ---------------------------------------------------------------------
  // Public read surface
  // ---------------------------------------------------------------------

  // The currently active weekly challenge, or null when none is configured.
  public query func getWeeklyChallenge() : async ?Common.WeeklyChallenge {
    VisitorLib.getActiveChallenge(weeklyChallengeState);
  };

  // Publicly visible comments, newest first. Hidden and removed comments
  // are never returned.
  public query func listPublicComments() : async [Common.PublicComment] {
    let visible = publicComments.values().filter(
      func(comment) = switch (comment.moderationStatus) {
        case (#visible) true;
        case _ false;
      }
    ).toArray();
    visible.sort(func(a, b) = Int.compare(b.timestamp, a.timestamp));
  };

  // ---------------------------------------------------------------------
  // Public write surface — anonymous participation
  // ---------------------------------------------------------------------

  // Record that the welcome popup was shown to a visitor.
  public shared ({ caller }) func recordChallengeImpression(
    sessionId : Common.VisitorSessionId
  ) : async Common.RecordImpressionResult {
    if (not VisitorLib.isValidSessionId(sessionId)) {
      return #err(#missingSessionId);
    };
    let id = counters.nextChallengeImpressionId;
    counters.nextChallengeImpressionId := id + 1;
    challengeImpressions.add(id, {
      id;
      sessionId = sessionId.trim(#char ' ');
      participant = participantOf(caller);
      weekKey = activeWeekKey();
      timestamp = Time.now();
    });
    #ok(id);
  };

  // Record that a visitor opened the interactive challenge.
  public shared ({ caller }) func startChallenge(
    sessionId : Common.VisitorSessionId
  ) : async Common.StartChallengeResult {
    if (not VisitorLib.isValidSessionId(sessionId)) {
      return #err(#missingSessionId);
    };
    let id = counters.nextChallengeStartId;
    counters.nextChallengeStartId := id + 1;
    challengeStarts.add(id, {
      id;
      sessionId = sessionId.trim(#char ' ');
      participant = participantOf(caller);
      weekKey = activeWeekKey();
      timestamp = Time.now();
    });
    #ok(id);
  };

  // Record a completed challenge submission.
  public shared ({ caller }) func submitChallengeResponse(
    sessionId : Common.VisitorSessionId,
    optionId : Nat,
    reasoning : ?Text,
  ) : async Common.SubmitChallengeResponseResult {
    if (not VisitorLib.isValidSessionId(sessionId)) {
      return #err(#missingSessionId);
    };
    let challenge = switch (VisitorLib.getActiveChallenge(weeklyChallengeState)) {
      case (?challenge) challenge;
      case null { return #err(#unknownChallenge) };
    };
    if (not VisitorLib.isKnownOption(challenge, optionId)) {
      return #err(#unknownOption);
    };
    let id = counters.nextChallengeResponseId;
    counters.nextChallengeResponseId := id + 1;
    challengeResponses.add(id, {
      id;
      sessionId = sessionId.trim(#char ' ');
      participant = participantOf(caller);
      weekKey = challenge.weekKey;
      optionId;
      reasoning;
      timestamp = Time.now();
    });
    #ok(id);
  };

  // Submit a public comment. The display name is optional.
  public shared ({ caller }) func submitPublicComment(
    sessionId : Common.VisitorSessionId,
    displayName : ?Text,
    body : Text,
  ) : async Common.SubmitCommentResult {
    if (not VisitorLib.isValidSessionId(sessionId)) {
      return #err(#missingSessionId);
    };
    let trimmedBody = body.trim(#char ' ');
    if (trimmedBody.size() == 0) {
      return #err(#missingBody);
    };
    if (not VisitorLib.isValidCommentBody(trimmedBody)) {
      return #err(#bodyTooLong);
    };
    let id = counters.nextCommentId;
    counters.nextCommentId := id + 1;
    publicComments.add(id, {
      id;
      sessionId = sessionId.trim(#char ' ');
      participant = participantOf(caller);
      displayName;
      body = trimmedBody;
      moderationStatus = #visible;
      reported = false;
      timestamp = Time.now();
    });
    #ok(id);
  };

  // Report a public comment for administrator review.
  public shared ({ caller }) func reportComment(
    sessionId : Common.VisitorSessionId,
    commentId : Common.CommentId,
    reason : ?Text,
  ) : async Common.ReportCommentResult {
    if (not VisitorLib.isValidSessionId(sessionId)) {
      return #err(#missingSessionId);
    };
    let comment = switch (publicComments.get(commentId)) {
      case (?comment) comment;
      case null { return #err(#unknownComment) };
    };
    let trimmedSession = sessionId.trim(#char ' ');
    // One report per session per comment.
    let alreadyReported = commentReports.values().any(
      func(report) = report.commentId == commentId and report.sessionId == trimmedSession
    );
    if (alreadyReported) {
      return #err(#alreadyReported);
    };
    let id = counters.nextCommentReportId;
    counters.nextCommentReportId := id + 1;
    commentReports.add(id, {
      id;
      commentId;
      sessionId = trimmedSession;
      reason;
      timestamp = Time.now();
    });
    // Flag the comment so administrators can see it needs review.
    publicComments.add(commentId, { comment with reported = true });
    #ok(id);
  };

  // ---------------------------------------------------------------------
  // Administrator-only surface — weekly challenge and moderation
  // ---------------------------------------------------------------------

  // Configure the active weekly challenge. Admin-only.
  public shared ({ caller }) func configureWeeklyChallenge(
    weekKey : Text,
    question : Text,
    options : [Common.ChallengeOption],
  ) : async Common.ConfigureWeeklyChallengeResult {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      return #err(#notAuthorized);
    };
    let trimmedWeekKey = weekKey.trim(#char ' ');
    let trimmedQuestion = question.trim(#char ' ');
    if (trimmedWeekKey.size() == 0 or trimmedQuestion.size() == 0 or options.size() == 0) {
      return #err(#invalidChallenge);
    };
    // Option ids must be unique and labels non-empty.
    let ids = options.map(func(option) = option.optionId);
    let uniqueIds = ids.filter(func(id) = ids.filter(func(other) = other == id).size() == 1);
    if (uniqueIds.size() != ids.size()) {
      return #err(#invalidChallenge);
    };
    if (options.any(func(option) = option.labelText.trim(#char ' ').size() == 0)) {
      return #err(#invalidChallenge);
    };
    weeklyChallengeState.challenge := ?{
      weekKey = trimmedWeekKey;
      question = trimmedQuestion;
      options;
      updatedAt = Time.now();
    };
    #ok;
  };

  // Set a comment's moderation status. Admin-only.
  public shared ({ caller }) func moderateComment(
    commentId : Common.CommentId,
    status : Common.CommentModerationStatus,
  ) : async Common.ModerateCommentResult {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      return #err(#notAuthorized);
    };
    let comment = switch (publicComments.get(commentId)) {
      case (?comment) comment;
      case null { return #err(#unknownComment) };
    };
    publicComments.add(commentId, { comment with moderationStatus = status });
    #ok;
  };

  // ---------------------------------------------------------------------
  // Administrator-only surface — analytics
  // ---------------------------------------------------------------------

  // The full visitor analytics snapshot. Admin-only.
  public query ({ caller }) func getVisitorAnalytics() : async Common.VisitorAnalytics {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view visitor analytics");
    };
    VisitorLib.computeAnalytics(
      weeklyChallengeState,
      challengeImpressions.values().toArray(),
      challengeStarts.values().toArray(),
      challengeResponses.values().toArray(),
      publicComments.values().toArray(),
      commentReports.values().toArray(),
    );
  };

  // ---------------------------------------------------------------------
  // Public write surface — lead capture
  // ---------------------------------------------------------------------

  // Store a validated lead and send best-effort confirmation + team
  // notification emails. A failed send never loses the stored lead and is
  // never reported as a successful send.
  func storeLead(
    pathway : Common.LeadPathway,
    name : Text,
    email : Text,
    organization : ?Text,
    organizationType : ?Common.OrganizationType,
    intendedDaoUseCase : ?Text,
    intendedDeployment : ?Text,
    prepaidInterest : ?Bool,
    budgetRange : ?Text,
    intendedSupport : ?Common.FundingSupportType,
    consentToContact : Bool,
    confirmationSubject : Text,
    confirmationBody : Text,
    teamSubject : Text,
    teamBody : Text,
  ) : async Common.SubmitLeadResult {
    let trimmedName = name.trim(#char ' ');
    let trimmedEmail = email.trim(#char ' ');
    if (trimmedName.size() == 0) {
      return #err(#missingName);
    };
    if (trimmedEmail.size() == 0) {
      return #err(#missingEmail);
    };
    if (not isValidLeadEmail(trimmedEmail)) {
      return #err(#invalidEmail);
    };
    if (not consentToContact) {
      return #err(#missingConsent);
    };

    let id = counters.nextLeadId;
    counters.nextLeadId := id + 1;
    leads.add(id, {
      id;
      pathway;
      name = trimmedName;
      email = trimmedEmail;
      organization;
      organizationType;
      intendedDaoUseCase;
      intendedDeployment;
      prepaidInterest;
      budgetRange;
      intendedSupport;
      consentToContact;
      status = #new;
      adminNote = null;
      timestamp = Time.now();
    });

    // Best-effort notifications. A failed send must never lose the stored
    // lead, so both results are ignored and the submission still succeeds.
    ignore await EmailClient.sendServiceEmail(
      "no-reply",
      [trimmedEmail],
      confirmationSubject,
      confirmationBody,
    );
    ignore await EmailClient.sendServiceEmail(
      "no-reply",
      [leadNotificationAddress],
      teamSubject,
      teamBody,
    );

    #ok(id);
  };

  // Free Early Access registration.
  public shared func submitEarlyAccessLead(
    name : Text,
    email : Text,
    organization : ?Text,
    organizationType : ?Common.OrganizationType,
    intendedDaoUseCase : ?Text,
    consentToContact : Bool,
  ) : async Common.SubmitLeadResult {
    await storeLead(
      #freeEarlyAccess,
      name,
      email,
      organization,
      organizationType,
      intendedDaoUseCase,
      null,
      null,
      null,
      null,
      consentToContact,
      "Your SOVEREIGN free early access registration",
      "Thank you for registering for free early access to the SOVEREIGN DAO platform.\n\n" #
      "We'll share development updates, early-access consideration and feedback opportunities.\n\n" #
      "This is a demonstration platform. Registering does not grant membership, voting rights, Nation representation or token eligibility.",
      "New SOVEREIGN free early access registration",
      "A new free early access registration was received.\n\n" #
      "Name: " # name.trim(#char ' ') # "\n" #
      "Email: " # email.trim(#char ' ') # "\n" #
      "Organization: " # (organization ?? "(not provided)") # "\n" #
      "Organization type: " # (switch (organizationType) {
        case (null) "(not provided)";
        case (?t) switch (t) {
          case (#indigenousNationOrCommunity) "Indigenous Nation or community";
          case (#nonProfitOrCharity) "Non-profit or charity";
          case (#cooperative) "Cooperative";
          case (#smallBusiness) "Small business";
          case (#enterprise) "Enterprise";
          case (#governmentOrPublicSector) "Government or public sector";
          case (#educationalInstitution) "Educational institution";
          case (#other) "Other";
        };
      }) # "\n" #
      "Intended DAO use case: " # (intendedDaoUseCase ?? "(not provided)"),
    );
  };

  // Founding Organization expression of interest.
  public shared func submitFoundingOrganizationLead(
    organization : Text,
    contactName : Text,
    email : Text,
    intendedDeployment : ?Text,
    prepaidInterest : ?Bool,
    budgetRange : ?Text,
    consentToContact : Bool,
  ) : async Common.SubmitLeadResult {
    let trimmedOrganization = organization.trim(#char ' ');
    if (trimmedOrganization.size() == 0) {
      return #err(#missingOrganization);
    };
    await storeLead(
      #foundingOrganization,
      contactName,
      email,
      ?trimmedOrganization,
      null,
      null,
      intendedDeployment,
      prepaidInterest,
      budgetRange,
      null,
      consentToContact,
      "Your SOVEREIGN Founding Organization interest",
      "Thank you for expressing interest in becoming a SOVEREIGN Founding Organization.\n\n" #
      "This is an expression of interest, not a purchase or financial commitment. " #
      "Final pricing, deliverables, access periods, refund conditions and legal terms will be established before any payment is accepted.",
      "New SOVEREIGN Founding Organization interest",
      "A new Founding Organization expression of interest was received.\n\n" #
      "Organization: " # trimmedOrganization # "\n" #
      "Contact: " # contactName.trim(#char ' ') # "\n" #
      "Email: " # email.trim(#char ' ') # "\n" #
      "Intended deployment: " # (intendedDeployment ?? "(not provided)") # "\n" #
      "Prepaid interest: " # (switch (prepaidInterest) {
        case (null) "(not provided)";
        case (?true) "yes";
        case (?false) "no";
      }) # "\n" #
      "Budget range: " # (budgetRange ?? "(not provided)"),
    );
  };

  // Strategic Funding Partner inquiry.
  public shared func submitStrategicFundingLead(
    contactName : Text,
    organization : ?Text,
    email : Text,
    intendedSupport : ?Common.FundingSupportType,
    budgetRange : ?Text,
    consentToContact : Bool,
  ) : async Common.SubmitLeadResult {
    await storeLead(
      #strategicFundingPartner,
      contactName,
      email,
      organization,
      null,
      null,
      null,
      null,
      budgetRange,
      intendedSupport,
      consentToContact,
      "Your SOVEREIGN strategic funding inquiry",
      "Thank you for your interest in supporting SOVEREIGN as a strategic funding partner.\n\n" #
      "We'll be in touch to discuss development, partnerships and the broader Indigenous Governance Network / SOVEREIGN initiative.\n\n" #
      "This is an inquiry only. It does not promise equity, returns or ownership.",
      "New SOVEREIGN strategic funding inquiry",
      "A new strategic funding and partnership inquiry was received.\n\n" #
      "Contact: " # contactName.trim(#char ' ') # "\n" #
      "Organization: " # (organization ?? "(not provided)") # "\n" #
      "Email: " # email.trim(#char ' ') # "\n" #
      "Intended support: " # (switch (intendedSupport) {
        case (null) "(not provided)";
        case (?t) switch (t) {
          case (#grantOrPhilanthropy) "Grant or philanthropy";
          case (#strategicPartnership) "Strategic partnership";
          case (#sponsorship) "Sponsorship";
          case (#investmentInterest) "Investment interest";
          case (#other) "Other";
        };
      }) # "\n" #
      "Budget range: " # (budgetRange ?? "(not provided)"),
    );
  };

  // ---------------------------------------------------------------------
  // Administrator-only surface — lead management
  // ---------------------------------------------------------------------

  // List leads for one pathway, newest first. Admin-only.
  public query ({ caller }) func listLeads(
    pathway : Common.LeadPathway
  ) : async Common.LeadList {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view leads");
    };
    let matching = leads.values().filter(
      func(lead) = switch (lead.pathway, pathway) {
        case (#freeEarlyAccess, #freeEarlyAccess) true;
        case (#foundingOrganization, #foundingOrganization) true;
        case (#strategicFundingPartner, #strategicFundingPartner) true;
        case _ false;
      }
    ).toArray();
    let sorted = matching.sort(func(a, b) = Int.compare(b.timestamp, a.timestamp));
    {
      pathway;
      leads = sorted;
      total = sorted.size();
    };
  };

  // Update a lead's status. Admin-only.
  public shared ({ caller }) func updateLeadStatus(
    leadId : Common.LeadId,
    status : Common.LeadStatus,
  ) : async Common.UpdateLeadResult {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      return #err(#notAuthorized);
    };
    let lead = switch (leads.get(leadId)) {
      case (?lead) lead;
      case null { return #err(#unknownLead) };
    };
    leads.add(leadId, { lead with status });
    #ok;
  };

  // Save a private administrator note on a lead. Admin-only.
  public shared ({ caller }) func saveLeadNote(
    leadId : Common.LeadId,
    note : ?Text,
  ) : async Common.UpdateLeadResult {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      return #err(#notAuthorized);
    };
    let lead = switch (leads.get(leadId)) {
      case (?lead) lead;
      case null { return #err(#unknownLead) };
    };
    leads.add(leadId, { lead with adminNote = note });
    #ok;
  };

  // Aggregate lead analytics. Admin-only.
  public query ({ caller }) func getLeadAnalytics() : async Common.LeadAnalytics {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view lead analytics");
    };
    VisitorLib.computeLeadAnalytics(leads.values().toArray());
  };
};
