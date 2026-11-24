import Set "mo:core/Set";
import Principal "mo:core/Principal";
import Sovereign "../types/sovereign";

// Participation Census — pure domain helpers.
//
// The Participation Census is a privacy-aware governance accountability
// record: who is eligible, who participates, what decisions are made and
// whether approved actions are executed. Everything here is deterministic and
// side-effect free; the mixin in `mixins/census-api.mo` owns the endpoints and
// the stable state.
//
// Privacy: a confidential entry records that participation occurred without
// ever exposing the individual's choice. The stored summary of a confidential
// entry is never returned by a read — it is replaced with a neutral
// placeholder. Historical entries are never deleted, so a past decision stays
// readable under the constitution version that governed it.
module {
  // The result of recording a census entry.
  public type RecordCensusResult = {
    #ok : Sovereign.CensusEntryId;
    #err : Sovereign.GovernanceError;
  };

  // The neutral summary returned in place of a confidential entry's stored
  // detail. A confidential entry records that participation occurred without
  // exposing how the individual voted.
  public let confidentialSummary : Text = "Confidential participation recorded";

  // Redact a census entry for reading. A confidential entry's stored summary
  // is never returned: it is replaced with a neutral placeholder so the
  // individual's choice is never exposed. Every other field is preserved, so
  // participation is still recorded and the entry still counts toward the
  // summary.
  public func redactEntry(entry : Sovereign.CensusEntry) : Sovereign.CensusEntry {
    if (entry.confidential) {
      { entry with summary = confidentialSummary };
    } else {
      entry;
    };
  };

  // Validate a census entry's summary. Returns the first validation error, or
  // null when the entry is acceptable.
  public func validateSummary(summary : Text) : ?Sovereign.GovernanceError {
    if (summary.size() == 0) { return ?#missingSummary };
    null;
  };

  // Compute a Nation's Participation Census summary from its census entries.
  // `eligibleMembers` is the Nation's current member count; `activeMembers` is
  // the number of distinct members with at least one recorded census event.
  // Only entries belonging to `nation` are counted.
  public func computeSummary(
    nation : Sovereign.NationId,
    entries : [Sovereign.CensusEntry],
    eligibleMembers : Nat,
  ) : Sovereign.CensusSummary {
    var proposals = 0;
    var votes = 0;
    var delegations = 0;
    var disputes = 0;
    var executions = 0;
    let subjects = Set.empty<Principal>();
    for (e in entries.values()) {
      if (e.nation == nation) {
        switch (e.kind) {
          case (#proposal) { proposals += 1 };
          case (#vote) { votes += 1 };
          case (#delegation) { delegations += 1 };
          case (#dispute) { disputes += 1 };
          case (#executionOutcome) { executions += 1 };
          case (_) {};
        };
        subjects.add(e.subject);
      };
    };
    {
      nation;
      eligibleMembers;
      activeMembers = subjects.size();
      proposals;
      votes;
      delegations;
      disputes;
      executions;
    };
  };
};
