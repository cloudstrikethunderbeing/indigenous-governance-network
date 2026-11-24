import { Link } from "@tanstack/react-router";
import { ArrowRight, Rocket, ScrollText } from "lucide-react";

import SampleNationPreview from "@/components/os/preview/SampleNationPreview";
import CommunityChallenge from "@/components/visitor/CommunityChallenge";
import DeployYourOwnDaoSection from "@/components/visitor/DeployYourOwnDaoSection";
import LeadPathwaysSection from "@/components/visitor/LeadPathwaysSection";
import SafetySecuritySection from "@/components/visitor/SafetySecuritySection";
import SovereigntyDiscussion from "@/components/visitor/SovereigntyDiscussion";
import VisitorWelcomePopup from "@/components/visitor/VisitorWelcomePopup";
import VisualDemoCta from "@/components/visitor/VisualDemoCta";
import WeeklyChallenge from "@/components/visitor/WeeklyChallenge";
import { useIsCallerAdmin } from "@/hooks/useQueries";

/**
 * The Deploy Your Own DAO product landing page at "/".
 *
 * This foundation shell owns the route, the page frame and the section
 * anchors. The section bodies (visitor welcome popup, community governance
 * challenge, public discussion, weekly challenge, AI DAO Builder introduction
 * and the three participation pathways) are implemented by the page tasks that
 * follow.
 */
export default function DeployLandingPage() {
  const { data: isAdmin } = useIsCallerAdmin();

  return (
    <div data-ocid="page.deploy_landing" className="min-h-screen bg-background">
      <VisitorWelcomePopup />
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur">
        <nav
          aria-label="Primary"
          className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-3"
        >
          <Link
            to="/"
            data-ocid="nav.home"
            className="font-display text-lg font-semibold tracking-tight text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            SOVEREIGN
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/500k"
              data-ocid="nav.fundraising"
              className="hidden rounded-md border border-border px-4 py-2 text-stamp text-foreground transition-smooth hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:inline-block"
            >
              The $500,000 Raise
            </Link>
            <Link
              to="/dao"
              data-ocid="nav.enter_dao"
              className="rounded-md border border-primary px-4 py-2 text-stamp text-primary transition-smooth hover:bg-primary hover:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Enter DAO &amp; Economy →
            </Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        {/* Hero */}
        <section
          data-ocid="deploy.hero"
          aria-labelledby="deploy-hero-heading"
          className="space-y-5"
        >
          <p className="text-stamp text-accent">Deploy Your Own DAO</p>
          <h1
            id="deploy-hero-heading"
            className="max-w-3xl font-display text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl"
          >
            Describe your community. Design its governance. Deploy it on ICP.
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            SOVEREIGN turns a plain-language description of your mission,
            structure and membership into a reviewable governance blueprint —
            membership rules, permissions, proposals, voting, treasury
            governance and policies — that you approve before anything is
            deployed.
          </p>
          <div className="rule-accent" />
          <div className="flex flex-wrap gap-3">
            <a
              href="#pathways"
              data-ocid="deploy.primary_button"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-smooth hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Rocket className="size-4" aria-hidden="true" />I want to deploy
              my own DAO
            </a>
            <a
              href="#pathways"
              data-ocid="deploy.secondary_button"
              className="inline-flex items-center gap-2 rounded-md border border-border px-6 py-3 text-sm font-medium text-foreground transition-smooth hover:bg-accent/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Join free early access
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          </div>
        </section>

        {/* Launch Your DAO — Visual Demo — prominent, right after the hero */}
        <VisualDemoCta />

        {/* Safety and security — placed high, right after the hero */}
        <SafetySecuritySection />

        {/* Live Sample Nation preview */}
        <section
          id="preview"
          data-ocid="deploy.preview_section"
          aria-labelledby="deploy-preview-heading"
          className="mt-16 scroll-mt-24 space-y-6"
        >
          <div className="space-y-2">
            <p className="text-stamp text-accent">See it working</p>
            <h2
              id="deploy-preview-heading"
              className="font-display text-2xl font-medium tracking-tight text-foreground md:text-3xl"
            >
              Explore a live Nation OS
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              This is the real SOVEREIGN OS, running on a fictional Sample
              Nation. Open the dashboard, governance, discussions, members,
              documents, calendar, treasury and files — no sign-in required.
            </p>
          </div>

          <SampleNationPreview />

          <div className="flex flex-wrap gap-3">
            <Link
              to="/os/sample"
              data-ocid="deploy.explore_sample_button"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-smooth hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Explore Sample Nation OS
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              to="/os/launcher"
              data-ocid="deploy.launch_nation_button"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-md border border-border px-6 py-3 text-sm font-medium text-foreground transition-smooth hover:bg-accent/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Rocket className="size-4" aria-hidden="true" />
              Launch Your Nation OS
            </Link>
          </div>
        </section>

        {/* DESCRIBE / DESIGN / DEPLOY introduction */}
        <div className="mt-16">
          <DeployYourOwnDaoSection />
        </div>

        {/* Concise Constitution Builder call to action */}
        <section
          data-ocid="deploy.constitution_cta"
          aria-labelledby="deploy-constitution-cta-heading"
          className="gov-cta-panel mt-16 space-y-4 p-6 text-center sm:p-10"
        >
          <p className="text-stamp opacity-90">Try it now</p>
          <h2
            id="deploy-constitution-cta-heading"
            className="font-display text-2xl font-semibold leading-snug tracking-tight sm:text-4xl"
          >
            YOUR ORGANIZATION. YOUR RULES. BUILD YOUR DAO.
          </h2>
          <p className="mx-auto max-w-xl text-sm leading-relaxed opacity-90">
            Walk through a short, guided demonstration and see how your choices
            become permissions, votes and membership rules. Fictional data only.
          </p>
          <div className="flex justify-center">
            <Link
              to="/os/constitution"
              data-ocid="deploy.constitution_cta_button"
              className="gov-cta-inverse os-focus-ring inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-smooth hover:opacity-90"
            >
              <ScrollText className="size-4" aria-hidden="true" />
              Build Your DAO Constitution
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* Visitor engagement — welcome popup, challenge, discussion, weekly challenge */}
        <section
          id="engage"
          data-ocid="deploy.engage"
          aria-labelledby="deploy-engage-heading"
          className="mt-16 scroll-mt-24 space-y-5"
        >
          <div className="space-y-2">
            <p className="text-stamp text-accent">Take part</p>
            <h2
              id="deploy-engage-heading"
              className="font-display text-2xl font-medium tracking-tight text-foreground md:text-3xl"
            >
              Experience a DAO
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Try a community governance challenge, join the public discussion
              and take part in the DAO Challenge of the Week. No login required.
            </p>
          </div>
          <div data-ocid="deploy.engage_slot" className="space-y-6">
            <p className="text-stamp text-accent">Demonstration only</p>
            <CommunityChallenge />
            <WeeklyChallenge />
            <SovereigntyDiscussion />
          </div>
        </section>

        {/* Participation pathways */}
        <div className="mt-16">
          <LeadPathwaysSection />
        </div>

        {isAdmin ? (
          <p className="mt-12 text-xs text-muted-foreground">
            Signed in as an administrator.{" "}
            <Link
              to="/dao/engagement"
              data-ocid="deploy.admin_link"
              className="text-primary underline-offset-2 hover:underline"
            >
              Open engagement &amp; lead management
            </Link>
            .
          </p>
        ) : null}
      </main>

      <footer className="border-t border-border px-6 py-6 text-center">
        <p className="text-xs text-muted-foreground">
          © 2026 SOVEREIGN. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
