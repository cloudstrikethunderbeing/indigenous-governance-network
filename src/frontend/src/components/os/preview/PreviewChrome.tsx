import { Home, LayoutGrid } from "lucide-react";

import type { PreviewApp } from "@/components/os/preview/previewApps";
import {
  previewApps,
  previewDockApps,
} from "@/components/os/preview/previewApps";

/**
 * The preview's own chrome: a sidebar, a dock and a mobile bottom bar. Unlike
 * the real OS chrome these are buttons, not router links, so selecting an app
 * switches the preview's view in place and never navigates the visitor away
 * from the landing page. Every target is at least 44px.
 */

/** The preview sidebar: the wordmark, a Home control and the app list. */
export function PreviewSidebar({
  activeKey,
  onSelect,
}: {
  activeKey: string;
  onSelect: (key: string) => void;
}) {
  return (
    <aside
      data-ocid="deploy.preview.sidebar"
      className="shell-rail hidden w-56 shrink-0 flex-col gap-3 overflow-y-auto p-3 md:flex"
    >
      <div className="flex flex-col gap-1 px-1 py-1">
        <span className="font-display text-base font-semibold tracking-tight text-foreground">
          SOVEREIGN OS
        </span>
        <span className="rule-accent" aria-hidden="true" />
      </div>

      <button
        type="button"
        data-ocid="deploy.preview.home_button"
        onClick={() => onSelect("dashboard")}
        className={`nav-item os-focus-ring ${
          activeKey === "dashboard" ? "nav-item-active" : ""
        }`}
      >
        <Home className="size-4 shrink-0" aria-hidden="true" />
        <span className="truncate">Home</span>
      </button>

      <nav aria-label="Preview apps" className="flex flex-col gap-1">
        {previewApps.map((app) => (
          <button
            key={app.key}
            type="button"
            data-ocid={`deploy.preview.sidebar_link.${app.key}`}
            aria-current={activeKey === app.key ? "page" : undefined}
            onClick={() => onSelect(app.key)}
            className={`nav-item os-focus-ring ${
              activeKey === app.key ? "nav-item-active" : ""
            }`}
          >
            <app.icon className="size-4 shrink-0" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate text-left">
              {app.label}
            </span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

/** The preview dock: a Home control plus the most-used apps. */
export function PreviewDock({
  activeKey,
  onSelect,
}: {
  activeKey: string;
  onSelect: (key: string) => void;
}) {
  return (
    <nav
      aria-label="Preview dock"
      data-ocid="deploy.preview.dock"
      className="os-dock flex items-center gap-1.5 p-2"
    >
      <button
        type="button"
        data-ocid="deploy.preview.dock.home_button"
        aria-label="Home — return to the dashboard"
        onClick={() => onSelect("dashboard")}
        className="os-dock-item os-focus-ring"
      >
        <Home className="size-5" aria-hidden="true" />
      </button>
      <span aria-hidden="true" className="mx-0.5 h-8 w-px bg-border" />
      {previewDockApps.map((app) => (
        <button
          key={app.key}
          type="button"
          data-ocid={`deploy.preview.dock.item.${app.key}`}
          aria-label={app.label}
          aria-current={activeKey === app.key ? "page" : undefined}
          onClick={() => onSelect(app.key)}
          className="os-dock-item os-focus-ring"
        >
          <app.icon className="size-5" aria-hidden="true" />
        </button>
      ))}
    </nav>
  );
}

/** The preview mobile bottom bar: Home, the first four apps and an Apps button. */
export function PreviewMobileBar({
  activeKey,
  onSelect,
  onOpenDrawer,
}: {
  activeKey: string;
  onSelect: (key: string) => void;
  onOpenDrawer: () => void;
}) {
  const barApps = previewDockApps.slice(0, 4);
  return (
    <nav
      aria-label="Preview mobile navigation"
      data-ocid="deploy.preview.mobile_bar"
      className="os-bottom-bar flex items-center justify-around px-2 py-1.5 md:hidden"
    >
      <button
        type="button"
        data-ocid="deploy.preview.mobile_bar.home_button"
        aria-label="Home — return to the dashboard"
        onClick={() => onSelect("dashboard")}
        className="os-focus-ring flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-lg px-2 text-foreground"
      >
        <Home className="size-5" aria-hidden="true" />
        <span className="text-[0.6rem] font-medium">Home</span>
      </button>
      {barApps.map((app) => (
        <button
          key={app.key}
          type="button"
          data-ocid={`deploy.preview.mobile_bar.item.${app.key}`}
          aria-label={app.label}
          aria-current={activeKey === app.key ? "page" : undefined}
          onClick={() => onSelect(app.key)}
          className="os-focus-ring flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-lg px-2 text-foreground"
        >
          <app.icon className="size-5" aria-hidden="true" />
          <span className="max-w-[3.5rem] truncate text-[0.6rem] font-medium">
            {app.label}
          </span>
        </button>
      ))}
      <button
        type="button"
        data-ocid="deploy.preview.mobile_bar.drawer_button"
        aria-label="Open all apps"
        onClick={onOpenDrawer}
        className="os-focus-ring flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-lg px-2 text-foreground"
      >
        <LayoutGrid className="size-5" aria-hidden="true" />
        <span className="text-[0.6rem] font-medium">Apps</span>
      </button>
    </nav>
  );
}

/** The preview app grid shown on the dashboard view. */
export function PreviewAppGrid({
  activeKey,
  onSelect,
}: {
  activeKey: string;
  onSelect: (key: string) => void;
}) {
  return (
    <ul
      data-ocid="deploy.preview.app_grid"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
    >
      {previewApps.map((app: PreviewApp) => (
        <li key={app.key} className="min-w-0">
          <button
            type="button"
            data-ocid={`deploy.preview.app_icon.${app.key}`}
            aria-label={`${app.label} — ${app.description}`}
            aria-current={activeKey === app.key ? "page" : undefined}
            onClick={() => onSelect(app.key)}
            className="os-icon-tile os-focus-ring h-full items-start text-left"
          >
            <span className="os-icon-glyph" aria-hidden="true">
              <app.icon className="size-5" />
            </span>
            <span className="os-icon-label">{app.label}</span>
            <span className="line-clamp-2 text-xs leading-snug text-muted-foreground">
              {app.description}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
