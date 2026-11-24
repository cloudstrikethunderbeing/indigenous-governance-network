import { ArrowLeft, ArrowRight, FlaskConical } from "lucide-react";
import { useMemo, useState } from "react";

import AppealsStep from "@/components/os/constitution-demo/AppealsStep";
import DemoCtaPanel from "@/components/os/constitution-demo/DemoCtaPanel";
import DemoStepRail from "@/components/os/constitution-demo/DemoStepRail";
import ExecutionAuthorizationStep from "@/components/os/constitution-demo/ExecutionAuthorizationStep";
import FoundingAuthorityStep from "@/components/os/constitution-demo/FoundingAuthorityStep";
import ParticipationCensusStep from "@/components/os/constitution-demo/ParticipationCensusStep";
import RevokedAuthorityStep from "@/components/os/constitution-demo/RevokedAuthorityStep";
import VotingEligibilityStep from "@/components/os/constitution-demo/VotingEligibilityStep";
import {
  type DemoStep,
  demoSteps,
  foundingAuthority,
} from "@/components/os/constitution-demo/demoScenarios";

/**
 * The guided "Build Your DAO Constitution" demonstration.
 *
 * A visitor walks through six fictional scenarios that show how governance
 * choices become permissions, voting and membership workflows: founding
 * authority setup and three-member approval, voting eligibility with inactivity
 * and reactivation, a passed proposal awaiting execution authorization, a
 * revoked authority being denied access, contradictory evidence entering the
 * appeals process, and a live Participation Census.
 *
 * Everything is local state on fictional data. No backend call is made, nothing
 * is persisted, and the demo is isolated from every real organization. It ends
 * with Deploy Your Own DAO as the single next step.
 */
export default function GuidedConstitutionDemo() {
  const [activeKey, setActiveKey] = useState<string>(demoSteps[0].key);
  const [visitedKeys, setVisitedKeys] = useState<string[]>([demoSteps[0].key]);

  // Per-step interaction state. Each is a local demonstration toggle only.
  const [approvedCount, setApprovedCount] = useState(
    foundingAuthority.approvals.filter((entry) => entry.approved).length,
  );
  const [reactivated, setReactivated] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [revokedAttempted, setRevokedAttempted] = useState(false);
  const [appealSubmitted, setAppealSubmitted] = useState(false);

  const activeIndex = useMemo(
    () => demoSteps.findIndex((step) => step.key === activeKey),
    [activeKey],
  );
  const activeStep = demoSteps[activeIndex] ?? demoSteps[0];
  const isLast = activeIndex === demoSteps.length - 1;

  function goTo(step: DemoStep) {
    setActiveKey(step.key);
    setVisitedKeys((current) =>
      current.includes(step.key) ? current : [...current, step.key],
    );
  }

  function goToIndex(index: number) {
    const step = demoSteps[index];
    if (step) goTo(step);
  }

  const progressPercent = Math.round(
    ((activeIndex + 1) / demoSteps.length) * 100,
  );

  return (
    <div className="space-y-5">
      <header className="space-y-3">
        <p className="text-stamp text-accent">Build Your DAO Constitution</p>
        <h2 className="font-display text-2xl font-medium tracking-tight text-foreground md:text-3xl">
          See how your rules would work
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Walk through six short examples. Each one shows how a choice you make
          becomes a permission, a vote or a membership rule. You can change
          every rule later through your own governance process.
        </p>
        <div className="rule-accent" />
      </header>

      <p
        data-ocid="constitution_demo.disclosure"
        role="note"
        className="flex items-start gap-2 rounded-md border border-dashed border-accent bg-accent/10 px-3 py-2 text-xs font-medium text-accent-foreground"
      >
        <FlaskConical className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        Demonstration only — every member, decision and figure here is
        fictional. Nothing is saved and no real organization is affected.
      </p>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-stamp text-muted-foreground">
            Step {activeIndex + 1} of {demoSteps.length}
          </p>
          <span className="text-tabular text-xs font-semibold text-foreground">
            {progressPercent}%
          </span>
        </div>
        <div className="gov-progress-track" aria-hidden="true">
          <div
            className="gov-progress-fill-alt"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
        <DemoStepRail
          activeKey={activeKey}
          visitedKeys={visitedKeys}
          onSelect={goTo}
        />

        <div
          data-ocid={`constitution_demo.step_panel.${activeStep.key}`}
          className="min-w-0 animate-fade-up"
        >
          {activeStep.key === "founding" ? (
            <FoundingAuthorityStep
              approvedCount={approvedCount}
              onApprove={() =>
                setApprovedCount((count) =>
                  Math.min(count + 1, foundingAuthority.approvals.length),
                )
              }
            />
          ) : activeStep.key === "voting" ? (
            <VotingEligibilityStep
              reactivated={reactivated}
              onReactivate={() => setReactivated(true)}
            />
          ) : activeStep.key === "execution" ? (
            <ExecutionAuthorizationStep
              authorized={authorized}
              onAuthorize={() => setAuthorized(true)}
            />
          ) : activeStep.key === "revoked" ? (
            <RevokedAuthorityStep
              attempted={revokedAttempted}
              onAttempt={() => setRevokedAttempted(true)}
            />
          ) : activeStep.key === "appeals" ? (
            <AppealsStep
              submitted={appealSubmitted}
              onSubmit={() => setAppealSubmitted(true)}
            />
          ) : (
            <ParticipationCensusStep />
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
            <button
              type="button"
              data-ocid="constitution_demo.prev_button"
              onClick={() => goToIndex(activeIndex - 1)}
              disabled={activeIndex === 0}
              className="os-focus-ring inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-border px-5 py-3 text-sm font-medium text-foreground transition-smooth hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back
            </button>
            {isLast ? (
              <span className="text-sm text-muted-foreground">
                You have reached the end of the demonstration.
              </span>
            ) : (
              <button
                type="button"
                data-ocid="constitution_demo.next_button"
                onClick={() => goToIndex(activeIndex + 1)}
                className="os-focus-ring inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90"
              >
                Next step
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>

      <DemoCtaPanel />
    </div>
  );
}
