/**
 * SOVEREIGN OS — sample Nation workspace data.
 *
 * Everything in this module is static, in-memory and illustrative. It is the
 * clearly-labelled simulated sample Nation that the SOVEREIGN OS workspace
 * surfaces read on first load, so a visitor can open a Nation workspace
 * immediately without signing in. Nothing here is persisted, no backend call
 * is made, and no figure represents a real community, member, document,
 * proposal, event or treasury position.
 */

/** Prominent disclosure shown across every SOVEREIGN OS workspace surface. */
export const sampleNationNotice =
  "SIMULATED SAMPLE NATION — ILLUSTRATIVE DATA, NOT A REAL COMMUNITY";

/** Plain-language explanation of what a Nation workspace is. */
export const nationWorkspaceExplanation =
  "A Nation workspace is a private, community-controlled home for a Nation's governance, discussions, documents, calendar and treasury. Each Nation decides what stays private and what it shares.";

/** The sample Nation identity. */
export interface SampleNation {
  /**
   * Fallback id used only when the backend cannot be reached. The live sample
   * Nation id is a backend-owned sentinel returned by `ensureSampleWorkspace()`
   * and resolved through `useSampleNationId()`; never treat this value as the
   * authoritative id.
   */
  id: number;
  name: string;
  shortDescription: string;
  region: string;
  governanceModel: string;
  privacyLabel: string;
  openToCollaboration: boolean;
}

/**
 * The sample Nation's fallback id, used only when the backend call that seeds
 * the sample workspace cannot complete. The authoritative id comes from the
 * backend via `useSampleNationId()`.
 */
export const sampleNationFallbackId = 1;

export const sampleNation: SampleNation = {
  id: sampleNationFallbackId,
  name: "Cedar River Nation",
  shortDescription:
    "A self-governing Nation coordinating research, land stewardship and community decisions in one workspace.",
  region: "Pacific Northwest",
  governanceModel: "Consensus council",
  privacyLabel: "Private to members",
  openToCollaboration: true,
};

/** The sample workspace itself. */
export interface SampleWorkspace {
  id: number;
  name: string;
  description: string;
}

export const sampleWorkspace: SampleWorkspace = {
  id: 1,
  name: "Cedar River Workspace",
  description:
    "Governance, research and community operations for the Cedar River Nation.",
};

/** A workspace app entry shown on the desktop and in the dock. */
export interface SampleWorkspaceApp {
  id: number;
  appKey: string;
  displayName: string;
  oneLineDescription: string;
  status: "working" | "preview";
  iconKey: string;
  order: number;
}

export const sampleWorkspaceApps: SampleWorkspaceApp[] = [
  {
    id: 1,
    appKey: "dashboard",
    displayName: "Dashboard",
    oneLineDescription: "The Nation's workspace at a glance.",
    status: "working",
    iconKey: "dashboard",
    order: 1,
  },
  {
    id: 2,
    appKey: "governance",
    displayName: "Governance",
    oneLineDescription: "Proposals, votes and decisions.",
    status: "working",
    iconKey: "governance",
    order: 2,
  },
  {
    id: 3,
    appKey: "discussions",
    displayName: "Discussions",
    oneLineDescription: "Community conversation threads.",
    status: "working",
    iconKey: "discussions",
    order: 3,
  },
  {
    id: 4,
    appKey: "members",
    displayName: "Members",
    oneLineDescription: "Who belongs to the Nation and their roles.",
    status: "working",
    iconKey: "members",
    order: 4,
  },
  {
    id: 5,
    appKey: "documents",
    displayName: "Documents",
    oneLineDescription: "Shared records and community knowledge.",
    status: "working",
    iconKey: "documents",
    order: 5,
  },
  {
    id: 6,
    appKey: "calendar",
    displayName: "Calendar",
    oneLineDescription: "Meetings, gatherings and events.",
    status: "working",
    iconKey: "calendar",
    order: 6,
  },
  {
    id: 7,
    appKey: "treasury",
    displayName: "Treasury",
    oneLineDescription: "Community income, spending and balance.",
    status: "working",
    iconKey: "treasury",
    order: 7,
  },
  {
    id: 8,
    appKey: "copilot",
    displayName: "AI Copilot",
    oneLineDescription: "Ask questions about the workspace.",
    status: "preview",
    iconKey: "copilot",
    order: 8,
  },
  {
    id: 9,
    appKey: "projects",
    displayName: "Projects",
    oneLineDescription: "Research and community initiatives.",
    status: "preview",
    iconKey: "projects",
    order: 9,
  },
  {
    id: 10,
    appKey: "conservation",
    displayName: "Conservation",
    oneLineDescription: "Land, water and stewardship records.",
    status: "preview",
    iconKey: "conservation",
    order: 10,
  },
  {
    id: 11,
    appKey: "settings",
    displayName: "Nation Settings",
    oneLineDescription: "Governance model, roles and privacy.",
    status: "working",
    iconKey: "settings",
    order: 11,
  },
  {
    id: 12,
    appKey: "network",
    displayName: "SOVEREIGN Network",
    oneLineDescription: "Nations open to collaboration.",
    status: "preview",
    iconKey: "network",
    order: 12,
  },
];

/** A Nation proposal with a vote tally. */
export interface SampleProposal {
  id: number;
  title: string;
  summary: string;
  status: "open" | "passed" | "rejected" | "draft" | "withdrawn";
  votesInFavor: number;
  votesAgainst: number;
  votesAbstain: number;
}

export const sampleProposals: SampleProposal[] = [
  {
    id: 1,
    title: "Adopt a community data-control charter",
    summary:
      "Require every project to follow a community-approved charter before collecting or sharing data.",
    status: "open",
    votesInFavor: 214,
    votesAgainst: 58,
    votesAbstain: 12,
  },
  {
    id: 2,
    title: "Fund a water-rights research brief",
    summary:
      "Commission a plain-language brief on regional water-rights legislation.",
    status: "open",
    votesInFavor: 186,
    votesAgainst: 74,
    votesAbstain: 9,
  },
  {
    id: 3,
    title: "Recognise the youth council as a standing body",
    summary:
      "Give the youth council a permanent seat in community decision processes.",
    status: "passed",
    votesInFavor: 231,
    votesAgainst: 41,
    votesAbstain: 6,
  },
];

/** A discussion thread with its posts. */
export interface SampleThread {
  id: number;
  title: string;
  author: string;
  posts: { id: number; author: string; body: string }[];
}

export const sampleThreads: SampleThread[] = [
  {
    id: 1,
    title: "How should we share research with other Nations?",
    author: "Aiyana Redcloud",
    posts: [
      {
        id: 1,
        author: "Aiyana Redcloud",
        body: "I think we start with a shared summary and keep the underlying data private until each Nation agrees.",
      },
      {
        id: 2,
        author: "Marcus Whitecloud",
        body: "Agreed. The charter should make the default private and sharing an explicit choice.",
      },
    ],
  },
  {
    id: 2,
    title: "Planning the spring gathering",
    author: "Lena Blackfeather",
    posts: [
      {
        id: 1,
        author: "Lena Blackfeather",
        body: "Proposing the second weekend of April. Please add anything the calendar should hold.",
      },
    ],
  },
];

/** A Nation member with a role and permission labels. */
export interface SampleMember {
  id: number;
  displayName: string;
  roleLabel: string;
  permissionLabels: string[];
}

export const sampleMembers: SampleMember[] = [
  {
    id: 1,
    displayName: "Aiyana Redcloud",
    roleLabel: "Council member",
    permissionLabels: ["Proposals", "Documents", "Treasury view"],
  },
  {
    id: 2,
    displayName: "Marcus Whitecloud",
    roleLabel: "Research lead",
    permissionLabels: ["Documents", "Projects"],
  },
  {
    id: 3,
    displayName: "Lena Blackfeather",
    roleLabel: "Community coordinator",
    permissionLabels: ["Calendar", "Discussions"],
  },
  {
    id: 4,
    displayName: "Jonas Littlebear",
    roleLabel: "Treasurer",
    permissionLabels: ["Treasury view", "Treasury edit"],
  },
];

/** A Nation document. */
export interface SampleDocument {
  id: number;
  title: string;
  body: string;
  author: string;
}

export const sampleDocuments: SampleDocument[] = [
  {
    id: 1,
    title: "Community data-control charter (draft)",
    body: "Every project must record what data it collects, why, who may access it, and how long it is kept. Sharing outside the Nation requires explicit community approval.",
    author: "Aiyana Redcloud",
  },
  {
    id: 2,
    title: "Water-rights research brief",
    body: "A plain-language summary of regional water-rights legislation and its implications for the Nation's stewardship responsibilities.",
    author: "Marcus Whitecloud",
  },
  {
    id: 3,
    title: "Spring gathering notes",
    body: "Decisions from the planning meeting, including the proposed date and the volunteer coordination list.",
    author: "Lena Blackfeather",
  },
];

/** A calendar event. */
export interface SampleEvent {
  id: number;
  title: string;
  description: string;
  /** ISO date-time string for the event start. */
  startTime: string;
  /** ISO date-time string for the event end. */
  endTime: string;
  location: string;
}

export const sampleEvents: SampleEvent[] = [
  {
    id: 1,
    title: "Council session",
    description: "Monthly governance session and proposal review.",
    startTime: "2026-04-11T10:00:00",
    endTime: "2026-04-11T12:00:00",
    location: "Community hall",
  },
  {
    id: 2,
    title: "Research briefing",
    description: "Presentation of the water-rights research brief.",
    startTime: "2026-04-18T14:00:00",
    endTime: "2026-04-18T15:30:00",
    location: "Online",
  },
  {
    id: 3,
    title: "Spring gathering",
    description: "Community gathering and stewardship planning.",
    startTime: "2026-04-25T09:00:00",
    endTime: "2026-04-25T17:00:00",
    location: "Riverside grounds",
  },
];

/** A Nation treasury transaction. */
export interface SampleTransaction {
  id: number;
  direction: "income" | "expense";
  category: string;
  amount: number;
  description: string;
}

export const sampleTransactions: SampleTransaction[] = [
  {
    id: 1,
    direction: "income",
    category: "Grant",
    amount: 42000,
    description: "Research grant for water-rights work",
  },
  {
    id: 2,
    direction: "expense",
    category: "Research",
    amount: 12500,
    description: "Commissioned legal research brief",
  },
  {
    id: 3,
    direction: "expense",
    category: "Operations",
    amount: 3800,
    description: "Workspace infrastructure and storage",
  },
  {
    id: 4,
    direction: "income",
    category: "Service",
    amount: 6400,
    description: "Collaboration research service",
  },
];

/** The Nation treasury summary derived from the sample transactions. */
export const sampleTreasurySummary = {
  totalIncome: sampleTransactions
    .filter((t) => t.direction === "income")
    .reduce((sum, t) => sum + t.amount, 0),
  totalExpense: sampleTransactions
    .filter((t) => t.direction === "expense")
    .reduce((sum, t) => sum + t.amount, 0),
  get balance() {
    return this.totalIncome - this.totalExpense;
  },
  transactionCount: sampleTransactions.length,
};

/** A governance model option offered in Nation settings. */
export interface SampleGovernanceModel {
  modelKey: string;
  labelText: string;
  description: string;
}

export const sampleGovernanceModels: SampleGovernanceModel[] = [
  {
    modelKey: "consensusCouncil",
    labelText: "Consensus council",
    description: "Decisions are made by a council seeking consensus.",
  },
  {
    modelKey: "directVote",
    labelText: "Direct community vote",
    description: "Every member votes directly on each proposal.",
  },
  {
    modelKey: "delegated",
    labelText: "Delegated representation",
    description: "Members delegate their vote to a trusted representative.",
  },
];

/** A role-permission matrix cell. */
export interface SampleRolePermission {
  roleLabel: string;
  capability: string;
  allowed: boolean;
}

export const sampleRolePermissions: SampleRolePermission[] = [
  {
    roleLabel: "Council member",
    capability: "Create proposals",
    allowed: true,
  },
  { roleLabel: "Council member", capability: "Edit documents", allowed: true },
  { roleLabel: "Research lead", capability: "Edit documents", allowed: true },
  { roleLabel: "Research lead", capability: "Manage treasury", allowed: false },
  { roleLabel: "Treasurer", capability: "Manage treasury", allowed: true },
  {
    roleLabel: "Community coordinator",
    capability: "Manage calendar",
    allowed: true,
  },
];

/** Which workspace content areas are visible to other Nations. */
export interface SamplePrivacySettings {
  proposalsVisible: boolean;
  discussionsVisible: boolean;
  documentsVisible: boolean;
  calendarVisible: boolean;
  treasuryVisible: boolean;
}

export const samplePrivacySettings: SamplePrivacySettings = {
  proposalsVisible: true,
  discussionsVisible: false,
  documentsVisible: false,
  calendarVisible: true,
  treasuryVisible: false,
};

/** A Nation listed in the SOVEREIGN Network. */
export interface SampleNetworkNation {
  nation: number;
  name: string;
  shortDescription: string;
  region: string;
  collaborationInterests: string[];
  networkOptIn: boolean;
}

export const sampleNetworkNations: SampleNetworkNation[] = [
  {
    nation: 1,
    name: "Cedar River Nation",
    shortDescription: "Research, land stewardship and community governance.",
    region: "Pacific Northwest",
    collaborationInterests: ["Water rights", "Data sovereignty"],
    networkOptIn: true,
  },
  {
    nation: 2,
    name: "Highland Lakes Nation",
    shortDescription: "Legal research and youth governance programmes.",
    region: "Great Lakes",
    collaborationInterests: ["Legal research", "Youth governance"],
    networkOptIn: true,
  },
  {
    nation: 3,
    name: "Desert Sky Nation",
    shortDescription: "Climate adaptation and community data infrastructure.",
    region: "Southwest",
    collaborationInterests: ["Climate research", "Data infrastructure"],
    networkOptIn: true,
  },
];

/** A sample Copilot answer shown in the AI Copilot app. */
export interface SampleCopilotAnswer {
  question: string;
  answer: string;
  sources: { sourceKind: string; title: string }[];
}

export const sampleCopilotAnswers: SampleCopilotAnswer[] = [
  {
    question: "What proposals are open right now?",
    answer:
      "Two proposals are open: the community data-control charter and the water-rights research brief. Both are awaiting community review.",
    sources: [
      {
        sourceKind: "proposal",
        title: "Adopt a community data-control charter",
      },
      { sourceKind: "proposal", title: "Fund a water-rights research brief" },
    ],
  },
  {
    question: "What is our treasury balance?",
    answer:
      "The sample treasury shows a positive balance after the research grant and collaboration service income, less research and operations spending.",
    sources: [{ sourceKind: "treasury", title: "Nation treasury summary" }],
  },
];

/** A sample project or initiative. */
export interface SampleProject {
  id: number;
  title: string;
  description: string;
  status: "Active" | "Planning" | "Complete";
}

export const sampleProjects: SampleProject[] = [
  {
    id: 1,
    title: "Water-rights research",
    description: "A plain-language brief on regional water-rights legislation.",
    status: "Active",
  },
  {
    id: 2,
    title: "Community data charter",
    description: "Drafting a charter for community-controlled data.",
    status: "Active",
  },
  {
    id: 3,
    title: "Youth governance programme",
    description: "Establishing a standing youth council.",
    status: "Planning",
  },
];

/** A conservation record. */
export interface SampleConservationRecord {
  id: number;
  title: string;
  description: string;
  status: "Monitored" | "Restoring" | "Protected";
}

export const sampleConservationRecords: SampleConservationRecord[] = [
  {
    id: 1,
    title: "Cedar River watershed",
    description: "Water quality monitoring and riparian restoration.",
    status: "Restoring",
  },
  {
    id: 2,
    title: "Ancestral salmon grounds",
    description: "Protected spawning habitat under community stewardship.",
    status: "Protected",
  },
  {
    id: 3,
    title: "Upland forest plots",
    description: "Seasonal monitoring of forest health and wildlife.",
    status: "Monitored",
  },
];
