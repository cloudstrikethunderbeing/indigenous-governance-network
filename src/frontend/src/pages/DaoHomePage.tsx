import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import ActivityFeed from "@/components/dashboard/ActivityFeed";
import MemberSidebar from "@/components/dashboard/MemberSidebar";
import Panel from "@/components/dashboard/Panel";
import ProposalsPanel from "@/components/dashboard/ProposalsPanel";
import QuickActions from "@/components/dashboard/QuickActions";
import TreasuryChart from "@/components/dashboard/TreasuryChart";
import WorkspacePanel from "@/components/dashboard/WorkspacePanel";
import DemoSession from "@/components/demo/DemoSession";
import PhaseCard from "@/components/demo/PhaseCard";
import { phases } from "@/data/demoData";

export default function DaoHomePage() {
  return (
    <div data-ocid="page.dao_home" className="space-y-6">
      <header className="space-y-3">
        <p className="text-stamp text-accent">Overview</p>
        <h2 className="font-display text-2xl font-medium tracking-tight text-foreground md:text-3xl">
          SOVEREIGN DAO &amp; Economy
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          A simulated workspace for a self-governing research network. Every
          figure, member and proposal below is clearly labelled demo data.
        </p>
        <div className="rule-accent" />
      </header>

      <DemoSession />

      <QuickActions />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel
          title="Treasury"
          ocid="dashboard.treasury_panel"
          className="lg:col-span-2"
        >
          <TreasuryChart />
        </Panel>

        <Panel title="Latest activity" ocid="dashboard.activity_panel">
          <ActivityFeed />
        </Panel>

        <Panel title="Proposals" ocid="dashboard.proposals_panel">
          <ProposalsPanel />
        </Panel>

        <Panel title="Workspace" ocid="dashboard.workspace_panel">
          <WorkspacePanel />
        </Panel>

        <Panel title="Members" ocid="dashboard.members_panel">
          <MemberSidebar />
        </Panel>
      </div>

      <section
        data-ocid="dashboard.roadmap_section"
        aria-label="Roadmap"
        className="space-y-4 pt-2"
      >
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-stamp text-accent">Roadmap</p>
            <h2 className="font-display text-xl font-medium tracking-tight text-foreground">
              Five-phase plan
            </h2>
          </div>
          <Link
            to="/dao/future-roadmap"
            data-ocid="dashboard.future_roadmap_link"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-smooth hover:gap-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            View the future roadmap
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <ol
          data-ocid="roadmap.list"
          className="list-none space-y-0"
          aria-label="Five-phase roadmap"
        >
          {phases.map((phase) => (
            <PhaseCard key={phase.id} phase={phase} />
          ))}
        </ol>
      </section>
    </div>
  );
}
