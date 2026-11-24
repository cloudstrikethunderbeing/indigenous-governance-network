import { ScrollText } from "lucide-react";

import {
  type LauncherDraft,
  membershipModelLabel,
  templateLabel,
  votingModelLabel,
} from "@/components/os/launcher/launcherTypes";

/** One numbered clause in the previewed constitution. */
interface PreviewClause {
  number: string;
  title: string;
  body: string;
}

/**
 * Build the plain-language clauses the confirmed rules would produce. Every
 * clause is derived from the draft, so the preview always matches the choices
 * the user has made — nothing is invented and nothing is hidden.
 */
function buildClauses(draft: LauncherDraft): PreviewClause[] {
  const name = draft.name.trim() || "this organization";
  return [
    {
      number: "01",
      title: "The collective will",
      body: `Decisions belong to the whole community of ${name}. No single person decides alone, and every member can see how a decision was reached.`,
    },
    {
      number: "02",
      title: "Voting & consensus",
      body: `Members decide by ${votingModelLabel(draft.votingModel).toLowerCase()}. A proposal passes when it reaches ${draft.approvalThresholdPercent}% support, after a fair time to discuss it.`,
    },
    {
      number: "03",
      title: "Membership & delegation",
      body: `New members join by ${membershipModelLabel(draft.membershipModel).toLowerCase()}. A member may ask a trusted person to vote on their behalf, and can take that back at any time.`,
    },
    {
      number: "04",
      title: "Quorum & oversight",
      body: `A vote counts only when at least ${draft.quorumPercent}% of members take part. An independent reviewer checks that decisions follow these rules and reports openly.`,
    },
  ];
}

/**
 * The constitution preview shown before deployment. It reads as a signed
 * instrument: a wax-seal roundel, a title, and numbered plain-language clauses
 * derived from the draft. It is a preview only — the rules are saved through
 * the backend once the user confirms them.
 */
export default function LauncherConstitutionPreview({
  draft,
  confirmed,
}: {
  draft: LauncherDraft;
  confirmed: boolean;
}) {
  const clauses = buildClauses(draft);

  return (
    <article
      data-ocid="os.launcher.constitution_preview"
      className="gov-constitution space-y-5 p-5 md:p-7"
    >
      <header className="space-y-3 text-center">
        <span
          aria-hidden="true"
          className={`gov-seal mx-auto flex size-14 items-center justify-center rounded-full ${
            confirmed ? "animate-gov-seal-in" : ""
          }`}
        >
          <ScrollText className="size-6" />
        </span>
        <div className="space-y-1">
          <p className="text-stamp text-muted-foreground">
            Governance rules — preview
          </p>
          <h3 className="font-display text-xl font-medium tracking-tight text-foreground md:text-2xl">
            Constitution of {draft.name.trim() || "the Organization"}
          </h3>
          <p className="text-xs text-muted-foreground">
            Based on the {templateLabel(draft.templateKey)} example
          </p>
        </div>
      </header>

      <ol className="space-y-4">
        {clauses.map((clause) => (
          <li key={clause.number} className="gov-clause space-y-1.5">
            <div className="flex items-baseline gap-2">
              <span className="gov-clause-num text-sm">{clause.number}.</span>
              <h4 className="font-display text-base font-medium text-foreground">
                {clause.title}
              </h4>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {clause.body}
            </p>
          </li>
        ))}
      </ol>

      <p className="border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
        This preview shows the rules your organization would adopt. Nothing is
        saved until you confirm them on the final step.
      </p>
    </article>
  );
}
