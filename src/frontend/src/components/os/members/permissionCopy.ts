/**
 * Plain-language copy for the Members app.
 *
 * Every label here is written for a reader with no technical or blockchain
 * background: what a role is for, and what each permission actually lets a
 * member do inside the Nation workspace.
 */

/** A short, plain-language explanation of what a role means. */
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

/** A short, plain-language explanation of what a permission lets someone do. */
export const permissionDescriptions: Record<string, string> = {
  Proposals: "Start and take part in community proposals.",
  Documents: "Read and edit the Nation's shared documents.",
  "Treasury view": "See the Nation's income, spending and balance.",
  "Treasury edit": "Record income and spending for the Nation.",
  Projects: "Create and update research and community projects.",
  Calendar: "Add and manage meetings, gatherings and events.",
  Discussions: "Open and reply to community conversations.",
};

/** Fallback copy when a role or permission has no written description yet. */
export const unknownRoleDescription =
  "A role defined by the Nation's own governance rules.";
export const unknownPermissionDescription =
  "A capability granted by this role.";

/** The plain-language description for a role label. */
export function describeRole(roleLabel: string): string {
  return roleDescriptions[roleLabel] ?? unknownRoleDescription;
}

/** The plain-language description for a permission label. */
export function describePermission(permissionLabel: string): string {
  return (
    permissionDescriptions[permissionLabel] ?? unknownPermissionDescription
  );
}

/** The initials shown in a member's avatar chip. */
export function memberInitials(displayName: string): string {
  return displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

/** A stable, marker-safe slug for a permission label. */
export function permissionSlug(permissionLabel: string): string {
  return permissionLabel.toLowerCase().replace(/\s+/g, "_");
}
