import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Clock,
  Lock,
  ShieldCheck,
  Sprout,
  TrendingUp,
  Wallet,
} from "lucide-react";

import Panel from "@/components/dashboard/Panel";
import { sovereigntySafeguard } from "@/data/demoData";

const principles = [
  {
    icon: Wallet,
    title: "Your assets stay yours",
    body: "Participation would be non-custodial. You would keep control of your own assets at all times — nothing is ever held on your behalf.",
  },
  {
    icon: Sprout,
    title: "Voluntary, always",
    body: "Joining would be a choice, never a requirement. You could take part, step back or leave at any time.",
  },
  {
    icon: Lock,
    title: "A commitment, not a lock-in",
    body: "A maturity period would reward patience, but it would be a commitment you choose — not a lock that traps your assets.",
  },
];

const maturityStages = [
  {
    label: "Day 0",
    title: "Choose to participate",
    body: "A member decides, on their own terms, to commit assets to a future governance system.",
  },
  {
    label: "Months 1–6",
    title: "Maturity builds",
    body: "Over time, a longer commitment could earn a larger share of governance weight — the way NNS neurons mature.",
  },
  {
    label: "At maturity",
    title: "Full participation",
    body: "A matured position could carry its full voting weight and a share of participation rewards.",
  },
];

const neuronConcepts = [
  {
    icon: Clock,
    title: "Maturity over time",
    body: "Inspired by ICP NNS neurons, where a longer commitment earns more influence the longer it is held.",
  },
  {
    icon: TrendingUp,
    title: "Rewards for patience",
    body: "A future system could reward long-term participants with a share of simulated participation rewards.",
  },
  {
    icon: ShieldCheck,
    title: "No custody, no transfer",
    body: "A neuron-style position would never move your assets. It would only describe your own voluntary commitment.",
  },
];

export default function StakingPage() {
  return (
    <div data-ocid="page.staking" className="space-y-6">
      <header className="space-y-4">
        <p className="text-stamp text-accent">Phase 4 of 5</p>
        <h1 className="font-display text-3xl font-medium tracking-tight text-foreground md:text-4xl">
          Staking &amp; Maturity
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          A concept for how people could voluntarily take part in a future
          governance system using their own assets — inspired by ICP NNS
          neurons. Nothing here is real: no token, wallet, staking, voting or
          asset movement exists.
        </p>
        <div className="rule-accent" />
      </header>

      {/* Concept-only disclosure */}
      <section
        data-ocid="staking.disclosure"
        aria-label="Concept disclosure"
        className="rounded-lg border border-dashed border-accent bg-accent/5 p-5 sm:p-6"
      >
        <p className="text-stamp text-accent">Concept only</p>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-foreground sm:text-base">
          This page explains an idea. There is no real token, no wallet
          connection, no staking, no voting, no delegation and no movement of
          any asset. Every figure and stage below is illustrative.
        </p>
      </section>

      {/* Principles */}
      <Panel
        title="How participation could work"
        ocid="staking.principles_panel"
        action={<span className="badge-stage-demo">Concept</span>}
      >
        <ul
          data-ocid="staking.principle_list"
          className="grid gap-4 sm:grid-cols-3"
        >
          {principles.map((principle, index) => (
            <li
              key={principle.title}
              data-ocid={`staking.principle.${index + 1}`}
              className="shell-panel-alt p-5"
            >
              <principle.icon
                className="size-5 text-primary"
                aria-hidden="true"
              />
              <h3 className="mt-3 font-display text-base font-medium text-foreground">
                {principle.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {principle.body}
              </p>
            </li>
          ))}
        </ul>
      </Panel>

      {/* Maturity timeline */}
      <Panel
        title="A maturity timeline"
        ocid="staking.maturity_panel"
        action={<span className="badge-stage-demo">Concept</span>}
      >
        <p className="mb-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          A conceptual path from choosing to participate to full participation.
          No real position is created at any stage.
        </p>
        <ol
          data-ocid="staking.maturity_list"
          className="grid gap-4 sm:grid-cols-3"
        >
          {maturityStages.map((stage, index) => (
            <li
              key={stage.label}
              data-ocid={`staking.maturity.${index + 1}`}
              className="relative shell-panel-alt p-5"
            >
              <span className="phase-node phase-node-demo" aria-hidden="true">
                {index + 1}
              </span>
              <p className="text-stamp mt-3 text-muted-foreground">
                {stage.label}
              </p>
              <h3 className="mt-1 font-display text-base font-medium text-foreground">
                {stage.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {stage.body}
              </p>
            </li>
          ))}
        </ol>
      </Panel>

      {/* Neuron-inspired concepts */}
      <Panel
        title="Inspired by NNS neurons"
        ocid="staking.neuron_panel"
        action={<span className="badge-stage-demo">Concept</span>}
      >
        <ul
          data-ocid="staking.neuron_list"
          className="divide-y divide-border rounded-lg border border-border bg-card"
        >
          {neuronConcepts.map((concept, index) => (
            <li
              key={concept.title}
              data-ocid={`staking.neuron.${index + 1}`}
              className="flex items-start gap-4 p-4 sm:p-5"
            >
              <concept.icon
                className="mt-0.5 size-5 shrink-0 text-accent"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {concept.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {concept.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      {/* Sovereignty safeguard — kept visible on this page too. */}
      <section
        data-ocid="staking.safeguard"
        aria-label="Indigenous-sovereignty safeguard"
        className="rounded-lg border border-primary/40 bg-primary/5 p-5 sm:p-6"
      >
        <div className="flex items-start gap-3">
          <ShieldCheck
            className="mt-0.5 size-5 shrink-0 text-primary"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="text-stamp text-primary">Sovereignty safeguard</p>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-foreground sm:text-base">
              {sovereigntySafeguard}
            </p>
          </div>
        </div>
      </section>

      <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">
        No real token, wallet connection, staking, voting, delegation or asset
        movement exists. This is a conceptual explanation only.
      </p>

      <div>
        <Link
          to="/dao/governance"
          data-ocid="staking.governance_link"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-smooth hover:gap-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          See the governance preview
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
