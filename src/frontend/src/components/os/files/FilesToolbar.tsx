import {
  ArrowDownAZ,
  ArrowUpAZ,
  ChevronRight,
  FolderUp,
  LayoutGrid,
  List,
  Search,
  Upload,
} from "lucide-react";
import { useRef } from "react";

import type { NationFolder } from "@/backend";
import type {
  FilesSort,
  FilesView,
  SortDirection,
} from "@/components/os/files/fileUtils";

const sortLabels: Record<FilesSort, string> = {
  name: "Name",
  date: "Date",
  size: "Size",
};

/**
 * The Files toolbar: breadcrumb navigation, a search field, the grid/list view
 * toggle, the sort control, and the upload and folder-import actions.
 */
export default function FilesToolbar({
  breadcrumb,
  currentFolder,
  onNavigate,
  query,
  onQueryChange,
  view,
  onViewChange,
  sort,
  direction,
  onSortChange,
  onToggleDirection,
  onUploadClick,
  onImportFolderClick,
  uploadDisabled,
  importSupported,
}: {
  breadcrumb: NationFolder[];
  currentFolder: bigint | null;
  onNavigate: (folder: bigint | null) => void;
  query: string;
  onQueryChange: (value: string) => void;
  view: FilesView;
  onViewChange: (view: FilesView) => void;
  sort: FilesSort;
  direction: SortDirection;
  onSortChange: (sort: FilesSort) => void;
  onToggleDirection: () => void;
  onUploadClick: () => void;
  onImportFolderClick: () => void;
  uploadDisabled: boolean;
  importSupported: boolean;
}) {
  const searchRef = useRef<HTMLInputElement>(null);

  return (
    <div className="file-toolbar flex flex-col gap-2 px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <nav
          aria-label="Current folder"
          className="flex min-w-0 flex-1 flex-wrap items-center gap-0.5"
        >
          <button
            type="button"
            data-ocid="os.files.breadcrumb_root"
            onClick={() => onNavigate(null)}
            className={`file-breadcrumb ${currentFolder === null ? "file-breadcrumb-current" : ""}`}
          >
            All files
          </button>
          {breadcrumb.map((folder) => (
            <span
              key={folder.id.toString()}
              className="flex items-center gap-0.5"
            >
              <ChevronRight
                className="size-3.5 text-muted-foreground"
                aria-hidden="true"
              />
              <button
                type="button"
                data-ocid={`os.files.breadcrumb.${folder.id}`}
                onClick={() => onNavigate(folder.id)}
                className={`file-breadcrumb ${currentFolder === folder.id ? "file-breadcrumb-current" : ""}`}
              >
                {folder.name}
              </button>
            </span>
          ))}
        </nav>

        <button
          type="button"
          data-ocid="os.files.upload_button"
          onClick={onUploadClick}
          disabled={uploadDisabled}
          className="os-focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-smooth hover:opacity-90 disabled:opacity-60"
        >
          <Upload className="size-4" aria-hidden="true" />
          Upload
        </button>
        <button
          type="button"
          data-ocid="os.files.import_folder_button"
          onClick={onImportFolderClick}
          disabled={uploadDisabled || !importSupported}
          title={
            importSupported
              ? "Import a folder from your device"
              : "Folder import is not supported by this browser"
          }
          className="os-focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-smooth hover:bg-muted disabled:opacity-60"
        >
          <FolderUp className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Import folder</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="relative flex min-w-0 flex-1 items-center">
          <Search
            className="pointer-events-none absolute left-3 size-4 text-muted-foreground"
            aria-hidden="true"
          />
          <span className="sr-only">Search files</span>
          <input
            ref={searchRef}
            type="search"
            value={query}
            data-ocid="os.files.search_input"
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search files in this folder"
            className="min-h-[44px] w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>

        <fieldset
          aria-label="Sort files"
          className="flex items-center gap-1 rounded-lg border border-border bg-card p-0.5"
        >
          <legend className="sr-only">Sort files</legend>
          {(Object.keys(sortLabels) as FilesSort[]).map((key) => (
            <button
              key={key}
              type="button"
              data-ocid={`os.files.sort.${key}`}
              aria-pressed={sort === key}
              onClick={() => onSortChange(key)}
              className={`os-focus-ring min-h-[36px] rounded-md px-2.5 text-xs font-medium transition-smooth ${
                sort === key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {sortLabels[key]}
            </button>
          ))}
          <button
            type="button"
            data-ocid="os.files.sort_direction_button"
            aria-label={
              direction === "asc" ? "Sort descending" : "Sort ascending"
            }
            onClick={onToggleDirection}
            className="os-focus-ring flex size-9 items-center justify-center rounded-md text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground"
          >
            {direction === "asc" ? (
              <ArrowUpAZ className="size-4" aria-hidden="true" />
            ) : (
              <ArrowDownAZ className="size-4" aria-hidden="true" />
            )}
          </button>
        </fieldset>

        <fieldset
          aria-label="View"
          className="flex items-center gap-1 rounded-lg border border-border bg-card p-0.5"
        >
          <legend className="sr-only">View</legend>
          <button
            type="button"
            data-ocid="os.files.view.grid"
            aria-pressed={view === "grid"}
            aria-label="Grid view"
            onClick={() => onViewChange("grid")}
            className={`os-focus-ring flex size-9 items-center justify-center rounded-md transition-smooth ${
              view === "grid"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <LayoutGrid className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            data-ocid="os.files.view.list"
            aria-pressed={view === "list"}
            aria-label="List view"
            onClick={() => onViewChange("list")}
            className={`os-focus-ring flex size-9 items-center justify-center rounded-md transition-smooth ${
              view === "list"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <List className="size-4" aria-hidden="true" />
          </button>
        </fieldset>
      </div>
    </div>
  );
}
