import {
  Activity,
  Coins,
  FileCheck2,
  HandCoins,
  Network,
  Vote,
  Wallet,
} from "lucide-react";

import Panel from "@/components/dashboard/Panel";
import DemoSession from "@/components/demo/DemoSession";
import { srcNotice } from "@/data/demoData";

/** Every figure below is a static, illustrative example — never a real record. */
const contributions = [
  {
    id: "c1",
    title: "Language revitalization field notes",
    detail: "Example contribution · reviewed",
    reward: 120,
  },
  {
    id: "c2",
    title: "Water-quality monitoring dataset",
    detail: "Example contribution · reviewed",
    reward: 90,
  },
  {
    id: "c3",
    title: "Oral history transcription",
    detail: "Example contribution · in review",
    reward: 60,
  },
];

const assignments = [
  { id: "a1", title: "Community energy survey", status: "Completed" },
  { id: "a2", title: "Seed-bank cataloguing", status: "Completed" },
  { id: "a3", title: "Youth mentorship curriculum", status: "In progress" },
];

const activity = [
  { id: "e1", label: "Contribution reviewed", when: "Example · 2 days ago" },
  {
    id: "e2",
    label: "Research assignment completed",
    when: "Example · 5 days ago",
  },
  { id: "e3", label: "Governance signal cast", when: "Example · 1 week ago" },
  { id: "e4", label: "New contributor joined", when: "Example · 2 weeks ago" },
];

const distribution = [
  { id: "d1", label: "Community research pool", share: "40%" },
  { id: "d2", label: "Nation partnerships", share: "25%" },
  { id: "d3", label: "Core development", share: "20%" },
  { id: "d4", label: "Treasury reserve", share: "15%" },
];

const srcActivity = [
  { id: "s1", label: "Credits earned — contributions", value: "+270" },
  { id: "s2", label: "Credits spent — commissioned research", value: "−80" },
  { id: "s3", label: "Illustrative balance", value: "1,240" },
];

const governance = [
  { id: "g1", label: "Signals cast", value: "7" },
  { id: "g2", label: "Proposals reviewed", value: "4" },
  { id: "g3", label: "Delegations made", value: "1" },
];

/** A small leading icon paired with a panel title, matching the shell. */
function PanelIcon({ icon: Icon }: { icon: typeof Coins }) {
  return <Icon className="size-4 shrink-0 text-accent" aria-hidden="true" />;
}

export default function CommunityPage() {
  return (
    <div data-ocid="page.community" className="space-y-6">
      <header className="space-y-3">
        <p className="text-stamp text-accent">Phase 5 of 5</p>
        <h2 className="font-display text-2xl font-medium tracking-tight text-foreground md:text-3xl">
          Community Economy
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          How meaningful participation could sustain a self-governing research
          network over time. Every entry below is an example record.
        </p>
        <div className="rule-accent" />
      </header>

      <DemoSession />

      <section
        data-ocid="community.explainer"
        aria-label="A self-sustaining research network"
        className="shell-panel-alt p-4 sm:p-5"
      >
        <h2 className="font-display text-lg font-medium tracking-tight text-foreground">
          A self-sustaining research network
        </h2>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          When contributors are recognised for verified research, the network
          can fund its own priorities: work earns credits, credits commission
          new work, and the results return to the community. Over time this loop
          could reduce reliance on outside funding while keeping authority with
          Nations and their own governance processes.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel
          title="Research contributions"
          ocid="community.contributions"
          action={<PanelIcon icon={FileCheck2} />}
        >
          <ul className="space-y-0">
            {contributions.map((item) => (
              <li
                key={item.id}
                data-ocid={`community.contribution.${item.id}`}
                className="ledger-row flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
                <span className="text-tabular shrink-0 text-sm text-accent">
                  +{item.reward} SRC
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Participation rewards"
          ocid="community.rewards"
          action={<PanelIcon icon={HandCoins} />}
        >
          <p className="text-sm leading-relaxed text-muted-foreground">
            Illustrative rewards for verified contributions. No credits are
            issued, transferred or persisted.
          </p>
          <p className="text-tabular mt-4 font-display text-4xl font-medium text-foreground">
            270
            <span className="ml-2 text-stamp text-muted-foreground">
              SRC earned (example)
            </span>
          </p>
        </Panel>

        <Panel
          title="Research assignments"
          ocid="community.assignments"
          action={<PanelIcon icon={Network} />}
        >
          <ul className="space-y-0">
            {assignments.map((item) => (
              <li
                key={item.id}
                data-ocid={`community.assignment.${item.id}`}
                className="ledger-row flex items-center justify-between gap-3 py-3"
              >
                <span className="min-w-0 truncate text-sm text-foreground">
                  {item.title}
                </span>
                <span
                  className={
                    item.status === "Completed"
                      ? "badge-stage-live shrink-0"
                      : "badge-stage-demo shrink-0"
                  }
                >
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Community activity"
          ocid="community.activity"
          action={<PanelIcon icon={Activity} />}
        >
          <ul className="space-y-0">
            {activity.map((item) => (
              <li
                key={item.id}
                data-ocid={`community.activity.${item.id}`}
                className="ledger-row flex items-center justify-between gap-3 py-3"
              >
                <span className="min-w-0 truncate text-sm text-foreground">
                  {item.label}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {item.when}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel
          title="Proposed token distribution"
          ocid="community.distribution"
          action={<PanelIcon icon={Coins} />}
        >
          <ul className="space-y-0">
            {distribution.map((item) => (
              <li
                key={item.id}
                data-ocid={`community.distribution.${item.id}`}
                className="ledger-row flex items-center justify-between gap-3 py-3"
              >
                <span className="min-w-0 truncate text-sm text-foreground">
                  {item.label}
                </span>
                <span className="text-tabular shrink-0 text-sm text-muted-foreground">
                  {item.share}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Proposed allocation only — not issued, not for sale.
          </p>
        </Panel>

        <Panel
          title="SRC activity"
          ocid="community.src_activity"
          action={<PanelIcon icon={Wallet} />}
        >
          <ul className="space-y-0">
            {srcActivity.map((item) => (
              <li
                key={item.id}
                data-ocid={`community.src_activity.${item.id}`}
                className="ledger-row flex items-center justify-between gap-3 py-3"
              >
                <span className="min-w-0 truncate text-sm text-foreground">
                  {item.label}
                </span>
                <span className="text-tabular shrink-0 text-sm text-foreground">
                  {item.value}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">{srcNotice}</p>
        </Panel>
      </div>

      <Panel
        title="Simulated governance participation"
        ocid="community.governance"
        action={<PanelIcon icon={Vote} />}
      >
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {governance.map((item) => (
            <div
              key={item.id}
              data-ocid={`community.governance.${item.id}`}
              className="rounded-md border border-border bg-background p-4"
            >
              <dt className="text-stamp text-muted-foreground">{item.label}</dt>
              <dd className="text-tabular mt-2 font-display text-2xl font-medium text-foreground">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs text-muted-foreground">
          Illustrative participation only. No real voting, delegation or
          governance outcome is recorded.
        </p>
      </Panel>
    </div>
  );
}
