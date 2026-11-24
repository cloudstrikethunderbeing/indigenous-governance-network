import { Eye } from "lucide-react";

/**
 * The plain-language preview statement shown at the top of every Preview app.
 * It states outright that the app is not yet working functionality, so a
 * visitor never mistakes the screen for a live feature.
 */
export default function PreviewBanner({
  appKey,
  appLabel,
  summary,
}: {
  appKey: string;
  appLabel: string;
  summary: string;
}) {
  return (
    <section
      data-ocid={`os.preview.banner.${appKey}`}
      aria-label={`${appLabel} preview notice`}
      className="rounded-lg border border-dashed border-accent bg-accent/10 p-4"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-accent/40 bg-accent/15 text-accent-foreground"
        >
          <Eye className="size-4" />
        </span>
        <div className="min-w-0 space-y-1.5">
          <p className="text-stamp text-accent-foreground">
            Preview — not yet working
          </p>
          <p className="text-sm leading-relaxed text-foreground">{summary}</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            This screen is a preview of an intended feature. Nothing here is
            connected to a live system, and no figure shown is real.
          </p>
        </div>
      </div>
    </section>
  );
}
