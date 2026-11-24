import { Link } from "@tanstack/react-router";
import { Home } from "lucide-react";

import OsStatusMarker from "@/components/os/OsStatusMarker";
import { topLevelApps } from "@/components/os/appRegistry";

/**
 * The persistent desktop sidebar: the SOVEREIGN OS wordmark, a Home control
 * and the full app list. Every row is a 44px nav item with a status marker.
 */
export default function OsSidebar() {
  return (
    <aside
      data-ocid="os.sidebar"
      className="shell-rail sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-4 overflow-y-auto p-4 md:flex"
    >
      <Link
        to="/os"
        data-ocid="os.sidebar.wordmark"
        className="flex flex-col gap-1 px-1 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <span className="font-display text-lg font-semibold tracking-tight text-foreground">
          SOVEREIGN OS
        </span>
        <span className="rule-accent" aria-hidden="true" />
      </Link>

      <Link
        to="/os"
        data-ocid="os.sidebar.home_link"
        className="nav-item os-focus-ring"
        activeProps={{ className: "nav-item nav-item-active" }}
        activeOptions={{ exact: true }}
      >
        <Home className="size-4 shrink-0" aria-hidden="true" />
        <span className="truncate">Home</span>
      </Link>

      <nav aria-label="SOVEREIGN OS apps" className="flex flex-col gap-1">
        {topLevelApps.map((app) => (
          <Link
            key={app.key}
            to={app.to}
            data-ocid={`os.sidebar_link.${app.key}`}
            className="nav-item os-focus-ring"
            activeProps={{ className: "nav-item nav-item-active" }}
          >
            <app.icon className="size-4 shrink-0" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate">{app.label}</span>
            <OsStatusMarker status={app.status} />
          </Link>
        ))}
      </nav>
    </aside>
  );
}
