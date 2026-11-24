import { Check } from "lucide-react";

import {
  type LauncherDraft,
  selectableApps,
} from "@/components/os/launcher/launcherTypes";
import { themeOptions, wallpapers } from "@/data/wallpapers";

/**
 * Step four — select the applications and the visual theme. Apps are toggled
 * on or off; a preview app is labelled so a visitor knows it is not yet
 * working. The theme and wallpaper are personal display choices, kept separate
 * from governance and identity.
 */
export default function LauncherStepApps({
  draft,
  onChange,
}: {
  draft: LauncherDraft;
  onChange: (patch: Partial<LauncherDraft>) => void;
}) {
  function toggleApp(appKey: string) {
    const selected = draft.selectedAppKeys.includes(appKey);
    onChange({
      selectedAppKeys: selected
        ? draft.selectedAppKeys.filter((key) => key !== appKey)
        : [...draft.selectedAppKeys, appKey],
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="font-display text-xl font-medium tracking-tight text-foreground">
          Select your applications and theme
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Choose which apps appear in your Nation workspace, then pick how it
          looks. You can add or remove apps later.
        </p>
      </div>

      <fieldset data-ocid="os.launcher.apps_fieldset" className="space-y-2">
        <legend className="text-sm font-medium text-foreground">
          Applications
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {selectableApps.map((app) => {
            const isSelected = draft.selectedAppKeys.includes(app.appKey);
            return (
              <label
                key={app.appKey}
                data-ocid={`os.launcher.app.${app.appKey}`}
                className={`flex min-h-[44px] cursor-pointer items-start gap-3 rounded-lg border p-3 transition-smooth ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-muted/40 hover:border-primary/40"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleApp(app.appKey)}
                  data-ocid={`os.launcher.app_checkbox.${app.appKey}`}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-card"
                  }`}
                >
                  {isSelected ? <Check className="size-3" /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="block text-sm font-medium text-foreground">
                      {app.displayName}
                    </span>
                    {app.status === "preview" ? (
                      <span className="badge-stage-demo">Preview</span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                    {app.oneLineDescription}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset data-ocid="os.launcher.theme_fieldset" className="space-y-2">
        <legend className="text-sm font-medium text-foreground">Theme</legend>
        <div className="flex flex-wrap gap-2">
          {themeOptions.map((option) => {
            const isSelected = option.key === draft.themeKey;
            return (
              <button
                key={option.key}
                type="button"
                aria-pressed={isSelected}
                data-ocid={`os.launcher.theme.${option.key}`}
                onClick={() => onChange({ themeKey: option.key })}
                className={`theme-option os-focus-ring ${
                  isSelected ? "theme-option-selected" : ""
                }`}
              >
                {isSelected ? (
                  <Check className="size-4" aria-hidden="true" />
                ) : null}
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset
        data-ocid="os.launcher.wallpaper_fieldset"
        className="space-y-2"
      >
        <legend className="text-sm font-medium text-foreground">
          Wallpaper
        </legend>
        <p className="text-xs text-muted-foreground">
          Seven curated Canadian regional landscapes plus a neutral default.
          Choose any wallpaper — a region never implies a Nation's identity.
        </p>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {wallpapers.map((wallpaper) => {
            const isSelected = wallpaper.key === draft.wallpaperKey;
            return (
              <li key={wallpaper.key}>
                <button
                  type="button"
                  data-ocid={`os.launcher.wallpaper.${wallpaper.key}`}
                  aria-pressed={isSelected}
                  onClick={() => onChange({ wallpaperKey: wallpaper.key })}
                  className={`wallpaper-tile os-focus-ring block w-full ${
                    isSelected ? "wallpaper-tile-selected" : ""
                  }`}
                >
                  <img
                    src={wallpaper.src}
                    alt={`${wallpaper.label} wallpaper preview`}
                    loading="lazy"
                    className="wallpaper-tile-preview"
                  />
                  <span className="wallpaper-label">{wallpaper.label}</span>
                  {isSelected ? (
                    <span
                      aria-hidden="true"
                      className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground"
                    >
                      <Check className="size-3.5" />
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/40 p-3">
        <div className="min-w-0 space-y-0.5">
          <p className="text-sm font-medium text-foreground">
            Soften the wallpaper
          </p>
          <p className="text-xs text-muted-foreground">
            Add a subtle blur and dimming so icons and text stand out.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={draft.blurEnabled}
          data-ocid="os.launcher.blur_toggle"
          onClick={() => onChange({ blurEnabled: !draft.blurEnabled })}
          className={`os-focus-ring relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-smooth ${
            draft.blurEnabled
              ? "border-primary bg-primary"
              : "border-input bg-muted"
          }`}
        >
          <span className="sr-only">Soften the wallpaper</span>
          <span
            aria-hidden="true"
            className={`inline-block size-5 rounded-full bg-card shadow transition-transform ${
              draft.blurEnabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
