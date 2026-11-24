import { CheckCircle2, ShieldQuestion } from "lucide-react";
import { useState } from "react";

import type { NationId, SuccessionRecoveryPlan } from "@/backend";
import { formatDate } from "@/components/os/governance/activity/activityLabels";
import { useRatifySuccessionPlan } from "@/hooks/useGovernanceLifecycle";

/**
 * The succession and recovery plan: who stands in for each seat, the recovery
 * trustees and threshold, and whether the plan has been ratified. Ratifying is
 * a sensitive action, so it opens an explicit confirmation step.
 */
export default function SuccessionPlanPanel({
  nation,
  plan,
  isLoading,
  isError,
  onRetry,
}: {
  nation: NationId;
  plan: SuccessionRecoveryPlan | null;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  const ratify = useRatifySuccessionPlan();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <section
        data-ocid="os.governance.control_center.succession_loading"
        aria-busy="true"
        className="shell-panel h-32 animate-pulse bg-muted/40"
      />
    );
  }

  if (isError) {
    return (
      <section
        data-ocid="os.governance.control_center.succession_error"
        className="shell-panel space-y-3 p-5"
      >
        <p className="text-sm text-muted-foreground">
          The succession plan could not be loaded.
        </p>
        <button
          type="button"
          data-ocid="os.governance.control_center.succession_retry_button"
          onClick={onRetry}
          className="os-focus-ring inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-smooth hover:opacity-90"
        >
          Try again
        </button>
      </section>
    );
  }

  return (
    <section
      data-ocid="os.governance.control_center.succession_panel"
      className="shell-panel space-y-3 p-5"
    >
      <div className="flex items-center gap-2">
        <ShieldQuestion className="size-4 text-accent" aria-hidden="true" />
        <h3 className="font-display text-lg font-medium tracking-tight text-foreground">
          Succession &amp; recovery plan
        </h3>
      </div>

      {plan ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            {plan.ratified ? (
              <span
                data-ocid="os.governance.control_center.succession_ratified"
                className="text-stamp inline-flex items-center gap-1.5 rounded-sm border border-success/50 bg-success/10 px-2 py-1 text-success"
              >
                <CheckCircle2 className="size-3.5" aria-hidden="true" />
                Ratified
              </span>
            ) : (
              <span
                data-ocid="os.governance.control_center.succession_unratified"
                className="text-stamp inline-flex items-center gap-1.5 rounded-sm border border-warning/60 bg-warning/10 px-2 py-1 text-warning"
              >
                Not yet ratified
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {plan.ratifications.length} ratification
              {plan.ratifications.length === 1 ? "" : "s"} · updated{" "}
              {formatDate(plan.timestamp)}
            </span>
          </div>

          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-0.5">
              <dt className="text-stamp text-muted-foreground">
                Designated successors
              </dt>
              <dd className="text-sm text-foreground">
                {plan.designatedSuccessors.length}
              </dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-stamp text-muted-foreground">
                Alternate authorities
              </dt>
              <dd className="text-sm text-foreground">
                {plan.alternateAuthorities.length}
              </dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-stamp text-muted-foreground">
                Recovery trustees
              </dt>
              <dd className="text-sm text-foreground">
                {plan.recoveryTrustees.length}
              </dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-stamp text-muted-foreground">
                Recovery threshold
              </dt>
              <dd className="text-sm text-foreground">
                {plan.recoveryApprovalThreshold.toString()} approvals
              </dd>
            </div>
          </dl>

          {plan.identityRecoveryProcedure.trim().length > 0 ? (
            <div className="space-y-0.5">
              <p className="text-stamp text-muted-foreground">
                Identity recovery
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {plan.identityRecoveryProcedure}
              </p>
            </div>
          ) : null}

          {!plan.ratified ? (
            confirming ? (
              <div
                data-ocid="os.governance.control_center.succession_confirm"
                className="space-y-3 rounded-md border border-warning/50 bg-warning/10 p-3"
              >
                <p className="text-sm leading-relaxed text-foreground">
                  Ratifying makes this plan constitutionally binding. The
                  constitution requires the authorities to ratify the plan
                  before it can govern succession.
                </p>
                {error ? (
                  <p className="text-sm text-destructive">{error}</p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    data-ocid="os.governance.control_center.succession_confirm_button"
                    disabled={ratify.isPending}
                    onClick={() => {
                      setError(null);
                      ratify.mutate(nation, {
                        onSuccess: (result) => {
                          if (result.__kind__ === "ok") setConfirming(false);
                          else
                            setError(
                              "The plan could not be ratified. It may need more authority approvals.",
                            );
                        },
                        onError: () =>
                          setError("The plan could not be ratified."),
                      });
                    }}
                    className="os-focus-ring inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-smooth hover:opacity-90 disabled:opacity-50"
                  >
                    {ratify.isPending ? "Ratifying…" : "Ratify plan"}
                  </button>
                  <button
                    type="button"
                    data-ocid="os.governance.control_center.succession_cancel_button"
                    disabled={ratify.isPending}
                    onClick={() => setConfirming(false)}
                    className="os-focus-ring inline-flex min-h-[44px] items-center justify-center rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-smooth hover:opacity-90 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                data-ocid="os.governance.control_center.succession_ratify_button"
                onClick={() => setConfirming(true)}
                className="os-focus-ring inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-smooth hover:opacity-90"
              >
                Ratify the plan
              </button>
            )
          ) : null}
        </>
      ) : (
        <p
          data-ocid="os.governance.control_center.succession_empty_state"
          className="text-sm leading-relaxed text-muted-foreground"
        >
          No succession and recovery plan has been set for this Nation yet.
        </p>
      )}
    </section>
  );
}
