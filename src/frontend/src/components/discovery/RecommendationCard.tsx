import { Lightbulb } from "lucide-react";

import type { Recommendation } from "@/backend";

const KIND_LABEL: Record<Recommendation["kind"], string> = {
  similarIdea: "Similar idea",
  relevantProposal: "Relevant proposal",
  collaborationPartner: "Collaboration partner",
  matchingMember: "Matching member",
  sharedObjective: "Shared objective",
  suggestedNextStep: "Suggested next step",
};

/**
 * A single recommendation with its short plain-language explanation. Every
 * recommendation is derived from stored data via keyword, category and
 * interest matching — never invented.
 */
export default function RecommendationCard({
  recommendation,
  index,
}: {
  recommendation: Recommendation;
  index: number;
}) {
  return (
    <article
      data-ocid={`discovery.recommendation_card.${index}`}
      className="network-panel flex flex-col gap-2 p-4"
    >
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="flex size-7 items-center justify-center rounded-md bg-accent/15 text-accent-foreground"
        >
          <Lightbulb className="size-3.5" />
        </span>
        <span className="network-chip">{KIND_LABEL[recommendation.kind]}</span>
      </div>
      <h3 className="font-display text-sm font-medium tracking-tight text-foreground">
        {recommendation.title}
      </h3>
      <p className="text-xs text-muted-foreground">
        {recommendation.explanation}
      </p>
    </article>
  );
}
