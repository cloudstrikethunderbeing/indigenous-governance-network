import {
  ArrowRight,
  Banknote,
  BookOpenCheck,
  Brain,
  Check,
  Coins,
  Database,
  FileCheck2,
  Gavel,
  Landmark,
  Layers,
  Lightbulb,
  RefreshCw,
  Scale,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Vote,
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";

import Panel from "@/components/dashboard/Panel";
import DemoSession from "@/components/demo/DemoSession";
import WaitlistSection from "@/components/proposal/WaitlistSection";
import {
  creditTransactions,
  demoProfile,
  economyComparison,
  flywheelSteps,
  futureEconomicAreas,
  governancePreviewProposals,
  governanceTopics,
  participationCategories,
  participationHistory,
  participationNotice,
  participationTokenSummary,
  prioritizedAssignments,
  sovereigntyPillars,
  sovereigntySafeguard,
  srcNotice,
  srcPlainLanguage,
  tokenomicsNotice,
} from "@/data/demoData";

/** In-page sub-navigation targets for the area's modules. */
const modules = [
  { id: "comparison", label: "Comparison" },
  { id: "dashboard", label: "Participation" },
  { id: "credits", label: "Research Credits" },
  { id: "governance", label: "Governance" },
  { id: "pillars", label: "Sovereignty Pillars" },
  { id: "future", label: "Future Applications" },
  { id: "flywheel", label: "Economic Flywheel" },
  { id: "dao", label: "DAO Connection" },
] as const;

const pillarIcons = {
  data: Database,
  information: BookOpenCheck,
  ai: Brain,
  legal: Scale,
} as const;

const flywheelIcons = {
  fund: Banknote,
  participate: Users,
  verify: FileCheck2,
  reward: Coins,
  research: Lightbulb,
  govern: Gavel,
  reinvest: RefreshCw,
} as const;

function formatCredits(value: number): string {
  return value.toLocaleString("en-US");
}

/** A module section: a shell-panel surface with a stamped eyebrow and heading. */
function ModuleSection({
  id,
  eyebrow,
  title,
  description,
  ocid,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  ocid: string;
  children: ReactNode;
}) {
  const headingId = `${id}-heading`;
  return (
    <section
      id={id}
      data-ocid={ocid}
      aria-labelledby={headingId}
      className="scroll-mt-32 space-y-5"
    >
      <div className="space-y-2">
        <p className="text-stamp text-accent">{eyebrow}</p>
        <h2
          id={headingId}
          className="font-display text-2xl font-medium tracking-tight text-foreground md:text-3xl"
        >
          {title}
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}

export default function ParticipationEconomyPage() {
  const [activeCategory, setActiveCategory] = useState(
    participationCategories[0].id,
  );
  const [votes, setVotes] = useState<Record<string, "yes" | "no">>({});
  const [activeStep, setActiveStep] = useState(flywheelSteps[0].id);

  const category =
    participationCategories.find((item) => item.id === activeCategory) ??
    participationCategories[0];
  const step =
    flywheelSteps.find((item) => item.id === activeStep) ?? flywheelSteps[0];

  const earned = useMemo(
    () =>
      creditTransactions
        .filter((entry) => entry.kind === "earned")
        .reduce((sum, entry) => sum + entry.amount, 0),
    [],
  );
  const spent = useMemo(
    () =>
      creditTransactions
        .filter((entry) => entry.kind === "spent")
        .reduce((sum, entry) => sum + Math.abs(entry.amount), 0),
    [],
  );
  const approvedCount = participationHistory.filter(
    (entry) => entry.status === "Approved",
  ).length;
  const awaitingCount = participationHistory.filter(
    (entry) => entry.status === "Awaiting verification",
  ).length;

  const voteReward = useMemo(
    () =>
      Object.keys(votes).reduce((sum, id) => {
        const proposal = governancePreviewProposals.find((p) => p.id === id);
        return sum + (proposal?.reward ?? 0);
      }, 0),
    [votes],
  );

  return (
    <div data-ocid="page.participation_economy" className="space-y-8">
      <header className="space-y-4">
        <p className="text-stamp text-accent">Participation Economy</p>
        <h1 className="font-display text-3xl font-medium tracking-tight text-foreground md:text-4xl">
          THE PARTICIPATION ECONOMY
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          From attention extraction to meaningful participation. From
          centralized control to community governance.
        </p>
        <div className="rule-accent" />
      </header>

      <div
        data-ocid="participation.notice"
        role="note"
        className="rounded-lg border border-dashed border-accent bg-accent/10 px-4 py-3"
      >
        <p className="text-stamp text-accent-foreground">
          {participationNotice}
        </p>
      </div>

      <DemoSession />

      <WaitlistSection />

      {/* In-page sub-navigation between the area's modules. */}
      <nav
        aria-label="Participation Economy modules"
        data-ocid="participation.subnav"
        className="shell-panel sticky top-16 z-20 -mx-4 overflow-x-auto px-4 py-2 md:mx-0 md:px-3"
      >
        <ul className="flex items-center gap-1">
          {modules.map((module) => (
            <li key={module.id}>
              <a
                href={`#${module.id}`}
                data-ocid={`participation.subnav_link.${module.id}`}
                className="inline-flex whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-smooth hover:bg-accent/10 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {module.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Attention vs Participation comparison */}
      <ModuleSection
        id="comparison"
        ocid="participation.comparison"
        eyebrow="The shift"
        title="Attention Economy vs Participation Economy"
        description="Two models of value, side by side. The participation model rewards verified contribution rather than captured attention."
      >
        <div className="shell-panel overflow-hidden">
          <div className="grid grid-cols-2 border-b border-border">
            <div className="border-r border-border bg-secondary/60 px-4 py-3">
              <p className="text-stamp text-muted-foreground">
                Attention Economy
              </p>
            </div>
            <div className="bg-primary/5 px-4 py-3">
              <p className="text-stamp text-primary">Participation Economy</p>
            </div>
          </div>
          <ul data-ocid="participation.comparison_list">
            {economyComparison.map((row, index) => (
              <li
                key={row.id}
                data-ocid={`participation.comparison_row.${index + 1}`}
                className="ledger-row grid grid-cols-2"
              >
                <div className="border-r border-border px-4 py-4">
                  <p className="text-sm text-muted-foreground">
                    {row.attention}
                  </p>
                </div>
                <div className="flex items-start gap-2 px-4 py-4">
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <p className="text-sm font-medium text-foreground">
                    {row.participation}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </ModuleSection>

      {/* Participation dashboard */}
      <ModuleSection
        id="dashboard"
        ocid="participation.dashboard"
        eyebrow="Module 01"
        title="Participation dashboard"
        description="Eight ways to contribute. Select a category to see an example activity, its illustrative SRC reward and the demo member's simulated history."
      >
        <ul
          data-ocid="participation.category_list"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          {participationCategories.map((item, index) => {
            const isActive = item.id === activeCategory;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  data-ocid={`participation.category.${index + 1}`}
                  aria-pressed={isActive}
                  onClick={() => setActiveCategory(item.id)}
                  className={
                    isActive
                      ? "h-full w-full rounded-lg border border-primary bg-primary/5 p-4 text-left transition-smooth focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      : "shell-panel h-full w-full p-4 text-left transition-smooth hover:border-primary/50 hover:bg-accent/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  }
                >
                  <span className="text-stamp text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-2 block font-display text-sm font-medium leading-snug text-foreground">
                    {item.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="grid gap-6 lg:grid-cols-2">
          <div
            data-ocid="participation.category_detail"
            className="shell-panel p-5 sm:p-6"
          >
            <p className="text-stamp text-accent">Selected category</p>
            <h3 className="mt-2 font-display text-lg font-medium text-foreground">
              {category.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {category.example}
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-md border border-dashed border-accent bg-accent/5 px-3 py-2">
              <Coins
                className="size-4 shrink-0 text-accent"
                aria-hidden="true"
              />
              <span className="text-sm text-muted-foreground">
                Illustrative reward
              </span>
              <span
                data-ocid="participation.category_reward"
                className="text-tabular ml-auto text-sm font-semibold text-foreground"
              >
                +{formatCredits(category.reward)} SRC
              </span>
            </div>
          </div>

          <div
            data-ocid="participation.history"
            className="shell-panel p-5 sm:p-6"
          >
            <p className="text-stamp text-accent">Simulated history</p>
            <ul className="mt-3">
              {participationHistory.map((entry, index) => (
                <li
                  key={entry.id}
                  data-ocid={`participation.history_row.${index + 1}`}
                  className="ledger-row flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">
                      {entry.title}
                    </p>
                    <span
                      className={
                        entry.status === "Approved"
                          ? "badge-stage-live mt-1 inline-block"
                          : entry.status === "Awaiting verification"
                            ? "badge-stage-proposed mt-1 inline-block"
                            : "badge-stage-future mt-1 inline-block"
                      }
                    >
                      {entry.status}
                    </span>
                  </div>
                  <span className="text-tabular shrink-0 text-sm font-semibold text-foreground">
                    +{formatCredits(entry.reward)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </ModuleSection>

      {/* Research Credit economy */}
      <ModuleSection
        id="credits"
        ocid="participation.credits"
        eyebrow="Module 02"
        title="Research Credit economy"
        description="SOVEREIGN Research Credits (SRC) recognise verified contributions and can prioritize new research."
      >
        <div
          data-ocid="participation.credits_notice"
          role="note"
          className="rounded-lg border border-dashed border-accent bg-accent/10 px-4 py-3"
        >
          <p className="text-stamp text-accent-foreground">{srcNotice}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="shell-panel p-5">
            <p className="text-stamp text-muted-foreground">SRC balance</p>
            <p
              data-ocid="participation.src_balance"
              className="text-tabular mt-2 text-3xl font-semibold text-foreground"
            >
              {formatCredits(demoProfile.srcBalance)}
            </p>
          </div>
          <div className="shell-panel p-5">
            <p className="text-stamp text-muted-foreground">Contributions</p>
            <p className="text-tabular mt-2 text-3xl font-semibold text-foreground">
              {participationHistory.length}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {awaitingCount} awaiting verification · {approvedCount} approved
            </p>
          </div>
          <div className="shell-panel p-5">
            <p className="text-stamp text-muted-foreground">Credits earned</p>
            <p className="text-tabular mt-2 text-3xl font-semibold text-primary">
              +{formatCredits(earned)}
            </p>
          </div>
          <div className="shell-panel p-5">
            <p className="text-stamp text-muted-foreground">Credits spent</p>
            <p className="text-tabular mt-2 text-3xl font-semibold text-foreground">
              −{formatCredits(spent)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Commissioning research
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel
            title="Prioritized research assignments"
            ocid="participation.assignments_panel"
          >
            <ul>
              {prioritizedAssignments.map((assignment, index) => (
                <li
                  key={assignment.id}
                  data-ocid={`participation.assignment.${index + 1}`}
                  className="ledger-row flex items-center justify-between gap-3 py-3"
                >
                  <span className="min-w-0 truncate text-sm text-foreground">
                    {assignment.title}
                  </span>
                  <span
                    className={
                      assignment.status === "Delivered"
                        ? "badge-stage-live shrink-0"
                        : assignment.status === "In review"
                          ? "badge-stage-proposed shrink-0"
                          : "badge-stage-future shrink-0"
                    }
                  >
                    {assignment.status}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel
            title="Credit transaction history"
            ocid="participation.transactions_panel"
          >
            <ul>
              {creditTransactions.map((entry, index) => (
                <li
                  key={entry.id}
                  data-ocid={`participation.transaction.${index + 1}`}
                  className="ledger-row flex items-center justify-between gap-3 py-3"
                >
                  <span className="min-w-0 truncate text-sm text-foreground">
                    {entry.label}
                  </span>
                  <span
                    className={
                      entry.kind === "earned"
                        ? "text-tabular shrink-0 text-sm font-semibold text-primary"
                        : "text-tabular shrink-0 text-sm font-semibold text-foreground"
                    }
                  >
                    {entry.amount > 0 ? "+" : "−"}
                    {formatCredits(Math.abs(entry.amount))}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="shell-panel-alt p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck
              className="mt-0.5 size-5 shrink-0 text-primary"
              aria-hidden="true"
            />
            <p className="max-w-prose text-sm leading-relaxed text-foreground">
              {srcPlainLanguage}
            </p>
          </div>
        </div>
      </ModuleSection>

      {/* Governance preview */}
      <ModuleSection
        id="governance"
        ocid="participation.governance"
        eyebrow="Module 03"
        title="Governance preview"
        description="Seven questions a participation economy would put to the community. Take part in a simulated vote to see a tally and status update."
      >
        <ul
          data-ocid="participation.topic_list"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {governanceTopics.map((topic, index) => (
            <li
              key={topic.id}
              data-ocid={`participation.topic.${index + 1}`}
              className="shell-panel p-4"
            >
              <Vote className="size-4 text-accent" aria-hidden="true" />
              <h3 className="mt-2 font-display text-sm font-medium leading-snug text-foreground">
                {topic.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {topic.framing}
              </p>
            </li>
          ))}
        </ul>

        <div className="space-y-4">
          <h3 className="font-display text-lg font-medium text-foreground">
            Simulated proposals
          </h3>
          <ul data-ocid="participation.proposal_list" className="space-y-4">
            {governancePreviewProposals.map((proposal, index) => {
              const choice = votes[proposal.id];
              const yes = proposal.baseYes + (choice === "yes" ? 1 : 0);
              const no = proposal.baseNo + (choice === "no" ? 1 : 0);
              const total = yes + no;
              const yesPct = total > 0 ? Math.round((yes / total) * 100) : 0;
              const status = choice
                ? yes > no
                  ? "Passed"
                  : "Rejected"
                : "Open";
              return (
                <li
                  key={proposal.id}
                  data-ocid={`participation.proposal.${index + 1}`}
                  className="shell-panel p-5 sm:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-display text-base font-medium text-foreground sm:text-lg">
                        {proposal.title}
                      </h4>
                      <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
                        {proposal.summary}
                      </p>
                    </div>
                    <span
                      data-ocid={`participation.proposal_status.${index + 1}`}
                      className={
                        status === "Passed"
                          ? "badge-stage-live"
                          : status === "Rejected"
                            ? "badge-stage-future"
                            : "badge-stage-demo"
                      }
                    >
                      {status}
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Simulated tally
                      </span>
                      <span className="text-tabular text-foreground">
                        {formatCredits(yes)} yes · {formatCredits(no)} no
                      </span>
                    </div>
                    <div
                      className="vote-bar mt-2"
                      role="img"
                      aria-label={`${yesPct} percent in favour`}
                    >
                      <div
                        className="vote-bar-yes"
                        style={{ width: `${yesPct}%` }}
                      />
                    </div>
                    <p className="text-tabular mt-1 text-xs text-muted-foreground">
                      {yesPct}% in favour · +{proposal.reward} SRC for taking
                      part
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {choice ? (
                      <p
                        data-ocid={`participation.vote_confirmation.${index + 1}`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-primary"
                      >
                        <Check className="size-4" aria-hidden="true" />
                        Simulated vote recorded:{" "}
                        {choice === "yes" ? "In favour" : "Against"}
                      </p>
                    ) : (
                      <>
                        <button
                          type="button"
                          data-ocid={`participation.vote_yes_button.${index + 1}`}
                          onClick={() =>
                            setVotes((current) => ({
                              ...current,
                              [proposal.id]: "yes",
                            }))
                          }
                          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-smooth hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        >
                          Vote in favour
                        </button>
                        <button
                          type="button"
                          data-ocid={`participation.vote_no_button.${index + 1}`}
                          onClick={() =>
                            setVotes((current) => ({
                              ...current,
                              [proposal.id]: "no",
                            }))
                          }
                          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-smooth hover:bg-accent/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        >
                          Vote against
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          <p
            data-ocid="participation.vote_reward_summary"
            className="text-sm text-muted-foreground"
          >
            Simulated participation rewards earned this session:{" "}
            <span className="text-tabular font-semibold text-foreground">
              +{formatCredits(voteReward)} SRC
            </span>
            . Rewards recognise meaningful participation, not how anyone votes.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="shell-panel p-5">
            <Users className="size-5 text-primary" aria-hidden="true" />
            <h3 className="mt-3 font-display text-base font-medium text-foreground">
              Delegation is optional
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              A member could hand their voting weight to someone who follows the
              research closely — but never has to.
            </p>
          </div>
          <div className="shell-panel p-5">
            <RefreshCw className="size-5 text-primary" aria-hidden="true" />
            <h3 className="mt-3 font-display text-base font-medium text-foreground">
              Delegation is revocable
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Any delegation could be taken back at any time. No one is ever
              locked in or required to vote.
            </p>
          </div>
          <div className="shell-panel p-5">
            <Coins className="size-5 text-primary" aria-hidden="true" />
            <h3 className="mt-3 font-display text-base font-medium text-foreground">
              Rewards for taking part
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Illustrative SRC rewards recognise meaningful participation —
              never voting a particular way.
            </p>
          </div>
        </div>

        <div
          data-ocid="participation.safeguard"
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
        </div>
      </ModuleSection>

      {/* Sovereignty pillars */}
      <ModuleSection
        id="pillars"
        ocid="participation.pillars"
        eyebrow="Module 04"
        title="Four sovereignty pillars"
        description="Each pillar describes a different kind of authority a participation economy would protect."
      >
        <ul
          data-ocid="participation.pillar_list"
          className="grid gap-4 sm:grid-cols-2"
        >
          {sovereigntyPillars.map((pillar, index) => {
            const Icon = pillarIcons[pillar.id as keyof typeof pillarIcons];
            return (
              <li
                key={pillar.id}
                data-ocid={`participation.pillar.${index + 1}`}
                className="shell-panel flex flex-col p-5 sm:p-6"
              >
                <span className="flex size-10 items-center justify-center rounded-md bg-primary/10">
                  <Icon className="size-5 text-primary" aria-hidden="true" />
                </span>
                <h3 className="mt-3 font-display text-lg font-medium text-foreground">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {pillar.explanation}
                </p>
                <div className="mt-4 flex items-start gap-2 rounded-md border border-dashed border-accent bg-accent/5 px-3 py-2">
                  <Sparkles
                    className="mt-0.5 size-4 shrink-0 text-accent"
                    aria-hidden="true"
                  />
                  <p className="text-xs leading-relaxed text-foreground">
                    {pillar.activity}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </ModuleSection>

      {/* Future economic applications */}
      <ModuleSection
        id="future"
        ocid="participation.future"
        eyebrow="Module 05"
        title="Future economic applications"
        description="Seven areas a participation economy could support. Every item is a future possibility, not a built feature."
      >
        <ul
          data-ocid="participation.future_list"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {futureEconomicAreas.map((area, index) => (
            <li
              key={area.id}
              data-ocid={`participation.future_area.${index + 1}`}
              className="rounded-lg border border-dashed border-border bg-card p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <TrendingUp className="size-4 text-accent" aria-hidden="true" />
                <span className="badge-stage-future">Future</span>
              </div>
              <h3 className="mt-2 font-display text-sm font-medium leading-snug text-foreground">
                {area.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {area.description}
              </p>
            </li>
          ))}
        </ul>
      </ModuleSection>

      {/* Economic flywheel */}
      <ModuleSection
        id="flywheel"
        ocid="participation.flywheel"
        eyebrow="Module 06"
        title="Economic flywheel"
        description="Seven steps that turn real funding into research capacity. Select a step to read it in plain language."
      >
        <ol
          data-ocid="participation.flywheel_steps"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          {flywheelSteps.map((item, index) => {
            const Icon = flywheelIcons[item.id as keyof typeof flywheelIcons];
            const isActive = item.id === activeStep;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  data-ocid={`participation.flywheel_step.${index + 1}`}
                  aria-pressed={isActive}
                  onClick={() => setActiveStep(item.id)}
                  className={
                    isActive
                      ? "h-full w-full rounded-lg border border-primary bg-primary/5 p-4 text-left transition-smooth focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      : "shell-panel h-full w-full p-4 text-left transition-smooth hover:border-primary/50 hover:bg-accent/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <Icon
                      className={
                        isActive ? "size-4 text-primary" : "size-4 text-accent"
                      }
                      aria-hidden="true"
                    />
                    <span className="text-stamp text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <span className="text-stamp mt-2 block text-foreground">
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <div
          data-ocid="participation.flywheel_detail"
          className="shell-panel p-5 sm:p-6"
        >
          <p className="text-stamp text-accent">Step {step.label}</p>
          <h3 className="mt-2 font-display text-lg font-medium text-foreground">
            {step.title}
          </h3>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
            {step.explanation}
          </p>
        </div>

        <div className="rounded-lg border border-dashed border-accent bg-accent/5 p-5 sm:p-6">
          <p className="text-stamp text-accent-foreground">
            Simulated credits vs real funding
          </p>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-foreground">
            SRC participation credits are illustrative only and carry no
            monetary value. Real funding and operating revenue are separate:
            they come from grants, philanthropy, institutional contracts and
            investment, and they fund research, infrastructure and
            participation.
          </p>
        </div>
      </ModuleSection>

      {/* DAO and tokenomics connection */}
      <ModuleSection
        id="dao"
        ocid="participation.dao_connection"
        eyebrow="Module 07"
        title="Connection to the SOVEREIGN DAO &amp; Economy"
        description="The participation model links directly to the proposed SOVEREIGN token economy and its future DAO governance."
      >
        <div
          data-ocid="participation.token_notice"
          role="note"
          className="rounded-lg border border-dashed border-accent bg-accent/10 px-4 py-3"
        >
          <p className="text-stamp text-accent-foreground">
            {tokenomicsNotice}
          </p>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="shell-panel p-5">
            <dt className="text-stamp text-muted-foreground">
              Proposed supply
            </dt>
            <dd className="text-tabular mt-2 font-display text-2xl font-medium text-foreground">
              {participationTokenSummary.supply}
            </dd>
          </div>
          <div className="shell-panel p-5">
            <dt className="text-stamp text-muted-foreground">Emission model</dt>
            <dd className="mt-2 text-sm font-medium text-foreground">
              {participationTokenSummary.halving}
            </dd>
          </div>
          <div className="shell-panel p-5">
            <dt className="text-stamp text-muted-foreground">
              Community rewards
            </dt>
            <dd className="mt-2 text-sm font-medium text-foreground">
              {participationTokenSummary.rewards}
            </dd>
          </div>
          <div className="shell-panel p-5">
            <dt className="text-stamp text-muted-foreground">Governance</dt>
            <dd className="mt-2 text-sm font-medium text-foreground">
              {participationTokenSummary.governance}
            </dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-3">
          <a
            href="/dao/tokenomics"
            data-ocid="participation.tokenomics_link"
            className="inline-flex items-center gap-1.5 rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary transition-smooth hover:bg-primary hover:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Landmark className="size-4" aria-hidden="true" />
            View the tokenomics overview
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
          <a
            href="/dao/governance"
            data-ocid="participation.governance_link"
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-smooth hover:bg-accent/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Gavel className="size-4" aria-hidden="true" />
            Explore DAO governance
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>
      </ModuleSection>

      <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">
        Every figure, credit, reward and vote on this page is a simulated
        demonstration. Nothing is persisted, no real credit or token exists, and
        no financial transaction takes place.
      </p>
    </div>
  );
}
