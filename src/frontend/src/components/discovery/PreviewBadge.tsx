import { Sparkles } from "lucide-react";

/**
 * A clearly-labelled badge marking a later-phase Discovery capability that is
 * shown as a preview only. Nothing behind this badge is live functionality.
 */
export default function PreviewBadge({
  label = "Phase 2 preview",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      data-ocid="discovery.preview_badge"
      className={`badge-stage-future inline-flex items-center gap-1 ${className ?? ""}`.trim()}
    >
      <Sparkles className="size-3" aria-hidden="true" />
      {label}
    </span>
  );
}
