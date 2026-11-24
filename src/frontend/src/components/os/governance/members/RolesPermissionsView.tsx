import { Check, Minus } from "lucide-react";

import type { GovernanceRole } from "@/backend";
import {
  builtInRoles,
  capabilityDescriptions,
  capabilityLabels,
  capabilityOrder,
  labelSlug,
} from "@/components/os/governance/members/membersCopy";

/**
 * The roles-and-permissions view: every role the organization has, and exactly
 * what each one can view, propose, approve, vote, modify and execute. The ten
 * built-in roles are always shown; any custom roles the organization has added
 * appear alongside them. A real table is shown from the small breakpoint up;
 * below it the same rows stack as cards so nothing scrolls sideways on a phone.
 */
export default function RolesPermissionsView({
  roles,
  onEditRole,
}: {
  roles: GovernanceRole[];
  onEditRole: (role: GovernanceRole) => void;
}) {
  const customRoles = roles.filter((role) => role.isCustom);

  return (
    <div className="space-y-5">
      <section
        data-ocid="os.governance.members.roles_matrix"
        aria-label="What each role can do"
        className="shell-panel space-y-3 p-4"
      >
        <div className="space-y-1">
          <p className="text-stamp text-accent">What each role can do</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            A tick means the role is allowed to do that. A dash means it is not.
          </p>
        </div>

        {/* Table — small screens and up */}
        <div className="hidden sm:block">
          <table className="w-full table-fixed border-collapse text-sm">
            <caption className="sr-only">
              What each role can view, propose, approve, vote, modify and
              execute
            </caption>
            <thead>
              <tr className="border-b border-border text-left">
                <th
                  scope="col"
                  className="w-[30%] py-2 pr-3 text-stamp text-muted-foreground"
                >
                  Role
                </th>
                {capabilityOrder.map((capability) => (
                  <th
                    key={capability}
                    scope="col"
                    className="py-2 text-center text-stamp text-muted-foreground"
                  >
                    {capabilityLabels[capability]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {builtInRoles.map((role) => (
                <tr
                  key={role.key}
                  data-ocid={`os.governance.members.role_row.${role.key}`}
                  className="border-b border-border/60 align-top"
                >
                  <th scope="row" className="py-3 pr-3 text-left font-normal">
                    <span className="block font-medium text-foreground">
                      {role.label}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                      {role.description}
                    </span>
                  </th>
                  {capabilityOrder.map((capability) => (
                    <td key={capability} className="py-3 text-center">
                      <CapabilityMark
                        allowed={role.capabilities.includes(capability)}
                        label={`${capabilityLabels[capability]} for ${role.label}`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Stacked cards — phones */}
        <ul className="space-y-3 sm:hidden">
          {builtInRoles.map((role) => (
            <li
              key={role.key}
              data-ocid={`os.governance.members.role_card.${role.key}`}
              className="rounded-md border border-border bg-muted/40 p-3"
            >
              <p className="text-sm font-medium text-foreground">
                {role.label}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {role.description}
              </p>
              <ul className="mt-3 space-y-1.5">
                {capabilityOrder.map((capability) => {
                  const allowed = role.capabilities.includes(capability);
                  return (
                    <li
                      key={capability}
                      className="flex items-start gap-2 text-sm"
                    >
                      <CapabilityMark
                        allowed={allowed}
                        label={`${capabilityLabels[capability]} for ${role.label}`}
                      />
                      <span className="min-w-0">
                        <span
                          className={
                            allowed
                              ? "font-medium text-foreground"
                              : "text-muted-foreground"
                          }
                        >
                          {capabilityLabels[capability]}
                        </span>
                        <span className="block text-xs leading-relaxed text-muted-foreground">
                          {capabilityDescriptions[capability]}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <section
        data-ocid="os.governance.members.custom_roles"
        aria-label="Custom roles"
        className="shell-panel space-y-3 p-4"
      >
        <div className="space-y-1">
          <p className="text-stamp text-accent">Custom roles</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Your organization can add its own roles. A custom role can only use
            the same permissions the platform already allows.
          </p>
        </div>

        {customRoles.length === 0 ? (
          <p
            data-ocid="os.governance.members.custom_roles_empty"
            className="rounded-md border border-border bg-muted/40 px-3 py-3 text-sm text-muted-foreground"
          >
            No custom roles yet. Add one below if your organization needs a role
            that is not in the list above.
          </p>
        ) : (
          <ul className="space-y-2">
            {customRoles.map((role, index) => (
              <li
                key={role.id.toString()}
                data-ocid={`os.governance.members.custom_role.${index + 1}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-muted/40 p-3"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">
                    {role.roleName}
                  </span>
                  <span className="block text-xs leading-relaxed text-muted-foreground">
                    {role.description || "A role defined by your organization."}
                  </span>
                  <span className="mt-1.5 flex flex-wrap gap-1.5">
                    {role.capabilities.map((capability) => (
                      <span
                        key={capability}
                        className="gov-role-chip"
                        data-ocid={`os.governance.members.custom_role_capability.${index + 1}.${labelSlug(capability)}`}
                      >
                        {capabilityLabels[capability]}
                      </span>
                    ))}
                  </span>
                </span>
                <button
                  type="button"
                  data-ocid={`os.governance.members.custom_role_edit.${index + 1}`}
                  onClick={() => onEditRole(role)}
                  className="os-focus-ring inline-flex min-h-[44px] items-center justify-center rounded-lg border border-input bg-card px-4 py-2 text-sm font-medium text-foreground transition-smooth hover:border-accent hover:bg-accent/10"
                >
                  Edit permissions
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/** A tick or dash marking whether a role holds a capability. */
function CapabilityMark({
  allowed,
  label,
}: {
  allowed: boolean;
  label: string;
}) {
  return (
    <span
      role="img"
      aria-label={`${label}: ${allowed ? "allowed" : "not allowed"}`}
      className={`inline-flex size-6 shrink-0 items-center justify-center rounded-full ${
        allowed
          ? "bg-success/15 text-success"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {allowed ? (
        <Check className="size-3.5" aria-hidden="true" />
      ) : (
        <Minus className="size-3.5" aria-hidden="true" />
      )}
    </span>
  );
}
