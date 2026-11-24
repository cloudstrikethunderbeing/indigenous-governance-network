/**
 * SOVEREIGN OS — wallpaper catalogue.
 *
 * Seven curated photographic Canadian regional landscape wallpapers plus a
 * neutral default. Every entry is a geographic landscape only: no sacred
 * imagery, Nation-specific artwork, crests or cultural symbols, and a region
 * never implies a Nation's cultural identity. The catalogue is static and
 * illustrative; the selected wallpaper is a personal preference kept separate
 * from governance and identity settings.
 */

/** The theme keys a Nation workspace may choose. */
export type ThemeKey = "light" | "dark" | "system";

/** One wallpaper in the catalogue. */
export interface Wallpaper {
  /** Stable key persisted with the Nation theme. */
  key: string;
  /** Human-readable name shown on the thumbnail and preview. */
  label: string;
  /** The Canadian region this landscape depicts, or "Neutral" for the default. */
  region: string;
  /** One-line description of the landscape. */
  description: string;
  /** Optimized full-size asset path. */
  src: string;
  /** Whether this is the neutral default wallpaper. */
  isDefault: boolean;
}

/**
 * The wallpaper catalogue, in display order: the neutral default first, then
 * the seven curated Canadian regional landscapes.
 */
export const wallpapers: Wallpaper[] = [
  {
    key: "neutral",
    label: "Neutral",
    region: "Neutral",
    description:
      "A calm paper ground with a faint engraved dot grid — the default.",
    src: "/assets/generated/wallpaper-neutral.dim_1600x1000.jpg",
    isDefault: true,
  },
  {
    key: "pacific-coast",
    label: "Pacific Coast",
    region: "Pacific Coast",
    description: "Misty coniferous shoreline where the forest meets the sea.",
    src: "/assets/generated/wallpaper-pacific-coast.dim_1600x1000.jpg",
    isDefault: false,
  },
  {
    key: "rocky-mountains",
    label: "Rocky Mountains",
    region: "Rocky Mountains",
    description: "Snow-capped peaks above a turquoise glacial lake.",
    src: "/assets/generated/wallpaper-rocky-mountains.dim_1600x1000.jpg",
    isDefault: false,
  },
  {
    key: "boreal-forest",
    label: "Boreal Forest",
    region: "Boreal Forest",
    description: "Dense evergreen forest beside a still northern lake.",
    src: "/assets/generated/wallpaper-boreal-forest.dim_1600x1000.jpg",
    isDefault: false,
  },
  {
    key: "prairies",
    label: "Prairies",
    region: "Prairies",
    description: "Open golden fields beneath a wide prairie sky.",
    src: "/assets/generated/wallpaper-prairies.dim_1600x1000.jpg",
    isDefault: false,
  },
  {
    key: "great-lakes",
    label: "Great Lakes",
    region: "Great Lakes",
    description: "Calm inland water among rocky islands and autumn forest.",
    src: "/assets/generated/wallpaper-great-lakes.dim_1600x1000.jpg",
    isDefault: false,
  },
  {
    key: "arctic",
    label: "Arctic",
    region: "Arctic",
    description: "Vast tundra and ice under soft polar light.",
    src: "/assets/generated/wallpaper-arctic.dim_1600x1000.jpg",
    isDefault: false,
  },
  {
    key: "eastern-woodlands",
    label: "Eastern Woodlands",
    region: "Eastern Woodlands",
    description: "Mixed maple and birch forest along a gentle river.",
    src: "/assets/generated/wallpaper-eastern-woodlands.dim_1600x1000.jpg",
    isDefault: false,
  },
];

/** The neutral default wallpaper. */
export const defaultWallpaper: Wallpaper =
  wallpapers.find((wallpaper) => wallpaper.isDefault) ?? wallpapers[0];

/** Look up a wallpaper by key, falling back to the neutral default. */
export function findWallpaper(key: string): Wallpaper {
  return (
    wallpapers.find((wallpaper) => wallpaper.key === key) ?? defaultWallpaper
  );
}

/** The theme options offered in Appearance settings. */
export interface ThemeOption {
  key: ThemeKey;
  label: string;
  description: string;
}

export const themeOptions: ThemeOption[] = [
  {
    key: "light",
    label: "Light",
    description: "Warm paper ground with deep ink text.",
  },
  {
    key: "dark",
    label: "Dark",
    description: "Ink ground with paper text for low-light use.",
  },
  {
    key: "system",
    label: "System",
    description: "Follow the device's light or dark setting.",
  },
];
