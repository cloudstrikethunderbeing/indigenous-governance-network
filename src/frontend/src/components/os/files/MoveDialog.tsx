import { Folder, HardDrive, X } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";

import type { NationFolder, NationFolderId } from "@/backend";

/**
 * A destination picker used to move a file or folder. It lists the Nation
 * root and every folder that is a legal destination: a folder cannot be moved
 * into itself or into one of its own descendants.
 */
export default function MoveDialog({
  open,
  itemName,
  folders,
  currentParent,
  movingFolderId,
  pending,
  onMove,
  onCancel,
}: {
  open: boolean;
  itemName: string;
  folders: NationFolder[];
  currentParent: NationFolderId | null;
  /** When moving a folder, its id, so it and its descendants are excluded. */
  movingFolderId: NationFolderId | null;
  pending: boolean;
  onMove: (destination: NationFolderId | null) => void;
  onCancel: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  // The set of folders that cannot be a destination: the moving folder itself
  // and every folder beneath it.
  const blocked = useMemo(() => {
    const set = new Set<string>();
    if (movingFolderId === null) return set;
    set.add(movingFolderId.toString());
    let changed = true;
    while (changed) {
      changed = false;
      for (const folder of folders) {
        const parent = folder.parent?.toString();
        if (parent && set.has(parent) && !set.has(folder.id.toString())) {
          set.add(folder.id.toString());
          changed = true;
        }
      }
    }
    return set;
  }, [folders, movingFolderId]);

  const destinations = useMemo(
    () =>
      folders
        .filter((folder) => !blocked.has(folder.id.toString()))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [folders, blocked],
  );

  if (!open) return null;

  return (
    <dialog
      open
      data-ocid="os.files.move_dialog"
      aria-label={`Move ${itemName}`}
      className="fixed inset-0 z-50 m-0 flex h-full max-h-none w-full max-w-none items-center justify-center border-0 bg-transparent p-4"
    >
      <button
        type="button"
        aria-label="Cancel move"
        data-ocid="os.files.move_dialog.scrim"
        onClick={onCancel}
        className="absolute inset-0 cursor-default bg-foreground/40 backdrop-blur-sm"
      />
      <div className="relative z-10 flex max-h-[80vh] w-full max-w-sm flex-col rounded-2xl border border-border bg-card shadow-lg">
        <header className="flex items-center justify-between gap-2 border-b border-border px-5 py-3">
          <div className="min-w-0">
            <h3 className="font-display text-base font-medium text-foreground">
              Move
            </h3>
            <p className="truncate text-xs text-muted-foreground">{itemName}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            data-ocid="os.files.move_dialog.close_button"
            aria-label="Close move dialog"
            onClick={onCancel}
            className="os-focus-ring flex size-11 items-center justify-center rounded-lg text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          <button
            type="button"
            data-ocid="os.files.move_dialog.destination_root"
            disabled={pending || currentParent === null}
            onClick={() => onMove(null)}
            className="file-sidebar-item disabled:opacity-50"
          >
            <HardDrive className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">All files (root)</span>
          </button>
          {destinations.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">
              No other folders to move into.
            </p>
          ) : (
            destinations.map((folder) => (
              <button
                key={folder.id.toString()}
                type="button"
                data-ocid={`os.files.move_dialog.destination.${folder.id}`}
                disabled={pending || currentParent === folder.id}
                onClick={() => onMove(folder.id)}
                className="file-sidebar-item disabled:opacity-50"
              >
                <Folder className="size-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{folder.name}</span>
              </button>
            ))
          )}
        </div>

        <footer className="border-t border-border px-5 py-3">
          <button
            type="button"
            data-ocid="os.files.move_dialog.cancel_button"
            onClick={onCancel}
            className="os-focus-ring inline-flex min-h-[44px] w-full items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-smooth hover:bg-muted"
          >
            Cancel
          </button>
        </footer>
      </div>
    </dialog>
  );
}
