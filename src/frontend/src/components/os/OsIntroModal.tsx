import { Compass, Globe2, ShieldCheck, Users } from "lucide-react";

/**
 * The first-visit welcome: a minimal, optional introduction with the headline
 * "Welcome to Your Nation's Digital Future", three benefits, a primary CTA into
 * the sample Nation and a secondary skip. It is replayable through Help.
 */
export default function OsIntroModal({
  open,
  onExplore,
  onSkip,
}: {
  open: boolean;
  onExplore: () => void;
  onSkip: () => void;
}) {
  if (!open) return null;

  const benefits = [
    {
      icon: ShieldCheck,
      title: "Govern Independently",
      body: "Make and record your community's own decisions, on your own terms.",
    },
    {
      icon: Globe2,
      title: "Connect with Other Nations",
      body: "Choose to collaborate with other Nations — always voluntarily.",
    },
    {
      icon: Users,
      title: "Build Your Community's Future",
      body: "Keep governance, documents and knowledge in one private home.",
    },
  ];

  return (
    <dialog
      open
      data-ocid="os.intro.modal"
      aria-labelledby="os-intro-title"
      className="fixed inset-0 z-50 m-0 flex h-full max-h-none w-full max-w-none items-center justify-center border-0 bg-transparent p-4"
    >
      <button
        type="button"
        aria-label="Skip the introduction"
        data-ocid="os.intro.scrim"
        onClick={onSkip}
        className="absolute inset-0 cursor-default bg-[oklch(var(--os-window-scrim))] backdrop-blur-sm"
      />
      <div className="welcome-popup relative z-10 w-full max-w-lg animate-os-window-in p-6 md:p-8">
        <p className="text-stamp text-accent">SOVEREIGN OS</p>
        <h2
          id="os-intro-title"
          className="mt-2 font-display text-2xl font-medium tracking-tight text-foreground md:text-3xl"
        >
          Welcome to Your Nation's Digital Future
        </h2>
        <div className="rule-accent mt-3" />

        <ul className="mt-5 space-y-4">
          {benefits.map((benefit) => (
            <li key={benefit.title} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-accent/40 bg-accent/15 text-accent-foreground"
              >
                <benefit.icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-foreground">
                  {benefit.title}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                  {benefit.body}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
          <button
            type="button"
            onClick={onExplore}
            data-ocid="os.intro.explore_button"
            className="os-focus-ring inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-smooth hover:opacity-90"
          >
            <Compass className="size-4" aria-hidden="true" />
            Explore Sample Nation
          </button>
          <button
            type="button"
            onClick={onSkip}
            data-ocid="os.intro.skip_button"
            className="os-focus-ring inline-flex min-h-[44px] flex-1 items-center justify-center rounded-lg border border-border bg-card px-5 text-sm font-medium text-foreground transition-smooth hover:border-primary/50"
          >
            Skip Introduction
          </button>
        </div>
      </div>
    </dialog>
  );
}
