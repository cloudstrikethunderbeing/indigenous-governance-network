import { ArrowRight, Lock } from "lucide-react";

import { NationLifecycleState } from "@/backend";
import {
  LifecycleStatusBadge,
  lifecycleExplanation,
  lifecycleLabel,
} from "@/components/os/governance/NationStatusBadge";

/**
 * The lifecycle panel: the Nation's current state and the actions the
 * constitution permits in that state. Actions that are not permitted are shown
 * disabled with the reason, so nothing is hidden and nothing is a dead end.
 */
interface PermittedAction {
  key: string;
  label: string;
  description: string;
  /** Where the action is carried out, when it lives in another panel. */
  hint: string;
}

const ACTIONS_BY_STATE: Record<NationLifecycleState, PermittedAction[]> = {
  [NationLifecycleState.draft]: [
    {
      key: "cancel-draft",
      label: "Cancel this draft",
      description:
        "A draft that was never activated can be cancelled by its creator.",
      hint: "Available to the Nation's creator.",
    },
  ],
  [NationLifecycleState.pendingActivation]: [
    {
      key: "accept-appointment",
      label: "Accept a founding appointment",
      description:
        "Each founding authority accepts their own role to activate the Nation.",
      hint: "Use the Authorities panel above.",
    },
  ],
  [NationLifecycleState.active]: [
    {
      key: "amend",
      label: "Propose an amendment",
      description:
        "Change the rules through the constitution's own amendment process.",
      hint: "Use Our Rules in Governance.",
    },
    {
      key: "emergency",
      label: "Request an emergency suspension",
      description:
        "Two of three authorities may pause a narrow scope for a short time.",
      hint: "Use the Emergency procedures panel below.",
    },
    {
      key: "dissolve",
      label: "Propose dissolution",
      description:
        "Closing the Nation needs a 90% vote and a cooling-off period.",
      hint: "Use Decisions in Governance.",
    },
  ],
  [NationLifecycleState.restrictedGovernance]: [
    {
      key: "fill-seats",
      label: "Fill vacant authority seats",
      description: "Appoint successors so a normal vote can be reached again.",
      hint: "Use the Authorities panel above.",
    },
  ],
  [NationLifecycleState.temporarilySuspended]: [
    {
      key: "restore",
      label: "Restore normal operation",
      description:
        "End the emergency suspension once the issue has been reviewed.",
      hint: "Use the Emergency procedures panel below.",
    },
  ],
  [NationLifecycleState.pendingDissolution]: [
    {
      key: "archive",
      label: "Archive the Nation",
      description:
        "After the cooling-off period, the Nation's record is closed for good.",
      hint: "Use Decisions in Governance.",
    },
  ],
  [NationLifecycleState.archived]: [],
};

export default function LifecyclePanel({
  state,
  isLoading,
}: {
  state: NationLifecycleState | null;
  isLoading: boolean;
}) {
  const actions = state ? ACTIONS_BY_STATE[state] : [];

  return (
    <section
      data-ocid="os.governance.control_center.lifecycle_panel"
      className="shell-panel space-y-3 p-5"
    >
      <div className="space-y-1">
        <h3 className="font-display text-lg font-medium tracking-tight text-foreground">
          Lifecycle
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          What the Nation can do in its current state. The backend enforces
          every one of these rules.
        </p>
      </div>

      {isLoading ? (
        <p aria-busy="true" className="text-sm text-muted-foreground">
          Reading the Nation's state…
        </p>
      ) : state ? (
        <>
          <LifecycleStatusBadge state={state} showExplanation />
          {actions.length === 0 ? (
            <p
              data-ocid="os.governance.control_center.lifecycle_no_actions"
              className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground"
            >
              <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {state === NationLifecycleState.archived
                ? "This Nation is archived. Its record is kept for good and no further actions are possible."
                : `No actions are available while the Nation is ${lifecycleLabel(state).toLowerCase()}.`}
            </p>
          ) : (
            <ul className="space-y-2">
              {actions.map((action, index) => (
                <li
                  key={action.key}
                  data-ocid={`os.governance.control_center.lifecycle_action.${index + 1}`}
                  className="rounded-md border border-border bg-card p-3"
                >
                  <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <ArrowRight
                      className="size-4 text-accent"
                      aria-hidden="true"
                    />
                    {action.label}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {action.description}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {action.hint}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          {lifecycleExplanation(NationLifecycleState.pendingActivation)}
        </p>
      )}
    </section>
  );
}
