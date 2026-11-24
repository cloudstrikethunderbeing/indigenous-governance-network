import { useCollectiveIntelligenceMetrics } from "@/hooks/useDiscovery";

/**
 * The central SOVEREIGN Intelligence hub. Shows live, permission-filtered
 * network information derived from stored backend data. When no data exists
 * yet, it invites participation instead of showing fabricated figures.
 */
export default function IntelligenceHub() {
  const { data: metrics, isLoading } = useCollectiveIntelligenceMetrics();

  const rows = [
    { label: "Active communities", value: metrics?.activeCommunities },
    { label: "Ideas submitted", value: metrics?.ideasSubmitted },
    {
      label: "Collaboration opportunities",
      value: metrics?.collaborationOpportunities,
    },
    { label: "Active proposals", value: metrics?.activeProposals },
    {
      label: "Successful partnerships",
      value: metrics?.successfulPartnerships,
    },
    { label: "Completed initiatives", value: metrics?.completedInitiatives },
  ];

  const hasAny = rows.some((row) => (row.value ?? 0n) > 0n);

  return (
    <section
      data-ocid="discovery.intelligence_hub"
      aria-label="SOVEREIGN Intelligence hub"
      className="network-panel flex flex-col gap-4 p-5"
    >
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="network-node-hub size-12 shrink-0">
          SI
        </span>
        <div className="flex min-w-0 flex-col">
          <h2 className="font-display text-lg font-medium tracking-tight text-foreground">
            SOVEREIGN Intelligence
          </h2>
          <p className="text-xs text-muted-foreground">
            One shared service across every Discovery feature.
          </p>
        </div>
      </div>

      {isLoading ? (
        <p
          data-ocid="discovery.intelligence_hub.loading_state"
          className="text-sm text-muted-foreground"
        >
          Reading the network…
        </p>
      ) : hasAny ? (
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {rows.map((row) => (
            <div key={row.label} className="flex flex-col gap-0.5">
              <dt className="text-stamp text-muted-foreground">{row.label}</dt>
              <dd className="network-metric text-xl">
                {(row.value ?? 0n).toString()}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p
          data-ocid="discovery.intelligence_hub.empty_state"
          className="text-sm text-muted-foreground"
        >
          The network is just beginning. Share an idea or publish a profile to
          start building shared intelligence.
        </p>
      )}
    </section>
  );
}
