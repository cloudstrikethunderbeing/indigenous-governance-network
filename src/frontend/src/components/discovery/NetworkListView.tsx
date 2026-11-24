import {
  NODE_KIND_LABEL,
  type NetworkNode,
} from "@/components/discovery/network-types";

/**
 * An accessible, readable alternative to the network graph. Shows the same
 * nodes and their relationships as rows, usable on mobile and desktop.
 */
export default function NetworkListView({
  nodes,
  selectedId,
  onSelect,
}: {
  nodes: NetworkNode[];
  selectedId: string | null;
  onSelect: (node: NetworkNode) => void;
}) {
  return (
    <ul
      data-ocid="discovery.network_list"
      className="network-panel divide-y divide-border"
    >
      {nodes.map((node) => {
        const selected = selectedId === node.id;
        return (
          <li key={node.id}>
            <button
              type="button"
              data-ocid={`discovery.network_row.${node.index}`}
              aria-pressed={selected}
              onClick={() => onSelect(node)}
              className={`flex w-full flex-col gap-1 px-4 py-3 text-left transition-smooth hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                selected ? "bg-muted" : ""
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="network-chip">
                  {NODE_KIND_LABEL[node.kind]}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                  {node.label}
                </span>
              </span>
              <span className="text-xs text-muted-foreground">
                {node.summary}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
