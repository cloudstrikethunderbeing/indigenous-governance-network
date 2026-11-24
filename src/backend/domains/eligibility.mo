import Sovereign "../types/sovereign";

// ---------------------------------------------------------------------
// DAO Constitution & Governance — Voting eligibility pure helpers.
//
// Everything here is deterministic and side-effect free: the post-admission
// waiting period, the activity requirement with explicitly defined
// qualifying activity, and a result that reports eligibility together with
// the specific reason for any restriction. The stateful endpoints live in
// the governance mixins.
//
// The defaults are the constitutional defaults: an 8-day waiting period
// after admission and a 30-day activity requirement. Both are read from the
// Nation's own constitution, so a Nation that sets a different value is
// governed by that value. A new community is never penalized indefinitely:
// a member inside the waiting period is told exactly when they become
// eligible, and the activity requirement only applies once the waiting
// period has passed.
// ---------------------------------------------------------------------

module {
  // Nanoseconds in one day.
  let nanosPerDay : Int = 86_400_000_000_000;

  // The default waiting period after admission, in days.
  public func defaultWaitingPeriodDays() : Nat {
    8;
  };

  // The default activity requirement, in days.
  public func defaultActivityWindowDays() : Nat {
    30;
  };

  // The qualifying activity kinds that count toward the activity
  // requirement. Explicitly defined: casting a recorded vote, creating a
  // governance proposal, or filing an appeal. Reading the workspace, being
  // admitted, or receiving an approval never counts.
  public func qualifyingActivityKinds() : [Sovereign.CensusEventKind] {
    [#vote, #proposal, #dispute];
  };

  // Whether a census event kind counts as qualifying activity.
  public func isQualifyingActivity(kind : Sovereign.CensusEventKind) : Bool {
    qualifyingActivityKinds().any(func(k) = k == kind);
  };

  // The timestamp at which a member becomes eligible to vote: the admission
  // time plus the constitution's waiting period.
  public func eligibleFrom(admittedAt : Sovereign.Timestamp, waitingPeriodDays : Nat) : Sovereign.Timestamp {
    admittedAt + (waitingPeriodDays * nanosPerDay);
  };

  // Whether the member has qualifying activity within the activity window
  // ending at `now`. `activityTimestamps` are the timestamps of the member's
  // qualifying events.
  public func hasRecentActivity(
    activityTimestamps : [Sovereign.Timestamp],
    now : Sovereign.Timestamp,
    activityWindowDays : Nat,
  ) : Bool {
    let windowStart = now - (activityWindowDays * nanosPerDay);
    activityTimestamps.any(func(t) = t >= windowStart and t <= now);
  };

  // Compute a member's voting eligibility. `admission` is the member's
  // admission record (null when the member has none); `rules` is the
  // constitution in force; `activityTimestamps` are the member's qualifying
  // activity timestamps; `now` is the current time.
  //
  // The waiting period is checked first: a member still inside it is
  // restricted with `#waitingPeriod` and told when they become eligible. Only
  // once the waiting period has passed is the activity requirement applied.
  public func votingEligibility(
    admission : ?Sovereign.MemberAdmission,
    rules : Sovereign.GovernanceRuleSet,
    activityTimestamps : [Sovereign.Timestamp],
    now : Sovereign.Timestamp,
  ) : Sovereign.VotingEligibility {
    switch (admission) {
      case (null) {
        { eligible = false; restriction = ?#notAdmitted; eligibleFrom = null };
      };
      case (?a) {
        let from = eligibleFrom(a.admittedAt, rules.newMemberWaitingPeriodDays);
        if (now < from) {
          { eligible = false; restriction = ?#waitingPeriod; eligibleFrom = ?from };
        } else if (not hasRecentActivity(activityTimestamps, now, defaultActivityWindowDays())) {
          { eligible = false; restriction = ?#inactivity; eligibleFrom = null };
        } else {
          { eligible = true; restriction = null; eligibleFrom = null };
        };
      };
    };
  };
};
