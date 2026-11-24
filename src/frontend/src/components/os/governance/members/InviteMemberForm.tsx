import { Check, Loader2, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { Principal } from "@icp-sdk/core/principal";

import type { GovernanceRole, NationMember } from "@/backend";
import {
  labelSlug,
  memberInitials,
  shortPrincipal,
} from "@/components/os/governance/members/membersCopy";

/**
 * The guided "let someone in" form. An administrator picks a person who has
 * asked to join, chooses what they may do from a short list of roles, and
 * confirms. The role list is ordered so the everyday choice — Member — is
 * first and already selected, so the common case is one tap and one confirm.
 *
 * The form never asks the administrator to understand permission internals:
 * each role is shown with a plain sentence describing who it is for.
 */
export default function InviteMemberForm({
  pendingMembers,
  roles,
  isSaving,
  error,
  onConfirm,
}: {
  /** People who have asked to join and are waiting for approval. */
  pendingMembers: NationMember[];
  /** The roles the organization can give, in display order. */
  roles: GovernanceRole[];
  isSaving: boolean;
  error: string | null;
  onConfirm: (input: { member: Principal; role: GovernanceRole }) => void;
}) {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  // The everyday role is the sensible default: prefer "Member", else the first.
  const defaultRole = useMemo(() => {
    const memberRole = roles.find(
      (role) => labelSlug(role.roleName) === "member",
    );
    return memberRole ?? roles[0] ?? null;
  }, [roles]);

  // Keep a valid person selected as the pending list changes.
  const activeMember = useMemo(() => {
    if (pendingMembers.length === 0) return null;
    const match = pendingMembers.find(
      (member) => member.member.toText() === selectedMember,
    );
    return match ?? pendingMembers[0];
  }, [pendingMembers, selectedMember]);

  // Seed the role choice once, and whenever the default changes.
  useEffect(() => {
    setSelectedRoleId(
      (current) => current ?? defaultRole?.id.toString() ?? null,
    );
  }, [defaultRole]);

  const activeRole = useMemo(() => {
    if (roles.length === 0) return null;
    const match = roles.find((role) => role.id.toString() === selectedRoleId);
    return match ?? defaultRole;
  }, [roles, selectedRoleId, defaultRole]);

  const canConfirm = !!activeMember && !!activeRole && !isSaving;

  return (
    <section
      data-ocid="os.governance.members.invite_form"
      aria-label="Let someone in"
      className="shell-panel space-y-4 p-4"
    >
      <div className="space-y-1">
        <p className="text-stamp text-accent">Let someone in</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Choose a person who has asked to join, pick what they may do, and
          confirm. You can change their role later.
        </p>
      </div>

      {pendingMembers.length === 0 ? (
        <p
          data-ocid="os.governance.members.invite_empty"
          className="rounded-md border border-border bg-muted/40 px-3 py-3 text-sm text-muted-foreground"
        >
          No one is waiting to join right now. When someone asks to join, they
          will appear here for you to let in.
        </p>
      ) : (
        <>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-foreground">
              Who would you like to let in?
            </legend>
            <ul className="space-y-2">
              {pendingMembers.map((member, index) => {
                const memberText = member.member.toText();
                const isSelected = activeMember?.member.toText() === memberText;
                return (
                  <li key={member.id.toString()}>
                    <label
                      data-ocid={`os.governance.members.invite_person.${index + 1}`}
                      className={`flex min-h-[44px] cursor-pointer items-center gap-3 rounded-md border p-3 transition-smooth ${
                        isSelected
                          ? "border-primary/60 bg-primary/5"
                          : "border-border bg-muted/30 hover:border-accent/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="invite-member"
                        checked={isSelected}
                        onChange={() => setSelectedMember(memberText)}
                        className="size-5 shrink-0 accent-[oklch(var(--primary))]"
                      />
                      <span className="avatar-chip shrink-0" aria-hidden="true">
                        {memberInitials(member.displayName)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {member.displayName || shortPrincipal(memberText)}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          Waiting for approval to join
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-foreground">
              What may they do?
            </legend>
            <ul className="space-y-2">
              {roles.map((role, index) => {
                const isSelected =
                  activeRole?.id.toString() === role.id.toString();
                return (
                  <li key={role.id.toString()}>
                    <label
                      data-ocid={`os.governance.members.invite_role.${index + 1}.${labelSlug(role.roleName)}`}
                      className={`flex min-h-[44px] cursor-pointer items-start gap-3 rounded-md border p-3 transition-smooth ${
                        isSelected
                          ? "border-primary/60 bg-primary/5"
                          : "border-border bg-muted/30 hover:border-accent/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="invite-role"
                        checked={isSelected}
                        onChange={() => setSelectedRoleId(role.id.toString())}
                        className="mt-0.5 size-5 shrink-0 accent-[oklch(var(--primary))]"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-foreground">
                          {role.roleName}
                        </span>
                        <span className="block text-xs leading-relaxed text-muted-foreground">
                          {role.description || "A role in your organization."}
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
              data-ocid="os.governance.members.invite_error"
              role="alert"
              className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}

          <button
            type="button"
            data-ocid="os.governance.members.invite_confirm_button"
            disabled={!canConfirm}
            onClick={() => {
              if (!activeMember || !activeRole) return;
              onConfirm({ member: activeMember.member, role: activeRole });
            }}
            className="os-focus-ring inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <UserPlus className="size-4" aria-hidden="true" />
            )}
            Let them in
          </button>

          {activeMember && activeRole ? (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Check className="size-3.5 text-success" aria-hidden="true" />
              {activeMember.displayName ||
                shortPrincipal(activeMember.member.toText())}{" "}
              will join as {activeRole.roleName}.
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}
