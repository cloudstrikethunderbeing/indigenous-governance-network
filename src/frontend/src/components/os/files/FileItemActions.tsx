import { FolderInput, Pencil, Trash2 } from "lucide-react";

/**
 * The rename, move and delete controls shared by the grid and list views.
 * Every control is disabled when the Nation is read-only (the sample Nation),
 * with the reason surfaced by the page's read-only notice.
 */
export default function FileItemActions({
  label,
  ocidPrefix,
  disabled,
  onRename,
  onMove,
  onDelete,
}: {
  label: string;
  ocidPrefix: string;
  disabled: boolean;
  onRename: () => void;
  onMove: () => void;
  onDelete: () => void;
}) {
  return (
    <span className="flex items-center gap-0.5">
      <button
        type="button"
        data-ocid={`${ocidPrefix}.rename_button`}
        aria-label={`Rename ${label}`}
        disabled={disabled}
        onClick={onRename}
        className="os-focus-ring flex size-11 items-center justify-center rounded-lg text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground disabled:opacity-40"
      >
        <Pencil className="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        data-ocid={`${ocidPrefix}.move_button`}
        aria-label={`Move ${label}`}
        disabled={disabled}
        onClick={onMove}
        className="os-focus-ring flex size-11 items-center justify-center rounded-lg text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground disabled:opacity-40"
      >
        <FolderInput className="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        data-ocid={`${ocidPrefix}.delete_button`}
        aria-label={`Delete ${label}`}
        disabled={disabled}
        onClick={onDelete}
        className="os-focus-ring flex size-11 items-center justify-center rounded-lg text-muted-foreground transition-smooth hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
    </span>
  );
}
