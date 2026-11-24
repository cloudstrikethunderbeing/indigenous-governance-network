import AvatarChip from "@/components/dashboard/AvatarChip";
import {
  type SidebarPerson,
  applications,
  newMembers,
  onlineMembers,
} from "@/data/demoData";

function PersonRow({
  person,
  ocid,
}: {
  person: SidebarPerson;
  ocid: string;
}) {
  return (
    <li
      data-ocid={ocid}
      className="flex items-center gap-2.5 py-2 first:pt-0 last:pb-0"
    >
      <AvatarChip name={person.name} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {person.name}
        </p>
        <p className="truncate text-[0.65rem] text-muted-foreground">
          {person.meta} · {person.time}
        </p>
      </div>
    </li>
  );
}

/** Right sidebar: new members, applications and online members. */
export default function MemberSidebar() {
  return (
    <div className="flex flex-col gap-5">
      <section data-ocid="dashboard.new_members" aria-label="New members">
        <h3 className="text-stamp mb-2 text-muted-foreground">New members</h3>
        <ul className="flex flex-col">
          {newMembers.map((person) => (
            <PersonRow
              key={person.id}
              person={person}
              ocid={`dashboard.new_member.${person.id}`}
            />
          ))}
        </ul>
      </section>

      <section data-ocid="dashboard.applications" aria-label="Applications">
        <h3 className="text-stamp mb-2 text-muted-foreground">Applications</h3>
        <ul className="flex flex-col">
          {applications.map((person) => (
            <PersonRow
              key={person.id}
              person={person}
              ocid={`dashboard.application.${person.id}`}
            />
          ))}
        </ul>
      </section>

      <section data-ocid="dashboard.online_members" aria-label="Online members">
        <h3 className="text-stamp mb-2 text-muted-foreground">
          Online members
        </h3>
        <ul className="flex flex-wrap gap-2">
          {onlineMembers.map((person) => (
            <li key={person.id} data-ocid={`dashboard.online.${person.id}`}>
              <AvatarChip name={person.name} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
