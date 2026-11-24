import { FolderOpen, FolderPlus, HardDrive, Info, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import type {
  FileError,
  NationFile,
  NationFolder,
  NationFolderId,
  NationId,
} from "@/backend";
import ConfirmDialog from "@/components/os/files/ConfirmDialog";
import FileGrid from "@/components/os/files/FileGrid";
import FileList from "@/components/os/files/FileList";
import FilePreview from "@/components/os/files/FilePreview";
import FilesToolbar from "@/components/os/files/FilesToolbar";
import MoveDialog from "@/components/os/files/MoveDialog";
import UploadPanel from "@/components/os/files/UploadPanel";
import {
  type FilesSort,
  type FilesView,
  compareFiles,
  fileErrorMessage,
  fileMatchesQuery,
  formatBytes,
  readFilesPreference,
  writeFilesPreference,
} from "@/components/os/files/fileUtils";
import { useFileUploads } from "@/components/os/files/useFileUploads";
import {
  useCreateNationFolder,
  useDeleteNationFile,
  useDeleteNationFolder,
  useMoveNationFile,
  useMoveNationFolder,
  useNationFileSummary,
  useNationFiles,
  useNationFolders,
  useRenameNationFile,
  useRenameNationFolder,
} from "@/hooks/useSovereign";

/** What a pending delete confirmation refers to. */
type PendingDelete =
  | { kind: "folder"; folder: NationFolder }
  | { kind: "file"; file: NationFile };

/** What a pending move refers to. */
type PendingMove =
  | { kind: "folder"; folder: NationFolder }
  | { kind: "file"; file: NationFile };

/** Whether the browser supports directory selection on a file input. */
function supportsDirectoryImport(): boolean {
  if (typeof document === "undefined") return false;
  const input = document.createElement("input");
  return "webkitdirectory" in input;
}

/**
 * The Finder-inspired file browser for one Nation. It owns every folder and
 * file query and mutation, so it is only mounted once the active Nation id is
 * resolved. A signed-in member's own Nation is writable; the sample Nation is
 * read-only for every caller.
 */
export default function FilesBrowser({
  nationId,
  readOnly,
}: {
  nationId: NationId;
  readOnly: boolean;
}) {
  const foldersQuery = useNationFolders(nationId);
  const summaryQuery = useNationFileSummary(nationId);

  const [currentFolder, setCurrentFolder] = useState<NationFolderId | null>(
    null,
  );
  const filesQuery = useNationFiles(nationId, currentFolder);

  const createFolder = useCreateNationFolder();
  const renameFolder = useRenameNationFolder();
  const moveFolder = useMoveNationFolder();
  const deleteFolder = useDeleteNationFolder();
  const renameFile = useRenameNationFile();
  const moveFile = useMoveNationFile();
  const deleteFile = useDeleteNationFile();

  const uploads = useFileUploads(nationId, currentFolder);

  const [preference, setPreference] = useState(() => readFilesPreference());
  const [query, setQuery] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [renamingFolder, setRenamingFolder] = useState<NationFolderId | null>(
    null,
  );
  const [renameValue, setRenameValue] = useState("");
  const [renamingFile, setRenamingFile] = useState<bigint | null>(null);
  const [fileRenameValue, setFileRenameValue] = useState("");
  const [previewFile, setPreviewFile] = useState<NationFile | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(
    null,
  );
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const importSupported = useMemo(() => supportsDirectoryImport(), []);

  const folders = useMemo(() => foldersQuery.data ?? [], [foldersQuery.data]);
  const files = useMemo(() => filesQuery.data ?? [], [filesQuery.data]);

  // The chain of folders from the root to the current folder, for the breadcrumb.
  const breadcrumb = useMemo<NationFolder[]>(() => {
    const chain: NationFolder[] = [];
    let cursor = currentFolder;
    while (cursor !== null) {
      const match = folders.find((folder) => folder.id === cursor);
      if (!match) break;
      chain.unshift(match);
      cursor = match.parent ?? null;
    }
    return chain;
  }, [folders, currentFolder]);

  const childFolders = useMemo(
    () =>
      folders
        .filter((folder) => (folder.parent ?? null) === currentFolder)
        .filter((folder) =>
          folder.name.toLowerCase().includes(query.trim().toLowerCase()),
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
    [folders, currentFolder, query],
  );

  const visibleFiles = useMemo(
    () =>
      files
        .filter((file) => fileMatchesQuery(file, query))
        .sort((a, b) =>
          compareFiles(a, b, preference.sort, preference.direction),
        ),
    [files, query, preference.sort, preference.direction],
  );

  const summary = summaryQuery.data ?? null;
  const isLoading = foldersQuery.isLoading || filesQuery.isLoading;

  function updatePreference(patch: Partial<typeof preference>) {
    setPreference((current) => {
      const next = { ...current, ...patch };
      writeFilesPreference(next);
      return next;
    });
  }

  function reportResult(
    result: { __kind__: "ok" } | { __kind__: "err"; err: FileError },
  ) {
    if (result.__kind__ === "err") setError(fileErrorMessage(result.err));
  }

  function handleCreateFolder() {
    const name = newFolderName.trim();
    if (name === "") return;
    setError(null);
    createFolder.mutate(
      { nation: nationId, parent: currentFolder, name },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "ok") setNewFolderName("");
          else reportResult(result);
        },
        onError: () => setError("The folder could not be created."),
      },
    );
  }

  function handleRenameFolder(folder: NationFolder) {
    const name = renameValue.trim();
    if (name === "") return;
    setError(null);
    renameFolder.mutate(
      { nation: nationId, folder: folder.id, name },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "ok") setRenamingFolder(null);
          else reportResult(result);
        },
        onError: () => setError("The folder could not be renamed."),
      },
    );
  }

  function handleRenameFile(file: NationFile) {
    const name = fileRenameValue.trim();
    if (name === "") return;
    setError(null);
    renameFile.mutate(
      { nation: nationId, file: file.id, name },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "ok") setRenamingFile(null);
          else reportResult(result);
        },
        onError: () => setError("The file could not be renamed."),
      },
    );
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    setError(null);
    if (pendingDelete.kind === "folder") {
      const folder = pendingDelete.folder;
      deleteFolder.mutate(
        { nation: nationId, folder: folder.id },
        {
          onSuccess: (result) => {
            if (result.__kind__ === "ok") {
              if (currentFolder === folder.id) {
                setCurrentFolder(folder.parent ?? null);
              }
              setPendingDelete(null);
            } else {
              reportResult(result);
              setPendingDelete(null);
            }
          },
          onError: () => {
            setError("The folder could not be deleted.");
            setPendingDelete(null);
          },
        },
      );
    } else {
      const file = pendingDelete.file;
      deleteFile.mutate(
        { nation: nationId, file: file.id },
        {
          onSuccess: (result) => {
            if (result.__kind__ === "ok") setPendingDelete(null);
            else {
              reportResult(result);
              setPendingDelete(null);
            }
          },
          onError: () => {
            setError("The file could not be deleted.");
            setPendingDelete(null);
          },
        },
      );
    }
  }

  function handleMove(destination: NationFolderId | null) {
    if (!pendingMove) return;
    setError(null);
    if (pendingMove.kind === "folder") {
      const folder = pendingMove.folder;
      moveFolder.mutate(
        { nation: nationId, folder: folder.id, newParent: destination },
        {
          onSuccess: (result) => {
            if (result.__kind__ === "ok") setPendingMove(null);
            else {
              reportResult(result);
              setPendingMove(null);
            }
          },
          onError: () => {
            setError("The folder could not be moved.");
            setPendingMove(null);
          },
        },
      );
    } else {
      const file = pendingMove.file;
      moveFile.mutate(
        { nation: nationId, file: file.id, folder: destination },
        {
          onSuccess: (result) => {
            if (result.__kind__ === "ok") setPendingMove(null);
            else {
              reportResult(result);
              setPendingMove(null);
            }
          },
          onError: () => {
            setError("The file could not be moved.");
            setPendingMove(null);
          },
        },
      );
    }
  }

  function handleFilesPicked(list: FileList | null) {
    if (!list || list.length === 0) return;
    uploads.enqueue(Array.from(list));
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (folderInputRef.current) folderInputRef.current.value = "";
  }

  const deletePending = deleteFolder.isPending || deleteFile.isPending;
  const movePending = moveFolder.isPending || moveFile.isPending;

  return (
    <>
      {readOnly ? (
        <p
          data-ocid="os.files.readonly_notice"
          className="flex items-start gap-2 rounded-md border border-dashed border-accent bg-accent/10 px-3 py-2 text-xs leading-relaxed text-accent-foreground"
        >
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            Sample files are read-only and fictional. Browse every folder and
            preview any file, but deploy your own Nation to create, upload,
            rename, move or delete.
          </span>
        </p>
      ) : null}

      {error ? (
        <p
          data-ocid="os.files.error_state"
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-foreground"
        >
          {error}
        </p>
      ) : null}

      <div className="file-shell grid grid-cols-1 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
        <aside
          data-ocid="os.files.sidebar"
          className="file-sidebar flex flex-col gap-1 p-3"
        >
          <button
            type="button"
            data-ocid="os.files.root_button"
            onClick={() => setCurrentFolder(null)}
            className={`file-sidebar-item ${currentFolder === null ? "file-sidebar-item-active" : ""}`}
          >
            <HardDrive className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">All files</span>
          </button>

          <p className="px-3 pb-1 pt-3 text-stamp text-muted-foreground">
            Folders
          </p>
          {folders.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">
              No folders yet.
            </p>
          ) : (
            folders.map((folder) => (
              <button
                key={folder.id.toString()}
                type="button"
                data-ocid={`os.files.folder.${folder.id}`}
                onClick={() => setCurrentFolder(folder.id)}
                className={`file-sidebar-item ${currentFolder === folder.id ? "file-sidebar-item-active" : ""}`}
              >
                <FolderOpen className="size-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{folder.name}</span>
              </button>
            ))
          )}

          {summary ? (
            <div
              data-ocid="os.files.summary"
              className="mt-auto space-y-1 rounded-lg border border-border/60 bg-background/40 px-3 py-2.5"
            >
              <p className="text-stamp text-muted-foreground">Storage</p>
              <p className="font-mono text-xs text-foreground">
                {summary.fileCount.toString()} files ·{" "}
                {formatBytes(summary.totalBytes)}
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                {summary.folderCount.toString()} folders
              </p>
            </div>
          ) : null}
        </aside>

        <div className="flex min-w-0 flex-col">
          <FilesToolbar
            breadcrumb={breadcrumb}
            currentFolder={currentFolder}
            onNavigate={setCurrentFolder}
            query={query}
            onQueryChange={setQuery}
            view={preference.view}
            onViewChange={(view: FilesView) => updatePreference({ view })}
            sort={preference.sort}
            direction={preference.direction}
            onSortChange={(sort: FilesSort) => updatePreference({ sort })}
            onToggleDirection={() =>
              updatePreference({
                direction: preference.direction === "asc" ? "desc" : "asc",
              })
            }
            onUploadClick={() => fileInputRef.current?.click()}
            onImportFolderClick={() => folderInputRef.current?.click()}
            uploadDisabled={readOnly || uploads.active}
            importSupported={importSupported}
          />

          <input
            ref={fileInputRef}
            type="file"
            multiple
            data-ocid="os.files.upload_input"
            className="sr-only"
            onChange={(event) => handleFilesPicked(event.target.files)}
          />
          <input
            ref={folderInputRef}
            type="file"
            multiple
            data-ocid="os.files.import_folder_input"
            className="sr-only"
            onChange={(event) => handleFilesPicked(event.target.files)}
            {...({ webkitdirectory: "" } as Record<string, string>)}
          />

          <div className="flex-1 space-y-3 p-3">
            <UploadPanel
              items={uploads.items}
              onRetry={uploads.retry}
              onDismiss={uploads.dismiss}
              onClearCompleted={uploads.clearCompleted}
            />

            <form
              className="flex flex-wrap items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                handleCreateFolder();
              }}
            >
              <input
                type="text"
                value={newFolderName}
                data-ocid="os.files.new_folder_input"
                onChange={(event) => setNewFolderName(event.target.value)}
                placeholder="New folder name"
                aria-label="New folder name"
                disabled={readOnly}
                className="min-h-[44px] min-w-0 flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
              />
              <button
                type="submit"
                data-ocid="os.files.new_folder_button"
                disabled={
                  readOnly ||
                  createFolder.isPending ||
                  newFolderName.trim() === ""
                }
                className="os-focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-smooth hover:bg-muted disabled:opacity-60"
              >
                <FolderPlus className="size-4" aria-hidden="true" />
                New folder
              </button>
            </form>

            {isLoading ? (
              <div
                data-ocid="os.files.loading_state"
                className="space-y-2"
                aria-busy="true"
              >
                {Array.from({ length: 4 }, (_, i) => `skeleton-${i}`).map(
                  (id) => (
                    <div
                      key={id}
                      className="h-12 animate-pulse rounded-lg bg-muted/40"
                    />
                  ),
                )}
              </div>
            ) : foldersQuery.isError || filesQuery.isError ? (
              <div
                data-ocid="os.files.load_error_state"
                role="alert"
                className="shell-panel space-y-3 p-5"
              >
                <p className="font-display text-base font-medium text-foreground">
                  The files could not be loaded.
                </p>
                <button
                  type="button"
                  data-ocid="os.files.retry_button"
                  onClick={() => {
                    void foldersQuery.refetch();
                    void filesQuery.refetch();
                  }}
                  className="os-focus-ring inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-smooth hover:opacity-90"
                >
                  Try again
                </button>
              </div>
            ) : childFolders.length === 0 && visibleFiles.length === 0 ? (
              <div
                data-ocid="os.files.empty_state"
                className="file-dropzone flex flex-col items-center gap-3 px-6 py-12 text-center"
              >
                <FolderOpen
                  className="size-8 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="font-display text-base font-medium text-foreground">
                  {query.trim() === ""
                    ? "This folder is empty"
                    : "No files match your search"}
                </p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  {query.trim() === ""
                    ? "Upload a file or create a folder to start organizing the Nation's records."
                    : "Try a different search term, or clear the search to see everything here."}
                </p>
              </div>
            ) : preference.view === "grid" ? (
              <FileGrid
                folders={childFolders}
                files={visibleFiles}
                readOnly={readOnly}
                renamingFolder={renamingFolder}
                renameValue={renameValue}
                onRenameValueChange={setRenameValue}
                onSubmitFolderRename={handleRenameFolder}
                onCancelRename={() => setRenamingFolder(null)}
                onOpenFolder={(folder) => setCurrentFolder(folder.id)}
                onRenameFolder={(folder) => {
                  setRenamingFolder(folder.id);
                  setRenameValue(folder.name);
                }}
                onMoveFolder={(folder) =>
                  setPendingMove({ kind: "folder", folder })
                }
                onDeleteFolder={(folder) =>
                  setPendingDelete({ kind: "folder", folder })
                }
                renamingFile={renamingFile}
                fileRenameValue={fileRenameValue}
                onFileRenameValueChange={setFileRenameValue}
                onSubmitFileRename={handleRenameFile}
                onOpenFile={setPreviewFile}
                onRenameFile={(file) => {
                  setRenamingFile(file.id);
                  setFileRenameValue(file.name);
                }}
                onMoveFile={(file) => setPendingMove({ kind: "file", file })}
                onDeleteFile={(file) =>
                  setPendingDelete({ kind: "file", file })
                }
              />
            ) : (
              <FileList
                folders={childFolders}
                files={visibleFiles}
                readOnly={readOnly}
                renamingFolder={renamingFolder}
                renameValue={renameValue}
                onRenameValueChange={setRenameValue}
                onSubmitFolderRename={handleRenameFolder}
                onCancelRename={() => setRenamingFolder(null)}
                onOpenFolder={(folder) => setCurrentFolder(folder.id)}
                onRenameFolder={(folder) => {
                  setRenamingFolder(folder.id);
                  setRenameValue(folder.name);
                }}
                onMoveFolder={(folder) =>
                  setPendingMove({ kind: "folder", folder })
                }
                onDeleteFolder={(folder) =>
                  setPendingDelete({ kind: "folder", folder })
                }
                renamingFile={renamingFile}
                fileRenameValue={fileRenameValue}
                onFileRenameValueChange={setFileRenameValue}
                onSubmitFileRename={handleRenameFile}
                onOpenFile={setPreviewFile}
                onRenameFile={(file) => {
                  setRenamingFile(file.id);
                  setFileRenameValue(file.name);
                }}
                onMoveFile={(file) => setPendingMove({ kind: "file", file })}
                onDeleteFile={(file) =>
                  setPendingDelete({ kind: "file", file })
                }
              />
            )}

            <div
              data-ocid="os.files.dropzone"
              onDragOver={(event) => {
                event.preventDefault();
                if (!readOnly) setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragActive(false);
                if (!readOnly) handleFilesPicked(event.dataTransfer.files);
              }}
              className={`file-dropzone flex items-center justify-center gap-2 px-4 py-4 text-center text-xs text-muted-foreground ${dragActive ? "file-dropzone-active" : ""}`}
            >
              <Upload className="size-4" aria-hidden="true" />
              {readOnly
                ? "Uploads are disabled in the sample Nation"
                : "Drag files here to upload"}
            </div>
          </div>
        </div>
      </div>

      {previewFile ? (
        <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} />
      ) : null}

      <ConfirmDialog
        open={pendingDelete !== null}
        ocid="os.files.delete_dialog"
        title={
          pendingDelete?.kind === "folder"
            ? "Delete this folder?"
            : "Delete this file?"
        }
        description={
          pendingDelete?.kind === "folder"
            ? `“${pendingDelete.folder.name}” and everything inside it will be removed. This cannot be undone.`
            : pendingDelete
              ? `“${pendingDelete.file.name}” will be removed. This cannot be undone.`
              : ""
        }
        confirmLabel="Delete"
        pending={deletePending}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <MoveDialog
        open={pendingMove !== null}
        itemName={
          pendingMove?.kind === "folder"
            ? pendingMove.folder.name
            : (pendingMove?.file.name ?? "")
        }
        folders={folders}
        currentParent={
          pendingMove?.kind === "folder"
            ? (pendingMove.folder.parent ?? null)
            : (pendingMove?.file.folder ?? null)
        }
        movingFolderId={
          pendingMove?.kind === "folder" ? pendingMove.folder.id : null
        }
        pending={movePending}
        onMove={handleMove}
        onCancel={() => setPendingMove(null)}
      />
    </>
  );
}
