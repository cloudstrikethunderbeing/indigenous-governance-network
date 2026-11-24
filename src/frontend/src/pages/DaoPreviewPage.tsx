import { Link } from "@tanstack/react-router";
import { ArrowRight, Rocket } from "lucide-react";
import { useCallback, useState } from "react";

import EcosystemConstellation from "@/components/dao-preview/EcosystemConstellation";
import GuidedSequence from "@/components/dao-preview/GuidedSequence";
import RevealOverlay from "@/components/dao-preview/RevealOverlay";

/**
 * /dao-preview — the public, no-auth cinematic governance preview.
 *
 * A one-click reveal over an Earth, aurora and network backdrop: the animated
 * ecosystem, the guided sequence, and the full-screen reveal. It is a visual
 * demonstration only — it creates no Nation, deployment or governance record.
 */
export default function DaoPreviewPage() {
  const [revealed, setRevealed] = useState(false);
  const closeReveal = useCallback(() => setRevealed(false), []);

  return (
    <main
      data-ocid="dao_preview.page"
      className="cosmos-root flex min-h-dvh flex-col"
    >
      {/* Backdrop layers */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="cosmos-aurora" aria-hidden="true" />
        <div className="cosmos-grid" aria-hidden="true" />
        <div className="cosmos-earth" aria-hidden="true" />
        <div className="cosmos-veil" aria-hidden="true" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col">
        {/* Header */}
        <header className="flex items-center justify-between gap-4 px-5 pt-[calc(1rem+env(safe-area-inset-top,0px))] sm:px-8">
          <Link
            to="/"
            data-ocid="dao_preview.home_link"
            className="cosmos-focus font-display text-base tracking-tight text-[oklch(var(--cosmos-foreground))]"
          >
            SOVEREIGN
          </Link>
          <span className="cosmos-chip cosmos-chip-future">
            Visual demo · creates nothing
          </span>
        </header>

        {/* Hero */}
        <section className="px-5 pb-4 pt-10 text-center sm:px-8 sm:pt-14">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-[oklch(var(--cosmos-muted))] sm:text-[0.65rem]">
            Launch Your DAO — Visual Demo
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl font-display text-[2.1rem] leading-[1.06] tracking-tight text-[oklch(var(--cosmos-foreground))] sm:text-5xl lg:text-6xl">
            Your Nation. Your Rules.
            <br />
            <span className="text-[oklch(var(--cosmos-gold))]">
              Your Governance.
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[oklch(var(--cosmos-muted))] sm:text-base">
            A sovereign digital community, written in your own constitution and
            governed by your own people.
          </p>
        </section>

        {/* Ecosystem */}
        <section
          aria-labelledby="dao-preview-ecosystem-title"
          className="px-3 pb-6 pt-2 sm:px-8"
        >
          <h2 id="dao-preview-ecosystem-title" className="sr-only">
            The sovereign governance ecosystem
          </h2>
          <EcosystemConstellation />
          <p className="mx-auto mt-2 max-w-md text-center text-xs text-[oklch(var(--cosmos-faint))]">
            Tap any module to see what it does. Live modules are implemented
            today; future modules are later phases.
          </p>
        </section>

        {/* Guided sequence */}
        <section className="px-5 pb-10 sm:px-8">
          <GuidedSequence onComplete={() => setRevealed(true)} />
        </section>

        {/* Closing actions */}
        <section className="px-5 pb-12 sm:px-8">
          <div className="mx-auto flex max-w-2xl flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link
              to="/dao"
              data-ocid="dao_preview.explore_live_button"
              className="cosmos-cta cosmos-focus"
            >
              Explore Live DAO Demo
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              to="/deploy"
              data-ocid="dao_preview.deploy_button"
              className="cosmos-cta-ghost cosmos-focus"
            >
              <Rocket className="size-4" aria-hidden="true" />
              Deploy Your Own DAO
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-auto border-t border-[oklch(var(--cosmos-border)/0.6)] px-5 py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] text-center sm:px-8">
          <p className="mx-auto max-w-lg text-xs leading-relaxed text-[oklch(var(--cosmos-faint))]">
            This is a visual demonstration. It creates no Nation, deployment or
            governance record, and is not an activated DAO.
          </p>
          <p className="mt-3 text-xs text-[oklch(var(--cosmos-faint))]">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                window.location.hostname,
              )}`}
              target="_blank"
              rel="noreferrer"
              className="cosmos-focus underline decoration-[oklch(var(--cosmos-border))] underline-offset-2 transition-colors hover:text-[oklch(var(--cosmos-cyan))]"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>

      {revealed ? <RevealOverlay onClose={closeReveal} /> : null}
    </main>
  );
}
