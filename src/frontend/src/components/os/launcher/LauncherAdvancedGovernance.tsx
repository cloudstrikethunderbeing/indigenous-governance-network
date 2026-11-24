import { ChevronDown } from "lucide-react";

import { advancedGovernanceSettings } from "@/components/os/launcher/launcherTypes";

/**
 * The advanced governance settings, hidden behind a Show advanced options
 * control until the user asks for them. Every setting carries a plain-language
 * explanation, so revealing them never turns the step into a form to fill in.
 * The values shown are the sensible defaults the recommended template applies.
 */
export default function LauncherAdvancedGovernance({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <section
      data-ocid="os.launcher.advanced_panel"
      className="space-y-3"
      aria-label="Advanced governance options"
    >
      <button
        type="button"
        data-ocid="os.launcher.advanced_toggle"
        aria-expanded={open}
        aria-controls="launcher-advanced-settings"
        onClick={onToggle}
        className="os-focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-smooth hover:border-primary/50 hover:bg-muted"
      >
        <ChevronDown
          className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
        {open ? "Hide advanced options" : "Show advanced options"}
      </button>

      {open ? (
        <div
          id="launcher-advanced-settings"
          data-ocid="os.launcher.advanced_settings"
          className="gov-advanced-panel space-y-3 p-4"
        >
          <p className="text-xs leading-relaxed text-muted-foreground">
            These are the defaults your template applies. You can change every
            one of them later through your own governance process.
          </p>
          <ul className="space-y-3">
            {advancedGovernanceSettings.map((setting) => (
              <li
                key={setting.key}
                data-ocid={`os.launcher.advanced.${setting.key}`}
                className="flex flex-col gap-0.5 border-b border-border/60 pb-3 last:border-b-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-medium text-foreground">
                    {setting.label}
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {setting.explanation}
                  </p>
                </div>
                <p className="text-tabular shrink-0 text-sm font-semibold text-accent">
                  {setting.value}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
