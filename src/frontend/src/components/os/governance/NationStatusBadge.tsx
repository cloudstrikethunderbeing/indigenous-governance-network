import {
  Archive,
  CheckCircle2,
  Clock,
  Gavel,
  PauseCircle,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import { type FoundingSetupStatus, NationLifecycleState } from "@/backend";

/**
 * The activation state of a Nation, shown wherever its status appears. A Nation
 * in Pending Activation is visibly distinct from an Active Nation: the label,
 * the icon and the colour all differ, so the state never relies on colour alone.
 */
export type NationActivationState = "active" | "pending";

/** Resolve a Nation's activation state from its founding setup status. */
export function activationStateFromSetup(
  status: FoundingSetupStatus | null | undefined,
): NationActivationState {
  return status === "activated" ? "active" : "pending";
}

/**
 * The seven lifecycle states a Nation can be in, each with a plain-language
 * label and a one-sentence explanation a non-expert can follow. The keys are
 * the backend's `NationLifecycleState` values, so the badge always reflects the
 * state the backend enforces.
 */
export interface LifecycleStateMeta {
  label: string;
  /** One plain-language sentence explaining what this state means. */
  explanation: string;
  icon: typeof CheckCircle2;
  className: string;
}

export const LIFECYCLE_STATE_META: Record<
  NationLifecycleState,
  LifecycleStateMeta
> = {
  [NationLifecycleState.draft]: {
    label: "Draft",
    explanation:
      "This Nation is still being set up and has not been activated yet.",
    icon: Clock,
    className: "border-muted-foreground/40 bg-muted/40 text-muted-foreground",
  },
  [NationLifecycleState.pendingActivation]: {
    label: "Pending Activation",
    explanation:
      "The founding authorities are still accepting their roles. The Nation becomes Active once all of them have.",
    icon: Clock,
    className: "border-warning/60 bg-warning/10 text-warning",
  },
  [NationLifecycleState.active]: {
    label: "Active",
    explanation: "The Nation is fully running and its rules are in force.",
    icon: CheckCircle2,
    className: "border-success/50 bg-success/10 text-success",
  },
  [NationLifecycleState.restrictedGovernance]: {
    label: "Restricted Governance",
    explanation:
      "Too few authorities remain to reach a normal vote, so only limited decisions can be made until the seats are filled.",
    icon: ShieldAlert,
    className: "border-warning/60 bg-warning/10 text-warning",
  },
  [NationLifecycleState.temporarilySuspended]: {
    label: "Temporarily Suspended",
    explanation:
      "Normal operation is paused for a short, limited time while an emergency is reviewed.",
    icon: PauseCircle,
    className: "border-destructive/50 bg-destructive/10 text-destructive",
  },
  [NationLifecycleState.pendingDissolution]: {
    label: "Pending Dissolution",
    explanation:
      "The community has voted to close the Nation and is in the cooling-off period before it is archived.",
    icon: Gavel,
    className: "border-destructive/50 bg-destructive/10 text-destructive",
  },
  [NationLifecycleState.archived]: {
    label: "Archived",
    explanation: "The Nation has been closed and its record is kept for good.",
    icon: Archive,
    className: "border-muted-foreground/40 bg-muted/40 text-muted-foreground",
  },
};

const ACTIVATION_META: Record<NationActivationState, LifecycleStateMeta> = {
  active: LIFECYCLE_STATE_META[NationLifecycleState.active],
  pending: LIFECYCLE_STATE_META[NationLifecycleState.pendingActivation],
};

/**
 * A compact chip stating whether a Nation is Active or Pending Activation. The
 * visible label carries the state, so it reads without relying on colour.
 */
export default function NationStatusBadge({
  state,
  className,
}: {
  state: NationActivationState;
  className?: string;
}) {
  const meta = ACTIVATION_META[state];
  const Icon = meta.icon;
  return (
    <span
      data-ocid={`os.governance.nation_status.${state}`}
      className={`text-stamp inline-flex shrink-0 items-center gap-1.5 rounded-sm border px-2 py-1 ${meta.className} ${className ?? ""}`}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {meta.label}
    </span>
  );
}

/**
 * A chip for any of the seven lifecycle states, with its plain-language
 * explanation available to assistive technology and as a visible caption when
 * `showExplanation` is set. The visible label always carries the state, so it
 * never relies on colour alone.
 */
export function LifecycleStatusBadge({
  state,
  showExplanation = false,
  className,
}: {
  state: NationLifecycleState;
  showExplanation?: boolean;
  className?: string;
}) {
  const meta = LIFECYCLE_STATE_META[state];
  const Icon = meta.icon;
  return (
    <span className={`inline-flex flex-col gap-1 ${className ?? ""}`}>
      <span
        data-ocid={`os.governance.lifecycle_status.${state}`}
        className={`text-stamp inline-flex w-fit shrink-0 items-center gap-1.5 rounded-sm border px-2 py-1 ${meta.className}`}
      >
        <Icon className="size-3.5" aria-hidden="true" />
        {meta.label}
      </span>
      {showExplanation ? (
        <span className="text-sm leading-relaxed text-muted-foreground">
          {meta.explanation}
        </span>
      ) : (
        <span className="sr-only">{meta.explanation}</span>
      )}
    </span>
  );
}

/** The plain-language explanation for a lifecycle state. */
export function lifecycleExplanation(state: NationLifecycleState): string {
  return LIFECYCLE_STATE_META[state].explanation;
}

/** The plain-language label for a lifecycle state. */
export function lifecycleLabel(state: NationLifecycleState): string {
  return LIFECYCLE_STATE_META[state].label;
}

/** A shield glyph used by the Control Center header, kept for reuse. */
export const LifecycleShieldIcon = ShieldCheck;
