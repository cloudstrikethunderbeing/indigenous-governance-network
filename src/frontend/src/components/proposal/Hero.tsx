export default function Hero() {
  return (
    <section
      data-ocid="section.hero"
      className="relative overflow-hidden border-b border-hairline"
    >
      <div className="absolute inset-0">
        <img
          src="/assets/generated/hero-governance-network.dim_1600x1200.jpg"
          alt="Abstract engraved map of interconnected nodes representing a distributed, sovereign governance network"
          className="h-full w-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-hero" />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 py-24 sm:py-32">
        <div className="hero-plinth rounded-lg px-6 py-10 text-center shadow-elevated sm:px-10 sm:py-12">
          <p className="text-stamp text-accent">Build Sovereign</p>
          <div className="rule-accent mx-auto mt-4 mb-6" />
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.08] text-foreground">
            Sovereign Indigenous Governance Network
          </h1>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
            A self-governing digital infrastructure built by and for Indigenous
            nations — giving communities sovereign tools to coordinate
            governance, protect data, and transact on their own terms, free from
            dependence on outside institutions.
          </p>
        </div>
      </div>
    </section>
  );
}
