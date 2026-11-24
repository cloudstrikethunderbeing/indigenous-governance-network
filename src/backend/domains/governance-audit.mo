import Sovereign "../types/sovereign";

// ---------------------------------------------------------------------
// DAO Constitution & Governance — append-only governance history helpers.
//
// Everything here is deterministic and side-effect free: the vocabulary of
// recorded governance events and the construction of a history entry. The
// stateful endpoints append entries through these helpers; entries are never
// deleted or rewritten, so the history is a complete audit trail of
// appointments, acceptances, approvals, rejections, votes and constitutional
// amendments.
// ---------------------------------------------------------------------

module {
  // The governance history event kinds, in display order.
  public func historyKinds() : [Sovereign.GovernanceHistoryKind] {
    [#appointment, #acceptance, #approval, #rejection, #vote, #amendment];
  };

  // Build one append-only governance history entry. The caller supplies the
  // id from the shared counter and the constitution version in force.
  public func newEntry(
    id : Sovereign.GovernanceHistoryId,
    nation : Sovereign.NationId,
    kind : Sovereign.GovernanceHistoryKind,
    actorPrincipal : Principal,
    referenceId : Nat,
    summary : Text,
    constitutionVersion : Nat,
    timestamp : Sovereign.Timestamp,
  ) : Sovereign.GovernanceHistoryEntry {
    {
      id;
      nation;
      kind;
      actorPrincipal;
      referenceId;
      summary;
      constitutionVersion;
      timestamp;
    };
  };

  // The single-use invitation token for a founding appointment. Derived from
  // the appointment id and the issuing time so it is unique per appointment
  // and not guessable from the id alone.
  public func invitationToken(appointmentId : Nat, issuedAt : Sovereign.Timestamp) : Text {
    "founding-" # appointmentId.toText() # "-" # issuedAt.toText();
  };

  // Whether an invitation token is present (a non-empty token).
  public func hasInvitationToken(token : Text) : Bool {
    token.size() > 0;
  };
};
