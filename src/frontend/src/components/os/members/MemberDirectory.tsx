import { ChevronRight } from "lucide-react";

import {
  memberInitials,
  permissionSlug,
} from "@/components/os/members/permissionCopy";
import type { SampleMember } from "@/data/sampleNation";

/**
 * The Members directory: one selectable row per member showing their display
 * name, role label and permission labels. Selecting a row opens the member's
 * detail view.
 */
export default function MemberDirectory({
  members,
  selectedId,
  onSelect,
}: {
  members: SampleMember[];
  selectedId: number | null;
  onSelect: (memberId: number) => void;
}) {
  return (
    <ul data-ocid="os.members.list" className="space-y-3">
      {members.map((member) => {
        const isSelected = member.id === selectedId;
        return (
          <li key={member.id}>
            <button
              type="button"
              data-ocid={`os.members.item.${member.id}`}
              aria-pressed={isSelected}
              onClick={() => onSelect(member.id)}
              className={`shell-panel os-focus-ring flex w-full min-h-[44px] items-center gap-3 p-4 text-left transition-smooth hover:border-primary/50 ${
                isSelected ? "border-primary/60 bg-muted/50" : ""
              }`}
            >
              <span className="avatar-chip shrink-0" aria-hidden="true">
                {memberInitials(member.displayName)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">
                  {member.displayName}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {member.roleLabel}
                </span>
                <span className="mt-2 flex flex-wrap gap-1.5">
                  {member.permissionLabels.map((label) => (
                    <span
                      key={label}
                      className="network-chip"
                      data-ocid={`os.members.permission.${member.id}.${permissionSlug(label)}`}
                    >
                      {label}
                    </span>
                  ))}
                </span>
              </span>
              <ChevronRight
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
