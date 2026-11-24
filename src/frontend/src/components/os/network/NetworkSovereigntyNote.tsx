import { Lock, ShieldCheck, Users } from "lucide-react";

const points = [
  {
    id: "control",
    icon: ShieldCheck,
    title: "You stay in control",
    body: "Joining the network never hands over your Nation's data. Each Nation keeps full ownership of its workspace, its records and its decisions.",
  },
  {
    id: "private",
    icon: Lock,
    title: "Private by default",
    body: "Your workspace stays private until you choose otherwise. Only the short profile you publish — your name, region and interests — is visible to other Nations.",
  },
  {
    id: "optional",
    icon: Users,
    title: "Always optional",
    body: "Collaboration is an invitation, not an obligation. You can leave the network at any time and your Nation returns to a fully private workspace.",
  },
];

/**
 * Plain-language explanation of what cross-Nation collaboration means for a
 * Nation's sovereignty and privacy. Written for readers with no blockchain
 * background.
 */
export default function NetworkSovereigntyNote() {
  return (
    <section
      data-ocid="os.network.sovereignty_section"
      aria-label="What collaboration means for your Nation"
      className="shell-panel flex flex-col gap-4 p-4"
    >
      <div className="flex flex-col gap-1">
        <p className="text-stamp text-accent">Sovereignty and privacy</p>
        <h3 className="font-display text-lg font-medium tracking-tight text-foreground">
          What joining the network means
        </h3>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          The SOVEREIGN Network lets Nations find each other and work together
          on shared goals. It is designed so that collaboration never comes at
          the cost of a Nation's sovereignty.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-3">
        {points.map((point) => (
          <li
            key={point.id}
            data-ocid={`os.network.sovereignty.${point.id}`}
            className="flex flex-col gap-2 rounded-md border border-border bg-muted/40 p-3"
          >
            <span
              aria-hidden="true"
              className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground"
            >
              <point.icon className="size-4" />
            </span>
            <p className="text-sm font-medium text-foreground">{point.title}</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {point.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
