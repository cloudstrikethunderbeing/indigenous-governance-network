import { Check } from "lucide-react";

import { launcherSteps } from "@/components/os/launcher/launcherTypes";

/**
 * The launcher's five-step progress rail. Each step shows its number, label and
 * a completed check. The current step is highlighted; completed steps are
 * marked so a visitor always knows where they are in the flow.
 */
export default function LauncherStepRail({
  currentStep,
  onSelectStep,
}: {
  currentStep: number;
  onSelectStep: (stepNumber: number) => void;
}) {
  return (
    <nav
      data-ocid="os.launcher.step_rail"
      aria-label="Launcher steps"
      className="gov-step-rail w-full"
    >
      <ol className="flex w-full max-w-full gap-2 pb-1 md:grid md:grid-cols-6 md:gap-3 md:overflow-visible">
        {launcherSteps.map((step) => {
          const isCurrent = step.number === currentStep;
          const isComplete = step.number < currentStep;
          return (
            <li key={step.id} className="min-w-[8.5rem] flex-1 md:min-w-0">
              <button
                type="button"
                data-ocid={`os.launcher.step.${step.number}`}
                aria-current={isCurrent ? "step" : undefined}
                onClick={() => onSelectStep(step.number)}
                className={`flex min-h-[44px] w-full items-center gap-2 rounded-lg border px-3 py-2 text-left transition-smooth ${
                  isCurrent
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold ${
                    isCurrent
                      ? "bg-primary text-primary-foreground"
                      : isComplete
                        ? "bg-success text-success-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isComplete ? <Check className="size-3.5" /> : step.number}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-foreground">
                    {step.label}
                  </span>
                  <span className="block truncate text-[0.65rem] text-muted-foreground">
                    Step {step.number} of {launcherSteps.length}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
