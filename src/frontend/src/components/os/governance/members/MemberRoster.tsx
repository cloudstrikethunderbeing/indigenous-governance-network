import { Check, Clock, Loader2, ShieldCheck, UserPlus } from "lucide-react";

import type { Principal } from "@icp-sdk/core/principal";

import type { GovernanceRole, NationMember } from "@/backend";
import {
  labelSlug,
  memberInitials,
  shortPrincipal,
} from "@/components/os/governance/members/membersCopy";
import { rolesForMember } from "@/components/os/governance/members/useGovernanceMembers";

/**
 * The member roster: one card per person showing their name, the roles they
 * hold and what those roles let them do. A person whose request to join is
 * still waiting shows a clear "waiting for approval" state with an approve
 * action when the signed-in person is allowed to approve.
 */
export default function MemberRoster({
  members,
  roles,
  assignments,
  canApprove,
  approvingMember,
  onApprove,
  onSelect,
  selectedMember,
}: {
  members: NationMember[];
  roles: GovernanceRole[];
  assignments: Parameters<typeof rolesForMember>[1];
  canApprove: boolean;
  approvingMember: string | null;
  onApprove: (member: Principal) => void;
  onSelect: (member: NationMember) => void;
  selectedMember: string | null;
}) {
  return (
    <ul data-ocid="os.governance.members.roster" className="space-y-3">
      {members.map((member, index) => {
        const memberRoles = rolesForMember(member.member, assignments, roles);
        const pending = member.permissionLabels.length === 0;
        const memberText = member.member.toText();
        const isSelected = selectedMember === memberText;
        const isApproving = approvingMember === memberText;

        return (
          <li key={member.id.toString()}>
            <div
              data-ocid={`os.governance.members.member.${index + 1}`}
              className={`shell-panel space-y-3 p-4 transition-smooth ${
                isSelected ? "border-accent ring-1 ring-accent" : ""
              }`}
            >
              <button
                type="button"
                data-ocid={`os.governance.members.member_open.${index + 1}`}
                aria-pressed={isSelected}
                onClick={() => onSelect(member)}
                className="os-focus-ring flex w-full min-h-[44px] items-center gap-3 text-left"
              >
                <span className="avatar-chip shrink-0" aria-hidden="true">
                  {memberInitials(member.displayName)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {member.displayName || shortPrincipal(memberText)}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {pending
                      ? "Waiting for approval to join"
                      : member.roleLabel || "Member"}
                  </span>
                </span>
                {pending ? (
                  <span
                    data-ocid={`os.governance.members.pending_badge.${index + 1}`}
                    className="text-stamp inline-flex shrink-0 items-center gap-1 rounded-sm border border-warning bg-warning/10 px-2 py-1 text-warning-foreground"
                  >
                    <Clock className="size-3" aria-hidden="true" />
                    Waiting
                  </span>
                ) : (
                  <span
                    data-ocid={`os.governance.members.active_badge.${index + 1}`}
                    className="text-stamp inline-flex shrink-0 items-center gap-1 rounded-sm border border-success bg-success/10 px-2 py-1 text-success"
                  >
                    <ShieldCheck className="size-3" aria-hidden="true" />
                    Active
                  </span>
                )}
              </button>

              {pending ? (
                <div className="space-y-2 border-t border-border pt-3">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    This person has asked to join. They can take part once the
                    organization approves them.
                  </p>
                  {canApprove ? (
                    <button
                      type="button"
                      data-ocid={`os.governance.members.approve_button.${index + 1}`}
                      disabled={isApproving}
                      onClick={() => onApprove(member.member)}
                      className="os-focus-ring inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                      {isApproving ? (
                        <Loader2
                          className="size-4 animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <UserPlus className="size-4" aria-hidden="true" />
                      )}
                      Approve to join
                    </button>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Only someone with approval permission can let them in.
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {memberRoles.length > 0 ? (
                    memberRoles.map((role) => (
                      <span
                        key={role.id.toString()}
                        data-ocid={`os.governance.members.role_chip.${index + 1}.${labelSlug(role.roleName)}`}
                        className="gov-role-chip"
                      >
                        {role.roleName}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      No role assigned yet.
                    </span>
                  )}
                </div>
              )}

              {!pending && member.permissionLabels.length > 0 ? (
                <ul className="flex flex-wrap gap-1.5">
                  {member.permissionLabels.map((label) => (
                    <li
                      key={label}
                      data-ocid={`os.governance.members.permission.${index + 1}.${labelSlug(label)}`}
                      className="network-chip inline-flex items-center gap-1"
                    >
                      <Check
                        className="size-3 text-success"
                        aria-hidden="true"
                      />
                      {label}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
