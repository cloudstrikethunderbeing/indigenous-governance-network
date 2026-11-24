import { CheckCircle2, Info, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";

import type { PrivacySettings, RolePermissionEntry } from "@/backend";
import OsAppPage from "@/components/os/OsAppPage";
import { useSampleNationId } from "@/components/os/files/useSampleNationId";
import AppearanceSettings from "@/components/os/settings/AppearanceSettings";
import GovernanceModelPicker from "@/components/os/settings/GovernanceModelPicker";
import PrivacyControls from "@/components/os/settings/PrivacyControls";
import RolePermissionMatrix from "@/components/os/settings/RolePermissionMatrix";
import { Button } from "@/components/ui/button";
import {
  sampleGovernanceModels,
  sampleNation,
  samplePrivacySettings,
  sampleRolePermissions,
} from "@/data/sampleNation";
import { useAppearance } from "@/hooks/useAppearance";
import {
  useGovernanceModelOptions,
  usePrivacySettings,
  useRolePermissions,
  useSavePrivacySettings,
  useSaveRolePermissions,
} from "@/hooks/useSovereign";

/**
 * The Nation Settings app: choose the governance model, edit the
 * roles-and-permissions matrix, and decide which workspace content other
 * Nations may read. Every change is sample-only and never affects another
 * Nation.
 */
export default function NationSettingsPage() {
  // The sample Nation id is a backend-owned sentinel, so it is resolved from
  // the backend rather than assumed, keeping the app and the canister aligned.
  const sampleNationId = useSampleNationId();

  const governanceQuery = useGovernanceModelOptions();
  const rolesQuery = useRolePermissions(sampleNationId);
  const privacyQuery = usePrivacySettings(sampleNationId);

  const saveRoles = useSaveRolePermissions();
  const savePrivacy = useSavePrivacySettings();
  const appearance = useAppearance(sampleNationId.toString());

  const [modelKey, setModelKey] = useState<string | null>(null);
  const [roles, setRoles] = useState<RolePermissionEntry[]>([]);
  const [privacy, setPrivacy] = useState<PrivacySettings | null>(null);
  const [rolesSeeded, setRolesSeeded] = useState(false);
  const [privacySeeded, setPrivacySeeded] = useState(false);
  const [rolesSaved, setRolesSaved] = useState(false);
  const [privacySaved, setPrivacySaved] = useState(false);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [privacyError, setPrivacyError] = useState<string | null>(null);

  // Seed the editable drafts once from the backend, falling back to the
  // clearly-labelled sample data. A later refetch never overwrites an edit.
  useEffect(() => {
    if (rolesSeeded) return;
    if (rolesQuery.data && rolesQuery.data.length > 0) {
      setRoles(rolesQuery.data);
      setRolesSeeded(true);
    } else if (rolesQuery.isSuccess) {
      setRoles(sampleRolePermissions);
      setRolesSeeded(true);
    }
  }, [rolesQuery.data, rolesQuery.isSuccess, rolesSeeded]);

  useEffect(() => {
    if (privacySeeded) return;
    if (privacyQuery.data) {
      setPrivacy(privacyQuery.data);
      setPrivacySeeded(true);
    } else if (privacyQuery.isSuccess) {
      setPrivacy({
        ...samplePrivacySettings,
        nation: sampleNationId,
        timestamp: 0n,
      });
      setPrivacySeeded(true);
    }
  }, [
    privacyQuery.data,
    privacyQuery.isSuccess,
    privacySeeded,
    sampleNationId,
  ]);

  const governanceOptions =
    governanceQuery.data && governanceQuery.data.length > 0
      ? governanceQuery.data
      : sampleGovernanceModels;

  const currentModelKey =
    modelKey ??
    sampleGovernanceModels.find(
      (model) => model.labelText === sampleNation.governanceModel,
    )?.modelKey ??
    null;

  function toggleRole(roleLabel: string, capability: string, allowed: boolean) {
    setRolesSaved(false);
    setRolesError(null);
    setRoles((current) =>
      current.map((entry) =>
        entry.roleLabel === roleLabel && entry.capability === capability
          ? { ...entry, allowed }
          : entry,
      ),
    );
  }

  function togglePrivacy(key: keyof PrivacySettings, visible: boolean) {
    setPrivacySaved(false);
    setPrivacyError(null);
    setPrivacy((current) =>
      current ? { ...current, [key]: visible } : current,
    );
  }

  function handleSaveRoles() {
    setRolesSaved(false);
    setRolesError(null);
    saveRoles.mutate(
      { nation: sampleNationId, entries: roles },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "ok") {
            setRolesSaved(true);
          } else {
            setRolesError(
              "This sample workspace is read-only for visitors, so the change was not stored.",
            );
          }
        },
        onError: () => {
          setRolesError("The change could not be saved. Please try again.");
        },
      },
    );
  }

  function handleSavePrivacy() {
    if (!privacy) return;
    setPrivacySaved(false);
    setPrivacyError(null);
    savePrivacy.mutate(privacy, {
      onSuccess: (result) => {
        if (result.__kind__ === "ok") {
          setPrivacySaved(true);
        } else {
          setPrivacyError(
            "This sample workspace is read-only for visitors, so the change was not stored.",
          );
        }
      },
      onError: () => {
        setPrivacyError("The change could not be saved. Please try again.");
      },
    });
  }

  return (
    <OsAppPage appKey="settings">
      <div className="space-y-6">
        <header className="space-y-2">
          <p className="text-stamp text-accent">Nation settings</p>
          <h2 className="font-display text-2xl font-medium tracking-tight text-foreground">
            Governance, roles and privacy
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            How the Nation makes decisions, who may do what, and which content
            other Nations may read.
          </p>
          <div className="rule-accent" />
        </header>

        <p
          data-ocid="os.settings.sample_only_notice"
          role="note"
          className="flex items-start gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground"
        >
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            These settings belong to the simulated sample Nation. Changes here
            are sample-only and never affect another Nation.
          </span>
        </p>

        {/* Governance model */}
        <section
          data-ocid="os.settings.governance_section"
          aria-label="Governance model"
          className="shell-panel space-y-3 p-4"
        >
          <div className="space-y-1">
            <h3 className="font-display text-lg font-medium text-foreground">
              Governance model
            </h3>
            <p className="text-sm text-muted-foreground">
              How this Nation makes its decisions. Choose the model that fits
              the community.
            </p>
          </div>
          <GovernanceModelPicker
            options={governanceOptions}
            selectedKey={currentModelKey}
            onSelect={setModelKey}
          />
          <p className="text-xs text-muted-foreground">
            Current model:{" "}
            <span className="font-medium text-foreground">
              {sampleNation.governanceModel}
            </span>
          </p>
        </section>

        {/* Roles and permissions */}
        <section
          data-ocid="os.settings.roles_section"
          aria-label="Roles and permissions"
          className="shell-panel space-y-3 p-4"
        >
          <div className="space-y-1">
            <h3 className="font-display text-lg font-medium text-foreground">
              Roles and permissions
            </h3>
            <p className="text-sm text-muted-foreground">
              Who can do what in this workspace. Turn a capability on or off for
              each role, then save.
            </p>
          </div>

          {rolesQuery.isLoading ? (
            <p
              data-ocid="os.settings.roles_loading"
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Loading the roles matrix…
            </p>
          ) : (
            <RolePermissionMatrix
              entries={roles}
              onToggle={toggleRole}
              disabled={saveRoles.isPending}
            />
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={handleSaveRoles}
              disabled={saveRoles.isPending || roles.length === 0}
              data-ocid="os.settings.save_roles_button"
              className="min-h-[44px]"
            >
              {saveRoles.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="size-4" aria-hidden="true" />
              )}
              Save roles
            </Button>
            {rolesSaved ? (
              <output
                data-ocid="os.settings.roles_success"
                className="flex items-center gap-1.5 text-sm font-medium text-success"
              >
                <CheckCircle2 className="size-4" aria-hidden="true" />
                Roles saved
              </output>
            ) : null}
            {rolesError ? (
              <span
                data-ocid="os.settings.roles_error"
                role="alert"
                className="text-sm text-destructive"
              >
                {rolesError}
              </span>
            ) : null}
          </div>
        </section>

        {/* Privacy */}
        <section
          data-ocid="os.settings.privacy_section"
          aria-label="Privacy settings"
          className="shell-panel space-y-3 p-4"
        >
          <div className="space-y-1">
            <h3 className="font-display text-lg font-medium text-foreground">
              Visible to other Nations
            </h3>
            <p className="text-sm text-muted-foreground">
              Choose which workspace content other Nations may read. Everything
              stays private by default.
            </p>
          </div>

          {privacyQuery.isLoading || !privacy ? (
            <p
              data-ocid="os.settings.privacy_loading"
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Loading privacy settings…
            </p>
          ) : (
            <PrivacyControls
              settings={privacy}
              onToggle={togglePrivacy}
              disabled={savePrivacy.isPending}
            />
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={handleSavePrivacy}
              disabled={savePrivacy.isPending || !privacy}
              data-ocid="os.settings.save_privacy_button"
              className="min-h-[44px]"
            >
              {savePrivacy.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="size-4" aria-hidden="true" />
              )}
              Save privacy
            </Button>
            {privacySaved ? (
              <output
                data-ocid="os.settings.privacy_success"
                className="flex items-center gap-1.5 text-sm font-medium text-success"
              >
                <CheckCircle2 className="size-4" aria-hidden="true" />
                Privacy saved
              </output>
            ) : null}
            {privacyError ? (
              <span
                data-ocid="os.settings.privacy_error"
                role="alert"
                className="text-sm text-destructive"
              >
                {privacyError}
              </span>
            ) : null}
          </div>
        </section>

        {/* Appearance — wallpapers and theme, kept separate from governance */}
        <section
          data-ocid="os.settings.appearance_section"
          aria-label="Appearance"
          className="shell-panel space-y-3 p-4"
        >
          <div className="space-y-1">
            <h3 className="font-display text-lg font-medium text-foreground">
              Appearance
            </h3>
            <p className="text-sm text-muted-foreground">
              Personal display preferences for this workspace. Wallpapers and
              themes are kept separate from governance and identity settings.
            </p>
          </div>
          <AppearanceSettings
            wallpaperKey={appearance.preference.wallpaperKey}
            themeKey={appearance.preference.themeKey}
            blurEnabled={appearance.preference.blurEnabled}
            onSelectWallpaper={appearance.setWallpaper}
            onSelectTheme={appearance.setTheme}
            onToggleBlur={appearance.setBlur}
          />
        </section>
      </div>
    </OsAppPage>
  );
}
