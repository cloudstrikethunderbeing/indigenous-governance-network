import { Link } from "@tanstack/react-router";
import { Lightbulb, Network, Users } from "lucide-react";
import type { ReactNode } from "react";

import DiscoveryNav from "@/components/discovery/DiscoveryNav";

const actions = [
  {
    to: "/dao/discovery/network",
    label: "Explore Network",
    description: "See how communities, ideas and skills connect.",
    icon: Network,
    ocid: "explore_network",
  },
  {
    to: "/dao/discovery/ideas",
    label: "Share an Idea",
    description: "Submit an idea, need or opportunity in plain language.",
    icon: Lightbulb,
    ocid: "share_idea",
  },
  {
    to: "/dao/discovery/collaborators",
    label: "Find Collaborators",
    description: "Discover communities and members with shared goals.",
    icon: Users,
    ocid: "find_collaborators",
  },
] as const;

/**
 * The shared Discovery layout: a heading, the three prominent actions, the
 * section sub-navigation and the page body. Every Discovery page renders
 * inside this shell so the area stays visually consistent.
 */
export default function DiscoveryShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div data-ocid="discovery.shell" className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <span className="text-stamp text-muted-foreground">
          SOVEREIGN Intelligence
        </span>
        <h1 className="font-display text-2xl font-medium tracking-tight text-foreground md:text-3xl">
          {title}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
      </header>

      <div data-ocid="discovery.actions" className="grid gap-3 sm:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            data-ocid={`discovery.action.${action.ocid}`}
            className="quick-action focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <span
              aria-hidden="true"
              className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground"
            >
              <action.icon className="size-4" />
            </span>
            <span className="font-display text-sm font-medium text-foreground">
              {action.label}
            </span>
            <span className="text-xs text-muted-foreground">
              {action.description}
            </span>
          </Link>
        ))}
      </div>

      <DiscoveryNav />

      <div className="flex flex-col gap-6">{children}</div>
    </div>
  );
}
