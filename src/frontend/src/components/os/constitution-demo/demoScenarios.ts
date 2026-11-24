/**
 * SOVEREIGN OS — Guided "Build Your DAO Constitution" demo scenarios.
 *
 * Every value in this module is fictional and illustrative. It powers the
 * guided demonstration on the public Constitution Builder page: a visitor walks
 * through how a constitution turns choices into permissions, voting and
 * membership workflows. Nothing here is persisted, no backend call is made, and
 * no scenario describes a real organization, member or decision.
 */

/** One step in the guided demonstration. */
export interface DemoStep {
  key: string;
  /** Short label for the step rail. */
  label: string;
  /** One plain-language sentence a 12-year-old could follow. */
  summary: string;
}

/** The guided steps, in order. Each is a self-contained fictional scenario. */
export const demoSteps: DemoStep[] = [
  {
    key: "founding",
    label: "Founding authority",
    summary: "Who sets up the organization, and how three members approve it.",
  },
  {
    key: "voting",
    label: "Voting & membership",
    summary:
      "Who may vote, what happens when someone goes quiet, and how they return.",
  },
  {
    key: "execution",
    label: "Approved decision",
    summary: "A proposal that passed and is waiting for permission to act.",
  },
  {
    key: "revoked",
    label: "Revoked authority",
    summary: "What happens when a permission is taken away.",
  },
  {
    key: "appeals",
    label: "Appeals",
    summary: "How new evidence can reopen a decision.",
  },
  {
    key: "census",
    label: "Participation Census",
    summary: "A live count of who took part, without exposing private choices.",
  },
];

/* ------------------------------------------------------------------ */
/* Step 1 — Founding authority setup and three-member approval         */
/* ------------------------------------------------------------------ */

export interface FoundingApproval {
  member: string;
  role: string;
  /** Whether this member has approved the founding constitution. */
  approved: boolean;
}

/** The fictional founding authority and the three members who must approve. */
export const foundingAuthority = {
  authorityLabel: "Founding Authority",
  authorityName: "The founding council",
  /** Plain-language explanation of the founding window. */
  windowNote:
    "The founding authority sets the first rules. Three members must approve before the constitution takes effect.",
  approvals: [
    { member: "Member A", role: "Elder", approved: true },
    { member: "Member B", role: "Steward", approved: true },
    { member: "Member C", role: "Member", approved: false },
  ] satisfies FoundingApproval[],
};

/* ------------------------------------------------------------------ */
/* Step 2 — Voting eligibility, inactivity and reactivation            */
/* ------------------------------------------------------------------ */

export interface VotingMember {
  member: string;
  /** Plain-language status shown to the reader. */
  status: "Eligible" | "Inactive" | "Reactivated";
  /** One sentence explaining the status. */
  note: string;
}

/** The fictional voting roster, including an inactive and a reactivated member. */
export const votingRoster: VotingMember[] = [
  {
    member: "Member A",
    status: "Eligible",
    note: "Joined before the waiting period ended, so may vote on every proposal.",
  },
  {
    member: "Member B",
    status: "Inactive",
    note: "Has not taken part for 90 days, so voting is paused until they return.",
  },
  {
    member: "Member C",
    status: "Reactivated",
    note: "Returned and confirmed their membership, so voting is active again.",
  },
];

/* ------------------------------------------------------------------ */
/* Step 3 — A passed proposal awaiting execution authorization         */
/* ------------------------------------------------------------------ */

export interface PassedProposal {
  title: string;
  summary: string;
  votesInFavor: number;
  votesAgainst: number;
  /** Plain-language description of the execution state. */
  executionState: string;
  /** The permission the decision still needs before it can act. */
  requiredPermission: string;
}

/** The fictional proposal that passed and is waiting for authorization. */
export const passedProposal: PassedProposal = {
  title: "Fund the community language program",
  summary:
    "Move a share of the treasury to a community-run language program for one year.",
  votesInFavor: 12,
  votesAgainst: 3,
  executionState: "Passed — waiting for execution authorization",
  requiredPermission: "Execution authority",
};

/* ------------------------------------------------------------------ */
/* Step 4 — A revoked authority being denied access                    */
/* ------------------------------------------------------------------ */

export interface RevokedAuthority {
  member: string;
  formerRole: string;
  /** What the member tries to do after the permission is removed. */
  attemptedAction: string;
  /** The plain-language result. */
  result: string;
}

/** The fictional member whose authority was revoked. */
export const revokedAuthority: RevokedAuthority = {
  member: "Member B",
  formerRole: "Treasury Steward",
  attemptedAction: "Approve a treasury payment",
  result: "Denied — the permission was removed, so the action is refused.",
};

/* ------------------------------------------------------------------ */
/* Step 5 — Contradictory evidence entering the appeals process        */
/* ------------------------------------------------------------------ */

export interface AppealEvidenceItem {
  label: string;
  detail: string;
  /** Whether this evidence supports or contradicts the original decision. */
  stance: "supports" | "contradicts";
}

/** The fictional appeal, including the contradictory evidence. */
export const appealScenario = {
  subject: "Membership rejection",
  summary:
    "A member disagrees with a decision and files an appeal. New evidence contradicts the original finding.",
  evidence: [
    {
      label: "Original record",
      detail:
        "The decision was made from the information available at the time.",
      stance: "supports",
    },
    {
      label: "New evidence",
      detail:
        "A document submitted later contradicts the original finding and must be reviewed.",
      stance: "contradicts",
    },
  ] satisfies AppealEvidenceItem[],
  /** Plain-language description of the review state. */
  reviewState: "Under review — the reviewer must weigh the new evidence.",
};

/* ------------------------------------------------------------------ */
/* Step 6 — Live Participation Census                                  */
/* ------------------------------------------------------------------ */

export interface CensusMetric {
  key: string;
  label: string;
  value: number;
  /** The total this metric is measured against. */
  total: number;
  /** One sentence explaining what the metric counts. */
  note: string;
}

/** The fictional live Participation Census. */
export const censusMetrics: CensusMetric[] = [
  {
    key: "eligible",
    label: "Eligible members",
    value: 18,
    total: 18,
    note: "Members who may take part in decisions.",
  },
  {
    key: "active",
    label: "Active members",
    value: 14,
    total: 18,
    note: "Members who took part in the last 90 days.",
  },
  {
    key: "votes",
    label: "Votes cast",
    value: 15,
    total: 18,
    note: "Votes recorded on the current proposal.",
  },
  {
    key: "proposals",
    label: "Proposals",
    value: 6,
    total: 6,
    note: "Proposals put to the community this year.",
  },
  {
    key: "executions",
    label: "Decisions carried out",
    value: 4,
    total: 6,
    note: "Approved decisions that have been executed.",
  },
  {
    key: "disputes",
    label: "Appeals filed",
    value: 1,
    total: 6,
    note: "Decisions a member has asked to have reviewed.",
  },
];

/** The quorum the census is measured against, as a share of eligible members. */
export const censusQuorumPercent = 50;
