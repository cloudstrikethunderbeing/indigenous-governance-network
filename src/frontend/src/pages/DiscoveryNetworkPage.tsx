import { List, Network } from "lucide-react";
import { useMemo, useState } from "react";

import {
  type CollaborationProfile,
  type DirectoryEntry,
  DirectoryEntryKind,
  type DiscoverySubmission,
  SubmissionClassification,
} from "@/backend";
import DiscoveryShell from "@/components/discovery/DiscoveryShell";
import EmptyState from "@/components/discovery/EmptyState";
import IntelligenceHub from "@/components/discovery/IntelligenceHub";
import NetworkGraph from "@/components/discovery/NetworkGraph";
import NetworkListView from "@/components/discovery/NetworkListView";
import NodeProfilePanel from "@/components/discovery/NodeProfilePanel";
import type { NetworkNode } from "@/components/discovery/network-types";
import {
  useMatchingCollaborators,
  useNetworkActivityFeed,
  usePublicSubmissions,
  useSearchDirectory,
} from "@/hooks/useDiscovery";

type ViewMode = "graph" | "list";

/** Map a stored directory entry to a network node. */
function directoryNode(entry: DirectoryEntry): Omit<NetworkNode, "index"> {
  const isCommunity = entry.kind === DirectoryEntryKind.community;
  return {
    id: `directory-${entry.kind}-${entry.referenceId.toString()}-${entry.title}`,
    label: entry.title,
    kind: isCommunity ? "community" : "partner",
    summary: entry.description,
    needs: [],
    proposals: [],
    opportunities: entry.tags,
  };
}

/** Map a stored public submission to a network node. */
function submissionNode(
  submission: DiscoverySubmission,
): Omit<NetworkNode, "index"> {
  const isProposal =
    submission.classification === SubmissionClassification.idea ||
    submission.classification === SubmissionClassification.potentialProposal;
  const isNeed = submission.classification === SubmissionClassification.need;
  return {
    id: `submission-${submission.id.toString()}`,
    label: submission.category || "Untitled submission",
    kind: isProposal ? "proposal" : "resource",
    summary: submission.body,
    needs: isNeed ? [submission.body] : [],
    proposals: isProposal ? [submission.body] : [],
    opportunities: submission.interestTags,
  };
}

/**
 * Map an opted-in collaboration profile to a network node. Member profiles
 * become member nodes; community profiles become community nodes.
 */
function collaboratorNode(
  profile: CollaborationProfile,
): Omit<NetworkNode, "index"> {
  const isMember = profile.party.__kind__ === "member";
  return {
    id: `collaborator-${profile.id.toString()}`,
    label: profile.displayName,
    kind: isMember ? "member" : "community",
    summary:
      profile.skills.length > 0
        ? `Skills: ${profile.skills.join(", ")}`
        : "Opted-in collaborator.",
    needs: profile.needs,
    proposals: [],
    opportunities: profile.partnershipOpportunities,
  };
}

/**
 * Discovery — Explore Network. The interactive constellation of communities,
 * proposals, resources, partnerships and members, with an accessible list
 * view. Every node is derived from stored backend data; when nothing is stored
 * yet, an empty state invites participation instead of inventing activity.
 */
export default function DiscoveryNetworkPage() {
  const [view, setView] = useState<ViewMode>("graph");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: directory, isLoading: directoryLoading } = useSearchDirectory(
    "",
    null,
  );
  const { data: submissions, isLoading: submissionsLoading } =
    usePublicSubmissions();
  const { data: collaborators, isLoading: collaboratorsLoading } =
    useMatchingCollaborators(0n);
  const { data: activity } = useNetworkActivityFeed();

  const nodes = useMemo<NetworkNode[]>(() => {
    const fromDirectory = (directory ?? []).map(directoryNode);
    const fromSubmissions = (submissions ?? []).map(submissionNode);
    const fromCollaborators = (collaborators ?? []).map(collaboratorNode);
    return [...fromDirectory, ...fromSubmissions, ...fromCollaborators].map(
      (node, index) => ({
        ...node,
        index,
      }),
    );
  }, [directory, submissions, collaborators]);

  const selected = useMemo(
    () => nodes.find((node) => node.id === selectedId) ?? null,
    [nodes, selectedId],
  );

  const isLoading =
    directoryLoading || submissionsLoading || collaboratorsLoading;
  const hasNodes = nodes.length > 0;

  const handleSelect = (node: NetworkNode) => {
    setSelectedId((current) => (current === node.id ? null : node.id));
  };

  return (
    <DiscoveryShell
      title="Explore Network"
      description="Communities, proposals, resources and members as one connected constellation. Every node comes from stored network data — nothing is invented."
    >
      <IntelligenceHub />

      <section
        data-ocid="discovery.network_explorer"
        aria-label="Network explorer"
        className="flex flex-col gap-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <h2 className="font-display text-lg font-medium tracking-tight text-foreground">
              Network constellation
            </h2>
            <p className="text-xs text-muted-foreground">
              {hasNodes
                ? `${nodes.length} connected ${nodes.length === 1 ? "node" : "nodes"}`
                : "No nodes published yet"}
            </p>
          </div>

          <div
            data-ocid="discovery.network_view.toggle"
            className="flex gap-1 rounded-full border border-border bg-card p-1"
          >
            <button
              type="button"
              data-ocid="discovery.network_view.graph_tab"
              aria-pressed={view === "graph"}
              onClick={() => setView("graph")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-smooth focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                view === "graph"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <Network className="size-3.5" aria-hidden="true" />
              Graph
            </button>
            <button
              type="button"
              data-ocid="discovery.network_view.list_tab"
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-smooth focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                view === "list"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <List className="size-3.5" aria-hidden="true" />
              List
            </button>
          </div>
        </div>

        {isLoading ? (
          <p
            data-ocid="discovery.network_explorer.loading_state"
            className="text-sm text-muted-foreground"
          >
            Reading the network…
          </p>
        ) : hasNodes ? (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="min-w-0">
              {view === "graph" ? (
                <NetworkGraph
                  nodes={nodes}
                  selectedId={selectedId}
                  onSelect={handleSelect}
                />
              ) : (
                <NetworkListView
                  nodes={nodes}
                  selectedId={selectedId}
                  onSelect={handleSelect}
                />
              )}
            </div>

            {selected ? (
              <NodeProfilePanel
                node={selected}
                onClose={() => setSelectedId(null)}
              />
            ) : (
              <aside
                data-ocid="discovery.network_explorer.hint"
                className="network-panel-alt flex flex-col gap-2 p-4"
              >
                <h3 className="font-display text-sm font-medium tracking-tight text-foreground">
                  Select a node
                </h3>
                <p className="text-xs text-muted-foreground">
                  Choose any community, proposal, resource, partnership or
                  member to see its needs, active proposals and collaboration
                  opportunities.
                </p>
              </aside>
            )}
          </div>
        ) : (
          <EmptyState
            ocid="discovery.network_explorer.empty_state"
            title="The network is just beginning"
            description="Publish a community profile or share an idea and it will appear here as a connected node. Nothing is shown until real data is stored."
          />
        )}

        {activity && activity.length > 0 ? (
          <p className="text-xs text-muted-foreground">
            {activity.length} recent network{" "}
            {activity.length === 1 ? "event" : "events"} recorded from stored
            data.
          </p>
        ) : null}
      </section>
    </DiscoveryShell>
  );
}
