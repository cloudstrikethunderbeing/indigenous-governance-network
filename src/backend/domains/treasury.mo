import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";

// Live, publicly-readable treasury transparency summary. Every figure here
// is derived solely from recorded TreasuryTransaction entries — nothing is
// auto-pulled from real ICP cycle balances or AI API usage; all entries are
// admin-entered, and figures are exactly zero until a real transaction
// exists.
mixin (
  accessControlState : AccessControl.AccessControlState,
  treasuryTransactions : Map.Map<Common.TreasuryTransactionId, Common.TreasuryTransaction>,
  counters : { var nextTreasuryTransactionId : Nat },
) {
  type TreasurySummary = {
    fundingReceived : Nat;
    grantsAndDonations : Nat;
    institutionalResearchContracts : Nat;
    serviceRevenue : Nat;
    aiApiSpend : Nat;
    infrastructureAndStorageCost : Nat;
    approvedResearchBounties : Nat;
    otherOperatingCost : Nat;
    totalIncome : Nat;
    totalExpense : Nat;
    // totalIncome - totalExpense; signed because expenses can exceed income.
    currentBalance : Int;
    // Sum of expense-direction transactions recorded in the trailing 30 days.
    monthlyOperatingCost : Nat;
    // currentBalance / monthlyOperatingCost, in months. Null when there is no
    // recent expense history to project a burn rate from (not "infinite").
    runwayMonths : ?Nat;
  };

  // Admin-only: records a real operating-fund transaction. Treasury figures
  // are manually entered by an admin, never auto-metered from live ICP
  // cycle/AI-spend data.
  public shared ({ caller }) func recordTreasuryTransaction(
    category : Common.TreasuryCategory,
    direction : Common.TreasuryDirection,
    amount : Nat,
    description : Text,
  ) : async Common.TreasuryTransaction {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can record treasury transactions");
    };
    let id = counters.nextTreasuryTransactionId;
    counters.nextTreasuryTransactionId += 1;
    let transaction : Common.TreasuryTransaction = {
      id;
      category;
      direction;
      amount;
      description;
      recordedBy = caller;
      timestamp = Time.now();
    };
    treasuryTransactions.add(id, transaction);
    transaction;
  };

  // Public, no sign-in required: treasury transparency is public. Newest
  // first.
  public query func listTreasuryTransactions() : async [Common.TreasuryTransaction] {
    treasuryTransactions.values().sort(
      func(a, b) = if (a.timestamp > b.timestamp) { #less } else if (a.timestamp < b.timestamp) {
        #greater
      } else { #equal }
    ).toArray();
  };

  // Public, no sign-in required: live-computed from recorded transactions
  // only. Every figure is exactly zero until a matching transaction exists.
  public query func getTreasurySummary() : async TreasurySummary {
    var fundingReceived = 0;
    var grantsAndDonations = 0;
    var institutionalResearchContracts = 0;
    var serviceRevenue = 0;
    var aiApiSpend = 0;
    var infrastructureAndStorageCost = 0;
    var approvedResearchBounties = 0;
    var otherOperatingCost = 0;
    var totalIncome = 0;
    var totalExpense = 0;
    var monthlyOperatingCost = 0;

    let now = Time.now();
    // 30 days, in nanoseconds (Time.now() unit).
    let windowStart = now - 2_592_000_000_000_000;

    for (transaction in treasuryTransactions.values()) {
      switch (transaction.category) {
        case (#fundingReceived) { fundingReceived += transaction.amount };
        case (#grantOrDonation) { grantsAndDonations += transaction.amount };
        case (#institutionalResearchContract) {
          institutionalResearchContracts += transaction.amount;
        };
        case (#serviceRevenue) { serviceRevenue += transaction.amount };
        case (#aiApiSpend) { aiApiSpend += transaction.amount };
        case (#infrastructureOrStorageCost) {
          infrastructureAndStorageCost += transaction.amount;
        };
        case (#approvedResearchBounty) {
          approvedResearchBounties += transaction.amount;
        };
        case (#otherOperatingCost) { otherOperatingCost += transaction.amount };
      };
      switch (transaction.direction) {
        case (#income) { totalIncome += transaction.amount };
        case (#expense) {
          totalExpense += transaction.amount;
          if (transaction.timestamp >= windowStart) {
            monthlyOperatingCost += transaction.amount;
          };
        };
      };
    };

    let currentBalance : Int = totalIncome.toInt() - totalExpense.toInt();
    let runwayMonths : ?Nat = if (monthlyOperatingCost == 0) {
      null;
    } else {
      let balanceNat = if (currentBalance <= 0) { 0 } else {
        currentBalance.toNat();
      };
      ?(balanceNat / monthlyOperatingCost);
    };

    {
      fundingReceived;
      grantsAndDonations;
      institutionalResearchContracts;
      serviceRevenue;
      aiApiSpend;
      infrastructureAndStorageCost;
      approvedResearchBounties;
      otherOperatingCost;
      totalIncome;
      totalExpense;
      currentBalance;
      monthlyOperatingCost;
      runwayMonths;
    };
  };
};
