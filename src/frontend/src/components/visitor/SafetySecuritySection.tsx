import {
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  UserCog,
  Vote,
} from "lucide-react";

const pillars = [
  {
    icon: ShieldCheck,
    title: "How your DAO works",
    body: "A DAO is simply an organization whose rules live in software instead of a filing cabinet. Members make decisions together, and every decision is recorded so anyone can check it. Nothing happens unless the rules you set allow it.",
    points: [
      "Your rules are written down once and applied the same way every time.",
      "Every action is recorded in a shared, tamper-evident history.",
      "No single person can quietly change the outcome.",
    ],
  },
  {
    icon: KeyRound,
    title: "Authorizations — who can do what",
    body: "Authorization answers one question: is this person allowed to take this action? Each member is given exactly the abilities their role needs — and nothing more. A member who is not authorized is turned away, even if they can see the button.",
    points: [
      "Every action is checked against the member's role before it runs.",
      "Access is granted by role, never by trust or seniority alone.",
      "Sensitive actions — treasury, membership, rules — stay restricted.",
    ],
  },
  {
    icon: UserCog,
    title: "Permissions — granting and removing access",
    body: "Permissions are how roles are handed out and taken back. An administrator grants a role, and the member immediately gains only that role's abilities. Remove the role and the access disappears at once — no leftover keys.",
    points: [
      "Roles are granted through your own approved governance process.",
      "Removing a role revokes its access immediately.",
      "Every grant and removal is recorded for review.",
    ],
  },
  {
    icon: Vote,
    title: "Consensus voting — deciding together",
    body: "A proposal is a suggested change. Members vote, and the proposal is carried out only when it reaches the approval your rules require. If it does not pass, nothing changes. The result is applied automatically and recorded.",
    points: [
      "Proposals pass only when they meet your approval threshold.",
      "Votes are counted transparently and cannot be altered after the fact.",
      "Approved proposals are carried out exactly as written.",
    ],
  },
];

/**
 * The safety and security section of the Deploy Your Own DAO landing page.
 *
 * It explains, in plain language, how a DAO works, who is authorized to do
 * what, how roles and access are granted and removed, and how consensus voting
 * decides and carries out proposals. It is placed high on the page and is
 * visually distinguished from the surrounding sections.
 */
export default function SafetySecuritySection() {
  return (
    <section
      id="safety"
      data-ocid="deploy.safety_section"
      aria-labelledby="deploy-safety-heading"
      className="mt-16 scroll-mt-24"
    >
      <div className="shell-panel overflow-hidden">
        <div className="border-b border-border bg-primary/5 px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary/10">
              <ShieldCheck className="size-6 text-primary" aria-hidden="true" />
            </span>
            <p className="text-stamp text-accent">Safety &amp; security</p>
          </div>
          <h2
            id="deploy-safety-heading"
            className="mt-4 max-w-3xl font-display text-3xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl"
          >
            Safe by design. Secure by default.
          </h2>
          <div className="rule-accent mt-4" />
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Before you deploy anything, you should know exactly how your
            organization stays safe. Here is how a SOVEREIGN DAO works, who is
            allowed to do what, how access is granted and removed, and how
            decisions are made — in plain language, no blockchain knowledge
            required.
          </p>
        </div>

        <div className="grid gap-px bg-border sm:grid-cols-2">
          {pillars.map((pillar, index) => (
            <article
              key={pillar.title}
              data-ocid={`deploy.safety_pillar.${index + 1}`}
              className="flex flex-col gap-4 bg-card p-6 sm:p-8"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <pillar.icon
                    className="size-5 text-primary"
                    aria-hidden="true"
                  />
                </span>
                <h3 className="font-display text-xl font-medium tracking-tight text-foreground">
                  {pillar.title}
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {pillar.body}
              </p>
              <ul className="mt-auto space-y-2">
                {pillar.points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5">
                    <CheckCircle2
                      className="mt-0.5 size-4 shrink-0 text-success"
                      aria-hidden="true"
                    />
                    <span className="text-sm leading-relaxed text-foreground">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="border-t border-border bg-secondary/40 px-6 py-6 sm:px-10">
          <p className="text-sm leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">
              Your rules, enforced by the system.
            </span>{" "}
            Authorizations, permissions and voting are not promises — they are
            enforced by the DAO itself, so your organization stays safe even as
            it grows.
          </p>
        </div>
      </div>
    </section>
  );
}
