import { FileText, X } from "lucide-react";
import { useEffect, useRef } from "react";

import type { NationFile, NationId } from "@/backend";
import { formatBytes } from "@/components/os/files/fileUtils";
import { useNationFiles } from "@/hooks/useSovereign";

/**
 * A modal that lets an authorized member attach one of the Nation's existing
 * stored files to a record. It lists the Nation's stored files and never
 * uploads a new copy — the chosen file is linked, not duplicated. The overlay
 * closes on Escape and restores focus to the control that opened it.
 */
export default function AttachmentPicker({
  nation,
  attachedFileIds,
  pending,
  onPick,
  onClose,
}: {
  nation: NationId;
  attachedFileIds: Set<string>;
  pending: boolean;
  onPick: (file: NationFile) => void;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const { data: files, isLoading, isError } = useNationFiles(nation, null);

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

  const available = files ?? [];

  return (
    <dialog
      open
      data-ocid="os.attachments.picker"
      aria-label="Attach a stored file"
      className="fixed inset-0 z-50 m-0 flex h-full max-h-none w-full max-w-none items-center justify-center border-0 bg-transparent p-3 md:p-6"
    >
      <button
        type="button"
        aria-label="Close file picker"
        data-ocid="os.attachments.picker.scrim"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-foreground/60 backdrop-blur-sm"
      />
      <div className="relative z-10 flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
        <header className="flex items-center gap-3 border-b border-border px-4 py-3">
          <span className="min-w-0 flex-1">
            <span className="block font-display text-base font-medium text-foreground">
              Attach a stored file
            </span>
            <span className="block text-xs text-muted-foreground">
              Choose from the Nation's files. The file is linked, not copied.
            </span>
          </span>
          <button
            ref={closeRef}
            type="button"
            data-ocid="os.attachments.picker.close_button"
            aria-label="Close file picker"
            onClick={onClose}
            className="os-focus-ring flex size-11 items-center justify-center rounded-lg text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-auto p-3">
          {isLoading ? (
            <p
              data-ocid="os.attachments.picker.loading_state"
              className="px-2 py-6 text-center text-sm text-muted-foreground"
            >
              Loading the Nation's files…
            </p>
          ) : isError ? (
            <p
              data-ocid="os.attachments.picker.error_state"
              role="alert"
              className="px-2 py-6 text-center text-sm text-destructive"
            >
              The Nation's files could not be loaded. Please try again.
            </p>
          ) : available.length === 0 ? (
            <p
              data-ocid="os.attachments.picker.empty_state"
              className="px-2 py-6 text-center text-sm text-muted-foreground"
            >
              This Nation has no stored files yet. Upload a file in the Files
              app first, then attach it here.
            </p>
          ) : (
            <ul className="space-y-2">
              {available.map((file) => {
                const alreadyAttached = attachedFileIds.has(file.id.toString());
                return (
                  <li key={file.id.toString()}>
                    <button
                      type="button"
                      data-ocid={`os.attachments.picker.file.${file.id}`}
                      disabled={pending || alreadyAttached}
                      onClick={() => onPick(file)}
                      className="os-focus-ring flex w-full min-h-[44px] items-center gap-3 rounded-lg border border-border bg-background px-3 py-2 text-left transition-smooth hover:border-primary/50 disabled:opacity-50"
                    >
                      <FileText
                        className="size-4 shrink-0 text-accent"
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {file.name}
                        </span>
                        <span className="block font-mono text-xs text-muted-foreground">
                          {formatBytes(file.size)} ·{" "}
                          {file.contentType || "unknown type"}
                        </span>
                      </span>
                      {alreadyAttached ? (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          Attached
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </dialog>
  );
}
