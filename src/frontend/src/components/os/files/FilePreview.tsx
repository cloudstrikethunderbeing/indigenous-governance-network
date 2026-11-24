import { Download, FileText, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { NationFile } from "@/backend";
import { fileKind, formatBytes } from "@/components/os/files/fileUtils";

/**
 * A file preview overlay. Images render inline and PDFs render in an embedded
 * viewer; any other file type shows its metadata with a download action. The
 * overlay closes on Escape and restores focus to the control that opened it.
 */
export default function FilePreview({
  file,
  onClose,
}: {
  file: NationFile;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  const kind = fileKind(file);

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

  // Resolve the stored bytes into a local object URL so the preview works even
  // when the blob has no direct gateway URL.
  useEffect(() => {
    let revoked: string | null = null;
    let cancelled = false;
    const direct = file.content.getDirectURL();
    if (direct) {
      setObjectUrl(direct);
      return;
    }
    void file.content
      .getBytes()
      .then((bytes) => {
        if (cancelled) return;
        const url = URL.createObjectURL(
          new Blob([new Uint8Array(bytes)], {
            type: file.contentType || "application/octet-stream",
          }),
        );
        revoked = url;
        setObjectUrl(url);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [file]);

  return (
    <dialog
      open
      data-ocid="os.files.preview"
      aria-label={`Preview of ${file.name}`}
      className="fixed inset-0 z-50 m-0 flex h-full max-h-none w-full max-w-none items-center justify-center border-0 bg-transparent p-3 md:p-6"
    >
      <button
        type="button"
        aria-label="Close preview"
        data-ocid="os.files.preview.scrim"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-foreground/60 backdrop-blur-sm"
      />
      <div className="relative z-10 flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
        <header className="flex items-center gap-3 border-b border-border px-4 py-3">
          <span className="min-w-0 flex-1">
            <span className="block truncate font-display text-base font-medium text-foreground">
              {file.name}
            </span>
            <span className="block font-mono text-xs text-muted-foreground">
              {formatBytes(file.size)} · {file.contentType || "unknown type"}
            </span>
          </span>
          {objectUrl ? (
            <a
              href={objectUrl}
              download={file.name}
              data-ocid="os.files.preview.download_button"
              className="os-focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-smooth hover:bg-muted"
            >
              <Download className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Download</span>
            </a>
          ) : null}
          <button
            ref={closeRef}
            type="button"
            data-ocid="os.files.preview.close_button"
            aria-label="Close preview"
            onClick={onClose}
            className="os-focus-ring flex size-11 items-center justify-center rounded-lg text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-muted/30 p-3">
          {loadError ? (
            <p
              data-ocid="os.files.preview.error_state"
              role="alert"
              className="max-w-sm text-center text-sm text-muted-foreground"
            >
              This file could not be loaded for preview. Try downloading it
              instead.
            </p>
          ) : kind === "image" && objectUrl ? (
            <img
              src={objectUrl}
              alt={file.name}
              data-ocid="os.files.preview.image"
              className="max-h-full max-w-full rounded-lg object-contain"
            />
          ) : kind === "pdf" && objectUrl ? (
            <iframe
              src={objectUrl}
              title={`PDF preview of ${file.name}`}
              data-ocid="os.files.preview.pdf"
              className="h-full min-h-[60vh] w-full rounded-lg border border-border bg-background"
            />
          ) : (
            <div
              data-ocid="os.files.preview.unsupported"
              className="flex flex-col items-center gap-3 px-6 py-12 text-center"
            >
              <FileText
                className="size-10 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="font-display text-base font-medium text-foreground">
                No inline preview for this file type
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Download the file to open it in an application on your device.
              </p>
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}
