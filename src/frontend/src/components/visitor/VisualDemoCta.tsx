import { Link } from "@tanstack/react-router";
import { ArrowRight, Play, Sparkles } from "lucide-react";

const highlights = [
  "An animated sovereign governance ecosystem",
  "Seven clickable modules, each explained in plain language",
  "A visual deployment sequence — community to ecosystem",
];

/**
 * The prominent "Launch Your DAO — Visual Demo" call to action on the public
 * Deploy landing page.
 *
 * It opens the immersive /dao-preview experience in the same tab. The preview
 * is a clearly-labelled demonstration that creates no DAO deployment or
 * governance records, so the copy says so plainly.
 */
export default function VisualDemoCta() {
  return (
    <section
      id="visual-demo"
      data-ocid="deploy.visual_demo_section"
      aria-labelledby="deploy-visual-demo-heading"
      className="mt-16 scroll-mt-24"
    >
      <div className="shell-panel overflow-hidden">
        <div className="grid gap-px bg-border md:grid-cols-[1.15fr_1fr]">
          <div className="flex flex-col gap-5 bg-card p-6 sm:p-10">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <Sparkles className="size-6 text-primary" aria-hidden="true" />
              </span>
              <p className="text-stamp text-accent">Visual demo</p>
            </div>
            <h2
              id="deploy-visual-demo-heading"
              className="max-w-xl font-display text-3xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl"
            >
              See your DAO come alive before you build it.
            </h2>
            <div className="rule-accent" />
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
              Step into a cinematic walkthrough of a sovereign governance
              ecosystem. Watch a community become a Nation, explore each module,
              and see exactly how your rules, members and decisions fit together
              — no sign-in, no setup, nothing created.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/dao-preview"
                data-ocid="deploy.visual_demo_button"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-smooth hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <Play className="size-4" aria-hidden="true" />
                Launch Your DAO — Visual Demo
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              A clearly-labelled demonstration. It creates no DAO deployment and
              no governance records.
            </p>
          </div>

          <div className="flex flex-col justify-center gap-4 bg-secondary/40 p-6 sm:p-10">
            <p className="text-stamp text-muted-foreground">
              What you will see
            </p>
            <ul className="space-y-3">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent"
                  />
                  <span className="text-sm leading-relaxed text-foreground">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
