import { FileSearch, ShieldCheck } from "lucide-react";

import Panel from "@/components/dashboard/Panel";
import DemoSession from "@/components/demo/DemoSession";
import { simulationNotice } from "@/data/demoData";

/** Every entry is a static, illustrative example — never a real audit record. */
const auditEntries = [
  {
    id: "e1",
    date: "Example · Q1",
    title: "Concept economy published",
    detail: "Proposed tokenomics and allocation shared for review.",
    status: "Published",
  },
  {
    id: "e2",
    date: "Example · Q2",
    title: "Community feedback round",
    detail: "Illustrative comments gathered on the proposed design.",
    status: "Reviewed",
  },
  {
    id: "e3",
    date: "Example · Q3",
    title: "Sovereignty safeguard restated",
    detail: "Nation authority confirmed to remain with Nations.",
    status: "Reviewed",
  },
  {
    id: "e4",
    date: "Example · Q4",
    title: "Independent review — planned",
    detail: "A future third-party review, not yet undertaken.",
    status: "Planned",
  },
];

const accountability = [
  {
    id: "a1",
    label: "All figures are simulated",
    detail: "No real balances, credits or treasury positions exist.",
  },
  {
    id: "a2",
    label: "No funds are held",
    detail: "This preview accepts no contributions and moves no value.",
  },
  {
    id: "a3",
    label: "Nation authority is unchanged",
    detail: "Participation never confers citizenship or treaty authority.",
  },
];

const statusClass: Record<string, string> = {
  Published: "badge-stage-live",
  Reviewed: "badge-stage-demo",
  Planned: "badge-stage-future",
};

export default function AuditHistoryPage() {
  return (
    <div data-ocid="page.audit_history" className="space-y-8">
      <header className="space-y-4">
        <p className="text-stamp text-accent">Public accountability</p>
        <h1 className="font-display text-3xl font-medium tracking-tight text-foreground md:text-4xl">
          Audit History
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          A readable public record of how the concept economy has been shared
          and reviewed. Every entry is an example.
        </p>
        <div className="rule-accent" />
      </header>

      <DemoSession />

      <section
        data-ocid="audit.notice"
        role="note"
        className="shell-panel flex items-start gap-3 border-dashed border-accent bg-accent/5 p-5 sm:p-6"
      >
        <ShieldCheck
          className="mt-0.5 size-5 shrink-0 text-accent"
          aria-hidden="true"
        />
        <p className="text-sm leading-relaxed text-muted-foreground">
          {simulationNotice}. This is a pitch and interactive demo only — no
          real accounting, issuance or governance is recorded here.
        </p>
      </section>

      <Panel
        title="Audit timeline"
        ocid="audit.timeline"
        action={
          <FileSearch
            className="size-4 shrink-0 text-accent"
            aria-hidden="true"
          />
        }
      >
        <ol className="list-none space-y-0">
          {auditEntries.map((entry) => (
            <li
              key={entry.id}
              data-ocid={`audit.entry.${entry.id}`}
              className="ledger-row flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
            >
              <div className="min-w-0">
                <p className="text-stamp text-muted-foreground">{entry.date}</p>
                <p className="mt-1 font-display text-base font-medium text-foreground">
                  {entry.title}
                </p>
                <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted-foreground">
                  {entry.detail}
                </p>
              </div>
              <span
                className={`${statusClass[entry.status]} shrink-0 self-start`}
              >
                {entry.status}
              </span>
            </li>
          ))}
        </ol>
      </Panel>

      <Panel title="Public accountability" ocid="audit.accountability">
        <ul className="grid gap-4 sm:grid-cols-3">
          {accountability.map((item) => (
            <li
              key={item.id}
              data-ocid={`audit.accountability.${item.id}`}
              className="shell-panel-alt p-4"
            >
              <p className="text-sm font-medium text-foreground">
                {item.label}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {item.detail}
              </p>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
