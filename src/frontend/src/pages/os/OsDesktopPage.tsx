import { Link } from "@tanstack/react-router";
import { ArrowRight, HelpCircle, ShieldCheck } from "lucide-react";
import { useState } from "react";

import OsAppIcon from "@/components/os/OsAppIcon";
import OsDock from "@/components/os/OsDock";
import OsDrawer from "@/components/os/OsDrawer";
import OsMobileBar from "@/components/os/OsMobileBar";
import OsSidebar from "@/components/os/OsSidebar";
import OsWallpaper from "@/components/os/OsWallpaper";
import { topLevelApps } from "@/components/os/appRegistry";
import { useSampleNationId } from "@/components/os/files/useSampleNationId";
import WelcomeExperience from "@/components/os/welcome/WelcomeExperience";
import { nationWorkspaceExplanation, sampleNation } from "@/data/sampleNation";

/**
 * The SOVEREIGN OS desktop — the primary product surface. A Portal-style
 * desktop with a wallpaper ground, a grid of app icons, a dock and a
 * persistent sidebar. Reachable without signing in.
 */
export default function OsDesktopPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [replaySignal, setReplaySignal] = useState(0);
  // The sample Nation id is a backend-owned sentinel, so it is resolved from
  // the backend rather than assumed. This keeps the desktop reading the same
  // stored wallpaper preference that Appearance settings writes.
  const sampleNationId = useSampleNationId();

  return (
    <div className="os-desktop relative flex min-h-dvh flex-col">
      <OsWallpaper workspaceId={sampleNationId.toString()} />
      <div className="relative z-10 flex flex-1">
        <OsSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <header
            data-ocid="os.desktop_header"
            className="shell-header sticky top-0 z-30"
          >
            <div className="flex items-center gap-3 px-4 py-3 md:px-6">
              <div className="min-w-0 flex-1">
                <p className="text-stamp text-accent">SOVEREIGN OS</p>
                <h1 className="truncate font-display text-lg font-medium tracking-tight text-foreground md:text-xl">
                  Desktop
                </h1>
              </div>
              <span
                data-ocid="os.desktop_nation_chip"
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
              <button
                type="button"
                data-ocid="os.desktop_help_button"
                aria-label="Help — replay the introduction"
                onClick={() => setReplaySignal((value) => value + 1)}
                className="os-focus-ring flex size-11 shrink-0 items-center justify-center rounded-lg text-foreground transition-smooth hover:bg-muted"
              >
                <HelpCircle className="size-5" aria-hidden="true" />
              </button>
            </div>
          </header>

          <main
            data-ocid="page.os_desktop"
            className="flex-1 px-4 py-6 pb-28 md:px-6 md:py-8 md:pb-32"
          >
            <div className="mx-auto max-w-6xl space-y-8">
              <section
                data-ocid="os.launcher_section"
                aria-label="Open the sample Nation workspace"
                className="shell-panel animate-os-boot flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6"
              >
                <div className="min-w-0 space-y-2">
                  <p className="text-stamp text-accent">Sample Nation</p>
                  <h2 className="font-display text-xl font-medium tracking-tight text-foreground md:text-2xl">
                    Open the {sampleNation.name} workspace
                  </h2>
                  <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {nationWorkspaceExplanation}
                  </p>
                </div>
                <Link
                  to="/os/nation"
                  data-ocid="os.launch_workspace_button"
                  className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground transition-smooth hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  Open workspace
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </section>

              <section
                data-ocid="os.icon_grid_section"
                aria-label="Apps"
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    className="size-4 text-accent"
                    aria-hidden="true"
                  />
                  <p className="text-stamp text-muted-foreground">
                    Apps — solid dot working, dashed ring preview
                  </p>
                </div>
                <div
                  data-ocid="os.icon_grid"
                  className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:gap-6 lg:grid-cols-6"
                >
                  {topLevelApps.map((app) => (
                    <OsAppIcon key={app.key} app={app} />
                  ))}
                </div>
              </section>
            </div>
          </main>

          <footer className="hidden border-t border-border px-4 py-4 text-center md:block md:px-6">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()}. Built with love using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline-offset-2 hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </footer>
        </div>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 hidden justify-center pb-4 md:flex">
        <div className="pointer-events-auto">
          <OsDock />
        </div>
      </div>

      <OsMobileBar onOpenDrawer={() => setDrawerOpen(true)} />
      <OsDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />

      <WelcomeExperience replaySignal={replaySignal} />
    </div>
  );
}
