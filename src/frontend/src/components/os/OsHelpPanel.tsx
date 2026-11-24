import { BookOpen, Compass, HelpCircle, RotateCcw } from "lucide-react";

import { nationWorkspaceExplanation } from "@/data/sampleNation";

/**
 * The workspace Help panel: a short explanation of what a Nation workspace is,
 * a pointer to the sample Nation, and a control that replays the first-visit
 * introduction. The introduction is optional and replayable at any time.
 */
export default function OsHelpPanel({
  onReplayIntro,
}: {
  onReplayIntro: () => void;
}) {
  return (
    <div data-ocid="os.help_panel" className="space-y-4">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-accent/40 bg-accent/15 text-accent-foreground"
        >
          <HelpCircle className="size-4" />
        </span>
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-foreground">
            What is a Nation workspace?
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {nationWorkspaceExplanation}
          </p>
        </div>
      </div>

      <ul className="space-y-2">
        <li className="flex items-start gap-3 rounded-md border border-border bg-card p-3">
          <Compass
            className="mt-0.5 size-4 shrink-0 text-accent"
            aria-hidden="true"
          />
          <span className="min-w-0 text-xs leading-relaxed text-muted-foreground">
            Open the{" "}
            <span className="font-medium text-foreground">Sample Nation</span>{" "}
            to explore a fully populated example workspace.
          </span>
        </li>
        <li className="flex items-start gap-3 rounded-md border border-border bg-card p-3">
          <BookOpen
            className="mt-0.5 size-4 shrink-0 text-accent"
            aria-hidden="true"
          />
          <span className="min-w-0 text-xs leading-relaxed text-muted-foreground">
            Apps marked with a dashed bronze ring are{" "}
            <span className="font-medium text-foreground">Preview</span> — not
            yet working functionality.
          </span>
        </li>
      </ul>

      <button
        type="button"
        onClick={onReplayIntro}
        data-ocid="os.help_panel.replay_intro_button"
        className="os-focus-ring inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-smooth hover:border-primary/50"
      >
        <RotateCcw className="size-4" aria-hidden="true" />
        Replay the introduction
      </button>
    </div>
  );
}
