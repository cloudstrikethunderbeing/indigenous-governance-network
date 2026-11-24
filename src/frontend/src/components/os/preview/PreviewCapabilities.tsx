import type { LucideIcon } from "lucide-react";

/** One intended capability of a Preview app. */
export interface PreviewCapability {
  /** Stable key, also used as the deterministic marker suffix. */
  key: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

/**
 * The intended capabilities of a Preview app, described in plain language so a
 * visitor understands what the finished feature would do.
 */
export default function PreviewCapabilities({
  appKey,
  heading,
  capabilities,
}: {
  appKey: string;
  heading: string;
  capabilities: PreviewCapability[];
}) {
  return (
    <section
      data-ocid={`os.preview.capabilities.${appKey}`}
      aria-label={heading}
      className="space-y-3"
    >
      <h3 className="font-display text-lg font-medium tracking-tight text-foreground">
        {heading}
      </h3>
      <ul className="grid gap-3 sm:grid-cols-2">
        {capabilities.map((capability) => (
          <li
            key={capability.key}
            data-ocid={`os.preview.capability.${appKey}.${capability.key}`}
            className="shell-panel flex items-start gap-3 p-4"
          >
            <span
              aria-hidden="true"
              className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-accent"
            >
              <capability.icon className="size-4" />
            </span>
            <div className="min-w-0 space-y-1">
              <h4 className="text-sm font-semibold text-foreground">
                {capability.title}
              </h4>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {capability.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
