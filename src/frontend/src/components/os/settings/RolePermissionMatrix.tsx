import type { RolePermissionEntry } from "@/backend";
import {
  describeCapability,
  describeRole,
  labelSlug,
} from "@/components/os/settings/settingsCopy";
import { Switch } from "@/components/ui/switch";

/**
 * The roles-and-permissions matrix: who can do what, grouped by role. Each
 * capability has a switch so the sample Nation's matrix can be edited. A real
 * table is shown from the small breakpoint up; below it the same rows stack as
 * cards so nothing ever scrolls sideways on a phone.
 */
export default function RolePermissionMatrix({
  entries,
  onToggle,
  disabled,
}: {
  entries: RolePermissionEntry[];
  onToggle: (roleLabel: string, capability: string, allowed: boolean) => void;
  disabled?: boolean;
}) {
  const roles = groupByRole(entries);

  return (
    <div data-ocid="os.settings.role_matrix">
      {/* Table — small screens and up */}
      <div className="hidden sm:block">
        <table className="w-full table-fixed border-collapse text-sm">
          <caption className="sr-only">
            Who can do what in this Nation workspace
          </caption>
          <thead>
            <tr className="border-b border-border text-left">
              <th
                scope="col"
                className="w-1/3 py-2 pr-3 text-stamp text-muted-foreground"
              >
                Role
              </th>
              <th
                scope="col"
                className="w-1/2 py-2 pr-3 text-stamp text-muted-foreground"
              >
                Can do
              </th>
              <th
                scope="col"
                className="w-[17%] py-2 text-right text-stamp text-muted-foreground"
              >
                Allowed
              </th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) =>
              role.entries.map((entry, index) => (
                <tr
                  key={`${role.roleLabel}-${entry.capability}`}
                  data-ocid={`os.settings.role.${labelSlug(role.roleLabel)}.${labelSlug(entry.capability)}`}
                  className="border-b border-border/60 align-top"
                >
                  <td className="py-3 pr-3">
                    {index === 0 ? (
                      <span className="block font-medium text-foreground">
                        {role.roleLabel}
                      </span>
                    ) : (
                      <span className="sr-only">{role.roleLabel}</span>
                    )}
                  </td>
                  <td className="py-3 pr-3">
                    <span className="block text-foreground">
                      {entry.capability}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                      {describeCapability(entry.capability)}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <Switch
                      checked={entry.allowed}
                      disabled={disabled}
                      onCheckedChange={(next) =>
                        onToggle(role.roleLabel, entry.capability, next)
                      }
                      data-ocid={`os.settings.role_toggle.${labelSlug(role.roleLabel)}.${labelSlug(entry.capability)}`}
                      aria-label={`${entry.capability} for ${role.roleLabel}`}
                    />
                  </td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>

      {/* Stacked cards — phones */}
      <ul className="space-y-3 sm:hidden">
        {roles.map((role) => (
          <li
            key={role.roleLabel}
            data-ocid={`os.settings.role_card.${labelSlug(role.roleLabel)}`}
            className="rounded-md border border-border bg-muted/40 p-3"
          >
            <p className="text-sm font-medium text-foreground">
              {role.roleLabel}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {describeRole(role.roleLabel)}
            </p>
            <ul className="mt-3 space-y-2">
              {role.entries.map((entry) => (
                <li
                  key={entry.capability}
                  className="flex min-h-[44px] items-center justify-between gap-3"
                >
                  <span className="min-w-0 text-sm text-foreground">
                    {entry.capability}
                  </span>
                  <Switch
                    checked={entry.allowed}
                    disabled={disabled}
                    onCheckedChange={(next) =>
                      onToggle(role.roleLabel, entry.capability, next)
                    }
                    data-ocid={`os.settings.role_toggle_mobile.${labelSlug(role.roleLabel)}.${labelSlug(entry.capability)}`}
                    aria-label={`${entry.capability} for ${role.roleLabel}`}
                  />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface RoleGroup {
  roleLabel: string;
  entries: RolePermissionEntry[];
}

/** Group the flat matrix into one block per role, preserving first-seen order. */
function groupByRole(entries: RolePermissionEntry[]): RoleGroup[] {
  const groups: RoleGroup[] = [];
  for (const entry of entries) {
    const existing = groups.find((g) => g.roleLabel === entry.roleLabel);
    if (existing) {
      existing.entries.push(entry);
    } else {
      groups.push({ roleLabel: entry.roleLabel, entries: [entry] });
    }
  }
  return groups;
}
