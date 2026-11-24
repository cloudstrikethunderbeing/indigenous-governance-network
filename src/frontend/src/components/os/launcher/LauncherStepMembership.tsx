import { Check } from "lucide-react";

import {
  type LauncherDraft,
  membershipModelOptions,
  votingModelOptions,
} from "@/components/os/launcher/launcherTypes";

/**
 * Step three — configure membership and voting permissions. Choose who may
 * join, how votes are decided, and the quorum and approval thresholds. Every
 * control is a plain choice with a visible label and a plain-language note.
 */
export default function LauncherStepMembership({
  draft,
  onChange,
}: {
  draft: LauncherDraft;
  onChange: (patch: Partial<LauncherDraft>) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="font-display text-xl font-medium tracking-tight text-foreground">
          Configure membership and voting
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Decide who belongs to your Nation and how a proposal is decided. You
          can refine these rules later in Nation Settings.
        </p>
      </div>

      <fieldset
        data-ocid="os.launcher.membership_fieldset"
        className="space-y-2"
      >
        <legend className="text-sm font-medium text-foreground">
          Membership model
        </legend>
        {membershipModelOptions.map((option) => {
          const isSelected = option.key === draft.membershipModel;
          return (
            <label
              key={option.key}
              data-ocid={`os.launcher.membership.${option.key}`}
              className={`flex min-h-[44px] cursor-pointer items-start gap-3 rounded-lg border p-3 transition-smooth ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-muted/40 hover:border-primary/40"
              }`}
            >
              <input
                type="radio"
                name="launcher-membership-model"
                value={option.key}
                checked={isSelected}
                onChange={() => onChange({ membershipModel: option.key })}
                data-ocid={`os.launcher.membership_radio.${option.key}`}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-card"
                }`}
              >
                {isSelected ? <Check className="size-3" /> : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground">
                  {option.label}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                  {option.description}
                </span>
              </span>
            </label>
          );
        })}
      </fieldset>

      <fieldset data-ocid="os.launcher.voting_fieldset" className="space-y-2">
        <legend className="text-sm font-medium text-foreground">
          Voting model
        </legend>
        {votingModelOptions.map((option) => {
          const isSelected = option.key === draft.votingModel;
          return (
            <label
              key={option.key}
              data-ocid={`os.launcher.voting.${option.key}`}
              className={`flex min-h-[44px] cursor-pointer items-start gap-3 rounded-lg border p-3 transition-smooth ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-muted/40 hover:border-primary/40"
              }`}
            >
              <input
                type="radio"
                name="launcher-voting-model"
                value={option.key}
                checked={isSelected}
                onChange={() => onChange({ votingModel: option.key })}
                data-ocid={`os.launcher.voting_radio.${option.key}`}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-card"
                }`}
              >
                {isSelected ? <Check className="size-3" /> : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground">
                  {option.label}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                  {option.description}
                </span>
              </span>
            </label>
          );
        })}
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="launcher-quorum"
            className="flex items-center justify-between text-sm font-medium text-foreground"
          >
            <span>Quorum</span>
            <span className="text-tabular text-muted-foreground">
              {draft.quorumPercent}%
            </span>
          </label>
          <input
            id="launcher-quorum"
            data-ocid="os.launcher.quorum_input"
            type="range"
            min={0}
            max={100}
            step={5}
            value={draft.quorumPercent}
            onChange={(event) =>
              onChange({ quorumPercent: Number(event.target.value) })
            }
            className="h-11 w-full accent-[oklch(var(--primary))]"
          />
          <p className="text-xs text-muted-foreground">
            The share of members who must take part for a vote to count.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="launcher-approval"
            className="flex items-center justify-between text-sm font-medium text-foreground"
          >
            <span>Approval threshold</span>
            <span className="text-tabular text-muted-foreground">
              {draft.approvalThresholdPercent}%
            </span>
          </label>
          <input
            id="launcher-approval"
            data-ocid="os.launcher.approval_input"
            type="range"
            min={0}
            max={100}
            step={5}
            value={draft.approvalThresholdPercent}
            onChange={(event) =>
              onChange({ approvalThresholdPercent: Number(event.target.value) })
            }
            className="h-11 w-full accent-[oklch(var(--primary))]"
          />
          <p className="text-xs text-muted-foreground">
            The share of votes in favour needed for a proposal to pass.
          </p>
        </div>
      </div>
    </div>
  );
}
