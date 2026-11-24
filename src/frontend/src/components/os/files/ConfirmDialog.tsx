import { AlertTriangle } from "lucide-react";
import { useEffect, useRef } from "react";

/**
 * A small confirmation dialog used before any destructive file or folder
 * action. It traps focus, closes on Escape, and restores focus to the control
 * that opened it.
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  pending,
  onConfirm,
  onCancel,
  ocid,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  pending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  ocid: string;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    confirmRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <dialog
      open
      data-ocid={ocid}
      aria-label={title}
      className="fixed inset-0 z-50 m-0 flex h-full max-h-none w-full max-w-none items-center justify-center border-0 bg-transparent p-4"
    >
      <button
        type="button"
        aria-label="Cancel"
        data-ocid={`${ocid}.scrim`}
        onClick={onCancel}
        className="absolute inset-0 cursor-default bg-foreground/40 backdrop-blur-sm"
      />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-lg">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 space-y-1">
            <h3 className="font-display text-base font-medium text-foreground">
              {title}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            data-ocid={`${ocid}.cancel_button`}
            onClick={onCancel}
            className="os-focus-ring inline-flex min-h-[44px] items-center rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-smooth hover:bg-muted"
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            type="button"
            data-ocid={`${ocid}.confirm_button`}
            onClick={onConfirm}
            disabled={pending}
            className="os-focus-ring inline-flex min-h-[44px] items-center rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-smooth hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
