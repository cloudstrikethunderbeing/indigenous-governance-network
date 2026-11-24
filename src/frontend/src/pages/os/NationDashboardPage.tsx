import { Link } from "@tanstack/react-router";
import { ArrowRight, Network } from "lucide-react";

import OsAppPage from "@/components/os/OsAppPage";
import DashboardAppGrid from "@/components/os/dashboard/DashboardAppGrid";
import DashboardExplainer from "@/components/os/dashboard/DashboardExplainer";
import DashboardSummary from "@/components/os/dashboard/DashboardSummary";
import { sampleNation, sampleWorkspace } from "@/data/sampleNation";

/**
 * The unified Nation dashboard: the sample Nation's welcome header, a clear
 * sample-data label, the grid of Nation apps, at-a-glance workspace summaries
 * and a plain-language explanation of what a Nation workspace is.
 */
export default function NationDashboardPage() {
  return (
    <OsAppPage appKey="dashboard">
      <div className="space-y-6">
        <header className="space-y-3">
          <p className="text-stamp text-accent">{sampleNation.region}</p>
          <h2 className="font-display text-2xl font-medium tracking-tight text-foreground md:text-3xl">
            Welcome to {sampleNation.name}
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {sampleNation.shortDescription}
          </p>
          <div className="rule-accent" />
          <div className="flex flex-wrap items-center gap-2">
            <span
              data-ocid="os.dashboard.sample_label"
              className="badge-stage-demo"
            >
              Sample data
            </span>
            <span className="text-xs text-muted-foreground">
              {sampleWorkspace.name} · {sampleNation.governanceModel} ·{" "}
              {sampleNation.privacyLabel}
            </span>
          </div>
        </header>

        <DashboardAppGrid />

        <DashboardSummary />

        <DashboardExplainer />

        <section
          data-ocid="os.dashboard.network_section"
          aria-label="SOVEREIGN Network"
          className="shell-panel flex flex-wrap items-center justify-between gap-3 p-4"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="os-icon-glyph size-9" aria-hidden="true">
              <Network className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-foreground">
                SOVEREIGN Network
              </span>
              <span className="block text-xs text-muted-foreground">
                See which Nations are open to collaboration.
              </span>
            </span>
          </span>
          <Link
            to="/os/network"
            data-ocid="os.dashboard.network_link"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-smooth hover:border-primary/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Open Network
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </OsAppPage>
  );
}
