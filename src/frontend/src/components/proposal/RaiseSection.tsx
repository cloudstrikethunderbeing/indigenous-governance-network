import { Download } from "lucide-react";

export default function RaiseSection() {
  return (
    <section
      data-ocid="section.raise"
      className="bg-card border-b border-hairline"
    >
      <div className="mx-auto max-w-3xl px-6 py-20 sm:py-24 text-center">
        <p className="text-stamp text-accent">The Raise</p>
        <div className="rule-accent mx-auto mt-4 mb-6" />

        <p
          className="font-display text-6xl sm:text-7xl md:text-8xl font-semibold tracking-tight text-primary"
          data-ocid="raise.amount"
        >
          $500,000
        </p>

        <p className="mt-6 max-w-xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed">
          Partnering with mission-aligned investors to fund development,
          community onboarding, and long-term stewardship of the network.
        </p>

        <div className="mt-10">
          <a
            href="/assets/pitch-deck.pdf"
            download="Sovereign-Indigenous-Governance-Network-Pitch-Deck.pdf"
            data-ocid="button.download_pitch_deck"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-8 py-4 text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-subtle transition-smooth hover:bg-primary/90 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Download Pitch Deck
          </a>
          <p className="mt-3 text-xs text-muted-foreground">
            Free download, no account required.
          </p>
        </div>
      </div>
    </section>
  );
}
