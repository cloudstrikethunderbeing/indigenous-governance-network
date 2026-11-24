import { findWallpaper } from "@/data/wallpapers";
import { useAppearance } from "@/hooks/useAppearance";

/**
 * The workspace wallpaper layer. It renders the selected photographic
 * landscape (or the neutral default) behind the desktop, with an optional
 * subtle blur and dimming so icon labels and overlays stay readable. The
 * wallpaper is a personal display preference, kept separate from governance
 * and identity settings.
 */
export default function OsWallpaper({ workspaceId }: { workspaceId: string }) {
  const { preference } = useAppearance(workspaceId);
  const wallpaper = findWallpaper(preference.wallpaperKey);

  return (
    <div
      aria-hidden="true"
      data-ocid="os.wallpaper_layer"
      data-wallpaper={wallpaper.key}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div
        className={`os-wallpaper-layer ${
          preference.blurEnabled ? "os-wallpaper-blur" : ""
        }`}
        style={{ backgroundImage: `url(${wallpaper.src})` }}
      />
      <div className="os-wallpaper-scrim" />
      {preference.blurEnabled ? <div className="os-wallpaper-dim" /> : null}
    </div>
  );
}
