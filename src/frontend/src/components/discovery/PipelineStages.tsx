import { PipelineStage } from "@/backend";

/** The seven-stage idea-to-proposal progression, in order. */
export const PIPELINE_STAGES: { stage: PipelineStage; label: string }[] = [
  { stage: PipelineStage.idea, label: "Idea" },
  { stage: PipelineStage.communityFeedback, label: "Community Feedback" },
  { stage: PipelineStage.collaboration, label: "Collaboration" },
  { stage: PipelineStage.draftProposal, label: "Draft Proposal" },
  { stage: PipelineStage.governanceVote, label: "Governance Vote" },
  { stage: PipelineStage.approvedAction, label: "Approved Action" },
  { stage: PipelineStage.results, label: "Results" },
];

/**
 * The visible seven-stage progression. Each stage is interactive: selecting a
 * stage reports it to the parent so the item's current stage can be shown and
 * advanced. Only authorized users may advance into the formal proposal stages.
 */
export default function PipelineStages({
  current,
  onSelect,
  interactive = true,
}: {
  current: PipelineStage;
  onSelect?: (stage: PipelineStage) => void;
  interactive?: boolean;
}) {
  const currentIndex = PIPELINE_STAGES.findIndex(
    (entry) => entry.stage === current,
  );

  return (
    <ol
      data-ocid="discovery.pipeline_stages"
      className="flex flex-wrap items-center gap-1.5"
    >
      {PIPELINE_STAGES.map((entry, index) => {
        const isCurrent = entry.stage === current;
        const isPast = index < currentIndex;
        const state = isCurrent ? "current" : isPast ? "past" : "future";
        return (
          <li key={entry.stage} className="flex items-center gap-1.5">
            <button
              type="button"
              data-ocid={`discovery.pipeline_stage.${index}`}
              aria-current={isCurrent ? "step" : undefined}
              aria-label={`${entry.label} — ${state}`}
              disabled={!interactive}
              onClick={() => onSelect?.(entry.stage)}
              className={`pipeline-node focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                isCurrent ? "pipeline-node-active" : ""
              } ${isPast ? "opacity-70" : ""}`}
            >
              {index + 1}
            </button>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {entry.label}
            </span>
            {index < PIPELINE_STAGES.length - 1 ? (
              <span
                aria-hidden="true"
                className="pipeline-rail h-px w-4 sm:w-6"
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
