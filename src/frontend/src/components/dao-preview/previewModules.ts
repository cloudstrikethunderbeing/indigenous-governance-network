import {
  Bot,
  Coins,
  FileSignature,
  Handshake,
  Landmark,
  type LucideIcon,
  ScrollText,
  Users,
  Vote,
} from "lucide-react";

export type ModuleStatus = "live" | "future";

export type PreviewModule = {
  id: string;
  name: string;
  status: ModuleStatus;
  icon: LucideIcon;
  tone: "cyan" | "violet" | "gold";
  summary: string;
  detail: string;
  /** Position on the constellation, in percent of the stage box. */
  x: number;
  y: number;
};

/**
 * The eight modules of the sovereign governance ecosystem. `live` modules are
 * implemented in the SOVEREIGN OS today; `future` modules are clearly labelled
 * as later phases. Positions form a ring around the central DAO symbol.
 */
export const PREVIEW_MODULES: PreviewModule[] = [
  {
    id: "constitution",
    name: "Constitution",
    status: "live",
    icon: ScrollText,
    tone: "gold",
    summary: "The written rules every decision answers to.",
    detail:
      "Your founding document: membership thresholds, voting rules and the safeguards that protect them. Amendments follow the same approved process as any other decision.",
    x: 50,
    y: 6,
  },
  {
    id: "authorities",
    name: "Three Founding Authorities",
    status: "live",
    icon: FileSignature,
    tone: "violet",
    summary: "Three distinct people must accept before activation.",
    detail:
      "The creator becomes Founding Authority #1 and appoints two more by secure invitation. Each accepts independently with Internet Identity, so no single person can activate a Nation alone.",
    x: 84,
    y: 22,
  },
  {
    id: "membership",
    name: "Membership",
    status: "live",
    icon: Users,
    tone: "cyan",
    summary: "Join requests, approvals and roles, on the record.",
    detail:
      "Applicants move from request to review to approval to an assigned role. Every approval is counted once, and each step is written to an auditable history.",
    x: 92,
    y: 52,
  },
  {
    id: "proposals",
    name: "Proposals & Voting",
    status: "live",
    icon: Vote,
    tone: "cyan",
    summary: "Decisions made openly, with a clear tally.",
    detail:
      "Members raise proposals, debate them and vote. Quorums and thresholds come from your constitution, and duplicate or unauthorized votes are rejected.",
    x: 78,
    y: 82,
  },
  {
    id: "collaboration",
    name: "Nation-to-Nation Collaboration",
    status: "future",
    icon: Handshake,
    tone: "gold",
    summary: "Voluntary partnerships between sovereign Nations.",
    detail:
      "A later phase: Nations opt in to shared initiatives and regional projects. Private membership, financial and document records are never shared by default.",
    x: 50,
    y: 94,
  },
  {
    id: "agents",
    name: "AI Governance Agents",
    status: "future",
    icon: Bot,
    tone: "violet",
    summary: "Advisory intelligence, never decision authority.",
    detail:
      "A later phase: agents summarize proposals and surface context for members. Voting, treasury execution and enforcement stay with your people and your contracts.",
    x: 22,
    y: 82,
  },
  {
    id: "treasury",
    name: "Treasury",
    status: "live",
    icon: Landmark,
    tone: "gold",
    summary: "Shared funds with a transparent ledger.",
    detail:
      "Track balances, allocations and spending in one place. Every movement is visible to members, and payouts follow the approvals your rules require.",
    x: 8,
    y: 52,
  },
  {
    id: "economy",
    name: "Community Economy",
    status: "future",
    icon: Coins,
    tone: "cyan",
    summary: "Rewards for the work that keeps a Nation running.",
    detail:
      "A later phase: participation credits and contribution rewards that recognize the members who show up, designed to stay separate from governance power.",
    x: 16,
    y: 22,
  },
];

export type SequenceStep = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
};

/** The guided visual sequence that ends in the full-screen reveal. */
export const SEQUENCE_STEPS: SequenceStep[] = [
  {
    id: "community",
    eyebrow: "Step 01",
    title: "Your Digital Community",
    body: "A private home for your people — members, roles and a shared place to work, with nothing public until you decide it is.",
  },
  {
    id: "constitution",
    eyebrow: "Step 02",
    title: "Your Constitution",
    body: "Write the rules once, in plain language. Thresholds, safeguards and amendment paths become the reference for every decision.",
  },
  {
    id: "authorities",
    eyebrow: "Step 03",
    title: "Your Founding Authorities",
    body: "Three distinct people accept before anything activates. No single administrator can switch a Nation on alone.",
  },
  {
    id: "membership",
    eyebrow: "Step 04",
    title: "Your Membership",
    body: "Join requests, approvals and roles flow through one auditable path, so everyone knows exactly how they belong.",
  },
  {
    id: "governance",
    eyebrow: "Step 05",
    title: "Your Governance",
    body: "Proposals, debate and voting with a clear tally — enforced by the constitution, not by whoever holds the keys.",
  },
  {
    id: "ecosystem",
    eyebrow: "Step 06",
    title: "Your Sovereign Digital Ecosystem",
    body: "Constitution, authorities, members, treasury and collaboration, connected around one sovereign core you control.",
  },
];
