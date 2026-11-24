import Common "../types/common";
import Int "mo:core/Int";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";

// Visitor participation experience domain logic.
//
// Pure helpers over the visitor-engagement state: recording impressions,
// starts and responses, submitting and moderating public comments,
// reporting comments, configuring the weekly challenge, and computing
// administrator analytics. All counts are derived from recorded events
// only — never simulated.
module {
  // Maximum accepted comment length, in characters.
  let maxCommentLength : Nat = 2000;

  // Nanoseconds in one UTC day.
  let nanosPerDay : Int = 86_400_000_000_000;

  // ---------------------------------------------------------------------
  // Validation helpers
  // ---------------------------------------------------------------------

  // A session identifier is required for every anonymous participation
  // event. Returns true when the trimmed id is non-empty.
  public func isValidSessionId(sessionId : Common.VisitorSessionId) : Bool {
    sessionId.trim(#char ' ').size() > 0;
  };

  // Comment bodies must be non-empty after trimming and within the
  // published maximum length.
  public func isValidCommentBody(body : Text) : Bool {
    let trimmed = body.trim(#char ' ');
    trimmed.size() > 0 and trimmed.size() <= maxCommentLength;
  };

  // ---------------------------------------------------------------------
  // Weekly challenge
  // ---------------------------------------------------------------------

  // The currently active weekly challenge, or null when an administrator
  // has not configured one yet.
  public func getActiveChallenge(
    weeklyChallengeState : { var challenge : ?Common.WeeklyChallenge }
  ) : ?Common.WeeklyChallenge {
    weeklyChallengeState.challenge;
  };

  // True when `optionId` is one of the active challenge's options.
  public func isKnownOption(challenge : Common.WeeklyChallenge, optionId : Nat) : Bool {
    challenge.options.any(func(option) = option.optionId == optionId);
  };

  // ---------------------------------------------------------------------
  // Analytics
  // ---------------------------------------------------------------------

  // Aggregate engagement counts across all recorded events.
  public func computeEngagementTotals(
    impressions : [Common.ChallengeImpression],
    starts : [Common.ChallengeStart],
    responses : [Common.ChallengeResponse],
    comments : [Common.PublicComment],
    reports : [Common.CommentReport],
  ) : Common.EngagementTotals {
    {
      impressions = impressions.size();
      challengeStarts = starts.size();
      challengeCompletions = responses.size();
      comments = comments.size();
      reports = reports.size();
    };
  };

  // Percentage of `part` out of `whole`, as a Float in 0.0–100.0. Returns
  // 0.0 when `whole` is zero so the dashboard never divides by zero.
  func percent(part : Nat, whole : Nat) : Float {
    if (whole == 0) { return 0.0 };
    part.toFloat() / whole.toFloat() * 100.0;
  };

  // Participation conversion: impressions -> starts -> completions, with
  // rates expressed as percentages (0.0–100.0).
  public func computeConversion(
    impressions : [Common.ChallengeImpression],
    starts : [Common.ChallengeStart],
    responses : [Common.ChallengeResponse],
  ) : Common.ParticipationConversion {
    let impressionCount = impressions.size();
    let startCount = starts.size();
    let completionCount = responses.size();
    {
      impressions = impressionCount;
      starts = startCount;
      completions = completionCount;
      startRatePercent = percent(startCount, impressionCount);
      completionRatePercent = percent(completionCount, startCount);
    };
  };

  // Distribution of completed responses across the active challenge's
  // options.
  public func computeAnswerDistribution(
    challenge : Common.WeeklyChallenge,
    responses : [Common.ChallengeResponse],
  ) : Common.AnswerDistribution {
    let entries = challenge.options.map(
      func(option) = {
        optionId = option.optionId;
        labelText = option.labelText;
        count = responses.filter(func(response) = response.optionId == option.optionId).size();
      }
    );
    {
      weekKey = challenge.weekKey;
      totalResponses = responses.size();
      entries;
    };
  };

  // Distinct-session returning-visitor activity across all recorded events.
  // A session is "returning" when it appears in more than one recorded
  // event; a session seen exactly once is "new".
  public func computeReturningVisitors(
    impressions : [Common.ChallengeImpression],
    starts : [Common.ChallengeStart],
    responses : [Common.ChallengeResponse],
    comments : [Common.PublicComment],
  ) : Common.ReturningVisitorActivity {
    let counts = Map.empty<Text, Nat>();
    func bump(sessionId : Text) {
      let next = switch (counts.get(sessionId)) {
        case (?n) n + 1;
        case null 1;
      };
      counts.add(sessionId, next);
    };
    for (impression in impressions.values()) { bump(impression.sessionId) };
    for (start in starts.values()) { bump(start.sessionId) };
    for (response in responses.values()) { bump(response.sessionId) };
    for (comment in comments.values()) { bump(comment.sessionId) };

    var returning = 0;
    var newSessions = 0;
    for (count in counts.values()) {
      if (count > 1) { returning += 1 } else { newSessions += 1 };
    };
    {
      distinctSessions = counts.size();
      returningSessions = returning;
      newSessions;
    };
  };

  // UTC day label ("YYYY-MM-DD") for a nanosecond timestamp. Negative
  // timestamps (pre-1970) are clamped to the epoch day. Uses Int arithmetic
  // so no Nat subtraction can trap.
  func dayLabel(timestamp : Int) : Text {
    let dayIndex = if (timestamp < 0) { 0 } else { timestamp / nanosPerDay };
    // Civil-from-days algorithm (Howard Hinnant), valid for the proleptic
    // Gregorian calendar.
    let z = dayIndex + 719_468;
    let era = z / 146_097;
    let doe = z - era * 146_097;
    let yoe = (doe - doe / 1460 + doe / 36_524 - doe / 146_096) / 365;
    let y = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = if (mp < 10) { mp + 3 } else { mp - 9 };
    let year = if (m <= 2) { y + 1 } else { y };
    pad4(year.toNat()) # "-" # pad2(m.toNat()) # "-" # pad2(d.toNat());
  };

  func pad2(n : Nat) : Text {
    if (n < 10) { "0" # n.toText() } else { n.toText() };
  };

  func pad4(n : Nat) : Text {
    var s = n.toText();
    while (s.size() < 4) { s := "0" # s };
    s;
  };

  // Per-UTC-day participation counts for trend reporting, oldest day first.
  public func computeWeeklyTrend(
    impressions : [Common.ChallengeImpression],
    starts : [Common.ChallengeStart],
    responses : [Common.ChallengeResponse],
    comments : [Common.PublicComment],
  ) : [Common.ParticipationTrendPoint] {
    let days = Map.empty<Text, { var impressions : Nat; var starts : Nat; var completions : Nat; var comments : Nat }>();
    func bucket(day : Text) : { var impressions : Nat; var starts : Nat; var completions : Nat; var comments : Nat } {
      switch (days.get(day)) {
        case (?b) b;
        case null {
          let b = { var impressions = 0; var starts = 0; var completions = 0; var comments = 0 };
          days.add(day, b);
          b;
        };
      };
    };
    for (impression in impressions.values()) {
      bucket(dayLabel(impression.timestamp)).impressions += 1;
    };
    for (start in starts.values()) {
      bucket(dayLabel(start.timestamp)).starts += 1;
    };
    for (response in responses.values()) {
      bucket(dayLabel(response.timestamp)).completions += 1;
    };
    for (comment in comments.values()) {
      bucket(dayLabel(comment.timestamp)).comments += 1;
    };

    let points = days.entries().map(
      func((day, b)) = {
        day;
        impressions = b.impressions;
        starts = b.starts;
        completions = b.completions;
        comments = b.comments;
      }
    ).toArray();
    points.sort(func(a, b) = Text.compare(a.day, b.day));
  };

  // The full administrator analytics snapshot.
  public func computeAnalytics(
    weeklyChallengeState : { var challenge : ?Common.WeeklyChallenge },
    impressions : [Common.ChallengeImpression],
    starts : [Common.ChallengeStart],
    responses : [Common.ChallengeResponse],
    comments : [Common.PublicComment],
    reports : [Common.CommentReport],
  ) : Common.VisitorAnalytics {
    let totals = computeEngagementTotals(impressions, starts, responses, comments, reports);
    let conversion = computeConversion(impressions, starts, responses);
    let answerDistribution = switch (getActiveChallenge(weeklyChallengeState)) {
      case (?challenge) computeAnswerDistribution(challenge, responses);
      case null {
        {
          weekKey = "";
          totalResponses = responses.size();
          entries = [];
        };
      };
    };
    // Recent comments: newest first, capped at 50 for the dashboard.
    let sortedComments = comments.sort(func(a, b) = Int.compare(b.timestamp, a.timestamp));
    let recentComments = if (sortedComments.size() > 50) {
      sortedComments.sliceToArray(0, 50);
    } else {
      sortedComments;
    };
    {
      totals;
      conversion;
      answerDistribution;
      recentComments;
      weeklyTrend = computeWeeklyTrend(impressions, starts, responses, comments);
      returningVisitors = computeReturningVisitors(impressions, starts, responses, comments);
      completionRatePercent = percent(responses.size(), starts.size());
    };
  };

  // ---------------------------------------------------------------------
  // Lead analytics
  // ---------------------------------------------------------------------

  // All organization-type tags, in a fixed order, so the analytics output
  // is stable and every tag is reported (including zero counts).
  let allOrganizationTypes : [Common.OrganizationType] = [
    #indigenousNationOrCommunity,
    #nonProfitOrCharity,
    #cooperative,
    #smallBusiness,
    #enterprise,
    #governmentOrPublicSector,
    #educationalInstitution,
    #other,
  ];

  // All lead-status tags, in a fixed order.
  let allLeadStatuses : [Common.LeadStatus] = [
    #new,
    #contacted,
    #interested,
    #foundingOrganizationProspect,
    #strategicPartner,
    #converted,
    #notProceeding,
  ];

  // Aggregate lead analytics across all three pathways.
  public func computeLeadAnalytics(leads : [Common.Lead]) : Common.LeadAnalytics {
    var freeEarlyAccess = 0;
    var foundingOrganization = 0;
    var strategicFundingPartner = 0;
    var consenting = 0;
    var prepaidInterest = 0;

    for (lead in leads.values()) {
      switch (lead.pathway) {
        case (#freeEarlyAccess) { freeEarlyAccess += 1 };
        case (#foundingOrganization) { foundingOrganization += 1 };
        case (#strategicFundingPartner) { strategicFundingPartner += 1 };
      };
      if (lead.consentToContact) { consenting += 1 };
      switch (lead.prepaidInterest) {
        case (?true) { prepaidInterest += 1 };
        case _ {};
      };
    };

    let organizationTypeCounts = allOrganizationTypes.map(
      func(orgType) = (
        orgType,
        leads.filter(
          func(lead) = switch (lead.organizationType) {
            case (?t) t == orgType;
            case null false;
          }
        ).size(),
      )
    );
    let statusCounts = allLeadStatuses.map(
      func(status) = (status, leads.filter(func(lead) = lead.status == status).size())
    );

    {
      totalLeads = leads.size();
      freeEarlyAccessCount = freeEarlyAccess;
      foundingOrganizationCount = foundingOrganization;
      strategicFundingPartnerCount = strategicFundingPartner;
      consentingLeads = consenting;
      prepaidInterestCount = prepaidInterest;
      organizationTypeCounts;
      statusCounts;
    };
  };
};
