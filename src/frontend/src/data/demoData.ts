/**
 * SOVEREIGN DAO & Economy — simulated demonstration data.
 *
 * Everything in this module is static, in-memory and illustrative. Nothing is
 * persisted, no backend call is made, and no figure represents a real balance,
 * token, credit, treasury position or governance outcome. The DAO & Economy
 * area is a pitch and interactive demo only.
 */

export type PhaseStatus = "Proposed" | "Demo" | "Future Development";

export interface DemoProfile {
  /** Clearly labelled example member — never a real account. */
  displayName: string;
  handle: string;
  role: string;
  nation: string;
  joinedLabel: string;
  /** Simulated SRC balance, shown as a count only. */
  srcBalance: number;
  /** Simulated governance participation count. */
  participationCount: number;
}

export interface PhaseDefinition {
  /** Stable slug used for routing and list keys. */
  id: string;
  /** Two-digit rail marker, e.g. "01". */
  index: string;
  title: string;
  /** One-sentence explanation. */
  summary: string;
  status: PhaseStatus;
  /** Route into the interactive preview. */
  to: string;
  /** Deterministic marker suffix. */
  ocid: string;
}

export const demoProfile: DemoProfile = {
  displayName: "Aiyana Redcloud",
  handle: "demo.member",
  role: "Community Research Contributor",
  nation: "Example Nation (simulated)",
  joinedLabel: "Demo session",
  srcBalance: 1240,
  participationCount: 7,
};

export const phases: PhaseDefinition[] = [
  {
    id: "tokenomics",
    index: "01",
    title: "Tokenomics",
    summary:
      "A proposed 21,000,000 SOVEREIGN supply with a full allocation and a four-month halving emission schedule.",
    status: "Proposed",
    to: "/dao/tokenomics",
    ocid: "tokenomics",
  },
  {
    id: "research-credits",
    index: "02",
    title: "Research Credits",
    summary:
      "SOVEREIGN Research Credits earned for verified contributions and spent to commission new research.",
    status: "Demo",
    to: "/dao/research-credits",
    ocid: "research_credits",
  },
  {
    id: "treasury",
    index: "03",
    title: "Treasury Transparency",
    summary:
      "An open ledger of funding, costs and runway, with honest empty states until real figures exist.",
    status: "Demo",
    to: "/dao/treasury",
    ocid: "treasury",
  },
  {
    id: "governance",
    index: "04",
    title: "DAO Governance",
    summary:
      "Proposals, voting and delegation concepts, with an explicit Indigenous-sovereignty safeguard.",
    status: "Demo",
    to: "/dao/governance",
    ocid: "governance",
  },
  {
    id: "community",
    index: "05",
    title: "Community Economy",
    summary:
      "How meaningful participation could sustain a self-governing research network over time.",
    status: "Future Development",
    to: "/dao/community",
    ocid: "community",
  },
];

/** The Indigenous-sovereignty safeguard, shown throughout the governance area. */
export const sovereigntySafeguard =
  "DAO participation and token ownership never confer Indigenous citizenship, Nation representation, treaty authority, FPIC or authority over Indigenous laws, knowledge or political decisions. Nation authority remains with Nations and their own authorized governance processes.";

/** Prominent tokenomics disclosure. */
export const tokenomicsNotice = "PROPOSED — NOT ISSUED, NOT FOR SALE";

/** Prominent SRC disclosure. */
export const srcNotice =
  "SRC LEDGER — DEMO ONLY. NO REAL CREDITS, TRANSFERS, BALANCES OR PERSISTENT RECORDS.";

/** Persistent simulation disclosure shown across the whole DAO area. */
export const simulationNotice = "SIMULATED DEMONSTRATION — NOT A LIVE SYSTEM";

export interface FutureRoadmapItem {
  id: string;
  title: string;
  description: string;
}

/** Stage 3 and beyond — every item is a future possibility, not a built feature. */
export const futureRoadmap: FutureRoadmapItem[] = [
  {
    id: "research-credit-infrastructure",
    title: "Production research credit infrastructure",
    description:
      "A real, audited SRC ledger with issuance, transfer and settlement rules.",
  },
  {
    id: "treasury-accounting",
    title: "Real treasury accounting and reporting",
    description:
      "Live balances, automated reconciliation and independently verifiable reporting.",
  },
  {
    id: "legal-review",
    title: "Independent legal and regulatory review",
    description:
      "Jurisdiction-by-jurisdiction counsel before any real issuance or sale.",
  },
  {
    id: "security-audits",
    title: "Security audits",
    description:
      "Third-party review of canisters, token logic and governance contracts.",
  },
  {
    id: "governance-framework",
    title: "Community-approved governance framework",
    description:
      "A ratified constitution defining proposals, voting and delegation.",
  },
  {
    id: "sns-launch",
    title: "Potential ICP SNS launch",
    description:
      "A possible Service Nervous System launch, subject to community approval.",
  },
  {
    id: "icrc-token",
    title: "Potential ICRC governance token",
    description:
      "A possible ICRC-standard governance token, if the community chooses one.",
  },
  {
    id: "neuron-configuration",
    title: "Neuron configuration and decentralized canister control",
    description:
      "Maturity-based neurons and decentralized control of the canisters.",
  },
];

/* ---------------------------------------------------------------------------
 * Participation Economy — simulated demonstration content.
 *
 * Every entry below is static, illustrative and in-memory. Nothing is
 * persisted, no backend call is made, and no figure represents a real credit,
 * balance, transfer, reward or governance outcome.
 * ------------------------------------------------------------------------- */

/** Prominent participation-economy disclosure. */
export const participationNotice =
  "DEMO ONLY — NO REAL CREDITS OR TRANSACTIONS";

/** Plain-language explanation of what SRC participation credits are. */
export const srcPlainLanguage =
  "Research Credits recognise verified contributions and can prioritize new research. They have no real monetary value and cannot be transferred or redeemed.";

/** One paired row comparing the attention economy with the participation economy. */
export interface EconomyComparisonRow {
  id: string;
  attention: string;
  participation: string;
}

export const economyComparison: EconomyComparisonRow[] = [
  {
    id: "attention",
    attention: "Views and clicks",
    participation: "Verified contributions",
  },
  {
    id: "data",
    attention: "Behavioural data extraction",
    participation: "Data sovereignty",
  },
  {
    id: "decisions",
    attention: "Centralized decisions",
    participation: "Community governance",
  },
  {
    id: "value",
    attention: "Platform-owned value",
    participation: "Shared participation",
  },
  {
    id: "role",
    attention: "Passive consumption",
    participation: "Active contribution",
  },
];

/** One of the eight participation categories on the dashboard. */
export interface ParticipationCategory {
  id: string;
  title: string;
  /** Example contribution activity for this category. */
  example: string;
  /** Illustrative SRC reward for the example activity. */
  reward: number;
}

export const participationCategories: ParticipationCategory[] = [
  {
    id: "legal-legislative",
    title: "Legal and legislative research",
    example: "Review a proposed bill against existing Indigenous rights law.",
    reward: 120,
  },
  {
    id: "indigenous-rights",
    title: "Indigenous rights and UNDRIP research",
    example:
      "Summarise a UNDRIP article and its application to a current case.",
    reward: 140,
  },
  {
    id: "data-sovereignty",
    title: "Data sovereignty contributions",
    example: "Document a community data-sharing agreement and its conditions.",
    reward: 110,
  },
  {
    id: "ai-verification",
    title: "AI research verification",
    example: "Check an AI-generated summary against its cited primary sources.",
    reward: 90,
  },
  {
    id: "community-governance",
    title: "Community governance participation",
    example: "Draft a plain-language brief on a community decision process.",
    reward: 100,
  },
  {
    id: "peer-review",
    title: "Peer review and evidence validation",
    example: "Validate the methodology of a submitted research dataset.",
    reward: 130,
  },
  {
    id: "challenges-corrections",
    title: "Research challenges and corrections",
    example: "File a sourced correction to a published research claim.",
    reward: 80,
  },
  {
    id: "platform-proposals",
    title: "Platform development proposals",
    example: "Propose a feature that improves contributor data control.",
    reward: 150,
  },
];

/** One row of the simulated participation history. */
export interface ParticipationHistoryEntry {
  id: string;
  title: string;
  status: "Submitted" | "Awaiting verification" | "Approved";
  reward: number;
}

export const participationHistory: ParticipationHistoryEntry[] = [
  {
    id: "ph1",
    title: "Legislative review — water rights amendment",
    status: "Approved",
    reward: 120,
  },
  {
    id: "ph2",
    title: "UNDRIP article summary — free, prior and informed consent",
    status: "Awaiting verification",
    reward: 140,
  },
  {
    id: "ph3",
    title: "Community data-sharing agreement documentation",
    status: "Submitted",
    reward: 110,
  },
  {
    id: "ph4",
    title: "AI summary source verification",
    status: "Approved",
    reward: 90,
  },
];

/** One row of the simulated SRC credit transaction history. */
export interface CreditTransaction {
  id: string;
  label: string;
  /** Positive credits earned, negative credits spent. */
  amount: number;
  kind: "earned" | "spent";
}

export const creditTransactions: CreditTransaction[] = [
  {
    id: "ct1",
    label: "Approved contribution reward",
    amount: 120,
    kind: "earned",
  },
  {
    id: "ct2",
    label: "Commissioned research assignment",
    amount: -200,
    kind: "spent",
  },
  {
    id: "ct3",
    label: "Approved contribution reward",
    amount: 90,
    kind: "earned",
  },
  {
    id: "ct4",
    label: "Prioritized research assignment",
    amount: -140,
    kind: "spent",
  },
  {
    id: "ct5",
    label: "Approved contribution reward",
    amount: 150,
    kind: "earned",
  },
];

/** One prioritized research assignment in the credit economy. */
export interface PrioritizedAssignment {
  id: string;
  title: string;
  status: "Queued" | "In review" | "Delivered";
}

export const prioritizedAssignments: PrioritizedAssignment[] = [
  {
    id: "pa1",
    title: "Map regional water-rights legislation",
    status: "In review",
  },
  {
    id: "pa2",
    title: "Survey community data-governance practices",
    status: "Queued",
  },
  { id: "pa3", title: "Review AI verification methods", status: "Delivered" },
];

/** One of the seven governance preview topics. */
export interface GovernanceTopic {
  id: string;
  title: string;
  /** Plain-language framing of the question. */
  framing: string;
}

export const governanceTopics: GovernanceTopic[] = [
  {
    id: "data-control",
    title: "Who controls community data?",
    framing: "Who decides how community data is collected, stored and shared.",
  },
  {
    id: "access-use",
    title: "Who can access and use information?",
    framing:
      "Who is allowed to see and use community information, and under what terms.",
  },
  {
    id: "ai-governance",
    title: "How should AI systems be governed?",
    framing:
      "What oversight, transparency and accountability AI systems should carry.",
  },
  {
    id: "research-funding",
    title: "What research should receive funding?",
    framing:
      "How the community sets research priorities and allocates support.",
  },
  {
    id: "resource-allocation",
    title: "How should community resources be allocated?",
    framing:
      "How shared resources are divided between competing community needs.",
  },
  {
    id: "transparency",
    title: "What transparency standards should platforms follow?",
    framing: "What platforms must disclose about their decisions and data use.",
  },
  {
    id: "infrastructure",
    title: "How should digital infrastructure protect community interests?",
    framing:
      "How infrastructure is built and governed to serve community interests.",
  },
];

/** One simulated governance proposal with a voting preview. */
export interface GovernancePreviewProposal {
  id: string;
  topicId: string;
  title: string;
  summary: string;
  baseYes: number;
  baseNo: number;
  /** Illustrative SRC reward for taking part. */
  reward: number;
}

export const governancePreviewProposals: GovernancePreviewProposal[] = [
  {
    id: "gp1",
    topicId: "data-control",
    title: "Adopt a community data-control charter",
    summary:
      "Require every project to follow a community-approved charter before collecting or sharing data.",
    baseYes: 214,
    baseNo: 58,
    reward: 20,
  },
  {
    id: "gp2",
    topicId: "ai-governance",
    title: "Require source verification for AI outputs",
    summary:
      "Every AI-assisted research output must cite verifiable primary sources before publication.",
    baseYes: 186,
    baseNo: 74,
    reward: 25,
  },
  {
    id: "gp3",
    topicId: "research-funding",
    title: "Prioritize Indigenous-led research funding",
    summary:
      "Direct a share of research funding to Nation-led and community-led research priorities.",
    baseYes: 231,
    baseNo: 41,
    reward: 20,
  },
];

/** One of the four sovereignty pillar modules. */
export interface SovereigntyPillar {
  id: string;
  title: string;
  explanation: string;
  /** Illustrative participation activity for this pillar. */
  activity: string;
}

export const sovereigntyPillars: SovereigntyPillar[] = [
  {
    id: "data",
    title: "Data Sovereignty",
    explanation:
      "Control over how data is collected, stored, accessed, protected and shared.",
    activity: "Document a community data-sharing agreement and its conditions.",
  },
  {
    id: "information",
    title: "Information Sovereignty",
    explanation:
      "Community authority over information, knowledge, permissions and distribution.",
    activity: "Review who may access a community knowledge archive and why.",
  },
  {
    id: "ai",
    title: "AI Sovereignty",
    explanation:
      "Transparent AI systems with verifiable sources, accountable outputs and human oversight.",
    activity:
      "Verify an AI-generated summary against its cited primary sources.",
  },
  {
    id: "legal",
    title: "Legal Sovereignty",
    explanation:
      "Research infrastructure supporting Indigenous legal traditions, rights, legislative analysis and Nation-led governance.",
    activity: "Analyse a proposed law against Indigenous legal traditions.",
  },
];

/** One future economic application area — a possibility, never a built feature. */
export interface FutureEconomicArea {
  id: string;
  title: string;
  description: string;
}

export const futureEconomicAreas: FutureEconomicArea[] = [
  {
    id: "governance-research",
    title: "Indigenous governance and public-interest research",
    description:
      "Research supporting Nation-led governance and public-interest questions.",
  },
  {
    id: "legal-review",
    title: "Legal research and legislative review",
    description:
      "Structured review of legislation against Indigenous rights and law.",
  },
  {
    id: "data-infrastructure",
    title: "Community-controlled data infrastructure",
    description:
      "Data systems owned and governed by the communities they serve.",
  },
  {
    id: "ai-services",
    title: "AI services and research verification",
    description:
      "Verification services that hold AI outputs to sourced evidence.",
  },
  {
    id: "public-transparency",
    title: "Public-sector transparency and accountability",
    description:
      "Independent research into public decisions and their outcomes.",
  },
  {
    id: "underwriting",
    title: "Legal and insurance underwriting research",
    description:
      "Evidence-based research supporting legal and insurance decisions.",
  },
  {
    id: "digital-economies",
    title: "Community-governed gaming and digital economies",
    description:
      "Digital economies governed by the communities that take part in them.",
  },
];

/** One step of the seven-step economic flywheel. */
export interface FlywheelStep {
  id: string;
  /** Short uppercase label shown on the wheel. */
  label: string;
  title: string;
  explanation: string;
}

export const flywheelSteps: FlywheelStep[] = [
  {
    id: "fund",
    label: "FUND",
    title: "Fund",
    explanation:
      "Grants, philanthropy, institutional contracts and investment provide real operating funding.",
  },
  {
    id: "participate",
    label: "PARTICIPATE",
    title: "Participate",
    explanation:
      "People contribute research, knowledge and expertise to shared priorities.",
  },
  {
    id: "verify",
    label: "VERIFY",
    title: "Verify",
    explanation:
      "Human review and validation confirm that contributions are sound.",
  },
  {
    id: "reward",
    label: "REWARD",
    title: "Reward",
    explanation:
      "Accepted contributions earn illustrative SRC participation credits.",
  },
  {
    id: "research",
    label: "RESEARCH",
    title: "Research",
    explanation:
      "Credits prioritize additional research the community has chosen.",
  },
  {
    id: "govern",
    label: "GOVERN",
    title: "Govern",
    explanation:
      "Participants shape priorities and how resources are allocated.",
  },
  {
    id: "reinvest",
    label: "REINVEST",
    title: "Reinvest",
    explanation:
      "Real operating revenue supports research, infrastructure and participation.",
  },
];

/** Plain-language summary of the proposed token economy for the DAO connection. */
export const participationTokenSummary = {
  supply: "21,000,000",
  halving: "Four-month halving emission schedule",
  rewards: "Community rewards for verified participation",
  governance: "Future DAO governance over priorities and resources",
};

/* ---------------------------------------------------------------------------
 * Dashboard Home — simulated demonstration content.
 *
 * Every entry below is static, illustrative and in-memory. Nothing is
 * persisted, no backend call is made, and no figure represents a real balance,
 * token, treasury position, vote or membership. The dashboard is a pitch and
 * interactive demo only.
 * ------------------------------------------------------------------------- */

/** The simulated network shown in the account chip. */
export const demoNetwork = "Mainnet (simulated)";

/** One quick action on the dashboard home — a clearly non-functional demo control. */
export interface QuickAction {
  id: string;
  label: string;
  /** Short explanation of what the action would do in a live system. */
  description: string;
  /** lucide-react icon name resolved by the dashboard component. */
  icon: "proposal" | "nfts" | "roles" | "rfp";
}

export const quickActions: QuickAction[] = [
  {
    id: "new-proposal",
    label: "New Proposal",
    description: "Draft a governance proposal for community review.",
    icon: "proposal",
  },
  {
    id: "send-nfts",
    label: "Send NFTs",
    description: "Distribute membership tokens to verified members.",
    icon: "nfts",
  },
  {
    id: "manage-roles",
    label: "Manage Roles",
    description: "Assign contributor and reviewer permissions.",
    icon: "roles",
  },
  {
    id: "create-rfp",
    label: "Create RFP",
    description: "Open a request for research proposals.",
    icon: "rfp",
  },
];

/** One day of the simulated multi-series treasury chart. */
export interface TreasuryPoint {
  day: string;
  eth: number;
  sol: number;
  token: number;
}

export const treasurySeries: TreasuryPoint[] = [
  { day: "Mon", eth: 42, sol: 28, token: 18 },
  { day: "Tue", eth: 55, sol: 34, token: 24 },
  { day: "Wed", eth: 48, sol: 41, token: 31 },
  { day: "Thu", eth: 63, sol: 37, token: 29 },
  { day: "Fri", eth: 71, sol: 46, token: 38 },
  { day: "Sat", eth: 66, sol: 58, token: 44 },
  { day: "Sun", eth: 82, sol: 63, token: 52 },
];

/** Headline figures for the treasury card — simulated only. */
export const treasurySummary = {
  totalLabel: "$283,520",
  changeLabel: "+34% this week",
  series: [
    { key: "eth", label: "ETH", color: "var(--chart-1)" },
    { key: "sol", label: "SOL", color: "var(--chart-3)" },
    { key: "token", label: "Own token", color: "var(--chart-2)" },
  ],
} as const;

/** One entry in the latest-activity feed. */
export interface ActivityEntry {
  id: string;
  kind: "Exchange" | "Primary sale" | "Grant" | "Membership";
  detail: string;
  amount: string;
  /** Relative timestamp label, e.g. "3 hours ago". */
  time: string;
}

export const activityFeed: ActivityEntry[] = [
  {
    id: "af1",
    kind: "Exchange",
    detail: "1 ETH to 19 SOL on a simulated exchange",
    amount: "−1 ETH / +19 SOL",
    time: "3 hours ago",
  },
  {
    id: "af2",
    kind: "Primary sale",
    detail: "Raised 10 ETH from a simulated partner DAO",
    amount: "+10 ETH",
    time: "5 hours ago",
  },
  {
    id: "af3",
    kind: "Grant",
    detail: "Climate fintech market research",
    amount: "−74 SOL",
    time: "6 hours ago",
  },
  {
    id: "af4",
    kind: "Membership",
    detail: "A new member joined the simulated workspace",
    amount: "+0.25 ETH",
    time: "7 hours ago",
  },
];

/** One example proposal with a simulated Yes/No vote split. */
export interface DashboardProposal {
  id: string;
  title: string;
  yes: number;
  no: number;
}

export const dashboardProposals: DashboardProposal[] = [
  { id: "dp1", title: "Elect a community treasurer", yes: 23, no: 8 },
  {
    id: "dp2",
    title: "Fund a climate fintech research brief",
    yes: 15,
    no: 73,
  },
  { id: "dp3", title: "Adopt a data-control charter", yes: 36, no: 12 },
];

/** One example workspace task with tags and a metric count. */
export interface WorkspaceTask {
  id: string;
  title: string;
  tags: string[];
  /** Illustrative comment/engagement count. */
  count: number;
}

export const workspaceTasks: WorkspaceTask[] = [
  {
    id: "wt1",
    title: "Design the community research portal",
    tags: ["Design", "RFP"],
    count: 7,
  },
  {
    id: "wt2",
    title: "Climate fintech market research",
    tags: ["Research", "Grant"],
    count: 3,
  },
  {
    id: "wt3",
    title: "Preliminary data-sovereignty report",
    tags: ["Milestone"],
    count: 5,
  },
];

/** One person shown in the right sidebar, with a relative timestamp. */
export interface SidebarPerson {
  id: string;
  name: string;
  /** Short role or status label. */
  meta: string;
  time: string;
}

export const newMembers: SidebarPerson[] = [
  { id: "nm1", name: "Lostpoet", meta: "Core team", time: "Today 8:35 PM" },
  { id: "nm2", name: "NinjaSam", meta: "Member", time: "Today 7:04 PM" },
  { id: "nm3", name: "BearXYZ", meta: "Scout", time: "Today 6:53 PM" },
  { id: "nm4", name: "CyberGod01", meta: "Member", time: "Yesterday 10:35 AM" },
];

export const applications: SidebarPerson[] = [
  { id: "ap1", name: "Cuteshiba", meta: "Candidate", time: "Today 8:12 PM" },
  { id: "ap2", name: "MetaHero", meta: "Candidate", time: "Yesterday 6:34 PM" },
];

export const onlineMembers: SidebarPerson[] = [
  { id: "om1", name: "MarkEZ", meta: "Online", time: "Now" },
  { id: "om2", name: "Hes07", meta: "Online", time: "Now" },
  { id: "om3", name: "Timmy", meta: "Online", time: "Now" },
  { id: "om4", name: "Alice", meta: "Online", time: "Now" },
  { id: "om5", name: "4King", meta: "Online", time: "Now" },
  { id: "om6", name: "Wofy", meta: "Online", time: "Now" },
];

/** Simulated workspace metric shown beside the task list. */
export const workspaceMetric = {
  label: "Open tasks",
  value: 12,
};
