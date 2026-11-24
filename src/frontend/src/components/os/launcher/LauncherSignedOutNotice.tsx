import { Link } from "@tanstack/react-router";
import { Compass, Lock } from "lucide-react";

import { SignInButton } from "@/components/InternetIdentity";

/**
 * The signed-out state of the launcher. Launching a Nation requires a signed-in
 * identity, so a visitor is told plainly why and offered the Sample Nation
 * instead. Nothing here creates a permanent organization.
 */
export default function LauncherSignedOutNotice() {
  return (
    <section
      data-ocid="os.launcher.signed_out_notice"
      aria-label="Sign in to launch a Nation"
      className="space-y-5"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"
        >
          <Lock className="size-5" />
        </span>
        <div className="min-w-0 space-y-1">
          <h3 className="font-display text-xl font-medium tracking-tight text-foreground">
            Sign in to launch your Nation OS
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Launching creates a private Nation workspace tied to your identity,
            so you need to sign in first. Signing in is free and takes a moment.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SignInButton className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-smooth hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60" />
        <Link
          to="/os/sample"
          data-ocid="os.launcher.explore_sample_button"
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold uppercase tracking-wider text-foreground transition-smooth hover:border-primary/50 hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Compass className="size-4" aria-hidden="true" />
          Explore sample Nation
        </Link>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        The Sample Nation is a clearly labelled, illustrative workspace. Opening
        it creates no permanent organization and changes nothing.
      </p>
    </section>
  );
}
