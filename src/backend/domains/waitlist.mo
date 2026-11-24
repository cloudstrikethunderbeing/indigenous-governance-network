import Common "../types/common";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import EmailClient "mo:caffeineai-email/emailClient";

// SOVEREIGN early access waitlist. Stores interest-list submissions and
// sends a confirmation email to the submitter plus a notification to the
// SOVEREIGN team. Registration grants no membership, voting rights, Nation
// representation or token eligibility.
mixin (
  waitlistEntries : Map.Map<Common.WaitlistEntryId, Common.WaitlistEntry>,
  counters : { var nextWaitlistEntryId : Nat },
) {
  // Team notification address for new waitlist submissions. A constant, not
  // stable state — kept in the mixin body as a transient binding.
  transient let teamNotificationAddress = "waitlist@sovereign.example";

  // Minimal, deliberately permissive email shape check: a non-empty local
  // part, a single "@", and a dotted domain with no whitespace. This is a
  // sanity gate for a demo interest list, not full RFC 5322 validation.
  func isValidEmail(email : Text) : Bool {
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

  public shared func submitWaitlistEntry(
    name : Text,
    email : Text,
    organization : ?Text,
    interestArea : ?Common.WaitlistInterestArea,
  ) : async Common.WaitlistSubmitResult {
    let trimmedName = name.trim(#char ' ');
    let trimmedEmail = email.trim(#char ' ');
    if (trimmedName.size() == 0) {
      return #err(#missingName);
    };
    if (trimmedEmail.size() == 0) {
      return #err(#missingEmail);
    };
    if (not isValidEmail(trimmedEmail)) {
      return #err(#invalidEmail);
    };

    let id = counters.nextWaitlistEntryId;
    counters.nextWaitlistEntryId := id + 1;

    let entry : Common.WaitlistEntry = {
      id;
      name = trimmedName;
      email = trimmedEmail;
      organization;
      interestArea;
      timestamp = Time.now();
    };
    waitlistEntries.add(id, entry);

    // Best-effort notifications. A failed send must never lose the stored
    // entry, so both results are ignored and the submission still succeeds.
    ignore await EmailClient.sendServiceEmail(
      "no-reply",
      [trimmedEmail],
      "You're on the SOVEREIGN early access list",
      "Thank you for your interest in SOVEREIGN.\n\n" #
      "You're on the SOVEREIGN early access list. We'll be in touch as the platform develops.\n\n" #
      "Joining the waitlist does not grant membership, voting rights, Nation representation or token eligibility.",
    );
    ignore await EmailClient.sendServiceEmail(
      "no-reply",
      [teamNotificationAddress],
      "New SOVEREIGN waitlist submission",
      "A new waitlist submission was received.\n\n" #
      "Name: " # trimmedName # "\n" #
      "Email: " # trimmedEmail # "\n" #
      "Organization or Nation: " # (organization ?? "(not provided)") # "\n" #
      "Interest area: " # (switch (interestArea) {
        case (null) "(not provided)";
        case (?area) switch (area) {
          case (#indigenousLeadershipAndGovernance) "Indigenous leadership and governance";
          case (#legalResearchAndPolicy) "Legal research and policy";
          case (#aiAndTechnology) "AI and technology";
          case (#digitalSovereigntyAndDataGovernance) "Digital sovereignty and data governance";
          case (#researchParticipation) "Research participation";
          case (#daoAndEcosystemDevelopment) "DAO and ecosystem development";
          case (#fundingAndStrategicPartnerships) "Funding and strategic partnerships";
        };
      }),
    );

    #ok(id);
  };

  public query func listWaitlistEntries() : async [Common.WaitlistEntry] {
    waitlistEntries.values().toArray();
  };

  public query func getWaitlistCount() : async Nat {
    waitlistEntries.size();
  };
};
