import { AlertCircle, CheckCircle2, RotateCw, X } from "lucide-react";

import type { UploadItem } from "@/components/os/files/useFileUploads";

/**
 * The upload queue: one row per file with its own progress bar, a clear error
 * message and a retry action on failure, and a dismiss control.
 */
export default function UploadPanel({
  items,
  onRetry,
  onDismiss,
  onClearCompleted,
}: {
  items: UploadItem[];
  onRetry: (id: string) => void;
  onDismiss: (id: string) => void;
  onClearCompleted: () => void;
}) {
  if (items.length === 0) return null;

  const hasCompleted = items.some((item) => item.status === "done");

  return (
    <section
      data-ocid="os.files.upload_panel"
      aria-label="Uploads"
      className="space-y-2 rounded-xl border border-border bg-card/60 p-3"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-stamp text-muted-foreground">Uploads</p>
        {hasCompleted ? (
          <button
            type="button"
            data-ocid="os.files.upload_clear_button"
            onClick={onClearCompleted}
            className="os-focus-ring rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground"
          >
            Clear finished
          </button>
        ) : null}
      </div>

      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            data-ocid={`os.files.upload_item.${item.id}`}
            className="space-y-1.5"
          >
            <div className="flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                {item.file.name}
              </span>
              {item.status === "done" ? (
                <CheckCircle2
                  className="size-4 shrink-0 text-[oklch(var(--file-progress-fill))]"
                  aria-label="Uploaded"
                />
              ) : item.status === "error" ? (
                <AlertCircle
                  className="size-4 shrink-0 text-destructive"
                  aria-label="Upload failed"
                />
              ) : (
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  {Math.round(item.progress)}%
                </span>
              )}
              {item.status === "error" ? (
                <button
                  type="button"
                  data-ocid={`os.files.upload_retry_button.${item.id}`}
                  onClick={() => onRetry(item.id)}
                  className="os-focus-ring inline-flex min-h-[32px] items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-foreground transition-smooth hover:bg-muted"
                >
                  <RotateCw className="size-3.5" aria-hidden="true" />
                  Retry
                </button>
              ) : null}
              {item.status === "done" || item.status === "error" ? (
                <button
                  type="button"
                  data-ocid={`os.files.upload_dismiss_button.${item.id}`}
                  aria-label={`Dismiss ${item.file.name}`}
                  onClick={() => onDismiss(item.id)}
                  className="os-focus-ring flex size-8 items-center justify-center rounded-md text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              ) : null}
            </div>

            {item.status === "uploading" || item.status === "pending" ? (
              <div className="file-progress-track">
                <div
                  className="file-progress-fill"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            ) : null}

            {item.status === "error" && item.error ? (
              <p
                data-ocid={`os.files.upload_error.${item.id}`}
                role="alert"
                className="text-xs text-destructive"
              >
                {item.error}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
