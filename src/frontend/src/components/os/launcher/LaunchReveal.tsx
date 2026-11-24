import {
  ArrowRight,
  Check,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from "lucide-react";

import { type NationId, NationLifecycleState } from "@/backend";
import { constitutionTemplateLabel } from "@/components/os/launcher/launcherTypes";
import { useFoundingStatus } from "@/hooks/useGovernanceEnforcement";
import { useNationLifecycle } from "@/hooks/useGovernanceLifecycle";

/** The number of distinct founding authorities a Nation needs to activate. */
const REQUIRED_AUTHORITIES = 3;

/**
 * The cinematic reveal shown the moment a Nation is created. It names the new
 * Nation, states the constitution template it was founded on and shows the
 * founding progress (1/3 after the creator accepts), then points to the one
 * next step: invite the other two founding authorities. It never claims the
 * Nation is active — activation only happens once all three accept.
 */
export default function LaunchReveal({
  nation,
  nationName,
  templateKey,
  onInvite,
  onOpenNation,
}: {
  nation: NationId;
  nationName: string;
  templateKey: string;
  onInvite: () => void;
  onOpenNation: () => void;
}) {
  const status = useFoundingStatus(nation);
  const lifecycle = useNationLifecycle(nation);

  const acceptedCount = Number(status.data?.accepted ?? 1n);
  const requiredCount = Number(status.data?.required ?? REQUIRED_AUTHORITIES);
  const activated =
    status.data?.activated === true ||
    lifecycle.data?.state === NationLifecycleState.active;
  const remaining = Math.max(requiredCount - acceptedCount, 0);

  return (
    <section
      data-ocid="os.launcher.reveal"
      className="shell-panel relative min-w-0 overflow-hidden p-5 md:p-8"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-accent/10 blur-3xl"
      />

      <div className="relative min-w-0 space-y-6">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <p className="flex items-center gap-2 text-stamp text-accent">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Nation created
            </p>
            <h2
              data-ocid="os.launcher.reveal.nation_name"
              className="animate-fade-up break-words font-display text-3xl font-medium tracking-tight text-foreground md:text-4xl"
            >
              {nationName}
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              Your Nation, its constitution and its founding setup are saved. It
              stays in Pending Activation until all three founding authorities
              accept.
            </p>
          </div>

          <div
            data-ocid="os.launcher.reveal.status"
            className={`flex shrink-0 items-center gap-2 self-start rounded-full border px-4 py-2 ${
              activated
                ? "border-success/40 bg-success/10 text-success"
                : "border-warning/40 bg-warning/10 text-warning"
            }`}
          >
            <ShieldCheck className="size-4" aria-hidden="true" />
            <span className="text-xs font-semibold">
              {activated ? "Active" : "Pending Activation"}
            </span>
          </div>
        </div>

        <dl className="grid min-w-0 gap-3 sm:grid-cols-2">
          <div className="min-w-0 rounded-lg border border-border bg-card p-3">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Constitution template
            </dt>
            <dd
              data-ocid="os.launcher.reveal.template"
              className="mt-1 truncate text-sm font-semibold text-foreground"
            >
              {constitutionTemplateLabel(templateKey)}
            </dd>
          </div>
          <div className="min-w-0 rounded-lg border border-border bg-card p-3">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Founding progress
            </dt>
            <dd
              data-ocid="os.launcher.reveal.progress"
              className="mt-1 font-mono text-sm font-semibold text-foreground"
            >
              {acceptedCount}/{requiredCount} accepted
            </dd>
          </div>
        </dl>

        <div
          aria-hidden="true"
          data-ocid="os.launcher.reveal.progress_bar"
          className="flex gap-1.5"
        >
          {Array.from(
            { length: requiredCount },
            (_, index) => `reveal-slot-${index}`,
          ).map((slot, index) => (
            <span
              key={slot}
              className={`h-1.5 flex-1 rounded-full ${
                index < acceptedCount ? "bg-success" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="flex min-w-0 items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
          <span
            aria-hidden="true"
            className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground"
          >
            <Check className="size-4" />
          </span>
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-semibold text-foreground">
              You are Founding Authority #1
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {activated
                ? "Every founding authority has accepted and your constitution is in force."
                : `Invite ${remaining === 1 ? "one more authority" : "the other two authorities"} below. Each accepts independently with Internet Identity.`}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            data-ocid="os.launcher.reveal.open_nation_button"
            onClick={onOpenNation}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-smooth hover:border-primary/50 hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Open your Nation
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
          {!activated ? (
            <button
              type="button"
              data-ocid="os.launcher.reveal.invite_button"
              onClick={onInvite}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <UserPlus className="size-4" aria-hidden="true" />
              Invite the other two authorities
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
