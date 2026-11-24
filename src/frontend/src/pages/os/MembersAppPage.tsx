import { useState } from "react";

import OsAppPage from "@/components/os/OsAppPage";
import MemberDetail from "@/components/os/members/MemberDetail";
import MemberDirectory from "@/components/os/members/MemberDirectory";
import { sampleMembers } from "@/data/sampleNation";

/**
 * The Members app: a directory of the sample Nation's members with their roles
 * and permission labels, plus a detail view for the selected member.
 */
export default function MembersAppPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selectedMember =
    sampleMembers.find((member) => member.id === selectedId) ?? null;

  return (
    <OsAppPage appKey="members">
      <div className="space-y-4">
        <header className="space-y-2">
          <p className="text-stamp text-accent">Members</p>
          <h2 className="font-display text-2xl font-medium tracking-tight text-foreground">
            Nation members
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Who belongs to the Nation, their role and what that role lets them
            do. Select a member to see their role and permissions in plain
            language.
          </p>
          <div className="rule-accent" />
        </header>

        {selectedMember ? (
          <MemberDetail
            member={selectedMember}
            onBack={() => setSelectedId(null)}
          />
        ) : (
          <MemberDirectory
            members={sampleMembers}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        )}
      </div>
    </OsAppPage>
  );
}
