import { Blocks, Compass, Sparkles } from "lucide-react";

const steps = [
  {
    icon: Compass,
    step: "Describe",
    body: "Enter your organization's mission, structure, membership and governance objectives in plain language.",
  },
  {
    icon: Sparkles,
    step: "Design",
    body: "AI proposes membership rules, permissions, proposals, voting, treasury governance and policies.",
  },
  {
    icon: Blocks,
    step: "Deploy",
    body: "Review, customize and approve the governance blueprint before deploying on ICP.",
  },
];

/**
 * The Deploy Your Own DAO product vision and the upcoming AI DAO Builder.
 *
 * The builder is presented as an upcoming capability, never as an operational
 * product, using the existing demo and proposed badge utilities.
 */
export default function DeployYourOwnDaoSection() {
  return (
    <section
      id="builder"
      data-ocid="deploy.builder"
      aria-labelledby="deploy-builder-heading"
      className="scroll-mt-24"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
        <div className="space-y-4">
          <p className="text-stamp text-accent">Deploy Your Own DAO</p>
          <h2
            id="deploy-builder-heading"
            className="font-display text-3xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl"
          >
            Your organization. Your rules. Your governance.
          </h2>
          <div className="rule-accent" />
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
            SOVEREIGN turns a plain-language description of your mission,
            structure and membership into a reviewable governance blueprint —
            membership rules, permissions, proposals, voting, treasury
            governance and policies — that you approve before anything is
            deployed.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge-stage-proposed">Upcoming capability</span>
            <span className="badge-stage-demo">Demonstration</span>
          </div>
        </div>

        <div className="shell-panel p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display text-xl font-medium tracking-tight text-foreground">
              The AI DAO Builder
            </h3>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            In development. Early access organizations are shaping the builder
            now.
          </p>

          <ol className="mt-6 space-y-3">
            {steps.map((item, index) => (
              <li
                key={item.step}
                data-ocid={`deploy.builder_step.${index + 1}`}
                className="shell-panel-alt flex gap-4 p-4"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <item.icon
                    className="size-5 text-primary"
                    aria-hidden="true"
                  />
                </span>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-stamp text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h4 className="font-display text-lg font-medium text-foreground">
                      {item.step}
                    </h4>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <a
            href="#pathways"
            data-ocid="deploy.builder_cta"
            className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-smooth hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:w-auto"
          >
            I want to deploy my own DAO / Join free early access
          </a>
        </div>
      </div>
    </section>
  );
}
