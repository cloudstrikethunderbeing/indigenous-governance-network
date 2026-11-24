import type { OsAppStatus } from "@/components/os/appRegistry";

/**
 * The visible status marker on every app icon: a solid moss dot for a working
 * feature, a dashed bronze ring for a preview. The marker is decorative — the
 * accessible name is carried by the icon's own label and description.
 */
export default function OsStatusMarker({
  status,
  className,
}: {
  status: OsAppStatus;
  className?: string;
}) {
  const working = status === "working";
  return (
    <span
      aria-hidden="true"
      data-ocid={`os.status.${status}`}
      title={working ? "Working feature" : "Preview feature"}
      className={`${working ? "os-status-live" : "os-status-preview"} ${className ?? ""}`}
    />
  );
}
