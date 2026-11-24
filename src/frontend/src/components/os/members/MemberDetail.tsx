import { ArrowLeft, Check } from "lucide-react";

import {
  describePermission,
  describeRole,
  memberInitials,
  permissionSlug,
} from "@/components/os/members/permissionCopy";
import type { SampleMember } from "@/data/sampleNation";

/**
 * The member detail view: the selected member's role and the plain-language
 * permissions their role grants.
 */
export default function MemberDetail({
  member,
  onBack,
}: {
  member: SampleMember;
  onBack: () => void;
}) {
  return (
    <section
      data-ocid={`os.members.detail.${member.id}`}
      aria-label={`${member.displayName} details`}
      className="shell-panel space-y-5 p-4 md:p-5"
    >
      <button
        type="button"
        data-ocid="os.members.detail.back_button"
        onClick={onBack}
        className="os-focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-lg px-2 text-sm font-medium text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All members
      </button>

      <header className="flex items-center gap-3">
        <span className="avatar-chip size-12 shrink-0" aria-hidden="true">
          {memberInitials(member.displayName)}
        </span>
        <div className="min-w-0">
          <h3 className="truncate font-display text-xl font-medium tracking-tight text-foreground">
            {member.displayName}
          </h3>
          <p className="truncate text-sm text-muted-foreground">
            {member.roleLabel}
          </p>
        </div>
      </header>

      <div className="space-y-2">
        <p className="text-stamp text-accent">Role</p>
        <p className="text-sm leading-relaxed text-foreground">
          {describeRole(member.roleLabel)}
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-stamp text-accent">What this role can do</p>
        <ul data-ocid="os.members.detail.permission_list" className="space-y-2">
          {member.permissionLabels.map((label) => (
            <li
              key={label}
              data-ocid={`os.members.detail.permission.${permissionSlug(label)}`}
              className="flex items-start gap-3 rounded-md border border-border bg-muted/40 p-3"
            >
              <span
                className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
                aria-hidden="true"
              >
                <Check className="size-3" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">
                  {label}
                </span>
                <span className="block text-xs leading-relaxed text-muted-foreground">
                  {describePermission(label)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Roles and permissions are set by the Nation's own governance rules. A
        member only sees what their role allows.
      </p>
    </section>
  );
}
