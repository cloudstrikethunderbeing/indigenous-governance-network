import { Link } from "@tanstack/react-router";
import {
  Building2,
  CheckCircle2,
  FileText,
  Handshake,
  Lightbulb,
  Users,
} from "lucide-react";

import DiscoveryActivityFeed from "@/components/discovery/DiscoveryActivityFeed";
import DiscoveryPreviewSection from "@/components/discovery/DiscoveryPreviewSection";
import DiscoveryShell from "@/components/discovery/DiscoveryShell";
import EmptyState from "@/components/discovery/EmptyState";
import MetricCard from "@/components/discovery/MetricCard";
import {
  useCollectiveIntelligenceMetrics,
  useNetworkActivityFeed,
} from "@/hooks/useDiscovery";

/**
 * Discovery — Collective Intelligence. Six metrics and an activity feed, all
 * derived from real stored backend data. When nothing is stored yet, each
 * surface invites participation instead of showing fabricated figures.
 */
export default function DiscoveryDashboardPage() {
  const { data: metrics, isLoading: metricsLoading } =
    useCollectiveIntelligenceMetrics();
  const { data: feed, isLoading: feedLoading } = useNetworkActivityFeed();

  const metricCards = [
    {
      label: "Active participating DAOs",
      value: metrics?.activeCommunities,
      hint: "Communities with a published profile.",
      icon: <Building2 className="size-4" />,
      ocid: "discovery.metric.active_daos",
    },
    {
      label: "Community ideas submitted",
      value: metrics?.ideasSubmitted,
      hint: "Ideas, needs and opportunities shared.",
      icon: <Lightbulb className="size-4" />,
      ocid: "discovery.metric.ideas_submitted",
    },
    {
      label: "Collaboration opportunities",
      value: metrics?.collaborationOpportunities,
      hint: "Open calls for partners and skills.",
      icon: <Users className="size-4" />,
      ocid: "discovery.metric.collaboration_opportunities",
    },
    {
      label: "Active proposals",
      value: metrics?.activeProposals,
      hint: "Proposals currently in the pipeline.",
      icon: <FileText className="size-4" />,
      ocid: "discovery.metric.active_proposals",
    },
    {
      label: "Successful partnerships",
      value: metrics?.successfulPartnerships,
      hint: "Introductions that became collaborations.",
      icon: <Handshake className="size-4" />,
      ocid: "discovery.metric.successful_partnerships",
    },
    {
      label: "Completed community initiatives",
      value: metrics?.completedInitiatives,
      hint: "Initiatives carried through to completion.",
      icon: <CheckCircle2 className="size-4" />,
      ocid: "discovery.metric.completed_initiatives",
    },
  ];

  const hasAnyMetric = metricCards.some((card) => (card.value ?? 0n) > 0n);
  const entries = feed ?? [];

  return (
    <DiscoveryShell
      title="Collective Intelligence"
      description="Metrics and activity derived from real stored data across the network."
    >
      <section
        data-ocid="discovery.metrics_section"
        aria-label="Collective intelligence metrics"
        className="flex flex-col gap-3"
      >
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-base font-medium tracking-tight text-foreground">
            Network at a glance
          </h2>
          <p className="text-sm text-muted-foreground">
            Every figure is read from stored data — nothing is estimated.
          </p>
        </div>

        {metricsLoading ? (
          <div
            data-ocid="discovery.metrics.loading_state"
            className="grid grid-cols-2 gap-3 sm:grid-cols-3"
          >
            {Array.from({ length: 6 }, (_, i) => `metric-skeleton-${i}`).map(
              (id) => (
                <div
                  key={id}
                  className="network-panel h-[92px] motion-safe:animate-pulse"
                  aria-hidden="true"
                />
              ),
            )}
          </div>
        ) : hasAnyMetric ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {metricCards.map((card) => (
              <MetricCard
                key={card.label}
                label={card.label}
                value={(card.value ?? 0n).toString()}
                hint={card.hint}
                icon={card.icon}
                ocid={card.ocid}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            ocid="discovery.metrics.empty_state"
            title="The network is just beginning"
            description="No activity has been recorded yet. Share an idea or publish a community profile to start building shared intelligence."
            action={
              <Link
                to="/dao/discovery/ideas"
                data-ocid="discovery.metrics.empty_state.action"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <Lightbulb className="size-4" aria-hidden="true" />
                Share an idea
              </Link>
            }
          />
        )}
      </section>

      <section
        data-ocid="discovery.activity_section"
        aria-label="Network activity"
        className="flex flex-col gap-3"
      >
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-base font-medium tracking-tight text-foreground">
            Network activity
          </h2>
          <p className="text-sm text-muted-foreground">
            New public ideas, proposals, partnerships and community milestones.
          </p>
        </div>

        {feedLoading ? (
          <div
            data-ocid="discovery.activity.loading_state"
            className="network-panel flex flex-col gap-3 p-4"
          >
            {Array.from({ length: 4 }, (_, i) => `feed-skeleton-${i}`).map(
              (id) => (
                <div
                  key={id}
                  className="h-4 w-full motion-safe:animate-pulse rounded bg-muted"
                  aria-hidden="true"
                />
              ),
            )}
          </div>
        ) : entries.length > 0 ? (
          <DiscoveryActivityFeed entries={entries} />
        ) : (
          <EmptyState
            ocid="discovery.activity.empty_state"
            title="No activity yet"
            description="When communities share ideas, open proposals or form partnerships, their milestones will appear here."
            action={
              <Link
                to="/dao/discovery/network"
                data-ocid="discovery.activity.empty_state.action"
                className="inline-flex items-center gap-2 rounded-md border border-input bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Explore the network
              </Link>
            }
          />
        )}
      </section>

      <section
        data-ocid="discovery.previews_section"
        aria-label="Later-phase capabilities (previews)"
        className="flex flex-col gap-3"
      >
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-base font-medium tracking-tight text-foreground">
            What comes next
          </h2>
          <p className="text-sm text-muted-foreground">
            These capabilities are planned for later phases. They are previews
            only — nothing below is live.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <DiscoveryPreviewSection
            title="AI-assisted proposal drafting"
            description="Turn a rough idea into a structured proposal with guided prompts and suggested sections."
            phase="Phase 2 preview"
          />
          <DiscoveryPreviewSection
            title="Semantic matching"
            description="Surface the communities, skills and resources most relevant to a stated goal."
            phase="Phase 2 preview"
          />
          <DiscoveryPreviewSection
            title="Community feedback summaries"
            description="Condense long discussion threads into a clear, neutral summary of the key points."
            phase="Phase 2 preview"
          />
          <DiscoveryPreviewSection
            title="Proactive recommendations"
            description="Suggest timely opportunities and collaborators as the network evolves."
            phase="Phase 2 preview"
          />
          <DiscoveryPreviewSection
            title="Cross-community collaboration"
            description="Coordinate work across multiple communities with shared goals and resources."
            phase="Phase 3 preview"
          />
          <DiscoveryPreviewSection
            title="Shared project opportunities"
            description="Pool resources and skills into joint initiatives that no single community could run alone."
            phase="Phase 3 preview"
          />
          <DiscoveryPreviewSection
            title="Collective outcome tracking"
            description="Follow the shared results of network-wide initiatives over time."
            phase="Phase 3 preview"
          />
        </div>
      </section>
    </DiscoveryShell>
  );
}
