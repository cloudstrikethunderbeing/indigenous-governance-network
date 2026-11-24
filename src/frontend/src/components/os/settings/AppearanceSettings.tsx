import { Check, Eye, ImageOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { ThemeKey, Wallpaper } from "@/data/wallpapers";
import { findWallpaper, themeOptions, wallpapers } from "@/data/wallpapers";

/**
 * The Appearance settings: choose a wallpaper from the curated catalogue, pick
 * a Light, Dark or System theme, and toggle a subtle blur for the desktop
 * wallpaper. Wallpaper and theme are personal display preferences, kept
 * separate from governance and identity settings. Every wallpaper is a
 * geographic landscape — a region never implies a Nation's cultural identity.
 */
export default function AppearanceSettings({
  wallpaperKey,
  themeKey,
  blurEnabled,
  onSelectWallpaper,
  onSelectTheme,
  onToggleBlur,
}: {
  wallpaperKey: string;
  themeKey: ThemeKey;
  blurEnabled: boolean;
  onSelectWallpaper: (key: string) => void;
  onSelectTheme: (key: ThemeKey) => void;
  onToggleBlur: (enabled: boolean) => void;
}) {
  const [preview, setPreview] = useState<Wallpaper | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  // Move focus to the preview when it opens, and let Escape dismiss it.
  useEffect(() => {
    if (!preview) return;
    previewRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreview(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [preview]);

  return (
    <div className="space-y-6">
      {/* Wallpapers */}
      <section
        data-ocid="os.settings.wallpaper_section"
        aria-label="Wallpapers"
        className="space-y-3"
      >
        <div className="space-y-1">
          <h3 className="font-display text-lg font-medium text-foreground">
            Wallpapers
          </h3>
          <p className="text-sm text-muted-foreground">
            Seven curated Canadian regional landscapes plus a neutral default.
            Choose any wallpaper — a region never implies a Nation's identity.
          </p>
        </div>

        <ul
          data-ocid="os.settings.wallpaper_grid"
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        >
          {wallpapers.map((wallpaper) => {
            const isSelected = wallpaper.key === wallpaperKey;
            const isPreviewing = preview?.key === wallpaper.key;
            return (
              <li key={wallpaper.key} className="contents">
                <div className="flex flex-col">
                  <button
                    type="button"
                    data-ocid={`os.settings.wallpaper.${wallpaper.key}`}
                    aria-pressed={isSelected}
                    onClick={() => onSelectWallpaper(wallpaper.key)}
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
                  <button
                    type="button"
                    data-ocid={`os.settings.wallpaper_preview_button.${wallpaper.key}`}
                    aria-expanded={isPreviewing}
                    onClick={() =>
                      setPreview((current) =>
                        current?.key === wallpaper.key ? null : wallpaper,
                      )
                    }
                    className="os-focus-ring mt-1.5 inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-md border border-border bg-card px-2 text-xs font-medium text-foreground transition-smooth hover:border-primary/50"
                  >
                    <Eye className="size-3.5" aria-hidden="true" />
                    Preview
                  </button>
                </div>

                {isPreviewing ? (
                  <div
                    ref={previewRef}
                    tabIndex={-1}
                    data-ocid="os.settings.wallpaper_fullscreen"
                    aria-label={`${wallpaper.label} wallpaper preview`}
                    className="wallpaper-inline-preview col-span-full"
                  >
                    <div className="wallpaper-inline-frame">
                      <img
                        src={wallpaper.src}
                        alt={`${wallpaper.label} — ${wallpaper.description}`}
                        className="size-full object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-3 bg-[oklch(var(--wallpaper-label-bg-dark))] p-3 sm:p-4">
                        <div className="min-w-0">
                          <p className="font-display text-base font-medium text-[oklch(var(--wallpaper-label-fg-dark))] sm:text-lg">
                            {wallpaper.label}
                          </p>
                          <p className="text-xs text-[oklch(var(--wallpaper-label-fg-dark))] opacity-80">
                            {wallpaper.description}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            data-ocid="os.settings.wallpaper_fullscreen.apply_button"
                            onClick={() => {
                              onSelectWallpaper(wallpaper.key);
                              setPreview(null);
                            }}
                            className="os-focus-ring inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-smooth hover:opacity-90"
                          >
                            Apply wallpaper
                          </button>
                          <button
                            type="button"
                            data-ocid="os.settings.wallpaper_fullscreen.close_button"
                            onClick={() => setPreview(null)}
                            className="os-focus-ring inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-smooth hover:border-primary/50"
                          >
                            <ImageOff className="size-4" aria-hidden="true" />
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>

      {/* Theme */}
      <section
        data-ocid="os.settings.theme_section"
        aria-label="Theme"
        className="space-y-3"
      >
        <div className="space-y-1">
          <h3 className="font-display text-lg font-medium text-foreground">
            Theme
          </h3>
          <p className="text-sm text-muted-foreground">
            Icon labels and overlays stay readable on every wallpaper.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {themeOptions.map((option) => {
            const isSelected = option.key === themeKey;
            return (
              <button
                key={option.key}
                type="button"
                aria-pressed={isSelected}
                data-ocid={`os.settings.theme.${option.key}`}
                onClick={() => onSelectTheme(option.key)}
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
      </section>

      {/* Blur */}
      <section
        data-ocid="os.settings.blur_section"
        aria-label="Wallpaper blur"
        className="space-y-3"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <h3 className="font-display text-lg font-medium text-foreground">
              Soften the wallpaper
            </h3>
            <p className="text-sm text-muted-foreground">
              Add a subtle blur and dimming so icons and text stand out.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={blurEnabled}
            data-ocid="os.settings.blur_toggle"
            onClick={() => onToggleBlur(!blurEnabled)}
            className={`os-focus-ring relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-smooth ${
              blurEnabled
                ? "border-primary bg-primary"
                : "border-input bg-muted"
            }`}
          >
            <span className="sr-only">Soften the wallpaper</span>
            <span
              aria-hidden="true"
              className={`inline-block size-5 rounded-full bg-card shadow transition-transform ${
                blurEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </section>
    </div>
  );
}

/** Re-export the wallpaper lookup so settings pages share one resolver. */
export { findWallpaper };
