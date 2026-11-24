module {
  // Shared timestamp type. `Time.now()` returns nanoseconds since epoch as a
  // signed Int; every timestamp field in this module uses the same type so
  // arithmetic and comparisons never need a conversion.
  public type Timestamp = Int;

  // ---------------------------------------------------------------------
  // SOVEREIGN Research Credits (SRC) ledger
  //
  // SRC are an internal, non-transferable contribution-tracking unit. They
  // are NOT the proposed SOVEREIGN token and do not represent money — see
  // TokenomicsConfig / EmissionScheduleConfig below for the separate,
  // proposed-only token design.
  // ---------------------------------------------------------------------

  public type SrcTransactionId = Nat;

  public type SrcTransactionType = { #earn; #spend };

  // Links an SRC transaction back to the contribution that earned it or the
  // assignment it was spent commissioning, when applicable.
  public type SrcReference = {
    #contribution : ContributionId;
    #assignment : AssignmentId;
    #none;
  };

  public type SrcTransaction = {
    id : SrcTransactionId;
    member : Principal;
    txType : SrcTransactionType;
    amount : Nat;
    reference : SrcReference;
    timestamp : Timestamp;
  };

  // A member's current SRC balance. Stored per-principal; the full earn/spend
  // history is the SrcTransaction ledger above.
  public type SrcBalance = Nat;

  // ---------------------------------------------------------------------
  // Verified research contributions
  // ---------------------------------------------------------------------

  public type ContributionId = Nat;

  public type ContributionType = {
    #legalLegislativeResearch;
    #courtTreatyResearch;
    #undripAnalysis;
    #sourceVerificationCitationCorrection;
    #expertPeerReview;
    #acceptedChallengeOrCorrection;
  };

  public type ContributionStatus = { #pending; #approved; #rejected };

  public type Contribution = {
    id : ContributionId;
    contributor : Principal;
    contributionType : ContributionType;
    notes : Text;
    links : [Text];
    status : ContributionStatus;
    reviewer : ?Principal;
    rationale : ?Text;
    // Set only once a reviewer approves the contribution.
    srcAwarded : ?Nat;
    timestamp : Timestamp;
  };

  // ---------------------------------------------------------------------
  // Research assignments commissioned or prioritized with SRC
  // ---------------------------------------------------------------------

  public type AssignmentId = Nat;

  public type AssignmentPriority = { #low; #medium; #high; #urgent };

  // #queuedAwaitingFunding reflects the treasury-funding gate: a job may be
  // approved but transparently queued until real operating funds exist.
  public type AssignmentStatus = {
    #queuedAwaitingFunding;
    #queued;
    #inProgress;
    #completed;
  };

  public type Assignment = {
    id : AssignmentId;
    title : Text;
    description : Text;
    requestedBy : Principal;
    priority : AssignmentPriority;
    srcSpent : Nat;
    status : AssignmentStatus;
    timestamp : Timestamp;
  };

  // ---------------------------------------------------------------------
  // Treasury transactions — real operating funds, kept separate from SRC
  // and from the proposed token supply.
  // ---------------------------------------------------------------------

  public type TreasuryTransactionId = Nat;

  public type TreasuryCategory = {
    #fundingReceived;
    #grantOrDonation;
    #institutionalResearchContract;
    #serviceRevenue;
    #aiApiSpend;
    #infrastructureOrStorageCost;
    #approvedResearchBounty;
    #otherOperatingCost;
  };

  public type TreasuryDirection = { #income; #expense };

  public type TreasuryTransaction = {
    id : TreasuryTransactionId;
    category : TreasuryCategory;
    direction : TreasuryDirection;
    amount : Nat;
    description : Text;
    recordedBy : Principal;
    timestamp : Timestamp;
  };

  // ---------------------------------------------------------------------
  // Proposed SOVEREIGN token allocation design.
  //
  // This is a PROPOSED design only — nothing here deploys, mints, sells, or
  // distributes a real token. maxSupply is fixed at 21,000,000; the
  // allocations list must sum to exactly 100% / 21,000,000 tokens.
  // ---------------------------------------------------------------------

  public type AllocationCategory = {
    #daoTreasuryEcosystemReserve;
    #communityAirdrop;
    #researchParticipationRewards;
    #governanceParticipationRewards;
    #stakingNeuronParticipation;
    #adminDeveloperAllocation;
  };

  public type TokenAllocation = {
    category : AllocationCategory;
    // Percentage of maxSupply, e.g. 30.0 for 30%.
    percentage : Float;
    // Exact token count; allocations' tokenAmount values must sum to maxSupply.
    tokenAmount : Nat;
    vestingSchedule : Text;
    lockupPeriod : Text;
    releaseConditions : Text;
    treasuryOversight : Text;
  };

  public type TokenomicsConfig = {
    maxSupply : Nat;
    allocations : [TokenAllocation];
  };

  // ---------------------------------------------------------------------
  // Proposed four-month halving emission schedule.
  //
  // Purely a proposed design: no price, return, or guarantee is implied.
  // The schedule is mathematically bounded by the 21,000,000 maximum supply.
  // ---------------------------------------------------------------------

  public type EmissionScheduleEntry = {
    periodIndex : Nat;
    startDate : Timestamp;
    emission : Nat;
    cumulativeReleased : Nat;
    remainingSupply : Nat;
  };

  public type EmissionScheduleConfig = {
    initialEmission : Nat;
    // Defaults to 4 (months) per the proposed four-month halving cycle.
    halvingIntervalMonths : Nat;
    maxSupply : Nat;
    schedule : [EmissionScheduleEntry];
  };

  // ---------------------------------------------------------------------
  // DAO governance: proposals, votes, delegation
  // ---------------------------------------------------------------------

  public type ProposalId = Nat;

  public type ProposalCategory = {
    #treasuryExpenditure;
    #researchPriority;
    #platformDevelopment;
    #technicalUpgrade;
    #grantsAndRewards;
    #governanceParameters;
  };

  public type ProposalStatus = { #open; #closed; #passed; #rejected };

  public type Proposal = {
    id : ProposalId;
    title : Text;
    description : Text;
    category : ProposalCategory;
    proposer : Principal;
    status : ProposalStatus;
    openTimestamp : Timestamp;
    closeTimestamp : ?Timestamp;
  };

  // One changeable vote per member per proposal — a later vote for the same
  // (proposalId, voter) pair overwrites the earlier one.
  public type VoteChoice = { #inFavor; #against; #abstain };

  public type Vote = {
    proposalId : ProposalId;
    voter : Principal;
    choice : VoteChoice;
    timestamp : Timestamp;
  };

  public type VoteDelegation = {
    delegator : Principal;
    delegate : Principal;
    active : Bool;
    timestamp : Timestamp;
  };

  // ---------------------------------------------------------------------
  // Voluntary, non-custodial staking / governance-maturity design,
  // inspired by ICP NNS neurons and SNS governance. The member always
  // retains control of the underlying asset; nothing here takes custody.
  // ---------------------------------------------------------------------

  public type StakingId = Nat;

  public type StakingStatus = { #active; #matured; #unlocked };

  public type StakingRecord = {
    id : StakingId;
    member : Principal;
    lockedAmount : Nat;
    // Chosen lock duration, in seconds, set by the member at lock time.
    lockTermSeconds : Nat;
    lockStart : Timestamp;
    unlockTime : Timestamp;
    // Transparent, fixed input used to compute time-based maturity / voting
    // power (basis points of lockedAmount accrued over one full lockTerm).
    maturityRateBps : Nat;
    status : StakingStatus;
  };

  // ---------------------------------------------------------------------
  // SOVEREIGN early access waitlist
  //
  // A simple interest list for the pitch site. Registration grants no
  // membership, voting rights, Nation representation or token eligibility.
  // ---------------------------------------------------------------------

  public type WaitlistEntryId = Nat;

  public type WaitlistInterestArea = {
    #indigenousLeadershipAndGovernance;
    #legalResearchAndPolicy;
    #aiAndTechnology;
    #digitalSovereigntyAndDataGovernance;
    #researchParticipation;
    #daoAndEcosystemDevelopment;
    #fundingAndStrategicPartnerships;
  };

  public type WaitlistEntry = {
    id : WaitlistEntryId;
    name : Text;
    email : Text;
    organization : ?Text;
    interestArea : ?WaitlistInterestArea;
    timestamp : Timestamp;
  };

  // Validation failure returned to the caller instead of a trap, so a
  // malformed submission can be corrected and retried.
  public type WaitlistError = {
    #missingName;
    #missingEmail;
    #invalidEmail;
  };

  public type WaitlistSubmitResult = {
    #ok : WaitlistEntryId;
    #err : WaitlistError;
  };

  // ---------------------------------------------------------------------
  // DAO visitor participation experience
  //
  // An additive, clearly-labelled demonstration layer on top of the DAO
  // page. Visitors may participate anonymously (no sign-in required) or
  // optionally sign in with Internet Identity. Nothing here is an official
  // Nation decision, binding vote, or community mandate.
  //
  // Privacy: participation is pseudonymous. A visitor is identified only by
  // a client-generated session identifier; no personal data is collected
  // and no visitor is fingerprinted. An authenticated participant's
  // principal is recorded only when the visitor chooses to sign in.
  // ---------------------------------------------------------------------

  // Client-generated pseudonymous session identifier. Opaque to the
  // backend; used to group a visitor's events and to detect returning
  // visitors without identifying them.
  public type VisitorSessionId = Text;

  // A challenge option the visitor can choose. `optionId` is a stable,
  // admin-assigned identifier; `labelText` is the human-readable text.
  // (`label` is a reserved Motoko keyword, so the field is named `labelText`.)
  public type ChallengeOption = {
    optionId : Nat;
    labelText : Text;
  };

  // The administrator-configurable weekly challenge. Exactly one challenge
  // is active at a time; `weekKey` is an admin-supplied label (for example
  // an ISO week string) used to distinguish successive weekly challenges.
  public type WeeklyChallenge = {
    weekKey : Text;
    question : Text;
    options : [ChallengeOption];
    updatedAt : Timestamp;
  };

  // ---------------------------------------------------------------------
  // Participation events
  //
  // Impressions, starts and completions are recorded as distinct events so
  // the analytics dashboard can report real conversion rather than
  // simulated activity.
  // ---------------------------------------------------------------------

  public type ChallengeImpressionId = Nat;

  // Recorded once when the welcome popup is shown to a visitor.
  public type ChallengeImpression = {
    id : ChallengeImpressionId;
    sessionId : VisitorSessionId;
    // Present only when the visitor was signed in at impression time.
    participant : ?Principal;
    weekKey : Text;
    timestamp : Timestamp;
  };

  public type ChallengeStartId = Nat;

  // Recorded when a visitor opens the interactive challenge.
  public type ChallengeStart = {
    id : ChallengeStartId;
    sessionId : VisitorSessionId;
    participant : ?Principal;
    weekKey : Text;
    timestamp : Timestamp;
  };

  public type ChallengeResponseId = Nat;

  // A completed challenge submission: the chosen option plus optional
  // free-text reasoning. This is a demonstration response, never a binding
  // vote.
  public type ChallengeResponse = {
    id : ChallengeResponseId;
    sessionId : VisitorSessionId;
    participant : ?Principal;
    weekKey : Text;
    optionId : Nat;
    reasoning : ?Text;
    timestamp : Timestamp;
  };

  // ---------------------------------------------------------------------
  // Public discussion
  // ---------------------------------------------------------------------

  public type CommentId = Nat;

  // Moderation state of a public comment. `#visible` comments are shown
  // publicly; `#hidden` comments are retained but withheld from public
  // display; `#removed` comments are deleted from public view by an admin.
  public type CommentModerationStatus = { #visible; #hidden; #removed };

  // A public comment or question submitted after participation. The
  // display name is optional and the participant principal is present only
  // when the visitor chose to sign in.
  public type PublicComment = {
    id : CommentId;
    sessionId : VisitorSessionId;
    participant : ?Principal;
    displayName : ?Text;
    body : Text;
    moderationStatus : CommentModerationStatus;
    // True once any visitor has reported this comment.
    reported : Bool;
    timestamp : Timestamp;
  };

  public type CommentReportId = Nat;

  // A visitor's report of a public comment, for administrator review.
  public type CommentReport = {
    id : CommentReportId;
    commentId : CommentId;
    sessionId : VisitorSessionId;
    reason : ?Text;
    timestamp : Timestamp;
  };

  // ---------------------------------------------------------------------
  // Submission results and errors
  //
  // Validation and authorization failures are returned to the caller as
  // variants rather than traps, so the frontend can present an actionable
  // message and the visitor can retry.
  // ---------------------------------------------------------------------

  public type VisitorError = {
    #missingSessionId;
    #missingBody;
    #bodyTooLong;
    #unknownChallenge;
    #unknownOption;
    #unknownComment;
    #alreadyReported;
    #notAuthorized;
    #invalidChallenge;
  };

  public type RecordImpressionResult = {
    #ok : ChallengeImpressionId;
    #err : VisitorError;
  };

  public type StartChallengeResult = {
    #ok : ChallengeStartId;
    #err : VisitorError;
  };

  public type SubmitChallengeResponseResult = {
    #ok : ChallengeResponseId;
    #err : VisitorError;
  };

  public type SubmitCommentResult = {
    #ok : CommentId;
    #err : VisitorError;
  };

  public type ReportCommentResult = {
    #ok : CommentReportId;
    #err : VisitorError;
  };

  // Administrator operations: configure the weekly challenge and moderate
  // comments. Both require an administrator caller.
  public type ConfigureWeeklyChallengeResult = {
    #ok;
    #err : VisitorError;
  };

  public type ModerateCommentResult = {
    #ok;
    #err : VisitorError;
  };

  // ---------------------------------------------------------------------
  // Administrator analytics
  //
  // All counts are derived from recorded events only — never simulated.
  // ---------------------------------------------------------------------

  // Aggregate engagement counts across all recorded events.
  public type EngagementTotals = {
    impressions : Nat;
    challengeStarts : Nat;
    challengeCompletions : Nat;
    comments : Nat;
    reports : Nat;
  };

  // Participation conversion: how many impressions led to a start and to a
  // completed response. Rates are expressed as percentages (0.0–100.0).
  public type ParticipationConversion = {
    impressions : Nat;
    starts : Nat;
    completions : Nat;
    startRatePercent : Float;
    completionRatePercent : Float;
  };

  // Distribution of completed responses across the challenge's options.
  public type AnswerDistributionEntry = {
    optionId : Nat;
    labelText : Text;
    count : Nat;
  };

  public type AnswerDistribution = {
    weekKey : Text;
    totalResponses : Nat;
    entries : [AnswerDistributionEntry];
  };

  // A single day's participation counts, for trend reporting.
  public type ParticipationTrendPoint = {
    // UTC day label, e.g. "2026-11-10".
    day : Text;
    impressions : Nat;
    starts : Nat;
    completions : Nat;
    comments : Nat;
  };

  // Returning-visitor activity: how many distinct sessions participated
  // more than once, and how many sessions are new.
  public type ReturningVisitorActivity = {
    distinctSessions : Nat;
    returningSessions : Nat;
    newSessions : Nat;
  };

  // The administrator analytics snapshot consumed by the dashboard.
  public type VisitorAnalytics = {
    totals : EngagementTotals;
    conversion : ParticipationConversion;
    answerDistribution : AnswerDistribution;
    recentComments : [PublicComment];
    weeklyTrend : [ParticipationTrendPoint];
    returningVisitors : ReturningVisitorActivity;
    // Completed responses divided by challenge starts, as a percentage.
    completionRatePercent : Float;
  };

  // ---------------------------------------------------------------------
  // Lead pathways
  //
  // Three separate, clearly-distinguished pathways: Free Early Access,
  // Founding Organization and Strategic Funding Partner. None of them is
  // a purchase, financial commitment, equity grant, or promise of
  // ownership. Contact details are private and admin-only.
  // ---------------------------------------------------------------------

  public type LeadId = Nat;

  // The single lead-status vocabulary shared by all three pathways.
  public type LeadStatus = {
    #new;
    #contacted;
    #interested;
    #foundingOrganizationProspect;
    #strategicPartner;
    #converted;
    #notProceeding;
  };

  // Which pathway a lead arrived through.
  public type LeadPathway = {
    #freeEarlyAccess;
    #foundingOrganization;
    #strategicFundingPartner;
  };

  // Organization type for the Free Early Access pathway.
  public type OrganizationType = {
    #indigenousNationOrCommunity;
    #nonProfitOrCharity;
    #cooperative;
    #smallBusiness;
    #enterprise;
    #governmentOrPublicSector;
    #educationalInstitution;
    #other;
  };

  // Intended support category for the Strategic Funding Partner pathway.
  public type FundingSupportType = {
    #grantOrPhilanthropy;
    #strategicPartnership;
    #sponsorship;
    #investmentInterest;
    #other;
  };

  // A single lead record. Only the fields relevant to the pathway that
  // created it are populated; the rest stay `null`. `consentToContact` is
  // required for every pathway — follow-up communication is never assumed.
  public type Lead = {
    id : LeadId;
    pathway : LeadPathway;
    // Free Early Access: the individual's name. Founding / funding: the
    // primary contact's name.
    name : Text;
    email : Text;
    organization : ?Text;
    // Free Early Access only.
    organizationType : ?OrganizationType;
    intendedDaoUseCase : ?Text;
    // Founding Organization only.
    intendedDeployment : ?Text;
    prepaidInterest : ?Bool;
    // Founding Organization and Strategic Funding Partner.
    budgetRange : ?Text;
    // Strategic Funding Partner only.
    intendedSupport : ?FundingSupportType;
    consentToContact : Bool;
    status : LeadStatus;
    // Private administrator note. Never exposed publicly.
    adminNote : ?Text;
    timestamp : Timestamp;
  };

  // ---------------------------------------------------------------------
  // Lead submission results and errors
  // ---------------------------------------------------------------------

  public type LeadError = {
    #missingName;
    #missingEmail;
    #invalidEmail;
    #missingOrganization;
    #missingConsent;
    #unknownLead;
    #notAuthorized;
  };

  public type SubmitLeadResult = {
    #ok : LeadId;
    #err : LeadError;
  };

  public type UpdateLeadResult = {
    #ok;
    #err : LeadError;
  };

  // ---------------------------------------------------------------------
  // Administrator lead views
  // ---------------------------------------------------------------------

  // A per-pathway lead listing with the pathway's aggregate counts.
  public type LeadList = {
    pathway : LeadPathway;
    leads : [Lead];
    total : Nat;
  };

  // Aggregate lead analytics for the admin dashboard.
  public type LeadAnalytics = {
    totalLeads : Nat;
    freeEarlyAccessCount : Nat;
    foundingOrganizationCount : Nat;
    strategicFundingPartnerCount : Nat;
    consentingLeads : Nat;
    prepaidInterestCount : Nat;
    organizationTypeCounts : [(OrganizationType, Nat)];
    statusCounts : [(LeadStatus, Nat)];
  };

  // ---------------------------------------------------------------------
  // Discovery — shared cross-cutting additions
  //
  // The Discovery domain's own record types live in types/discovery.mo.
  // Only the identifiers and vocabulary that other domains or the shared
  // composition root need are declared here.
  // ---------------------------------------------------------------------

  // A community's stable identifier within the Discovery network.
  public type CommunityId = Nat;

  // The classification the advisory intelligence service assigns to a
  // natural-language discovery submission. AI is advisory only: this value
  // never changes governance state.
  public type DiscoveryClassification = {
    #idea;
    #feedback;
    #need;
    #opportunity;
    #potentialProposal;
  };

  // ---------------------------------------------------------------------
  // SOVEREIGN OS — shared cross-cutting additions
  //
  // The Nation workspace domain's own record types live in
  // types/sovereign.mo. Only the identifier that other domains or the shared
  // composition root need is declared here.
  // ---------------------------------------------------------------------

  // A Nation's stable identifier within SOVEREIGN OS.
  public type NationId = Nat;
};
