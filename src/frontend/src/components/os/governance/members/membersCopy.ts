import { GovernanceCapability } from "@/backend";

/**
 * Plain-language copy for the Governance Members section.
 *
 * Every label here is written for a reader with no technical or blockchain
 * background: what each of the ten roles is for, and what each of the six
 * capabilities actually lets a person do inside the organization.
 */

/** The six capabilities, in the order they are shown. */
export const capabilityOrder: GovernanceCapability[] = [
  GovernanceCapability.view,
  GovernanceCapability.propose,
  GovernanceCapability.approve,
  GovernanceCapability.vote,
  GovernanceCapability.modify,
  GovernanceCapability.execute,
];

/** A short, plain-language name for a capability. */
export const capabilityLabels: Record<GovernanceCapability, string> = {
  [GovernanceCapability.view]: "View",
  [GovernanceCapability.propose]: "Propose",
  [GovernanceCapability.approve]: "Approve",
  [GovernanceCapability.vote]: "Vote",
  [GovernanceCapability.modify]: "Modify",
  [GovernanceCapability.execute]: "Execute",
};

/** One plain sentence explaining what a capability lets someone do. */
export const capabilityDescriptions: Record<GovernanceCapability, string> = {
  [GovernanceCapability.view]: "See the organization's information.",
  [GovernanceCapability.propose]: "Put forward ideas for a decision.",
  [GovernanceCapability.approve]: "Accept or reject what others propose.",
  [GovernanceCapability.vote]: "Have a say in a decision.",
  [GovernanceCapability.modify]: "Change settings, rules or records.",
  [GovernanceCapability.execute]: "Carry out a decision that has passed.",
};

/** The ten built-in roles, in the order they are shown. */
export type BuiltInRoleKey =
  | "foundingAuthority"
  | "membershipAuthority"
  | "member"
  | "governanceDelegate"
  | "proposalSteward"
  | "executionAuthority"
  | "treasurySteward"
  | "documentSteward"
  | "auditor"
  | "observer";

export interface BuiltInRole {
  key: BuiltInRoleKey;
  /** The role's display name. */
  label: string;
  /** One plain sentence explaining who the role is for. */
  description: string;
  /** The capabilities the role grants. */
  capabilities: GovernanceCapability[];
}

/**
 * The ten roles every organization starts with. Each is described in plain
 * language and lists exactly what it can view, propose, approve, vote, modify
 * and execute.
 */
export const builtInRoles: BuiltInRole[] = [
  {
    key: "foundingAuthority",
    label: "Founding Authority",
    description:
      "Sets the organization up and holds the highest authority while it is being founded.",
    capabilities: [
      GovernanceCapability.view,
      GovernanceCapability.propose,
      GovernanceCapability.approve,
      GovernanceCapability.vote,
      GovernanceCapability.modify,
      GovernanceCapability.execute,
    ],
  },
  {
    key: "membershipAuthority",
    label: "Membership Authority",
    description: "Decides who may join the organization.",
    capabilities: [
      GovernanceCapability.view,
      GovernanceCapability.approve,
      GovernanceCapability.modify,
    ],
  },
  {
    key: "member",
    label: "Member",
    description: "Belongs to the organization and takes part in its decisions.",
    capabilities: [
      GovernanceCapability.view,
      GovernanceCapability.propose,
      GovernanceCapability.vote,
    ],
  },
  {
    key: "governanceDelegate",
    label: "Governance Delegate",
    description:
      "Votes on behalf of members who have asked them to, until that is taken back.",
    capabilities: [GovernanceCapability.view, GovernanceCapability.vote],
  },
  {
    key: "proposalSteward",
    label: "Proposal Steward",
    description: "Guides ideas through to a clear, well-formed proposal.",
    capabilities: [
      GovernanceCapability.view,
      GovernanceCapability.propose,
      GovernanceCapability.modify,
    ],
  },
  {
    key: "executionAuthority",
    label: "Execution Authority",
    description: "Carries out decisions once the community has approved them.",
    capabilities: [GovernanceCapability.view, GovernanceCapability.execute],
  },
  {
    key: "treasurySteward",
    label: "Treasury Steward",
    description: "Looks after the organization's money and records it openly.",
    capabilities: [
      GovernanceCapability.view,
      GovernanceCapability.propose,
      GovernanceCapability.modify,
    ],
  },
  {
    key: "documentSteward",
    label: "Document Steward",
    description: "Keeps the organization's shared documents accurate.",
    capabilities: [
      GovernanceCapability.view,
      GovernanceCapability.propose,
      GovernanceCapability.modify,
    ],
  },
  {
    key: "auditor",
    label: "Auditor",
    description:
      "Checks that decisions follow the rules and reports openly to everyone.",
    capabilities: [GovernanceCapability.view],
  },
  {
    key: "observer",
    label: "Observer",
    description: "May watch and read, but takes no part in decisions.",
    capabilities: [GovernanceCapability.view],
  },
];

/** A stable, marker-safe slug for a label. */
export function labelSlug(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

/** The initials shown in a member's avatar chip. */
export function memberInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/);
  if (parts.length === 0 || parts[0] === "") return "?";
  return parts
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** A short, readable principal label for a member with no display name. */
export function shortPrincipal(principalText: string): string {
  if (principalText.length <= 12) return principalText;
  return `${principalText.slice(0, 5)}…${principalText.slice(-4)}`;
}
