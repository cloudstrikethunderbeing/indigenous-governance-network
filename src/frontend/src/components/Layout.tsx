import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  ChevronDown,
  Compass,
  FileSearch,
  Gavel,
  Landmark,
  Menu,
  PieChart,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  Users,
  Wallet,
  Waypoints,
} from "lucide-react";
import { useState } from "react";

import { UserRole } from "@/backend";
import { SignInButton } from "@/components/InternetIdentity";
import AvatarChip from "@/components/dashboard/AvatarChip";
import SimulatedBanner from "@/components/demo/SimulatedBanner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { demoNetwork, demoProfile } from "@/data/demoData";
import { useCallerUserRole, useIsCallerAdmin } from "@/hooks/useQueries";

const sections = [
  { to: "/dao", label: "Roadmap", icon: Compass, ocid: "roadmap" },
  {
    to: "/dao/deploy",
    label: "Deploy Your Own DAO",
    icon: Rocket,
    ocid: "deploy",
  },
  {
    to: "/dao/tokenomics",
    label: "Tokenomics Overview",
    icon: PieChart,
    ocid: "tokenomics",
  },
  {
    to: "/dao/emissions",
    label: "Emission Schedule",
    icon: TrendingDown,
    ocid: "emissions",
  },
  {
    to: "/dao/research-credits",
    label: "Research Credits",
    icon: Wallet,
    ocid: "research_credits",
  },
  {
    to: "/dao/participation",
    label: "Participation Economy",
    icon: Sparkles,
    ocid: "participation",
  },
  { to: "/dao/treasury", label: "Treasury", icon: Landmark, ocid: "treasury" },
  { to: "/dao/staking", label: "Staking", icon: ShieldCheck, ocid: "staking" },
  {
    to: "/dao/governance",
    label: "Governance",
    icon: Gavel,
    ocid: "governance",
  },
  {
    to: "/dao/community",
    label: "Community Participation",
    icon: Users,
    ocid: "community",
  },
  {
    to: "/dao/audit-history",
    label: "Audit History",
    icon: FileSearch,
    ocid: "audit_history",
  },
  {
    to: "/dao/future-roadmap",
    label: "Future Roadmap",
    icon: Rocket,
    ocid: "future_roadmap",
  },
  {
    to: "/dao/discovery",
    label: "Discovery",
    icon: Waypoints,
    ocid: "discovery",
  },
  {
    to: "/dao/engagement",
    label: "Engagement & Leads",
    icon: Waypoints,
    ocid: "engagement",
    adminOnly: true,
  },
] as const;

/** Page title for the header, derived from the active route. */
function usePageTitle() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const match = sections.find((section) => section.to === pathname);
  if (match) return match.label;
  const prefixMatch = sections.find((section) =>
    pathname.startsWith(`${section.to}/`),
  );
  return prefixMatch?.label ?? "DAO Dashboard";
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: role } = useCallerUserRole();
  const showAdmin = isAdmin === true || role === UserRole.admin;
  const visibleSections = sections.filter(
    (section) => !("adminOnly" in section && section.adminOnly) || showAdmin,
  );

  return (
    <nav aria-label="DAO & Economy sections" className="flex flex-col gap-1">
      {visibleSections.map((section) => (
        <Link
          key={section.to}
          to={section.to}
          onClick={onNavigate}
          data-ocid={`nav.sidebar_link.${section.ocid}`}
          className="nav-item focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          activeProps={{ className: "nav-item nav-item-active" }}
        >
          <section.icon className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{section.label}</span>
        </Link>
      ))}
    </nav>
  );
}

function AdminIndicator() {
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: role } = useCallerUserRole();
  const showAdmin = isAdmin === true || role === UserRole.admin;

  if (!showAdmin) return null;

  return (
    <span
      data-ocid="nav.admin_indicator"
      className="text-stamp rounded border border-accent px-2 py-1 text-accent-foreground"
      title={role ? `Role: ${role}` : undefined}
    >
      Admin
    </span>
  );
}

function AccountChip() {
  return (
    <button
      type="button"
      data-ocid="nav.account_chip"
      aria-label={`Account: ${demoProfile.displayName}, ${demoNetwork} (simulated)`}
      className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-2 transition-smooth hover:border-primary/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <AvatarChip name={demoProfile.displayName} />
      <span className="hidden min-w-0 flex-col items-start leading-tight sm:flex">
        <span className="max-w-[9rem] truncate text-xs font-medium text-foreground">
          {demoProfile.displayName}
        </span>
        <span className="max-w-[9rem] truncate text-[0.65rem] text-muted-foreground">
          {demoNetwork}
        </span>
      </span>
      <ChevronDown
        className="size-3.5 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
    </button>
  );
}

export default function Layout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pageTitle = usePageTitle();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1">
        <aside
          data-ocid="nav.sidebar"
          className="shell-rail sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-4 overflow-y-auto p-4 md:flex"
        >
          <Link
            to="/"
            data-ocid="nav.back_to_landing"
            className="flex items-center gap-2 px-1 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <span className="font-display text-lg font-semibold tracking-tight text-foreground">
              SOVEREIGN
            </span>
          </Link>
          <p className="text-stamp px-1 text-muted-foreground">
            DAO &amp; Economy
          </p>
          <NavLinks />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header
            data-ocid="nav.topbar"
            className="shell-header sticky top-0 z-30"
          >
            <div className="flex items-center gap-3 px-4 py-3 md:px-6">
              <button
                type="button"
                data-ocid="nav.mobile_menu_button"
                className="rounded-md p-2 text-foreground transition-smooth hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:hidden"
                aria-label="Open navigation menu"
                onClick={() => setMobileNavOpen(true)}
              >
                <Menu className="size-5" aria-hidden="true" />
              </button>

              <h1 className="min-w-0 flex-1 truncate font-display text-xl font-medium tracking-tight text-foreground md:text-2xl">
                {pageTitle}
              </h1>

              <div className="relative hidden lg:block">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  data-ocid="nav.search_input"
                  placeholder="Search proposals…"
                  aria-label="Search proposals (demo)"
                  className="w-56 rounded-full border border-input bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                />
              </div>

              <button
                type="button"
                data-ocid="nav.notification_button"
                aria-label="Notifications (demo)"
                className="relative rounded-full border border-border bg-card p-2 text-foreground transition-smooth hover:border-primary/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <Bell className="size-4" aria-hidden="true" />
                <span
                  aria-hidden="true"
                  className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-primary"
                />
              </button>

              <AdminIndicator />
              <AccountChip />
            </div>
          </header>

          <SimulatedBanner />

          <main
            data-ocid="page.dao_dashboard"
            className="flex-1 px-4 py-6 md:px-6 md:py-8"
          >
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>

          <footer className="border-t border-border px-4 py-4 text-center md:px-6">
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

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" data-ocid="nav.mobile_sheet">
          <SheetHeader>
            <SheetTitle>SOVEREIGN DAO &amp; Economy</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-4">
            <NavLinks onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
