import {
  BookOpenCheck,
  Gavel,
  type LucideIcon,
  ScrollText,
  Users,
} from "lucide-react";

/**
 * The four main Governance sections. Governance shows exactly these four
 * top-level sections; the eight governance views live inside them and never
 * add top-level navigation.
 */
export type GovernanceSectionKey =
  | "our-rules"
  | "decisions"
  | "members"
  | "activity";

/** One of the four Governance sections. */
export interface GovernanceSection {
  key: GovernanceSectionKey;
  label: string;
  /** One plain-language sentence explaining what the section is for. */
  description: string;
  icon: LucideIcon;
}

/** The four sections, in display order. */
export const governanceSections: GovernanceSection[] = [
  {
    key: "our-rules",
    label: "Our Rules",
    description: "The rules your organization agrees to follow.",
    icon: ScrollText,
  },
  {
    key: "decisions",
    label: "Decisions",
    description: "What your community is deciding right now.",
    icon: Gavel,
  },
  {
    key: "members",
    label: "Members",
    description: "Who belongs, and what each person may do.",
    icon: Users,
  },
  {
    key: "activity",
    label: "Activity",
    description: "A clear record of what has happened.",
    icon: BookOpenCheck,
  },
];

/**
 * The governance views, each mapped to the section that contains it. This is
 * the single source of truth for the section switcher and the governance setup
 * progress indicator. The new lifecycle surfaces (amendments, authorities,
 * succession, membership departures, emergency procedures and the Control
 * Center) nest inside the existing four sections and never become top-level
 * sections of their own.
 */
export type GovernanceViewKey =
  | "constitutional"
  | "amendments"
  | "control-center"
  | "proposals"
  | "voting"
  | "membership"
  | "departures"
  | "roles"
  | "authorities"
  | "census"
  | "appeals"
  | "execution"
  | "lifecycle";

export interface GovernanceView {
  key: GovernanceViewKey;
  label: string;
  /** The section this view is reachable within. */
  section: GovernanceSectionKey;
  /** One plain-language sentence explaining the view. */
  description: string;
}

/** The governance views, grouped by their section. */
export const governanceViews: GovernanceView[] = [
  {
    key: "constitutional",
    label: "Constitution",
    section: "our-rules",
    description: "The rules in force, and how they can be changed.",
  },
  {
    key: "amendments",
    label: "Amendments",
    section: "our-rules",
    description: "Proposed changes to the rules, and their version history.",
  },
  {
    key: "control-center",
    label: "Control Center",
    section: "our-rules",
    description: "The Nation's state, succession plan and recovery.",
  },
  {
    key: "proposals",
    label: "Proposals",
    section: "decisions",
    description: "Ideas put forward for the community to decide.",
  },
  {
    key: "voting",
    label: "Voting",
    section: "decisions",
    description: "Open votes and their current results.",
  },
  {
    key: "membership",
    label: "Membership",
    section: "members",
    description: "Who may join, and how they are approved.",
  },
  {
    key: "departures",
    label: "Departures",
    section: "members",
    description: "Members leaving, retiring or being removed.",
  },
  {
    key: "roles",
    label: "Roles & Permissions",
    section: "members",
    description: "What each role is allowed to do.",
  },
  {
    key: "authorities",
    label: "Authorities",
    section: "members",
    description: "The seats of authority, who holds them and their terms.",
  },
  {
    key: "census",
    label: "Participation Census",
    section: "activity",
    description: "Who took part, without exposing private choices.",
  },
  {
    key: "appeals",
    label: "Appeals",
    section: "activity",
    description: "Reviews of decisions a member disagrees with.",
  },
  {
    key: "execution",
    label: "Execution",
    section: "activity",
    description: "Approved decisions carried out, step by step.",
  },
  {
    key: "lifecycle",
    label: "Lifecycle & Emergencies",
    section: "activity",
    description: "Emergency suspensions and dissolution, recorded for good.",
  },
];

/** The views that belong to a given section, in display order. */
export function viewsForSection(
  section: GovernanceSectionKey,
): GovernanceView[] {
  return governanceViews.filter((view) => view.section === section);
}
