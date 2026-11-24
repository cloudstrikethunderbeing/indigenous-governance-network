import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, HelpCircle, Search, Settings } from "lucide-react";
import { useEffect, useState } from "react";

import OsDock from "@/components/os/OsDock";
import OsDrawer from "@/components/os/OsDrawer";
import OsHelpPanel from "@/components/os/OsHelpPanel";
import OsIntroModal from "@/components/os/OsIntroModal";
import OsMobileBar from "@/components/os/OsMobileBar";
import OsNationSwitcher from "@/components/os/OsNationSwitcher";
import OsNotificationsPanel from "@/components/os/OsNotificationsPanel";
import OsSearchPanel from "@/components/os/OsSearchPanel";
import OsSidebar from "@/components/os/OsSidebar";
import OsWallpaper from "@/components/os/OsWallpaper";
import { osApps } from "@/components/os/appRegistry";
import { useSampleNationId } from "@/components/os/files/useSampleNationId";
import {
  hasSeenIntro,
  markIntroSeen,
  resetIntro,
} from "@/components/os/introState";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { sampleNation } from "@/data/sampleNation";

/** The app whose route is active, used for the header title. */
function useActiveApp() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  return osApps.find(
    (app) => pathname === app.to || pathname.startsWith(`${app.to}/`),
  );
}

type ShellPanel = "search" | "notifications" | "help" | null;

/**
 * The SOVEREIGN OS shell for app and workspace views: a persistent sidebar, a
 * header with the Nation name, search, notifications, settings and Help, the
 * app content, a dock and the mobile bottom bar plus drawer. Reachable without
 * signing in.
 */
export default function OsShell() {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [panel, setPanel] = useState<ShellPanel>(null);
  const [introOpen, setIntroOpen] = useState(false);
  // The sample Nation id is a backend-owned sentinel, resolved from the
  // backend so the shell reads the same stored wallpaper preference that
  // Appearance settings writes.
  const sampleNationId = useSampleNationId();
  const [selectedNationId, setSelectedNationId] = useState<bigint | null>(null);
  const activeNationId = selectedNationId ?? sampleNationId;
  const activeApp = useActiveApp();

  // Show the optional introduction once per session on first visit.
  useEffect(() => {
    if (!hasSeenIntro()) setIntroOpen(true);
  }, []);

  function closeIntro() {
    markIntroSeen();
    setIntroOpen(false);
  }

  function replayIntro() {
    resetIntro();
    setPanel(null);
    setIntroOpen(true);
  }

  return (
    <div className="os-desktop relative flex min-h-dvh flex-col">
      <OsWallpaper workspaceId={activeNationId.toString()} />
      <div className="relative z-10 flex flex-1">
        <OsSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <header
            data-ocid="os.header"
            className="shell-header sticky top-0 z-30"
          >
            <div className="flex items-center gap-2 px-4 py-3 md:gap-3 md:px-6">
              <div className="min-w-0 flex-1">
                <p className="text-stamp text-accent">Nation workspace</p>
                <h1 className="truncate font-display text-lg font-medium tracking-tight text-foreground md:text-xl">
                  {activeApp?.label ?? sampleNation.name}
                </h1>
              </div>

              <button
                type="button"
                data-ocid="os.search_button"
                aria-label="Search apps and documents"
                onClick={() => setPanel("search")}
                className="os-focus-ring flex size-11 items-center justify-center rounded-lg text-foreground transition-smooth hover:bg-muted"
              >
                <Search className="size-5" aria-hidden="true" />
              </button>

              <button
                type="button"
                data-ocid="os.notifications_button"
                aria-label="Notifications"
                onClick={() => setPanel("notifications")}
                className="os-focus-ring flex size-11 items-center justify-center rounded-lg text-foreground transition-smooth hover:bg-muted"
              >
                <Bell className="size-5" aria-hidden="true" />
              </button>

              <button
                type="button"
                data-ocid="os.help_button"
                aria-label="Help"
                onClick={() => setPanel("help")}
                className="os-focus-ring flex size-11 items-center justify-center rounded-lg text-foreground transition-smooth hover:bg-muted"
              >
                <HelpCircle className="size-5" aria-hidden="true" />
              </button>

              <button
                type="button"
                data-ocid="os.settings_button"
                aria-label="Nation settings"
                onClick={() => void navigate({ to: "/os/settings" })}
                className="os-focus-ring flex size-11 items-center justify-center rounded-lg text-foreground transition-smooth hover:bg-muted"
              >
                <Settings className="size-5" aria-hidden="true" />
              </button>

              <span className="hidden sm:block">
                <OsNationSwitcher
                  activeNationId={activeNationId}
                  onSelect={setSelectedNationId}
                />
              </span>

              <span
                data-ocid="os.nation_chip"
                className="hidden items-center gap-2 rounded-full border border-border bg-card py-1 pl-2 pr-3 lg:flex"
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

          <main
            data-ocid="page.os_workspace"
            className="flex-1 px-4 py-6 pb-24 md:px-6 md:py-8 md:pb-8"
          >
            <div className="mx-auto max-w-6xl">
              <Outlet />
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

      <Sheet
        open={panel !== null}
        onOpenChange={(open) => !open && setPanel(null)}
      >
        <SheetContent
          side="right"
          data-ocid="os.shell_panel"
          className="os-drawer w-full max-w-md overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle className="font-display">
              {panel === "search"
                ? "Search"
                : panel === "notifications"
                  ? "Notifications"
                  : "Help"}
            </SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-6">
            {panel === "search" ? <OsSearchPanel /> : null}
            {panel === "notifications" ? <OsNotificationsPanel /> : null}
            {panel === "help" ? (
              <OsHelpPanel onReplayIntro={replayIntro} />
            ) : null}
          </div>
        </SheetContent>
      </Sheet>

      <OsIntroModal
        open={introOpen}
        onExplore={() => {
          closeIntro();
          void navigate({ to: "/os/sample" });
        }}
        onSkip={closeIntro}
      />
    </div>
  );
}
