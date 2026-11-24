import { useMemo } from "react";

import type {
  NetworkNode,
  NetworkNodeKind,
} from "@/components/discovery/network-types";

const KIND_CLASS: Record<NetworkNodeKind, string> = {
  community: "network-node-community",
  proposal: "network-node-proposal",
  resource: "network-node-resource",
  partner: "network-node-partner",
  member: "network-node-member",
};

const VIEW = 640;
const CENTER = VIEW / 2;
const HUB_RADIUS = 46;
const ORBIT_RADIUS = 232;

/**
 * A deterministic constellation of the network. Nodes are placed on a ring
 * around the SOVEREIGN Intelligence hub; links connect each node to the hub
 * and to its nearest neighbour. Every node comes from stored backend data.
 */
export default function NetworkGraph({
  nodes,
  selectedId,
  onSelect,
}: {
  nodes: NetworkNode[];
  selectedId: string | null;
  onSelect: (node: NetworkNode) => void;
}) {
  const placed = useMemo(() => {
    const count = Math.max(nodes.length, 1);
    return nodes.map((node, index) => {
      const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
      return {
        node,
        x: CENTER + Math.cos(angle) * ORBIT_RADIUS,
        y: CENTER + Math.sin(angle) * ORBIT_RADIUS,
      };
    });
  }, [nodes]);

  return (
    <div
      data-ocid="discovery.network_graph"
      className="network-canvas relative w-full overflow-hidden"
    >
      <svg
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        role="img"
        aria-label="Network graph of communities, proposals, resources, partners and members connected to the SOVEREIGN Intelligence hub"
        className="h-auto w-full"
      >
        <defs>
          <radialGradient id="hub-glow" cx="50%" cy="50%" r="50%">
            <stop
              offset="0%"
              stopColor="oklch(var(--network-hub))"
              stopOpacity="0.28"
            />
            <stop
              offset="100%"
              stopColor="oklch(var(--network-hub))"
              stopOpacity="0"
            />
          </radialGradient>
        </defs>

        <circle
          cx={CENTER}
          cy={CENTER}
          r={HUB_RADIUS * 2.4}
          fill="url(#hub-glow)"
        />

        {placed.map(({ node, x, y }) => (
          <line
            key={`link-${node.id}`}
            x1={CENTER}
            y1={CENTER}
            x2={x}
            y2={y}
            className={
              selectedId === node.id ? "network-link-active" : "network-link"
            }
          />
        ))}

        {placed.map(({ node, x, y }, index) => {
          const next = placed[(index + 1) % placed.length];
          if (placed.length < 2 || next.node.id === node.id) return null;
          return (
            <line
              key={`ring-${node.id}`}
              x1={x}
              y1={y}
              x2={next.x}
              y2={next.y}
              className="network-link"
              opacity={0.35}
            />
          );
        })}

        <g>
          <circle
            cx={CENTER}
            cy={CENTER}
            r={HUB_RADIUS}
            fill="oklch(var(--network-hub))"
            stroke="oklch(var(--network-link))"
            strokeWidth={2}
          />
          <text
            x={CENTER}
            y={CENTER - 4}
            textAnchor="middle"
            className="fill-[oklch(var(--network-hub-fg))] font-mono text-[11px] font-semibold uppercase tracking-wider"
          >
            SOVEREIGN
          </text>
          <text
            x={CENTER}
            y={CENTER + 10}
            textAnchor="middle"
            className="fill-[oklch(var(--network-hub-fg))] font-mono text-[9px] uppercase tracking-wider"
          >
            Intelligence
          </text>
        </g>

        {placed.map(({ node, x, y }) => {
          const size = node.kind === "community" ? 34 : 26;
          const selected = selectedId === node.id;
          return (
            <foreignObject
              key={node.id}
              x={x - size / 2}
              y={y - size / 2}
              width={size}
              height={size}
              className="overflow-visible"
            >
              <button
                type="button"
                data-ocid={`discovery.network_node.${node.index}`}
                aria-label={`${node.label} — ${node.kind}`}
                aria-pressed={selected}
                onClick={() => onSelect(node)}
                className={`network-node ${KIND_CLASS[node.kind]} ${
                  selected ? "network-node-selected" : ""
                } size-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring`}
              >
                <span className="sr-only">{node.label}</span>
              </button>
            </foreignObject>
          );
        })}

        {placed.map(({ node, x, y }) => (
          <text
            key={`label-${node.id}`}
            x={x}
            y={y + (node.kind === "community" ? 17 : 13) + 12}
            textAnchor="middle"
            className="pointer-events-none fill-[oklch(var(--foreground))] font-body text-[10px]"
          >
            {node.label.length > 18
              ? `${node.label.slice(0, 17)}…`
              : node.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
