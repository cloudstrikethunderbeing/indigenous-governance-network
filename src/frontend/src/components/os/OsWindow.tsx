import { Link } from "@tanstack/react-router";
import { Home, X } from "lucide-react";
import type { ReactNode } from "react";

import OsStatusMarker from "@/components/os/OsStatusMarker";
import type { OsApp } from "@/components/os/appRegistry";

/**
 * An app window: a paper card with a chrome bar carrying the app title, its
 * working/preview status, a Home control and a close control that returns to
 * the desktop. The body is the app's own content.
 */
export default function OsWindow({
  app,
  children,
}: {
  app: OsApp;
  children: ReactNode;
}) {
  return (
    <section
      data-ocid={`os.window.${app.key}`}
      aria-label={`${app.label} window`}
      className="os-window animate-os-window-in"
    >
      <header className="os-window-chrome">
        <span className="os-icon-glyph size-8 shrink-0" aria-hidden="true">
          <app.icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-lg font-medium tracking-tight text-foreground">
            {app.label}
          </h1>
          <p className="truncate text-xs text-muted-foreground">
            {app.description}
          </p>
        </div>
        <span className="hidden items-center gap-1.5 sm:flex">
          <OsStatusMarker status={app.status} />
          <span className="text-stamp text-muted-foreground">
            {app.status === "working" ? "Working" : "Preview"}
          </span>
        </span>
        <Link
          to="/os"
          data-ocid={`os.window.home_button.${app.key}`}
          aria-label="Home — return to the desktop"
          className="os-focus-ring flex size-11 items-center justify-center rounded-lg text-foreground transition-smooth hover:bg-muted"
        >
          <Home className="size-4" aria-hidden="true" />
        </Link>
        <Link
          to="/os"
          data-ocid={`os.window.close_button.${app.key}`}
          aria-label={`Close ${app.label}`}
          className="os-focus-ring flex size-11 items-center justify-center rounded-lg text-foreground transition-smooth hover:bg-muted"
        >
          <X className="size-4" aria-hidden="true" />
        </Link>
      </header>
      <div className="os-window-body p-4 md:p-6">{children}</div>
    </section>
  );
}
