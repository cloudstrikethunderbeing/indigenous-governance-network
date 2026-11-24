import type { ActivityKind, NetworkActivityEntry } from "@/backend";

const KIND_LABEL: Record<ActivityKind, string> = {
  publicIdea: "New public idea",
  proposal: "Proposal",
  partnership: "Partnership",
  communityMilestone: "Community milestone",
};

function formatTimestamp(timestamp: bigint): string {
  const date = new Date(Number(timestamp / 1_000_000n));
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/**
 * The interactive activity feed of new public ideas, proposals, partnerships
 * and community milestones. Every entry comes from stored backend data.
 */
export default function DiscoveryActivityFeed({
  entries,
}: {
  entries: NetworkActivityEntry[];
}) {
  return (
    <ol
      data-ocid="discovery.activity_feed"
      className="network-panel divide-y divide-border"
    >
      {entries.map((entry, index) => (
        <li
          key={entry.id.toString()}
          data-ocid={`discovery.activity_row.${index}`}
          className="flex items-start gap-3 px-4 py-3"
        >
          <span
            aria-hidden="true"
            className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-stamp text-muted-foreground">
              {KIND_LABEL[entry.kind]}
            </span>
            <span className="text-sm text-foreground">{entry.summary}</span>
          </div>
          <time className="shrink-0 text-xs text-muted-foreground">
            {formatTimestamp(entry.timestamp)}
          </time>
        </li>
      ))}
    </ol>
  );
}
