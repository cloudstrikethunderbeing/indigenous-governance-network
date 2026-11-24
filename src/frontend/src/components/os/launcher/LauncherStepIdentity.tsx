import type { LauncherDraft } from "@/components/os/launcher/launcherTypes";

/**
 * Step one — name the Nation or organization. Captures the name, a short
 * description and the region. Every field is a plain text input with a visible
 * label, so the step is usable without any blockchain knowledge.
 */
export default function LauncherStepIdentity({
  draft,
  onChange,
}: {
  draft: LauncherDraft;
  onChange: (patch: Partial<LauncherDraft>) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h3 className="font-display text-xl font-medium tracking-tight text-foreground">
          Name your Nation or organization
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          This is how your community will see itself across the workspace. You
          can change it later in Nation Settings.
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="launcher-name"
          className="block text-sm font-medium text-foreground"
        >
          Nation or organization name
        </label>
        <input
          id="launcher-name"
          data-ocid="os.launcher.name_input"
          type="text"
          value={draft.name}
          maxLength={80}
          onChange={(event) => onChange({ name: event.target.value })}
          placeholder="e.g. Cedar River Nation"
          className="min-h-[44px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground transition-smooth placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="launcher-description"
          className="block text-sm font-medium text-foreground"
        >
          Short description
        </label>
        <textarea
          id="launcher-description"
          data-ocid="os.launcher.description_input"
          value={draft.shortDescription}
          maxLength={240}
          rows={3}
          onChange={(event) =>
            onChange({ shortDescription: event.target.value })
          }
          placeholder="One or two sentences about what your community does."
          className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground transition-smooth placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        />
        <p className="text-xs text-muted-foreground">
          {draft.shortDescription.length}/240 characters
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="launcher-region"
          className="block text-sm font-medium text-foreground"
        >
          Region
        </label>
        <input
          id="launcher-region"
          data-ocid="os.launcher.region_input"
          type="text"
          value={draft.region}
          maxLength={80}
          onChange={(event) => onChange({ region: event.target.value })}
          placeholder="e.g. Pacific Northwest"
          className="min-h-[44px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground transition-smooth placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        />
        <p className="text-xs text-muted-foreground">
          Your region is used only to describe your Nation. It never selects a
          wallpaper or implies a cultural identity.
        </p>
      </div>
    </div>
  );
}
