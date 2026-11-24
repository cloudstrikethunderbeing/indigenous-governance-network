import { Link } from "@tanstack/react-router";

import OsStatusMarker from "@/components/os/OsStatusMarker";
import type { OsApp } from "@/components/os/appRegistry";

/**
 * A single app icon on the desktop: a squircle instrument tile with a glyph
 * plate, a name label and a working/preview status marker. Rendered as a link
 * so it is keyboard navigable with a visible focus ring.
 */
export default function OsAppIcon({ app }: { app: OsApp }) {
  const statusLabel = app.status === "working" ? "Working" : "Preview";
  return (
    <Link
      to={app.to}
      data-ocid={`os.app_icon.${app.key}`}
      aria-label={`${app.label} — ${statusLabel}. ${app.description}`}
      className="os-icon-tile os-focus-ring group relative"
    >
      <span className="absolute right-2 top-2">
        <OsStatusMarker status={app.status} />
      </span>
      <span className="os-icon-glyph" aria-hidden="true">
        <app.icon className="size-5" />
      </span>
      <span className="os-icon-label">{app.label}</span>
    </Link>
  );
}
