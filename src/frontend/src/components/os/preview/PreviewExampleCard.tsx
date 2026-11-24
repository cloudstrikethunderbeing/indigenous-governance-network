import type { ReactNode } from "react";

/**
 * A single illustrative example record inside a Preview app. Every card is
 * stamped "Example" so the content is unmistakably illustrative and never read
 * as a real record.
 */
export default function PreviewExampleCard({
  appKey,
  index,
  title,
  description,
  meta,
  children,
}: {
  appKey: string;
  index: number;
  title: string;
  description: string;
  meta?: string;
  children?: ReactNode;
}) {
  return (
    <li
      data-ocid={`os.preview.example.${appKey}.${index}`}
      className="shell-panel space-y-2 p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h4 className="min-w-0 font-display text-base font-medium text-foreground">
          {title}
        </h4>
        <span className="badge-stage-demo shrink-0">Example</span>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {meta ? <p className="text-stamp text-muted-foreground">{meta}</p> : null}
      {children}
    </li>
  );
}
