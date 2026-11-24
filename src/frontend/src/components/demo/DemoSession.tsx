import { BadgeCheck } from "lucide-react";

import { demoProfile } from "@/data/demoData";

/**
 * A clearly labelled simulated member profile. This creates the feeling of a
 * signed-in session without any real authentication, account or backend.
 */
export default function DemoSession() {
  return (
    <section
      data-ocid="demo.session"
      aria-label="Simulated demo session"
      className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-subtle"
    >
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary font-display text-base font-semibold text-primary-foreground"
      >
        {demoProfile.displayName.charAt(0)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate font-display text-base font-medium text-foreground">
          {demoProfile.displayName}
          <BadgeCheck
            className="size-4 shrink-0 text-accent"
            aria-hidden="true"
          />
        </p>
        <p className="truncate text-sm text-muted-foreground">
          {demoProfile.role} · {demoProfile.nation}
        </p>
      </div>
      <span className="badge-stage-demo shrink-0">Demo profile</span>
    </section>
  );
}
