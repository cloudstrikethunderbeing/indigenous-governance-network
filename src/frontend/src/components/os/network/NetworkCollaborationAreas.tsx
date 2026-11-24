import {
  FileText,
  Handshake,
  Leaf,
  type LucideIcon,
  MessagesSquare,
  Share2,
} from "lucide-react";

interface CollaborationArea {
  id: string;
  icon: LucideIcon;
  title: string;
  body: string;
}

/**
 * The five areas the SOVEREIGN Network demonstrates. Each is an illustrative
 * example of how independently governed Nations could work together — none of
 * them is an operational feature.
 */
const areas: CollaborationArea[] = [
  {
    id: "initiatives",
    icon: Handshake,
    title: "Shared community initiatives",
    body: "Nations pool effort on programmes that serve more than one community, each keeping control of its own people and records.",
  },
  {
    id: "discussions",
    icon: MessagesSquare,
    title: "Regional discussions",
    body: "A space for Nations in a region to talk through shared questions without opening their private threads to anyone else.",
  },
  {
    id: "conservation",
    icon: Leaf,
    title: "Conservation and stewardship",
    body: "Coordinated land, water and wildlife stewardship across neighbouring territories, with each Nation deciding what it shares.",
  },
  {
    id: "resources",
    icon: Share2,
    title: "Resource sharing",
    body: "Nations offer equipment, expertise or funding to one another on terms they set themselves, and can withdraw at any time.",
  },
  {
    id: "proposals",
    icon: FileText,
    title: "Joint proposals and projects",
    body: "Two or more Nations draft a shared proposal or project while each keeps its own governance and approval process.",
  },
];

/**
 * The collaboration areas the network demonstrates. Every entry is an
 * illustrative example, clearly labelled as a demonstration.
 */
export default function NetworkCollaborationAreas() {
  return (
    <section
      data-ocid="os.network.areas_section"
      aria-label="Collaboration areas the network demonstrates"
      className="shell-panel flex flex-col gap-4 p-4"
    >
      <div className="flex flex-col gap-1">
        <p className="text-stamp text-accent">What the network demonstrates</p>
        <h3 className="font-display text-lg font-medium tracking-tight text-foreground">
          Areas Nations can collaborate on
        </h3>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          These are illustrative examples of how independently governed Nations
          could work together. Participation is always voluntary and
          permission-controlled.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {areas.map((area) => (
          <li
            key={area.id}
            data-ocid={`os.network.area.${area.id}`}
            className="flex flex-col gap-2 rounded-md border border-border bg-muted/40 p-3"
          >
            <span
              aria-hidden="true"
              className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground"
            >
              <area.icon className="size-4" />
            </span>
            <p className="text-sm font-medium text-foreground">{area.title}</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {area.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
