import { Check } from "lucide-react";

import {
  type DemoStep,
  demoSteps,
} from "@/components/os/constitution-demo/demoScenarios";

/**
 * The guided demo step rail. It mirrors the Governance four-section rail: a
 * horizontal, scroll-free row of large buttons on mobile and a vertical rail on
 * desktop. Each step is a self-contained fictional scenario; the rail shows how
 * far the visitor has walked through the demonstration.
 */
export default function DemoStepRail({
  activeKey,
  visitedKeys,
  onSelect,
}: {
  activeKey: string;
  visitedKeys: string[];
  onSelect: (step: DemoStep) => void;
}) {
  return (
    <nav
      data-ocid="constitution_demo.step_rail"
      aria-label="Guided demonstration steps"
      className="gov-section-rail gov-step-rail -mx-4 flex w-[calc(100%+2rem)] max-w-[calc(100%+2rem)] gap-2 px-4 py-2 lg:mx-0 lg:w-full lg:max-w-full lg:flex-col lg:gap-1.5 lg:overflow-visible lg:rounded-xl lg:border lg:border-border lg:px-2 lg:py-3"
    >
      {demoSteps.map((step, index) => {
        const isActive = step.key === activeKey;
        const isVisited = visitedKeys.includes(step.key);
        return (
          <button
            key={step.key}
            type="button"
            data-ocid={`constitution_demo.step.${step.key}`}
            aria-current={isActive ? "step" : undefined}
            onClick={() => onSelect(step)}
            className={`gov-section-tab os-focus-ring shrink-0 lg:w-full ${
              isActive ? "gov-section-tab-active" : ""
            }`}
          >
            <span
              aria-hidden="true"
              className={`flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                isVisited && !isActive
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-current"
              }`}
            >
              {isVisited && !isActive ? (
                <Check className="size-3.5" />
              ) : (
                index + 1
              )}
            </span>
            <span className="whitespace-nowrap lg:whitespace-normal">
              {step.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
