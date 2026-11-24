/**
 * Shared node model for the Discovery network graph and list view. Nodes are
 * derived from stored backend data (communities, proposals, resources,
 * partnerships and members) — never invented.
 */
export type NetworkNodeKind =
  | "community"
  | "proposal"
  | "resource"
  | "partner"
  | "member";

export interface NetworkNode {
  /** Stable identity used for React keys and selection. */
  id: string;
  /** Numeric position for deterministic test markers. */
  index: number;
  label: string;
  kind: NetworkNodeKind;
  /** Plain-language summary shown in the profile panel. */
  summary: string;
  /** Needs the node has published, if any. */
  needs: string[];
  /** Active proposals associated with the node. */
  proposals: string[];
  /** Collaboration opportunities the node offers. */
  opportunities: string[];
}

export const NODE_KIND_LABEL: Record<NetworkNodeKind, string> = {
  community: "Community",
  proposal: "Proposal",
  resource: "Resource",
  partner: "Partnership",
  member: "Member",
};
