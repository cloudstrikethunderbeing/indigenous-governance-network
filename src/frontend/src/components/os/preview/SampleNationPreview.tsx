import { X } from "lucide-react";
import { useState } from "react";

import OsWallpaper from "@/components/os/OsWallpaper";
import { useSampleNationId } from "@/components/os/files/useSampleNationId";
import { PreviewAppView } from "@/components/os/preview/PreviewAppViews";
import {
  PreviewAppGrid,
  PreviewDock,
  PreviewMobileBar,
  PreviewSidebar,
} from "@/components/os/preview/PreviewChrome";
import {
  findPreviewApp,
  previewApps,
} from "@/components/os/preview/previewApps";
import { sampleNation, sampleNationNotice } from "@/data/sampleNation";

/**
 * The landing page's live Sample Nation preview.
 *
 * This is a real, interactive SOVEREIGN OS surface — the same wallpaper, dock,
 * app icons, sidebar and mobile bar the workspace uses — rendered inside a
 * framed window on the landing page. Selecting an app or dock item switches the
 * preview's view in place, so a visitor can explore the Sample Nation without
 * signing in and without leaving the landing page. A persistent Home control
 * returns to the dashboard from any view.
 */
export default function SampleNationPreview() {
  const [activeKey, setActiveKey] = useState("dashboard");
  const [drawerOpen, setDrawerOpen] = useState(false);
  // The sample Nation id is a backend-owned sentinel, resolved from the
  // backend so the preview reads the same stored wallpaper preference that
  // Appearance settings writes.
  const sampleNationId = useSampleNationId();
  const activeApp = findPreviewApp(activeKey);

  function select(key: string) {
    setActiveKey(key);
    setDrawerOpen(false);
  }

  return (
    <div
      data-ocid="deploy.preview"
      className="os-preview-frame relative"
      aria-label="Live Sample Nation preview"
    >
      {/* Window chrome */}
      <div className="os-preview-chrome">
        <span className="flex items-center gap-1.5" aria-hidden="true">
          <span className="os-preview-dot" />
          <span className="os-preview-dot" />
          <span className="os-preview-dot" />
        </span>
        <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
          {sampleNation.name} — {activeApp.label}
        </span>
        <span className="os-preview-badge">Live preview</span>
      </div>

      {/* The interactive OS surface */}
      <div className="os-desktop relative flex min-h-[30rem] flex-col md:min-h-[34rem]">
        <OsWallpaper workspaceId={sampleNationId.toString()} />

        <div className="relative z-10 flex flex-1">
          <PreviewSidebar activeKey={activeKey} onSelect={select} />

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="shell-header sticky top-0 z-20">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-stamp text-accent">Sample Nation</p>
                  <h3 className="truncate font-display text-base font-medium tracking-tight text-foreground">
                    {activeApp.label}
                  </h3>
                </div>
                <span
                  data-ocid="deploy.preview.nation_chip"
                  className="hidden items-center gap-2 rounded-full border border-border bg-card py-1 pl-2 pr-3 sm:flex"
                >
                  <span
                    aria-hidden="true"
                    className="flex size-6 items-center justify-center rounded-full bg-primary font-mono text-[0.6rem] font-semibold text-primary-foreground"
                  >
                    CR
                  </span>
                  <span className="max-w-[9rem] truncate text-xs font-medium text-foreground">
                    {sampleNation.name}
                  </span>
                </span>
              </div>
            </header>

            <div
              data-ocid="deploy.preview.view"
              className="flex-1 overflow-y-auto px-4 py-5 pb-24 md:px-5 md:pb-6"
            >
              <p
                data-ocid="deploy.preview.notice"
                role="note"
                className="mb-4 rounded-md border border-dashed border-accent bg-accent/10 px-3 py-2 text-xs font-medium text-accent-foreground"
              >
                {sampleNationNotice}
              </p>

              {activeKey === "dashboard" ? (
                <div className="mb-5 space-y-3">
                  <h4 className="font-display text-base font-medium tracking-tight text-foreground">
                    Your Nation's apps
                  </h4>
                  <PreviewAppGrid activeKey={activeKey} onSelect={select} />
                </div>
              ) : null}

              <PreviewAppView appKey={activeKey} />
            </div>
          </div>
        </div>

        {/* Desktop dock */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 hidden justify-center pb-3 md:flex">
          <div className="pointer-events-auto">
            <PreviewDock activeKey={activeKey} onSelect={select} />
          </div>
        </div>

        {/* Mobile bottom bar */}
        <PreviewMobileBar
          activeKey={activeKey}
          onSelect={select}
          onOpenDrawer={() => setDrawerOpen(true)}
        />

        {/* Mobile drawer */}
        {drawerOpen ? (
          <div
            data-ocid="deploy.preview.drawer"
            className="absolute inset-0 z-30 flex md:hidden"
          >
            <button
              type="button"
              aria-label="Close all apps"
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 bg-[oklch(var(--os-window-scrim))]"
            />
            <div className="os-drawer relative flex w-64 flex-col gap-1 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-display text-base font-semibold tracking-tight text-foreground">
                  SOVEREIGN OS
                </span>
                <button
                  type="button"
                  data-ocid="deploy.preview.drawer.close_button"
                  aria-label="Close all apps"
                  onClick={() => setDrawerOpen(false)}
                  className="os-focus-ring flex size-11 items-center justify-center rounded-lg text-foreground transition-smooth hover:bg-muted"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
              <nav
                aria-label="All preview apps"
                className="flex flex-col gap-1"
              >
                {previewApps.map((app) => (
                  <button
                    key={app.key}
                    type="button"
                    data-ocid={`deploy.preview.drawer_link.${app.key}`}
                    aria-current={activeKey === app.key ? "page" : undefined}
                    onClick={() => select(app.key)}
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
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
