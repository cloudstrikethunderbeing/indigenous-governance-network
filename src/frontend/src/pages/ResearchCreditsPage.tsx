import {
  ArrowRight,
  BadgeCheck,
  CircleDollarSign,
  ClipboardCheck,
  Coins,
  FlaskConical,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";

import Panel from "@/components/dashboard/Panel";
import DemoSession from "@/components/demo/DemoSession";
import { demoProfile, srcNotice } from "@/data/demoData";

/** The three simulated review stages a contribution moves through. */
type ContributionStage = "submitted" | "verified" | "approved";

interface Contribution {
  id: string;
  title: string;
  topic: string;
  /** Illustrative SRC reward released on approval. */
  reward: number;
  stage: ContributionStage;
}

interface Assignment {
  id: string;
  title: string;
  /** SRC committed to commission or prioritize this assignment. */
  cost: number;
  /** Simulated research task status. */
  status: "Queued" | "In review" | "Delivered";
}

interface LedgerEntry {
  id: string;
  label: string;
  /** Positive credits earned, negative credits spent. */
  amount: number;
  kind: "earned" | "spent";
}

const stageOrder: ContributionStage[] = ["submitted", "verified", "approved"];

const stageMeta: Record<
  ContributionStage,
  { label: string; stamp: string; hint: string }
> = {
  submitted: {
    label: "Submitted",
    stamp: "badge-stage-future",
    hint: "Awaiting reviewer verification",
  },
  verified: {
    label: "Verified",
    stamp: "badge-stage-proposed",
    hint: "Reviewer confirmed the source",
  },
  approved: {
    label: "Approved",
    stamp: "badge-stage-live",
    hint: "Reward released to balance",
  },
};

const initialContributions: Contribution[] = [
  {
    id: "c1",
    title: "Oral history of seasonal water stewardship",
    topic: "Water & land",
    reward: 120,
    stage: "submitted",
  },
  {
    id: "c2",
    title: "Community-led seed bank inventory",
    topic: "Food systems",
    reward: 90,
    stage: "verified",
  },
  {
    id: "c3",
    title: "Language revitalization program review",
    topic: "Language",
    reward: 150,
    stage: "approved",
  },
];

const initialAssignments: Assignment[] = [
  {
    id: "a1",
    title: "Map regional renewable energy partnerships",
    cost: 200,
    status: "In review",
  },
  {
    id: "a2",
    title: "Survey youth digital-skills training needs",
    cost: 140,
    status: "Queued",
  },
];

const initialLedger: LedgerEntry[] = [
  {
    id: "l1",
    label: "Approved contribution reward",
    amount: 150,
    kind: "earned",
  },
  {
    id: "l2",
    label: "Commissioned research assignment",
    amount: -200,
    kind: "spent",
  },
  {
    id: "l3",
    label: "Approved contribution reward",
    amount: 90,
    kind: "earned",
  },
  {
    id: "l4",
    label: "Prioritized research assignment",
    amount: -140,
    kind: "spent",
  },
];

/** Illustrative SRC cost to commission a new research assignment. */
const COMMISSION_COST = 100;

function formatCredits(value: number): string {
  return value.toLocaleString("en-US");
}

export default function ResearchCreditsPage() {
  const [balance, setBalance] = useState(demoProfile.srcBalance);
  const [contributions, setContributions] =
    useState<Contribution[]>(initialContributions);
  const [assignments, setAssignments] =
    useState<Assignment[]>(initialAssignments);
  const [ledger, setLedger] = useState<LedgerEntry[]>(initialLedger);
  const [commissionCount, setCommissionCount] = useState(0);

  const earned = useMemo(
    () =>
      ledger
        .filter((entry) => entry.kind === "earned")
        .reduce((sum, entry) => sum + entry.amount, 0),
    [ledger],
  );
  const spent = useMemo(
    () =>
      ledger
        .filter((entry) => entry.kind === "spent")
        .reduce((sum, entry) => sum + Math.abs(entry.amount), 0),
    [ledger],
  );

  function advanceContribution(id: string) {
    setContributions((current) =>
      current.map((contribution) => {
        if (contribution.id !== id) return contribution;
        const nextIndex = stageOrder.indexOf(contribution.stage) + 1;
        if (nextIndex >= stageOrder.length) return contribution;
        const nextStage = stageOrder[nextIndex];
        if (nextStage === "approved") {
          setBalance((value) => value + contribution.reward);
          setLedger((entries) => [
            {
              id: `l-${contribution.id}-approved`,
              label: `Approved: ${contribution.title}`,
              amount: contribution.reward,
              kind: "earned",
            },
            ...entries,
          ]);
        }
        return { ...contribution, stage: nextStage };
      }),
    );
  }

  function commissionAssignment() {
    if (balance < COMMISSION_COST) return;
    const nextNumber = commissionCount + 1;
    setCommissionCount(nextNumber);
    setBalance((value) => value - COMMISSION_COST);
    setAssignments((current) => [
      {
        id: `a-new-${nextNumber}`,
        title: `New commissioned research brief #${nextNumber}`,
        cost: COMMISSION_COST,
        status: "Queued",
      },
      ...current,
    ]);
    setLedger((entries) => [
      {
        id: `l-commission-${nextNumber}`,
        label: "Commissioned research assignment",
        amount: -COMMISSION_COST,
        kind: "spent",
      },
      ...entries,
    ]);
  }

  return (
    <div data-ocid="page.research_credits" className="space-y-6">
      <header className="space-y-3">
        <p className="text-stamp text-accent">Phase 2 of 5</p>
        <h2 className="font-display text-2xl font-medium tracking-tight text-foreground md:text-3xl">
          Research Credits
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          SOVEREIGN Research Credits (SRC) are earned for verified contributions
          and spent to commission new research. Step a contribution through
          review to see how participation creates research capacity.
        </p>
        <div className="rule-accent" />
      </header>

      <div
        data-ocid="src.notice"
        role="note"
        className="rounded-lg border border-dashed border-accent bg-accent/10 px-4 py-3"
      >
        <p className="text-stamp text-accent-foreground">{srcNotice}</p>
      </div>

      <DemoSession />

      <section
        data-ocid="src.balance_panel"
        aria-label="Simulated SRC balance"
        className="grid gap-4 sm:grid-cols-3"
      >
        <div className="shell-panel flex flex-col p-5 sm:col-span-1">
          <p className="text-stamp text-muted-foreground">SRC balance</p>
          <p
            data-ocid="src.balance_value"
            className="text-tabular mt-2 text-4xl font-semibold text-foreground"
          >
            {formatCredits(balance)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Simulated credits available to spend
          </p>
        </div>
        <div className="shell-panel flex flex-col p-5">
          <p className="text-stamp text-muted-foreground">Earned</p>
          <p
            data-ocid="src.earned_value"
            className="text-tabular mt-2 text-3xl font-semibold text-primary"
          >
            +{formatCredits(earned)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            From approved contributions
          </p>
        </div>
        <div className="shell-panel flex flex-col p-5">
          <p className="text-stamp text-muted-foreground">Spent</p>
          <p
            data-ocid="src.spent_value"
            className="text-tabular mt-2 text-3xl font-semibold text-foreground"
          >
            −{formatCredits(spent)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            On commissioned research
          </p>
        </div>
      </section>

      <Panel
        title="Example contributions"
        ocid="src.contributions_section"
        action={
          <FlaskConical className="size-5 text-accent" aria-hidden="true" />
        }
      >
        <p className="max-w-2xl text-sm text-muted-foreground">
          Each contribution moves from submission to reviewer verification to
          approval. The illustrative reward is released only on approval.
        </p>

        <ul data-ocid="src.contributions_list" className="mt-4 space-y-3">
          {contributions.map((contribution, index) => {
            const meta = stageMeta[contribution.stage];
            const isApproved = contribution.stage === "approved";
            const nextStage =
              stageOrder[stageOrder.indexOf(contribution.stage) + 1];
            return (
              <li
                key={contribution.id}
                data-ocid={`src.contribution.${index + 1}`}
                className="shell-panel-alt p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-base font-medium text-foreground">
                      {contribution.title}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {contribution.topic}
                    </p>
                  </div>
                  <span className={meta.stamp}>{meta.label}</span>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Coins className="size-4 text-accent" aria-hidden="true" />
                    <span className="text-sm text-muted-foreground">
                      Illustrative reward
                    </span>
                    <span className="text-tabular text-sm font-semibold text-foreground">
                      {formatCredits(contribution.reward)} SRC
                    </span>
                  </div>
                  {isApproved ? (
                    <span
                      data-ocid={`src.contribution_reward.${index + 1}`}
                      className="flex items-center gap-1.5 text-sm font-medium text-primary"
                    >
                      <BadgeCheck className="size-4" aria-hidden="true" />
                      Reward released
                    </span>
                  ) : (
                    <button
                      type="button"
                      data-ocid={`src.advance_button.${index + 1}`}
                      onClick={() => advanceContribution(contribution.id)}
                      className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-smooth hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      {contribution.stage === "submitted" ? (
                        <ClipboardCheck className="size-4" aria-hidden="true" />
                      ) : (
                        <ShieldCheck className="size-4" aria-hidden="true" />
                      )}
                      {contribution.stage === "submitted"
                        ? "Verify contribution"
                        : "Approve & release reward"}
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {isApproved
                    ? "Approved — reward added to the simulated balance."
                    : `Next step: ${nextStage ? stageMeta[nextStage].label : ""} · ${meta.hint}`}
                </p>
              </li>
            );
          })}
        </ul>
      </Panel>

      <Panel
        title="Commission research"
        ocid="src.assignments_section"
        action={<Sparkles className="size-5 text-accent" aria-hidden="true" />}
      >
        <p className="max-w-2xl text-sm text-muted-foreground">
          Spend SRC to commission or prioritize a research assignment. Each
          assignment shows its simulated task status.
        </p>

        <div className="shell-panel-alt mt-4 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CircleDollarSign
                className="size-4 text-accent"
                aria-hidden="true"
              />
              <span className="text-sm text-muted-foreground">
                Commission a new research brief
              </span>
              <span className="text-tabular text-sm font-semibold text-foreground">
                {formatCredits(COMMISSION_COST)} SRC
              </span>
            </div>
            <button
              type="button"
              data-ocid="src.commission_button"
              onClick={commissionAssignment}
              disabled={balance < COMMISSION_COST}
              className="inline-flex items-center gap-2 rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary transition-smooth hover:bg-primary hover:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="size-4" aria-hidden="true" />
              Commission assignment
            </button>
          </div>
          {balance < COMMISSION_COST && (
            <p
              data-ocid="src.commission_hint"
              className="mt-2 text-xs text-muted-foreground"
            >
              Not enough simulated SRC — approve a contribution to earn more.
            </p>
          )}
        </div>

        <ul data-ocid="src.assignments_list" className="mt-4 space-y-3">
          {assignments.map((assignment, index) => (
            <li
              key={assignment.id}
              data-ocid={`src.assignment.${index + 1}`}
              className="shell-panel-alt flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-display text-base font-medium text-foreground">
                  {assignment.title}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {formatCredits(assignment.cost)} SRC committed
                </p>
              </div>
              <span
                className={
                  assignment.status === "Delivered"
                    ? "badge-stage-live"
                    : assignment.status === "In review"
                      ? "badge-stage-proposed"
                      : "badge-stage-future"
                }
              >
                {assignment.status}
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel
        title="Transaction & audit history"
        ocid="src.ledger_section"
        action={
          <ClipboardCheck className="size-5 text-accent" aria-hidden="true" />
        }
      >
        <p className="max-w-2xl text-sm text-muted-foreground">
          A sample ledger of the demo member&apos;s simulated SRC activity.
        </p>

        <div className="mt-4 overflow-hidden rounded-lg border border-border">
          <table data-ocid="src.ledger_table" className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-secondary/60">
                <th
                  scope="col"
                  className="text-stamp px-4 py-3 text-muted-foreground"
                >
                  Activity
                </th>
                <th
                  scope="col"
                  className="text-stamp px-4 py-3 text-right text-muted-foreground"
                >
                  Credits
                </th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((entry, index) => (
                <tr
                  key={entry.id}
                  data-ocid={`src.ledger_row.${index + 1}`}
                  className="ledger-row"
                >
                  <td className="px-4 py-3 text-sm text-foreground">
                    {entry.label}
                  </td>
                  <td
                    className={
                      entry.kind === "earned"
                        ? "text-tabular px-4 py-3 text-right text-sm font-semibold text-primary"
                        : "text-tabular px-4 py-3 text-right text-sm font-semibold text-foreground"
                    }
                  >
                    {entry.amount > 0 ? "+" : "−"}
                    {formatCredits(Math.abs(entry.amount))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
