import { Link } from "@tanstack/react-router";
import { LayoutDashboard, Lightbulb, Network, Users } from "lucide-react";

import DiscoveryShell from "@/components/discovery/DiscoveryShell";
import IntelligenceHub from "@/components/discovery/IntelligenceHub";

const destinations = [
  {
    to: "/dao/discovery/network",
    title: "Explore the Network",
    description:
      "See how communities, proposals, resources and members connect, with an accessible list view.",
    icon: Network,
    ocid: "network",
  },
  {
    to: "/dao/discovery/ideas",
    title: "Share an Idea",
    description:
      "Submit an idea, need or opportunity and follow it through the idea-to-proposal pipeline.",
    icon: Lightbulb,
    ocid: "ideas",
  },
  {
    to: "/dao/discovery/collaborators",
    title: "Find Collaborators",
    description:
      "Discover communities and members with shared goals and request an introduction.",
    icon: Users,
    ocid: "collaborators",
  },
  {
    to: "/dao/discovery/dashboard",
    title: "Collective Intelligence",
    description:
      "Metrics and an activity feed derived from real stored data across the network.",
    icon: LayoutDashboard,
    ocid: "dashboard",
  },
] as const;

/**
 * The Discovery landing view. Introduces the shared intelligence service and
 * routes into each Discovery surface.
 */
export default function DiscoveryPage() {
  return (
    <DiscoveryShell
      title="Discovery"
      description="One shared intelligence service that helps communities find each other, share ideas and turn them into action — without exposing private community data."
    >
      <IntelligenceHub />

      <div className="grid gap-3 sm:grid-cols-2">
        {destinations.map((destination) => (
          <Link
            key={destination.to}
            to={destination.to}
            data-ocid={`discovery.destination.${destination.ocid}`}
            className="network-panel flex flex-col gap-2 p-4 transition-smooth hover:border-primary/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <span
              aria-hidden="true"
              className="flex size-9 items-center justify-center rounded-md bg-muted text-foreground"
            >
              <destination.icon className="size-4" />
            </span>
            <span className="font-display text-sm font-medium text-foreground">
              {destination.title}
            </span>
            <span className="text-xs text-muted-foreground">
              {destination.description}
            </span>
          </Link>
        ))}
      </div>
    </DiscoveryShell>
  );
}
