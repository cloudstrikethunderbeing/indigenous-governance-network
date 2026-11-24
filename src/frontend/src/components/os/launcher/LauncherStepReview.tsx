import { Check, Rocket } from "lucide-react";

import type { GovernanceModelOption } from "@/backend";
import LauncherConstitutionPreview from "@/components/os/launcher/LauncherConstitutionPreview";
import {
  type LauncherDraft,
  membershipModelLabel,
  selectableApps,
  templateLabel,
  votingModelLabel,
} from "@/components/os/launcher/launcherTypes";
import { findWallpaper, themeOptions } from "@/data/wallpapers";

/** One labelled row in the review summary. */
function ReviewRow({
  label,
  value,
  marker,
}: {
  label: string;
  value: string;
  marker: string;
}) {
  return (
    <div
      data-ocid={marker}
      className="flex flex-col gap-0.5 border-b border-border/60 py-2.5 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
    >
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="min-w-0 text-sm font-medium text-foreground sm:text-right">
        {value}
      </dd>
    </div>
  );
}

/**
 * Step five — review every choice, confirm the governance rules, then launch.
 * The summary restates the name, description, region, governance, membership
 * and voting rules, selected apps and theme, so nothing is launched unseen. The
 * constitution preview shows the rules that will be saved, and the launch
 * action stays disabled until the user explicitly confirms them.
 */
export default function LauncherStepReview({
  draft,
  governanceOptions,
  isLaunching,
  launchError,
  onLaunch,
  onConfirmRules,
}: {
  draft: LauncherDraft;
  governanceOptions: GovernanceModelOption[];
  isLaunching: boolean;
  launchError: string | null;
  onLaunch: () => void;
  onConfirmRules: (confirmed: boolean) => void;
}) {
  const governanceLabel =
    governanceOptions.find(
      (option) => option.modelKey === draft.governanceModelKey,
    )?.labelText ?? draft.governanceModelKey;
  const themeLabel =
    themeOptions.find((option) => option.key === draft.themeKey)?.label ??
    draft.themeKey;
  const wallpaperLabel = findWallpaper(draft.wallpaperKey).label;
  const selectedApps = selectableApps.filter((app) =>
    draft.selectedAppKeys.includes(app.appKey),
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="font-display text-xl font-medium tracking-tight text-foreground">
          Review and launch your Nation OS
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Check every choice below. Launching creates a private Nation workspace
          that only you and the members you invite can see.
        </p>
      </div>

      <dl
        data-ocid="os.launcher.review_summary"
        className="rounded-lg border border-border bg-card px-4 py-2"
      >
        <ReviewRow
          label="Name"
          value={draft.name.trim() || "Not set"}
          marker="os.launcher.review.name"
        />
        <ReviewRow
          label="Description"
          value={draft.shortDescription.trim() || "Not set"}
          marker="os.launcher.review.description"
        />
        <ReviewRow
          label="Region"
          value={draft.region.trim() || "Not set"}
          marker="os.launcher.review.region"
        />
        <ReviewRow
          label="Template"
          value={templateLabel(draft.templateKey)}
          marker="os.launcher.review.template"
        />
        <ReviewRow
          label="Governance"
          value={governanceLabel || "Not set"}
          marker="os.launcher.review.governance"
        />
        <ReviewRow
          label="Membership"
          value={membershipModelLabel(draft.membershipModel)}
          marker="os.launcher.review.membership"
        />
        <ReviewRow
          label="Voting"
          value={votingModelLabel(draft.votingModel)}
          marker="os.launcher.review.voting"
        />
        <ReviewRow
          label="Quorum"
          value={`${draft.quorumPercent}%`}
          marker="os.launcher.review.quorum"
        />
        <ReviewRow
          label="Approval threshold"
          value={`${draft.approvalThresholdPercent}%`}
          marker="os.launcher.review.approval"
        />
        <ReviewRow
          label="Applications"
          value={
            selectedApps.length > 0
              ? selectedApps.map((app) => app.displayName).join(", ")
              : "None selected"
          }
          marker="os.launcher.review.apps"
        />
        <ReviewRow
          label="Theme"
          value={`${themeLabel} · ${wallpaperLabel}`}
          marker="os.launcher.review.theme"
        />
      </dl>

      <LauncherConstitutionPreview
        draft={draft}
        confirmed={draft.rulesConfirmed}
      />

      <label
        data-ocid="os.launcher.confirm_rules"
        className={`flex min-h-[44px] cursor-pointer items-start gap-3 rounded-lg border p-3 transition-smooth ${
          draft.rulesConfirmed
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/40 hover:border-primary/40"
        }`}
      >
        <input
          type="checkbox"
          checked={draft.rulesConfirmed}
          onChange={(event) => onConfirmRules(event.target.checked)}
          data-ocid="os.launcher.confirm_rules_checkbox"
          className="sr-only"
        />
        <span
          aria-hidden="true"
          className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border ${
            draft.rulesConfirmed
              ? "border-primary bg-primary text-primary-foreground"
              : "border-input bg-card"
          }`}
        >
          {draft.rulesConfirmed ? <Check className="size-3" /> : null}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-foreground">
            I confirm these governance rules
          </span>
          <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
            Your organization activates with these rules. You can change them
            later through your own approved governance process.
          </span>
        </span>
      </label>

      {launchError ? (
        <p
          role="alert"
          data-ocid="os.launcher.launch_error_state"
          className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {launchError}
        </p>
      ) : null}

      {!draft.rulesConfirmed ? (
        <p
          data-ocid="os.launcher.confirm_rules_hint"
          className="text-xs text-muted-foreground"
        >
          Confirm the governance rules above to enable launch.
        </p>
      ) : null}

      <button
        type="button"
        data-ocid="os.launcher.launch_button"
        disabled={isLaunching || !draft.rulesConfirmed}
        onClick={onLaunch}
        className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-smooth hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60 sm:w-auto"
      >
        <Rocket className="size-4" aria-hidden="true" />
        {isLaunching ? "Launching…" : "Launch your Nation OS"}
      </button>
    </div>
  );
}
