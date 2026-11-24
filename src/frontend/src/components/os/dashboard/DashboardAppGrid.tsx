import { Link } from "@tanstack/react-router";

import OsStatusMarker from "@/components/os/OsStatusMarker";
import { osApps } from "@/components/os/appRegistry";

/**
 * The dashboard's app grid: every Nation app as a tappable card that links into
 * its workspace app. Each card carries the app glyph, name, one-line
 * description and a working/preview status marker, so the whole workspace is
 * reachable from one screen.
 */
export default function DashboardAppGrid() {
  return (
    <section
      data-ocid="os.dashboard.apps_section"
      aria-label="Nation apps"
      className="space-y-3"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-display text-lg font-medium text-foreground">
          Your Nation's apps
        </h3>
        <span className="text-stamp text-muted-foreground">
          {osApps.length} apps
        </span>
      </div>
      <ul
        data-ocid="os.dashboard.app_grid"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
      >
        {osApps.map((app) => (
          <li key={app.key} className="min-w-0">
            <Link
              to={app.to}
              data-ocid={`os.dashboard.app_card.${app.key}`}
              aria-label={`${app.label} — ${app.status === "working" ? "Working" : "Preview"}. ${app.description}`}
              className="os-icon-tile os-focus-ring group h-full items-start text-left"
            >
              <span className="flex w-full items-start justify-between gap-2">
                <span className="os-icon-glyph" aria-hidden="true">
                  <app.icon className="size-5" />
                </span>
                <OsStatusMarker status={app.status} />
              </span>
              <span className="os-icon-label">{app.label}</span>
              <span className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                {app.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
