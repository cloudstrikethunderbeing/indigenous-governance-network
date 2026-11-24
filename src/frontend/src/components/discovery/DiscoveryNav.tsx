import { Link } from "@tanstack/react-router";
import { LayoutDashboard, Lightbulb, Network, Users } from "lucide-react";

const items = [
  {
    to: "/dao/discovery",
    label: "Overview",
    icon: Network,
    ocid: "overview",
    exact: true,
  },
  {
    to: "/dao/discovery/network",
    label: "Explore Network",
    icon: Network,
    ocid: "network",
  },
  {
    to: "/dao/discovery/ideas",
    label: "Share an Idea",
    icon: Lightbulb,
    ocid: "ideas",
  },
  {
    to: "/dao/discovery/collaborators",
    label: "Find Collaborators",
    icon: Users,
    ocid: "collaborators",
  },
  {
    to: "/dao/discovery/dashboard",
    label: "Intelligence",
    icon: LayoutDashboard,
    ocid: "dashboard",
  },
] as const;

/**
 * Sub-navigation across the Discovery area. Rendered inside DiscoveryShell so
 * every Discovery page shares the same section rail.
 */
export default function DiscoveryNav() {
  return (
    <nav
      aria-label="Discovery sections"
      data-ocid="discovery.nav"
      className="flex flex-wrap gap-1"
    >
      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          data-ocid={`discovery.nav.${item.ocid}`}
          activeOptions={{ exact: "exact" in item && item.exact }}
          className="nav-item focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          activeProps={{ className: "nav-item nav-item-active" }}
        >
          <item.icon className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
