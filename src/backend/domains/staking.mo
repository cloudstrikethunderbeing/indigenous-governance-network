import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";

// Voluntary, non-custodial staking of internal governance-participation
// points. Locking is purely a bookkeeping record: the DAO never takes
// custody of any real asset, mints nothing, and promises no return. A
// member picks one of a fixed set of preset lock terms; longer terms accrue
// a higher proposed maturity/voting-power rate. This is a proposed,
// configurable design — the preset menu below is an example starting point
// for governance review, not a final parameter set.
mixin (
  stakingRecords : Map.Map<Common.StakingId, Common.StakingRecord>,
  counters : { var nextStakingId : Nat },
  accessControlState : AccessControl.AccessControlState,
) {
  type StakePreset = {
    termSeconds : Nat;
    // Basis points of lockedAmount accrued as maturity once the full term
    // has elapsed. Mirrors StakingRecord.maturityRateBps.
    maturityRateBps : Nat;
    termLabel : Text;
  };

  transient let stakePresets : [StakePreset] = [
    { termSeconds = 7_776_000; maturityRateBps = 500; termLabel = "3 months" },
    { termSeconds = 15_552_000; maturityRateBps = 1_200; termLabel = "6 months" },
    { termSeconds = 31_536_000; maturityRateBps = 3_000; termLabel = "12 months" },
    { termSeconds = 63_072_000; maturityRateBps = 7_000; termLabel = "24 months" },
  ];

  func findStakePreset(termSeconds : Nat) : ?StakePreset {
    stakePresets.find(func p = p.termSeconds == termSeconds);
  };

  // A StakingRecord plus the transparent, time-based values computed from it.
  // `status` is the stored lifecycle value (only ever #active or #unlocked —
  // this mixin never persists #matured). `effectiveStatus` additionally
  // reports #matured once the unlock time has passed but the member has not
  // yet called unlockStake, so listings can show active / matured / unlocked
  // without a separate background job.
  type StakingView = {
    id : Common.StakingId;
    member : Principal;
    lockedAmount : Nat;
    lockTermSeconds : Nat;
    lockStart : Common.Timestamp;
    unlockTime : Common.Timestamp;
    maturityRateBps : Nat;
    status : Common.StakingStatus;
    effectiveStatus : Common.StakingStatus;
    // Nat accrued maturity, in the same units as lockedAmount, linearly
    // accrued from 0 at lockStart to (lockedAmount * maturityRateBps / 10_000)
    // at unlockTime, capped at the full term.
    accruedMaturity : Nat;
    // Simple additive voting power: lockedAmount + accruedMaturity. A
    // transparent placeholder model, not a guarantee of any future reward or
    // return.
    votingPower : Nat;
  };

  func computeView(record : Common.StakingRecord, now : Common.Timestamp) : StakingView {
    let elapsedSeconds : Nat = if (now <= record.lockStart) {
      0;
    } else {
      ((now - record.lockStart) / 1_000_000_000).toNat();
    };
    let cappedElapsed = if (elapsedSeconds > record.lockTermSeconds) {
      record.lockTermSeconds;
    } else {
      elapsedSeconds;
    };
    let accruedBps = if (record.lockTermSeconds == 0) {
      record.maturityRateBps;
    } else {
      (record.maturityRateBps * cappedElapsed) / record.lockTermSeconds;
    };
    let accruedMaturity = (record.lockedAmount * accruedBps) / 10_000;
    let votingPower = record.lockedAmount + accruedMaturity;
    let effectiveStatus : Common.StakingStatus = switch (record.status) {
      case (#unlocked) { #unlocked };
      case (_) {
        if (elapsedSeconds >= record.lockTermSeconds) { #matured } else {
          #active;
        };
      };
    };
    {
      id = record.id;
      member = record.member;
      lockedAmount = record.lockedAmount;
      lockTermSeconds = record.lockTermSeconds;
      lockStart = record.lockStart;
      unlockTime = record.unlockTime;
      maturityRateBps = record.maturityRateBps;
      status = record.status;
      effectiveStatus;
      accruedMaturity;
      votingPower;
    };
  };

  public query func listStakePresets() : async [StakePreset] {
    stakePresets;
  };

  public shared ({ caller }) func lockStake(amount : Nat, termSeconds : Nat) : async Common.StakingRecord {
    if (AccessControl.getUserRole(accessControlState, caller) == #guest) {
      Runtime.trap("Sign in and register before staking.");
    };
    if (amount == 0) {
      Runtime.trap("Staked amount must be greater than zero.");
    };
    let preset = findStakePreset(termSeconds) ?? Runtime.trap("Unsupported lock term. Choose one of the published preset terms.");
    let id = counters.nextStakingId;
    counters.nextStakingId += 1;
    let lockStart = Time.now();
    let record : Common.StakingRecord = {
      id;
      member = caller;
      lockedAmount = amount;
      lockTermSeconds = preset.termSeconds;
      lockStart;
      unlockTime = lockStart + preset.termSeconds * 1_000_000_000;
      maturityRateBps = preset.maturityRateBps;
      status = #active;
    };
    stakingRecords.add(id, record);
    record;
  };

  // A member's own stakes — active, matured, and unlocked — in a single
  // history list, newest lock first. No one can list another member's
  // stakes.
  public query ({ caller }) func listMyStakes() : async [StakingView] {
    if (AccessControl.getUserRole(accessControlState, caller) == #guest) {
      Runtime.trap("Sign in and register to view your stakes.");
    };
    let now = Time.now();
    let mine = stakingRecords.values().filter(func r = r.member == caller).toArray();
    let sorted = mine.sort(func (a, b) = if (a.lockStart > b.lockStart) { #less } else if (a.lockStart < b.lockStart) { #greater } else { #equal });
    sorted.map(func r = computeView(r, now));
  };

  public shared ({ caller }) func unlockStake(id : Common.StakingId) : async Common.StakingRecord {
    if (AccessControl.getUserRole(accessControlState, caller) == #guest) {
      Runtime.trap("Sign in and register before unlocking a stake.");
    };
    let record = stakingRecords.get(id) ?? Runtime.trap("Stake not found.");
    if (record.member != caller) {
      Runtime.trap("You may only unlock your own stake.");
    };
    if (record.status == #unlocked) {
      Runtime.trap("Stake is already unlocked.");
    };
    if (Time.now() < record.unlockTime) {
      Runtime.trap("Stake has not reached its unlock time yet.");
    };
    let updated : Common.StakingRecord = { record with status = #unlocked };
    ignore stakingRecords.replace(id, updated);
    updated;
  };
};
