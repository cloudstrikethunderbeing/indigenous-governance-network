import { Check } from "lucide-react";

import type { GovernanceModelOption } from "@/backend";
import LauncherAdvancedGovernance from "@/components/os/launcher/LauncherAdvancedGovernance";
import LauncherConstitutionPreview from "@/components/os/launcher/LauncherConstitutionPreview";
import {
  type LauncherDraft,
  type LauncherTemplate,
  launcherTemplates,
} from "@/components/os/launcher/launcherTypes";

/**
 * Step two — choose how your community makes decisions. The step reads as a few
 * simple questions: start from an example template (the recommended one is
 * already chosen), then pick how decisions are made. Advanced settings stay
 * hidden until asked for, and the constitution preview shows the rules the
 * choices would produce before anything is saved.
 */
export default function LauncherStepGovernance({
  draft,
  options,
  isLoading,
  isError,
  onChange,
}: {
  draft: LauncherDraft;
  options: GovernanceModelOption[];
  isLoading: boolean;
  isError: boolean;
  onChange: (patch: Partial<LauncherDraft>) => void;
}) {
  /**
   * Choosing a template applies sensible defaults: it records the template and,
   * when no governance structure has been chosen yet, pre-selects the first
   * model the canister offers so a first-time user can continue immediately.
   */
  function chooseTemplate(template: LauncherTemplate) {
    const patch: Partial<LauncherDraft> = { templateKey: template.key };
    if (draft.governanceModelKey.length === 0 && options.length > 0) {
      patch.governanceModelKey = options[0].modelKey;
    }
    onChange(patch);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="font-display text-xl font-medium tracking-tight text-foreground">
          How should your community decide?
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Start from an example, then choose how decisions are made. Every
          template is an example — none of them assumes your
          organization&rsquo;s legal or traditional governance authority.
        </p>
      </div>

      <fieldset data-ocid="os.launcher.template_fieldset" className="space-y-2">
        <legend className="text-sm font-medium text-foreground">
          Start from an example
        </legend>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {launcherTemplates.map((template) => {
            const isSelected = template.key === draft.templateKey;
            return (
              <li key={template.key}>
                <button
                  type="button"
                  data-ocid={`os.launcher.template.${template.key}`}
                  aria-pressed={isSelected}
                  onClick={() => chooseTemplate(template)}
                  className={`gov-template-card os-focus-ring h-full ${
                    isSelected ? "gov-template-card-selected" : ""
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-display text-sm font-medium text-foreground">
                      {template.label}
                    </span>
                    <span className="flex items-center gap-1.5">
                      {template.recommended ? (
                        <span className="badge-stage-demo">Recommended</span>
                      ) : null}
                      <span className="gov-template-example-chip">Example</span>
                    </span>
                  </span>
                  <span className="text-xs leading-relaxed text-muted-foreground">
                    {template.description}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">
          How are decisions made?
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Pick the approach that fits how you already work. You can change it
          later.
        </p>

        {isLoading ? (
          <output
            data-ocid="os.launcher.governance_loading"
            className="block text-sm text-muted-foreground"
          >
            Loading governance models…
          </output>
        ) : null}

        {isError ? (
          <p
            role="alert"
            data-ocid="os.launcher.governance_error_state"
            className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            The governance models could not be loaded. Please try again.
          </p>
        ) : null}

        {!isLoading && !isError ? (
          <fieldset
            data-ocid="os.launcher.governance_fieldset"
            className="space-y-2"
          >
            <legend className="sr-only">Choose a governance model</legend>
            {options.map((option) => {
              const isSelected = option.modelKey === draft.governanceModelKey;
              return (
                <label
                  key={option.modelKey}
                  data-ocid={`os.launcher.governance.${option.modelKey}`}
                  className={`flex min-h-[44px] cursor-pointer items-start gap-3 rounded-lg border p-3 transition-smooth ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border bg-muted/40 hover:border-primary/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="launcher-governance-model"
                    value={option.modelKey}
                    checked={isSelected}
                    onChange={() =>
                      onChange({ governanceModelKey: option.modelKey })
                    }
                    data-ocid={`os.launcher.governance_radio.${option.modelKey}`}
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
                      {option.labelText}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                      {option.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </fieldset>
        ) : null}
      </div>

      <LauncherAdvancedGovernance
        open={draft.advancedOpen}
        onToggle={() => onChange({ advancedOpen: !draft.advancedOpen })}
      />

      <LauncherConstitutionPreview
        draft={draft}
        confirmed={draft.rulesConfirmed}
      />
    </div>
  );
}
