import type { ReactNode } from "react";

/**
 * A single collective-intelligence metric. The value is always supplied from
 * stored backend data — never a fabricated figure.
 */
export default function MetricCard({
  label,
  value,
  hint,
  icon,
  ocid,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  ocid?: string;
}) {
  return (
    <div data-ocid={ocid} className="network-panel flex flex-col gap-1 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-stamp text-muted-foreground">{label}</span>
        {icon ? (
          <span aria-hidden="true" className="text-muted-foreground">
            {icon}
          </span>
        ) : null}
      </div>
      <span className="network-metric text-2xl">{value}</span>
      {hint ? (
        <span className="text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </div>
  );
}
