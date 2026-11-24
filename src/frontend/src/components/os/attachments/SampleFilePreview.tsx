import { FileText, X } from "lucide-react";
import { useEffect, useRef } from "react";

import type { SampleStoredFile } from "@/components/os/attachments/sampleAttachments";
import { formatBytes } from "@/components/os/files/fileUtils";

/**
 * A metadata preview for a fictional sample file. The sample Nation stores no
 * real bytes, so this shows the file's name, type and size with a plain
 * explanation instead of a download. It closes on Escape and restores focus to
 * the control that opened it.
 */
export default function SampleFilePreview({
  file,
  onClose,
}: {
  file: SampleStoredFile;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [onClose]);

  return (
    <dialog
      open
      data-ocid="os.attachments.sample_preview"
      aria-label={`Preview of ${file.name}`}
      className="fixed inset-0 z-50 m-0 flex h-full max-h-none w-full max-w-none items-center justify-center border-0 bg-transparent p-3 md:p-6"
    >
      <button
        type="button"
        aria-label="Close preview"
        data-ocid="os.attachments.sample_preview.scrim"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-foreground/60 backdrop-blur-sm"
      />
      <div className="relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
        <header className="flex items-center gap-3 border-b border-border px-4 py-3">
          <span className="min-w-0 flex-1">
            <span className="block truncate font-display text-base font-medium text-foreground">
              {file.name}
            </span>
            <span className="block font-mono text-xs text-muted-foreground">
              {formatBytes(BigInt(file.size))} ·{" "}
              {file.contentType || "unknown type"}
            </span>
          </span>
          <button
            ref={closeRef}
            type="button"
            data-ocid="os.attachments.sample_preview.close_button"
            aria-label="Close preview"
            onClick={onClose}
            className="os-focus-ring flex size-11 items-center justify-center rounded-lg text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>
        <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
          <FileText
            className="size-10 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="font-display text-base font-medium text-foreground">
            Fictional sample file
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            This attachment is illustrative sample data. The sample Nation
            stores no real file, so there is nothing to download. Deploy your
            own Nation to store and open real files.
          </p>
        </div>
      </div>
    </dialog>
  );
}
