import type { ReactNode } from "react";

import PreviewBadge from "@/components/discovery/PreviewBadge";

/**
 * A clearly-labelled preview of a later-phase Discovery capability. Nothing
 * inside is live functionality — the badge and copy make that explicit.
 */
export default function DiscoveryPreviewSection({
  title,
  description,
  phase = "Phase 2 preview",
  children,
}: {
  title: string;
  description: string;
  phase?: string;
  children?: ReactNode;
}) {
  return (
    <section
      data-ocid="discovery.preview_section"
      aria-label={`${title} (preview)`}
      className="network-panel-alt flex flex-col gap-3 border-dashed p-5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-display text-base font-medium tracking-tight text-foreground">
          {title}
        </h2>
        <PreviewBadge label={phase} />
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
      {children}
    </section>
  );
}
