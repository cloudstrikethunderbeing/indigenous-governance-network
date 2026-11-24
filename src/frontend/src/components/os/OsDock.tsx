import { Link } from "@tanstack/react-router";
import { Home } from "lucide-react";

import OsStatusMarker from "@/components/os/OsStatusMarker";
import { dockApps } from "@/components/os/appRegistry";

/**
 * The frosted paper dock: the most-used apps plus a persistent Home control
 * that returns the visitor to the desktop from any app or workspace view.
 */
export default function OsDock() {
  return (
    <nav
      aria-label="Dock"
      data-ocid="os.dock"
      className="os-dock flex items-center gap-1.5 p-2 md:gap-2 md:p-3"
    >
      <Link
        to="/os"
        data-ocid="os.dock.home_button"
        aria-label="Home — return to the desktop"
        className="os-dock-item os-focus-ring"
      >
        <Home className="size-5" aria-hidden="true" />
      </Link>
      <span aria-hidden="true" className="mx-0.5 h-8 w-px bg-border md:mx-1" />
      {dockApps.map((app) => (
        <Link
          key={app.key}
          to={app.to}
          data-ocid={`os.dock.item.${app.key}`}
          aria-label={`${app.label} — ${app.status === "working" ? "Working" : "Preview"}`}
          className="os-dock-item os-focus-ring relative"
        >
          <app.icon className="size-5" aria-hidden="true" />
          <span className="absolute right-1 top-1">
            <OsStatusMarker status={app.status} />
          </span>
        </Link>
      ))}
    </nav>
  );
}
