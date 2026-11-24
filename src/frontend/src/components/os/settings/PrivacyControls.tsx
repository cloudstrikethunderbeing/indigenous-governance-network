import type { PrivacySettings } from "@/backend";
import { privacyAreas } from "@/components/os/settings/settingsCopy";
import { Switch } from "@/components/ui/switch";

/**
 * The privacy controls: one switch per content area deciding whether other
 * Nations may read it. Everything is private by default, and each row states
 * plainly what sharing that area reveals.
 */
export default function PrivacyControls({
  settings,
  onToggle,
  disabled,
}: {
  settings: PrivacySettings;
  onToggle: (key: keyof PrivacySettings, visible: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <ul data-ocid="os.settings.privacy_list" className="space-y-0">
      {privacyAreas.map((area) => {
        const visible = settings[area.key];
        return (
          <li
            key={area.key}
            data-ocid={`os.settings.privacy.${area.key}`}
            className="ledger-row flex min-h-[44px] items-center justify-between gap-4 py-3"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-foreground">
                {area.label}
              </span>
              <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                {area.description}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <span
                className={`text-stamp ${visible ? "text-success" : "text-muted-foreground"}`}
              >
                {visible ? "Shared" : "Private"}
              </span>
              <Switch
                checked={visible}
                disabled={disabled}
                onCheckedChange={(next) => onToggle(area.key, next)}
                data-ocid={`os.settings.privacy_toggle.${area.key}`}
                aria-label={`Share ${area.label} with other Nations`}
              />
            </span>
          </li>
        );
      })}
    </ul>
  );
}
