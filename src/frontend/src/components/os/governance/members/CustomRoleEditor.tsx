import { Loader2, Plus, Save, X } from "lucide-react";
import { useEffect, useState } from "react";

import type { GovernanceCapability, GovernanceRole } from "@/backend";
import {
  capabilityDescriptions,
  capabilityLabels,
  capabilityOrder,
} from "@/components/os/governance/members/membersCopy";

/**
 * The custom-role editor. It creates a new role or edits the permissions of an
 * existing custom role. Only the platform's own permissions can be chosen, so a
 * custom role can never exceed what the organization's system already allows.
 */
export default function CustomRoleEditor({
  editingRole,
  isSaving,
  error,
  onSave,
  onCancel,
}: {
  /** The custom role being edited, or null when creating a new one. */
  editingRole: GovernanceRole | null;
  isSaving: boolean;
  error: string | null;
  onSave: (input: {
    roleName: string;
    description: string;
    capabilities: GovernanceCapability[];
  }) => void;
  onCancel: () => void;
}) {
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [capabilities, setCapabilities] = useState<GovernanceCapability[]>([]);

  // Seed the draft once when the editor opens for an existing role.
  useEffect(() => {
    if (editingRole) {
      setRoleName(editingRole.roleName);
      setDescription(editingRole.description);
      setCapabilities(editingRole.capabilities);
    } else {
      setRoleName("");
      setDescription("");
      setCapabilities([]);
    }
  }, [editingRole]);

  function toggleCapability(capability: GovernanceCapability) {
    setCapabilities((current) =>
      current.includes(capability)
        ? current.filter((entry) => entry !== capability)
        : [...current, capability],
    );
  }

  const canSave =
    roleName.trim().length > 0 && capabilities.length > 0 && !isSaving;

  return (
    <section
      data-ocid="os.governance.members.role_editor"
      aria-label={editingRole ? "Edit custom role" : "Create a custom role"}
      className="shell-panel space-y-4 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-stamp text-accent">
            {editingRole ? "Edit custom role" : "New custom role"}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {editingRole
              ? "Change what this role is allowed to do."
              : "Give the role a name and choose what it may do."}
          </p>
        </div>
        <button
          type="button"
          data-ocid="os.governance.members.role_editor_close"
          onClick={onCancel}
          aria-label="Close the role editor"
          className="os-focus-ring inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>

      <div className="space-y-3">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">Role name</span>
          <input
            type="text"
            data-ocid="os.governance.members.role_name_input"
            value={roleName}
            onChange={(event) => setRoleName(event.target.value)}
            placeholder="e.g. Youth Council Lead"
            className="os-focus-ring min-h-[44px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">
            What is this role for?
          </span>
          <input
            type="text"
            data-ocid="os.governance.members.role_description_input"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="One short sentence"
            className="os-focus-ring min-h-[44px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
          />
        </label>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">
          What may this role do?
        </legend>
        <ul className="space-y-2">
          {capabilityOrder.map((capability) => {
            const checked = capabilities.includes(capability);
            return (
              <li key={capability}>
                <label
                  data-ocid={`os.governance.members.role_capability.${capability}`}
                  className={`flex min-h-[44px] cursor-pointer items-start gap-3 rounded-md border p-3 transition-smooth ${
                    checked
                      ? "border-primary/60 bg-primary/5"
                      : "border-border bg-muted/30 hover:border-accent/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCapability(capability)}
                    className="mt-0.5 size-5 shrink-0 accent-[oklch(var(--primary))]"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-foreground">
                      {capabilityLabels[capability]}
                    </span>
                    <span className="block text-xs leading-relaxed text-muted-foreground">
                      {capabilityDescriptions[capability]}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      {error ? (
        <p
          data-ocid="os.governance.members.role_editor_error"
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          data-ocid="os.governance.members.role_save_button"
          disabled={!canSave}
          onClick={() =>
            onSave({
              roleName: roleName.trim(),
              description: description.trim(),
              capabilities,
            })
          }
          className="os-focus-ring inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : editingRole ? (
            <Save className="size-4" aria-hidden="true" />
          ) : (
            <Plus className="size-4" aria-hidden="true" />
          )}
          {editingRole ? "Save permissions" : "Create role"}
        </button>
        <button
          type="button"
          data-ocid="os.governance.members.role_cancel_button"
          onClick={onCancel}
          className="os-focus-ring inline-flex min-h-[44px] items-center justify-center rounded-lg border border-input bg-card px-4 py-3 text-sm font-medium text-foreground transition-smooth hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </section>
  );
}
