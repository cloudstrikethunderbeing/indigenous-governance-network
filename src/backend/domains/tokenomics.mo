import Common "../types/common";
import AccessControl "mo:caffeineai-authorization/access-control";
import Result "mo:core/Result";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Float "mo:core/Float";

// Proposed SOVEREIGN tokenomics domain: token allocation design and the
// proposed four-month halving emission schedule. Both are PROPOSED designs
// only -- nothing here mints, sells, or distributes a real token. Reads are
// available to everyone without sign-in; writes are admin-only and are
// rejected unless the whole configuration still respects the fixed
// 21,000,000 maxSupply.
mixin (
  accessControlState : AccessControl.AccessControlState,
  tokenomicsConfigState : { var config : Common.TokenomicsConfig },
  emissionScheduleState : { var config : Common.EmissionScheduleConfig },
) {

  // Builds the derived per-period emission schedule for a given
  // (initialEmission, halvingIntervalMonths) pair. Each period's emission is
  // exactly half the previous period's (integer division), so the loop
  // always terminates once emission reaches 0 -- it does not assume the
  // series ever reaches maxSupply. remainingSupply floors at 0 so an
  // out-of-bounds (initialEmission, halvingIntervalMonths) pair never traps
  // here; callers that persist a new config must separately reject any pair
  // whose cumulative total would exceed maxSupply.
  func computeSchedule(
    initialEmission : Nat,
    halvingIntervalMonths : Nat,
    maxSupply : Nat,
  ) : [Common.EmissionScheduleEntry] {
    let secondsPerMonth : Nat = 30 * 24 * 60 * 60;
    let nsPerMonth : Nat = secondsPerMonth * 1_000_000_000;
    let periodNs : Nat = halvingIntervalMonths * nsPerMonth;
    let entries = List.empty<Common.EmissionScheduleEntry>();
    var periodIndex = 0;
    var emission = initialEmission;
    var cumulative = 0;
    while (emission > 0) {
      cumulative += emission;
      let remaining = if (cumulative > maxSupply) { 0 } else {
        Nat.sub(maxSupply, cumulative);
      };
      entries.add({
        periodIndex;
        startDate = (periodIndex * periodNs).toInt();
        emission;
        cumulativeReleased = cumulative;
        remainingSupply = remaining;
      });
      periodIndex += 1;
      emission := emission / 2;
    };
    entries.toArray();
  };

  // Queryable, available to everyone without sign-in.
  public query func getTokenomicsConfig() : async Common.TokenomicsConfig {
    tokenomicsConfigState.config;
  };

  // Admin-only. Recomputes the sum of every submitted allocation's
  // percentage and tokenAmount, and rejects the update unless percentages
  // sum to exactly 100% and token amounts sum to exactly the fixed
  // maxSupply (21,000,000).
  public shared ({ caller }) func updateTokenomicsConfig(
    allocations : [Common.TokenAllocation]
  ) : async Result.Result<(), Text> {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update the tokenomics configuration");
    };
    let maxSupply = tokenomicsConfigState.config.maxSupply;
    let sumPercentage = allocations.foldLeft(0.0, func(acc, a) = acc + a.percentage);
    let sumTokenAmount : Nat = allocations.foldLeft(0, func(acc, a) = acc + a.tokenAmount);
    if (not Float.equal(sumPercentage, 100.0, 0.0001) or sumTokenAmount != maxSupply) {
      return #err(
        "Allocation percentages must sum to exactly 100% and token amounts must sum to exactly " # maxSupply.toText() # " tokens"
      );
    };
    tokenomicsConfigState.config := { tokenomicsConfigState.config with allocations };
    #ok(());
  };

  // Queryable, available to everyone without sign-in. The derived schedule
  // is computed from the currently persisted (already-validated) config, so
  // it is always mathematically bounded by the fixed maxSupply.
  public query func getEmissionScheduleConfig() : async Common.EmissionScheduleConfig {
    let cfg = emissionScheduleState.config;
    {
      cfg with schedule = computeSchedule(cfg.initialEmission, cfg.halvingIntervalMonths, cfg.maxSupply)
    };
  };

  // Admin-only. Recomputes the derived schedule for the proposed
  // (initialEmission, halvingIntervalMonths) pair and rejects the update if
  // the resulting cumulative released total would exceed the fixed
  // maxSupply (21,000,000) across the displayed periods.
  public shared ({ caller }) func updateEmissionSchedule(
    initialEmission : Nat,
    halvingIntervalMonths : Nat,
  ) : async Result.Result<(), Text> {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update the emission schedule");
    };
    let maxSupply = emissionScheduleState.config.maxSupply;
    let schedule = computeSchedule(initialEmission, halvingIntervalMonths, maxSupply);
    let cumulativeAtEnd = schedule.foldLeft(
      0,
      func(acc, entry) = if (entry.cumulativeReleased > acc) { entry.cumulativeReleased } else { acc },
    );
    if (cumulativeAtEnd > maxSupply) {
      return #err(
        "This initial emission and halving interval would release more than " # maxSupply.toText() # " tokens across the displayed periods"
      );
    };
    emissionScheduleState.config := {
      initialEmission;
      halvingIntervalMonths;
      maxSupply;
      schedule;
    };
    #ok(());
  };
};
