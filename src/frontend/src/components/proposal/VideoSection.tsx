export default function VideoSection() {
  return (
    <section
      data-ocid="section.videos"
      className="bg-background border-b border-hairline"
    >
      <div className="mx-auto max-w-3xl px-6 py-20 sm:py-24">
        <p className="text-stamp text-accent text-center">Watch</p>
        <div className="rule-accent mx-auto mt-4 mb-6" />
        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground text-center">
          See the Vision
        </h2>

        <div className="mt-12 grid gap-12 sm:gap-16">
          <div data-ocid="video.longform">
            <h3 className="text-stamp text-muted-foreground mb-4 text-center">
              Full Overview
            </h3>
            <div className="relative aspect-video w-full overflow-hidden rounded-md border border-hairline shadow-subtle bg-card">
              <iframe
                className="absolute inset-0 h-full w-full"
                src="https://www.youtube.com/embed/5o8NBByKYPA"
                title="Sovereign Indigenous Governance Network — Full Overview"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>

          <div data-ocid="video.shorts">
            <h3 className="text-stamp text-muted-foreground mb-4 text-center">
              Quick Look
            </h3>
            <div className="relative mx-auto aspect-[9/16] w-full max-w-xs overflow-hidden rounded-md border border-hairline shadow-subtle bg-card">
              <iframe
                className="absolute inset-0 h-full w-full"
                src="https://www.youtube.com/embed/c_N49fhysQg"
                title="Sovereign Indigenous Governance Network — Short"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
