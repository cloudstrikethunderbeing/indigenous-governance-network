import { Link } from "@tanstack/react-router";
import { ArrowRight, Rocket, X } from "lucide-react";

type RevealOverlayProps = {
  onClose: () => void;
};

/**
 * The full-screen reveal that ends the sequence. It states the promise, offers
 * the two real next steps, and is explicit that nothing has been created.
 */
export default function RevealOverlay({ onClose }: RevealOverlayProps) {
  return (
    <div
      data-ocid="dao_preview.reveal"
      className="fixed inset-0 z-40 flex flex-col items-center justify-center overflow-y-auto bg-[oklch(var(--cosmos-ground-deep)/0.94)] px-6 py-[calc(4rem+env(safe-area-inset-top,0px))] text-center backdrop-blur-md"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close reveal"
        data-ocid="dao_preview.reveal.close_button"
        className="cosmos-focus absolute right-4 top-[calc(1rem+env(safe-area-inset-top,0px))] flex size-11 items-center justify-center rounded-full text-[oklch(var(--cosmos-muted))] transition-colors hover:text-[oklch(var(--cosmos-foreground))]"
      >
        <X className="size-5" aria-hidden="true" />
      </button>

      <div className="cosmos-rise w-full max-w-3xl">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-[oklch(var(--cosmos-cyan))]">
          The reveal
        </p>
        <h2 className="mt-5 font-display text-[2rem] leading-[1.08] tracking-tight text-[oklch(var(--cosmos-foreground))] sm:text-5xl lg:text-6xl">
          Your Nation. Your Rules.
          <br />
          <span className="text-[oklch(var(--cosmos-gold))]">
            Your Governance.
          </span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-[oklch(var(--cosmos-muted))] sm:text-base">
          A sovereign digital community, written in your own constitution and
          governed by your own people.
        </p>

        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link
            to="/dao"
            data-ocid="dao_preview.reveal.explore_live_button"
            className="cosmos-cta cosmos-focus"
          >
            Explore Live DAO Demo
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link
            to="/deploy"
            data-ocid="dao_preview.reveal.deploy_button"
            className="cosmos-cta-ghost cosmos-focus"
          >
            <Rocket className="size-4" aria-hidden="true" />
            Deploy Your Own DAO
          </Link>
        </div>

        <p className="mx-auto mt-8 max-w-md text-xs leading-relaxed text-[oklch(var(--cosmos-faint))]">
          This was a visual demonstration. Nothing was created — no Nation, no
          deployment and no governance record.
        </p>
      </div>
    </div>
  );
}
