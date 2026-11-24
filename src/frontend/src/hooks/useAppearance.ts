import { useCallback, useEffect, useState } from "react";

import type { ThemeKey } from "@/data/wallpapers";
import { defaultWallpaper } from "@/data/wallpapers";

/**
 * SOVEREIGN OS — appearance preferences.
 *
 * The selected wallpaper, theme and blur preference are personal display
 * preferences, deliberately kept separate from governance and identity
 * settings. They are stored locally per workspace so a visitor's choice
 * persists on this device without ever touching Nation governance data.
 */

/** The appearance preference for one workspace. */
export interface AppearancePreference {
  wallpaperKey: string;
  themeKey: ThemeKey;
  blurEnabled: boolean;
}

/** The default appearance: neutral wallpaper, system theme, no blur. */
export const defaultAppearance: AppearancePreference = {
  wallpaperKey: defaultWallpaper.key,
  themeKey: "system",
  blurEnabled: false,
};

/** The localStorage key for a workspace's appearance preference. */
function storageKey(workspaceId: string): string {
  return `sovereign.os.appearance.${workspaceId}`;
}

/** The window event broadcast when any appearance preference changes. */
const APPEARANCE_EVENT = "sovereign:appearance-change";

/** Read a stored preference, falling back to the default on any problem. */
function readPreference(workspaceId: string): AppearancePreference {
  if (typeof window === "undefined") return defaultAppearance;
  try {
    const raw = window.localStorage.getItem(storageKey(workspaceId));
    if (!raw) return defaultAppearance;
    const parsed = JSON.parse(raw) as Partial<AppearancePreference>;
    return {
      wallpaperKey: parsed.wallpaperKey ?? defaultAppearance.wallpaperKey,
      themeKey: parsed.themeKey ?? defaultAppearance.themeKey,
      blurEnabled: parsed.blurEnabled ?? defaultAppearance.blurEnabled,
    };
  } catch {
    return defaultAppearance;
  }
}

/** Apply the resolved theme to the document root. */
function applyTheme(themeKey: ThemeKey) {
  if (typeof document === "undefined") return;
  const prefersDark =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  const dark = themeKey === "dark" || (themeKey === "system" && !!prefersDark);
  document.documentElement.classList.toggle("dark", dark);
}

/**
 * The appearance preference for a workspace, with instant apply. Selecting a
 * wallpaper, theme or blur updates the preference and persists it locally.
 */
export function useAppearance(workspaceId: string) {
  const [preference, setPreference] = useState<AppearancePreference>(() =>
    readPreference(workspaceId),
  );

  // Re-read when the workspace changes so each workspace keeps its own choice.
  useEffect(() => {
    setPreference(readPreference(workspaceId));
  }, [workspaceId]);

  // Follow changes made elsewhere (e.g. the settings page) so a selection
  // applies instantly on every surface showing this workspace's wallpaper.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<{ workspaceId: string }>).detail;
      if (detail?.workspaceId === workspaceId) {
        setPreference(readPreference(workspaceId));
      }
    };
    window.addEventListener(APPEARANCE_EVENT, listener);
    return () => window.removeEventListener(APPEARANCE_EVENT, listener);
  }, [workspaceId]);

  // Apply the theme whenever it changes, and follow the system setting live.
  useEffect(() => {
    applyTheme(preference.themeKey);
    if (preference.themeKey !== "system") return;
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => applyTheme("system");
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [preference.themeKey]);

  const persist = useCallback(
    (next: AppearancePreference) => {
      setPreference(next);
      if (typeof window === "undefined") return;
      try {
        window.localStorage.setItem(
          storageKey(workspaceId),
          JSON.stringify(next),
        );
      } catch {
        // A storage failure never blocks the in-memory preference.
      }
      window.dispatchEvent(
        new CustomEvent(APPEARANCE_EVENT, { detail: { workspaceId } }),
      );
    },
    [workspaceId],
  );

  const setWallpaper = useCallback(
    (wallpaperKey: string) => persist({ ...preference, wallpaperKey }),
    [persist, preference],
  );

  const setTheme = useCallback(
    (themeKey: ThemeKey) => persist({ ...preference, themeKey }),
    [persist, preference],
  );

  const setBlur = useCallback(
    (blurEnabled: boolean) => persist({ ...preference, blurEnabled }),
    [persist, preference],
  );

  return { preference, setWallpaper, setTheme, setBlur };
}
