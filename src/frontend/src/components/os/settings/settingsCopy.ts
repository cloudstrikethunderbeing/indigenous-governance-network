/**
 * Plain-language copy for the Nation Settings app.
 *
 * Every label here is written for a reader with no technical or blockchain
 * background: what each governance model means, what each role may do, and
 * what sharing a content area with other Nations actually reveals.
 */

/** A short, plain-language explanation of what a governance model means. */
export const governanceModelNotes: Record<string, string> = {
  consensusCouncil:
    "A small council works toward agreement before any decision is made.",
  directVote:
    "Every member has a direct say on each proposal, with no middle step.",
  delegated:
    "Members hand their vote to someone they trust, and can take it back at any time.",
};

/** Fallback copy when a governance model has no written note yet. */
export const unknownGovernanceNote =
  "A decision-making approach defined by the Nation's own rules.";

/** The plain-language note for a governance model key. */
export function describeGovernanceModel(modelKey: string): string {
  return governanceModelNotes[modelKey] ?? unknownGovernanceNote;
}

/** A short, plain-language explanation of what a role is for. */
export const roleDescriptions: Record<string, string> = {
  "Council member":
    "Sits on the Nation's council and helps shape and approve community decisions.",
  "Research lead":
    "Leads research work and keeps the Nation's shared knowledge up to date.",
  "Community coordinator":
    "Organises gatherings, meetings and day-to-day community communication.",
  Treasurer:
    "Looks after the Nation's money and keeps the community informed about it.",
};

/** A short, plain-language explanation of what a capability lets someone do. */
export const capabilityDescriptions: Record<string, string> = {
  "Create proposals": "Start a new community proposal for others to consider.",
  "Edit documents": "Change the Nation's shared documents and records.",
  "Manage treasury": "Record income and spending for the Nation.",
  "Manage calendar": "Add and manage meetings, gatherings and events.",
};

/** Fallback copy when a role or capability has no written description yet. */
export const unknownRoleDescription =
  "A role defined by the Nation's own governance rules.";
export const unknownCapabilityDescription =
  "A capability granted by this role.";

/** The plain-language description for a role label. */
export function describeRole(roleLabel: string): string {
  return roleDescriptions[roleLabel] ?? unknownRoleDescription;
}

/** The plain-language description for a capability label. */
export function describeCapability(capability: string): string {
  return capabilityDescriptions[capability] ?? unknownCapabilityDescription;
}

/** A stable, marker-safe slug for a label. */
export function labelSlug(label: string): string {
  return label.toLowerCase().replace(/\s+/g, "_");
}

/** The content areas a Nation may choose to share with other Nations. */
export interface PrivacyArea {
  key:
    | "proposalsVisible"
    | "discussionsVisible"
    | "documentsVisible"
    | "calendarVisible"
    | "treasuryVisible";
  label: string;
  description: string;
}

export const privacyAreas: PrivacyArea[] = [
  {
    key: "proposalsVisible",
    label: "Proposals",
    description: "Let other Nations read this Nation's proposals and results.",
  },
  {
    key: "discussionsVisible",
    label: "Discussions",
    description: "Let other Nations read community conversation threads.",
  },
  {
    key: "documentsVisible",
    label: "Documents",
    description: "Let other Nations read shared documents and records.",
  },
  {
    key: "calendarVisible",
    label: "Calendar",
    description: "Let other Nations see meetings, gatherings and events.",
  },
  {
    key: "treasuryVisible",
    label: "Treasury",
    description: "Let other Nations see income, spending and the balance.",
  },
];
