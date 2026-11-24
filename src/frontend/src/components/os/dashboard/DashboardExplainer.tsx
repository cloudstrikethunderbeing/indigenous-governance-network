import { Lock, ShieldCheck, Sparkles } from "lucide-react";

import { nationWorkspaceExplanation } from "@/data/sampleNation";

const points = [
  {
    id: "private",
    icon: Lock,
    title: "Private by default",
    body: "Each Nation decides what stays inside its workspace and what it shares with other Nations.",
  },
  {
    id: "self-governed",
    icon: ShieldCheck,
    title: "Community-controlled",
    body: "Governance, documents and treasury stay under the Nation's own rules and roles.",
  },
  {
    id: "independent",
    icon: Sparkles,
    title: "Independent workspace",
    body: "A Nation would eventually run its own private workspace, separate from every other Nation.",
  },
];

/**
 * A short plain-language explanation of what a Nation workspace is and how a
 * Nation would eventually run its own independent, private workspace.
 */
export default function DashboardExplainer() {
  return (
    <section
      data-ocid="os.dashboard.explainer_section"
      aria-label="What a Nation workspace is"
      className="shell-panel space-y-4 p-4 md:p-5"
    >
      <div className="space-y-2">
        <p className="text-stamp text-accent">What is a Nation workspace?</p>
        <p className="max-w-3xl text-sm leading-relaxed text-foreground">
          {nationWorkspaceExplanation}
        </p>
      </div>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {points.map((point) => (
          <li
            key={point.id}
            data-ocid={`os.dashboard.explainer.${point.id}`}
            className="shell-panel-alt space-y-2 p-3"
          >
            <span className="flex items-center gap-2">
              <span className="os-icon-glyph size-8" aria-hidden="true">
                <point.icon className="size-4" />
              </span>
              <span className="text-sm font-semibold text-foreground">
                {point.title}
              </span>
            </span>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {point.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
