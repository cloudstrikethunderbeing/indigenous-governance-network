import { MoreHorizontal } from "lucide-react";
import type { ReactNode } from "react";

/**
 * A dashboard panel: a titled card surface with an optional overflow control.
 * The overflow control is a clearly non-functional demo affordance.
 */
export default function Panel({
  title,
  ocid,
  action,
  children,
  className,
}: {
  title: string;
  ocid?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      data-ocid={ocid}
      aria-label={title}
      className={`shell-panel flex flex-col p-4 sm:p-5 ${className ?? ""}`.trim()}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="font-display text-lg font-medium tracking-tight text-foreground">
          {title}
        </h2>
        {action ?? (
          <button
            type="button"
            aria-label={`${title} options (demo)`}
            className="rounded-md p-1 text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <MoreHorizontal className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>
      {children}
    </section>
  );
}
