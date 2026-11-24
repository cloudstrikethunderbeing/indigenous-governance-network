import { File as FileIcon, FileImage, FileText, Folder } from "lucide-react";

import type { NationFile, NationFolder } from "@/backend";
import FileItemActions from "@/components/os/files/FileItemActions";
import {
  type FileKind,
  fileKind,
  formatBytes,
} from "@/components/os/files/fileUtils";

const kindGlyph: Record<FileKind, typeof FileIcon> = {
  image: FileImage,
  pdf: FileText,
  doc: FileText,
  other: FileIcon,
};

const kindClass: Record<FileKind, string> = {
  image: "file-glyph-image",
  pdf: "file-glyph-pdf",
  doc: "file-glyph-doc",
  other: "file-glyph-other",
};

/**
 * The grid view: folder and file cards. A folder card opens the folder; a file
 * card opens its preview. Each card carries rename, move and delete controls.
 */
export default function FileGrid({
  folders,
  files,
  readOnly,
  renamingFolder,
  renameValue,
  onRenameValueChange,
  onSubmitFolderRename,
  onCancelRename,
  onOpenFolder,
  onRenameFolder,
  onMoveFolder,
  onDeleteFolder,
  renamingFile,
  fileRenameValue,
  onFileRenameValueChange,
  onSubmitFileRename,
  onOpenFile,
  onRenameFile,
  onMoveFile,
  onDeleteFile,
}: {
  folders: NationFolder[];
  files: NationFile[];
  readOnly: boolean;
  renamingFolder: bigint | null;
  renameValue: string;
  onRenameValueChange: (value: string) => void;
  onSubmitFolderRename: (folder: NationFolder) => void;
  onCancelRename: () => void;
  onOpenFolder: (folder: NationFolder) => void;
  onRenameFolder: (folder: NationFolder) => void;
  onMoveFolder: (folder: NationFolder) => void;
  onDeleteFolder: (folder: NationFolder) => void;
  renamingFile: bigint | null;
  fileRenameValue: string;
  onFileRenameValueChange: (value: string) => void;
  onSubmitFileRename: (file: NationFile) => void;
  onOpenFile: (file: NationFile) => void;
  onRenameFile: (file: NationFile) => void;
  onMoveFile: (file: NationFile) => void;
  onDeleteFile: (file: NationFile) => void;
}) {
  return (
    <ul
      data-ocid="os.files.grid"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
    >
      {folders.map((folder) => (
        <li key={`folder-${folder.id}`}>
          {renamingFolder === folder.id ? (
            <form
              className="file-card"
              onSubmit={(event) => {
                event.preventDefault();
                onSubmitFolderRename(folder);
              }}
            >
              <span className="file-type-glyph file-glyph-folder">
                <Folder className="size-5" aria-hidden="true" />
              </span>
              <input
                type="text"
                value={renameValue}
                data-ocid={`os.files.rename_folder_input.${folder.id}`}
                onChange={(event) => onRenameValueChange(event.target.value)}
                aria-label="Folder name"
                className="min-h-[44px] w-full rounded-lg border border-input bg-background px-2 py-1.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <span className="flex gap-1">
                <button
                  type="submit"
                  data-ocid={`os.files.save_folder_button.${folder.id}`}
                  className="os-focus-ring inline-flex min-h-[36px] flex-1 items-center justify-center rounded-lg bg-primary px-2 text-xs font-medium text-primary-foreground transition-smooth hover:opacity-90"
                >
                  Save
                </button>
                <button
                  type="button"
                  data-ocid={`os.files.cancel_folder_button.${folder.id}`}
                  onClick={onCancelRename}
                  className="os-focus-ring inline-flex min-h-[36px] flex-1 items-center justify-center rounded-lg border border-border px-2 text-xs font-medium text-foreground transition-smooth hover:bg-muted"
                >
                  Cancel
                </button>
              </span>
            </form>
          ) : (
            <div className="file-card">
              <button
                type="button"
                data-ocid={`os.files.open_folder.${folder.id}`}
                onClick={() => onOpenFolder(folder)}
                className="flex min-w-0 flex-col items-start gap-2 text-left"
              >
                <span className="file-type-glyph file-glyph-folder">
                  <Folder className="size-5" aria-hidden="true" />
                </span>
                <span className="w-full truncate text-sm font-medium text-foreground">
                  {folder.name}
                </span>
                <span className="text-xs text-muted-foreground">Folder</span>
              </button>
              <FileItemActions
                label={folder.name}
                ocidPrefix={`os.files.folder_actions.${folder.id}`}
                disabled={readOnly}
                onRename={() => onRenameFolder(folder)}
                onMove={() => onMoveFolder(folder)}
                onDelete={() => onDeleteFolder(folder)}
              />
            </div>
          )}
        </li>
      ))}

      {files.map((file) => {
        const kind = fileKind(file);
        const Glyph = kindGlyph[kind];
        return (
          <li key={`file-${file.id}`}>
            {renamingFile === file.id ? (
              <form
                className="file-card"
                onSubmit={(event) => {
                  event.preventDefault();
                  onSubmitFileRename(file);
                }}
              >
                <span className={`file-type-glyph ${kindClass[kind]}`}>
                  <Glyph className="size-5" aria-hidden="true" />
                </span>
                <input
                  type="text"
                  value={fileRenameValue}
                  data-ocid={`os.files.rename_file_input.${file.id}`}
                  onChange={(event) =>
                    onFileRenameValueChange(event.target.value)
                  }
                  aria-label="File name"
                  className="min-h-[44px] w-full rounded-lg border border-input bg-background px-2 py-1.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <span className="flex gap-1">
                  <button
                    type="submit"
                    data-ocid={`os.files.save_file_button.${file.id}`}
                    className="os-focus-ring inline-flex min-h-[36px] flex-1 items-center justify-center rounded-lg bg-primary px-2 text-xs font-medium text-primary-foreground transition-smooth hover:opacity-90"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    data-ocid={`os.files.cancel_file_button.${file.id}`}
                    onClick={onCancelRename}
                    className="os-focus-ring inline-flex min-h-[36px] flex-1 items-center justify-center rounded-lg border border-border px-2 text-xs font-medium text-foreground transition-smooth hover:bg-muted"
                  >
                    Cancel
                  </button>
                </span>
              </form>
            ) : (
              <div className="file-card">
                <button
                  type="button"
                  data-ocid={`os.files.open_file.${file.id}`}
                  onClick={() => onOpenFile(file)}
                  className="flex min-w-0 flex-col items-start gap-2 text-left"
                >
                  <span className={`file-type-glyph ${kindClass[kind]}`}>
                    <Glyph className="size-5" aria-hidden="true" />
                  </span>
                  <span className="w-full truncate text-sm font-medium text-foreground">
                    {file.name}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {formatBytes(file.size)}
                  </span>
                </button>
                <FileItemActions
                  label={file.name}
                  ocidPrefix={`os.files.file_actions.${file.id}`}
                  disabled={readOnly}
                  onRename={() => onRenameFile(file)}
                  onMove={() => onMoveFile(file)}
                  onDelete={() => onDeleteFile(file)}
                />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
