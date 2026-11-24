import { X } from "lucide-react";

import {
  NODE_KIND_LABEL,
  type NetworkNode,
} from "@/components/discovery/network-types";

function Section({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <h4 className="text-stamp text-muted-foreground">{title}</h4>
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li
            key={item}
            className="rounded border border-border bg-card px-2.5 py-1.5 text-xs text-foreground"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The profile panel shown when a network node is selected. Presents the node's
 * needs, active proposals and collaboration opportunities from stored data.
 */
export default function NodeProfilePanel({
  node,
  onClose,
}: {
  node: NetworkNode;
  onClose: () => void;
}) {
  return (
    <aside
      data-ocid="discovery.node_profile_panel"
      aria-label={`${node.label} profile`}
      className="network-panel flex flex-col gap-4 p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="network-chip w-fit">
            {NODE_KIND_LABEL[node.kind]}
          </span>
          <h3 className="font-display text-lg font-medium tracking-tight text-foreground">
            {node.label}
          </h3>
        </div>
        <button
          type="button"
          data-ocid="discovery.node_profile_panel.close_button"
          aria-label="Close profile panel"
          onClick={onClose}
          className="rounded-md p-1.5 text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      <p className="text-sm text-muted-foreground">{node.summary}</p>

      <Section title="Needs" items={node.needs} />
      <Section title="Active proposals" items={node.proposals} />
      <Section title="Collaboration opportunities" items={node.opportunities} />

      {node.needs.length === 0 &&
      node.proposals.length === 0 &&
      node.opportunities.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          This node has not published needs, proposals or opportunities yet.
        </p>
      ) : null}
    </aside>
  );
}
