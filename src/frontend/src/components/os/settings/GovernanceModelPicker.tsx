import { Check } from "lucide-react";

import type { GovernanceModelOption } from "@/backend";
import { describeGovernanceModel } from "@/components/os/settings/settingsCopy";

/**
 * The governance model picker: one selectable card per available model, each
 * showing its plain-language description. The chosen model is highlighted and
 * marked with a check so the current choice is obvious at a glance.
 */
export default function GovernanceModelPicker({
  options,
  selectedKey,
  onSelect,
  disabled,
}: {
  options: GovernanceModelOption[];
  selectedKey: string | null;
  onSelect: (modelKey: string) => void;
  disabled?: boolean;
}) {
  return (
    <fieldset
      data-ocid="os.settings.governance_fieldset"
      className="space-y-2"
      disabled={disabled}
    >
      <legend className="sr-only">Choose a governance model</legend>
      {options.map((option) => {
        const isSelected = option.modelKey === selectedKey;
        return (
          <label
            key={option.modelKey}
            data-ocid={`os.settings.model.${option.modelKey}`}
            className={`flex min-h-[44px] cursor-pointer items-start gap-3 rounded-md border p-3 transition-smooth ${
              isSelected
                ? "border-primary bg-primary/5"
                : "border-border bg-muted/40 hover:border-primary/40"
            }`}
          >
            <input
              type="radio"
              name="governance-model"
              value={option.modelKey}
              checked={isSelected}
              onChange={() => onSelect(option.modelKey)}
              data-ocid={`os.settings.model_radio.${option.modelKey}`}
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
                {describeGovernanceModel(option.modelKey)}
              </span>
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
