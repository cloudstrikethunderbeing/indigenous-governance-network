import { Link } from "@tanstack/react-router";
import { ArrowRight, Compass, Globe2, ShieldCheck } from "lucide-react";

import OsAppPage from "@/components/os/OsAppPage";
import SampleGovernanceWorkflow from "@/components/os/sample/SampleGovernanceWorkflow";
import SampleNationSections from "@/components/os/sample/SampleNationSections";
import {
  nationWorkspaceExplanation,
  sampleNation,
  sampleNationNotice,
} from "@/data/sampleNation";

/** The persistent call to action into the Nation launcher. */
function DeployCta({ variant }: { variant: "banner" | "inline" }) {
  const isBanner = variant === "banner";
  return (
    <div
      data-ocid={`os.sample.deploy_cta.${variant}`}
      className={
        isBanner
          ? "shell-panel flex flex-col gap-3 border-accent/50 bg-accent/10 p-4 sm:flex-row sm:items-center sm:justify-between"
          : "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      }
    >
      <div className="min-w-0 space-y-1">
        <p className="text-stamp text-accent">Ready for your own?</p>
        <p className="font-display text-base font-medium tracking-tight text-foreground">
          Deploy your own Nation OS
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Launch a private Nation workspace with its own governance, members,
          documents and treasury in five guided steps.
        </p>
      </div>
      <Link
        to="/os/launcher"
        data-ocid={`os.sample.deploy_cta_button.${variant}`}
        className="os-focus-ring inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-smooth hover:opacity-90"
      >
        Deploy your own Nation OS
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

/**
 * The Sample Nation page body. A visitor can enter the fictional Cedar River
 * Nation without signing in and browse its proposals, discussions, members,
 * documents, calendar events and treasury information. Every record is visibly
 * labelled as illustrative demonstration data, an interactive governance
 * workflow can be completed, and a persistent call to action leads to the
 * launcher.
 */
export default function SampleNationPage() {
  const highlights = [
    {
      icon: ShieldCheck,
      title: "Private by default",
      body: "Governance, documents and knowledge stay inside the Nation.",
    },
    {
      icon: Globe2,
      title: "Collaborate voluntarily",
      body: "Sharing with other Nations is always an explicit choice.",
    },
    {
      icon: Compass,
      title: "One workspace",
      body: "Proposals, discussions, members, calendar and treasury together.",
    },
  ];

  return (
    <OsAppPage appKey="sample">
      <div className="space-y-6">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge-stage-demo">Illustrative demonstration</span>
            <span className="text-stamp text-muted-foreground">
              {sampleNation.region}
            </span>
          </div>
          <h2 className="font-display text-2xl font-medium tracking-tight text-foreground md:text-3xl">
            {sampleNation.name}
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {sampleNation.shortDescription}
          </p>
          <div className="rule-accent" />
          <p
            data-ocid="os.sample.notice"
            role="note"
            className="rounded-md border border-dashed border-accent bg-accent/10 px-3 py-2 text-xs font-medium text-accent-foreground"
          >
            {sampleNationNotice}
          </p>
        </header>

        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="shell-panel p-3">
            <dt className="text-stamp text-muted-foreground">Governance</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">
              {sampleNation.governanceModel}
            </dd>
          </div>
          <div className="shell-panel p-3">
            <dt className="text-stamp text-muted-foreground">Privacy</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">
              {sampleNation.privacyLabel}
            </dd>
          </div>
          <div className="shell-panel p-3">
            <dt className="text-stamp text-muted-foreground">Collaboration</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">
              {sampleNation.openToCollaboration
                ? "Open to collaboration"
                : "Not participating"}
            </dd>
          </div>
        </dl>

        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {nationWorkspaceExplanation}
        </p>

        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {highlights.map((item) => (
            <li key={item.title} className="shell-panel space-y-1 p-3">
              <span className="flex items-center gap-2">
                <item.icon className="size-4 text-accent" aria-hidden="true" />
                <span className="text-sm font-semibold text-foreground">
                  {item.title}
                </span>
              </span>
              <span className="block text-xs leading-relaxed text-muted-foreground">
                {item.body}
              </span>
            </li>
          ))}
        </ul>

        <DeployCta variant="banner" />

        <SampleGovernanceWorkflow />

        <SampleNationSections />

        <DeployCta variant="inline" />
      </div>
    </OsAppPage>
  );
}
