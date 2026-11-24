import { Landmark, ScrollText, ShieldCheck, Users } from "lucide-react";

const controlSteps = [
  {
    id: "hold",
    icon: Landmark,
    title: "The Nation holds its own funds",
    body: "A Nation's treasury would sit in an account the Nation itself controls, not one held by a platform or a third party. The community, not an outside operator, decides what happens to it.",
  },
  {
    id: "decide",
    icon: Users,
    title: "Members decide together",
    body: "Spending would follow the Nation's own governance model. A proposal to fund a project is put to the community, and members approve or reject it through the same voting process used for every other decision.",
  },
  {
    id: "record",
    icon: ScrollText,
    title: "Every movement is recorded",
    body: "Each payment in and out would be written to a shared, tamper-resistant ledger. Members can see where money came from, where it went and who authorised it — the same transparency this sample ledger illustrates.",
  },
  {
    id: "guard",
    icon: ShieldCheck,
    title: "Safeguards stay with the community",
    body: "Roles and permissions decide who may propose, approve or record spending. Limits, approvals and oversight are set by the Nation, so control of the treasury always remains with its members.",
  },
];

/**
 * A plain-language explanation of how a Nation would eventually control its own
 * treasury. It describes the model only and states no financial figures.
 */
export default function TreasuryControlExplainer() {
  return (
    <section
      data-ocid="os.treasury.control_section"
      aria-label="How a Nation controls its treasury"
      className="shell-panel space-y-4 p-4"
    >
      <div className="space-y-1">
        <h3 className="font-display text-lg font-medium text-foreground">
          How a Nation would control its treasury
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          This is how community-controlled treasury would work once a Nation is
          live. Nothing on this page moves real money today.
        </p>
      </div>
      <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {controlSteps.map((step) => (
          <li
            key={step.id}
            data-ocid={`os.treasury.control.${step.id}`}
            className="flex gap-3 rounded-md border border-border bg-muted/40 p-3"
          >
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-card text-primary"
              aria-hidden="true"
            >
              <step.icon className="size-4" />
            </span>
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium text-foreground">
                {step.title}
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
