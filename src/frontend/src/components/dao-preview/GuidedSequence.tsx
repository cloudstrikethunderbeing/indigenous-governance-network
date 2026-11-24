import { ArrowRight, RotateCcw } from "lucide-react";

import { SEQUENCE_STEPS } from "./previewModules";
import { useReducedMotion, useSequence } from "./usePreviewMotion";

type GuidedSequenceProps = {
  onComplete: () => void;
};

const STEP_INTERVAL_MS = 4200;

/**
 * The guided visual sequence: six steps from Your Digital Community to Your
 * Sovereign Digital Ecosystem, then the full-screen reveal. It advances on its
 * own, and the user can step forward, back, restart or skip at any time.
 */
export default function GuidedSequence({ onComplete }: GuidedSequenceProps) {
  const reduced = useReducedMotion();
  const { step, setStep } = useSequence(
    SEQUENCE_STEPS.length,
    STEP_INTERVAL_MS,
    !reduced,
  );
  const current = SEQUENCE_STEPS[step];
  const isLast = step === SEQUENCE_STEPS.length - 1;

  return (
    <section
      data-ocid="dao_preview.sequence"
      aria-labelledby="dao-preview-sequence-title"
      className="cosmos-panel cosmos-rise mx-auto w-full max-w-2xl p-6 sm:p-8"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-[oklch(var(--cosmos-cyan))]">
          {current.eyebrow} / {String(SEQUENCE_STEPS.length).padStart(2, "0")}
        </p>
        <button
          type="button"
          onClick={() => setStep(0)}
          data-ocid="dao_preview.sequence.restart_button"
          className="cosmos-focus inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-xs font-medium text-[oklch(var(--cosmos-muted))] transition-colors hover:text-[oklch(var(--cosmos-foreground))]"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Restart
        </button>
      </div>

      <div key={current.id} className="cosmos-reveal mt-2">
        <h2
          id="dao-preview-sequence-title"
          className="font-display text-2xl leading-tight text-[oklch(var(--cosmos-foreground))] sm:text-3xl"
        >
          {current.title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[oklch(var(--cosmos-muted))] sm:text-base">
          {current.body}
        </p>
      </div>

      {/* Progress rail */}
      <ol
        className="mt-6 flex items-center gap-1.5"
        aria-label="Sequence progress"
      >
        {SEQUENCE_STEPS.map((item, index) => (
          <li key={item.id} className="flex-1">
            <button
              type="button"
              onClick={() => setStep(index)}
              aria-label={`Go to ${item.title}`}
              aria-current={index === step ? "step" : undefined}
              data-ocid={`dao_preview.sequence.step.${index + 1}`}
              className="cosmos-focus block h-11 w-full"
            >
              <span
                className="block h-1 w-full rounded-full transition-colors duration-500"
                style={{
                  background:
                    index <= step
                      ? "oklch(var(--cosmos-cyan))"
                      : "oklch(var(--cosmos-border))",
                }}
              />
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          data-ocid="dao_preview.sequence.back_button"
          className="cosmos-focus inline-flex min-h-[44px] items-center justify-center rounded-full px-4 text-sm font-medium text-[oklch(var(--cosmos-muted))] transition-colors hover:text-[oklch(var(--cosmos-foreground))] disabled:opacity-40"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => (isLast ? onComplete() : setStep(step + 1))}
          data-ocid="dao_preview.sequence.next_button"
          className="cosmos-cta cosmos-focus w-full sm:w-auto"
        >
          {isLast ? "Reveal Your Nation" : "Next"}
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
