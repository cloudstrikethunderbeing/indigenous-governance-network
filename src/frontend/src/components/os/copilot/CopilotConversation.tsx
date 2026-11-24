import { AlertCircle, RotateCcw, Sparkles, User } from "lucide-react";

import type { CopilotTurn } from "@/components/os/copilot/types";
import { Button } from "@/components/ui/button";

/** The advisory label shown on every Copilot answer. */
function AdvisoryBadge() {
  return (
    <span
      data-ocid="os.copilot.advisory_badge"
      className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-accent"
    >
      Advisory only
    </span>
  );
}

/** The workspace sources an answer drew on. */
function SourceChips({ turn }: { turn: CopilotTurn }) {
  if (!turn.sources || turn.sources.length === 0) return null;
  return (
    <div className="space-y-1.5">
      <p className="text-stamp text-muted-foreground">Sources</p>
      <ul className="flex flex-wrap gap-1.5">
        {turn.sources.map((source) => (
          <li
            key={`${source.sourceKind}-${source.referenceId.toString()}`}
            className="network-chip"
          >
            {source.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** A single question-and-answer turn. */
function Turn({
  turn,
  index,
  onRetry,
}: {
  turn: CopilotTurn;
  index: number;
  onRetry: (turn: CopilotTurn) => void;
}) {
  return (
    <li
      data-ocid={`os.copilot.turn.${index + 1}`}
      className="space-y-3"
      aria-live="polite"
    >
      <div className="flex items-start justify-end gap-2">
        <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground">
          {turn.question}
        </p>
        <span
          aria-hidden="true"
          className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
        >
          <User className="size-3.5" />
        </span>
      </div>

      <div className="flex items-start gap-2">
        <span
          aria-hidden="true"
          className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent"
        >
          <Sparkles className="size-3.5" />
        </span>
        <div className="min-w-0 flex-1 space-y-3">
          {turn.pending ? (
            <div
              data-ocid={`os.copilot.pending.${index + 1}`}
              className="shell-panel flex items-center gap-2 p-3"
            >
              <span className="flex gap-1" aria-hidden="true">
                <span className="size-1.5 animate-os-preview-pulse rounded-full bg-accent" />
                <span className="size-1.5 animate-os-preview-pulse rounded-full bg-accent [animation-delay:0.2s]" />
                <span className="size-1.5 animate-os-preview-pulse rounded-full bg-accent [animation-delay:0.4s]" />
              </span>
              <p className="text-sm text-muted-foreground">
                Preparing an answer from the workspace…
              </p>
            </div>
          ) : turn.error ? (
            <div
              data-ocid={`os.copilot.error.${index + 1}`}
              role="alert"
              className="shell-panel space-y-2 border-destructive/40 p-3"
            >
              <div className="flex items-start gap-2">
                <AlertCircle
                  className="mt-0.5 size-4 shrink-0 text-destructive"
                  aria-hidden="true"
                />
                <p className="text-sm text-foreground">{turn.error}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                data-ocid={`os.copilot.retry_button.${index + 1}`}
                onClick={() => onRetry(turn)}
                className="min-h-[44px] rounded-lg"
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                Retry
              </Button>
            </div>
          ) : (
            <div className="shell-panel space-y-3 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <AdvisoryBadge />
              </div>
              <p className="text-sm leading-relaxed text-foreground">
                {turn.answer}
              </p>
              <SourceChips turn={turn} />
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

/**
 * The Copilot conversation: the ordered question-and-answer turns, each with
 * its advisory label, workspace sources, pending state and retry.
 */
export default function CopilotConversation({
  turns,
  onRetry,
}: {
  turns: CopilotTurn[];
  onRetry: (turn: CopilotTurn) => void;
}) {
  return (
    <ul
      data-ocid="os.copilot.conversation"
      className="space-y-5"
      aria-label="Copilot conversation"
    >
      {turns.map((turn, index) => (
        <Turn key={turn.id} turn={turn} index={index} onRetry={onRetry} />
      ))}
    </ul>
  );
}
