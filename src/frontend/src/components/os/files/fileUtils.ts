import type { FileError, NationFile } from "@/backend";

/** How a stored file is presented: its icon family and preview behaviour. */
export type FileKind = "image" | "pdf" | "doc" | "other";

/** Classify a file by its stored content type, falling back to its name. */
export function fileKind(file: NationFile): FileKind {
  const type = file.contentType.toLowerCase();
  const name = file.name.toLowerCase();
  if (type.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg|bmp)$/.test(name))
    return "image";
  if (type === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (type.startsWith("text/") || /\.(txt|md|docx?|csv|json|rtf)$/.test(name))
    return "doc";
  return "other";
}

/** Whether a file can be rendered in the inline preview. */
export function isPreviewable(file: NationFile): boolean {
  const kind = fileKind(file);
  return kind === "image" || kind === "pdf";
}

/** Human-readable byte size. */
export function formatBytes(bytes: bigint): string {
  const value = Number(bytes);
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1024 * 1024 * 1024)
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  return `${(value / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/** A plain-language message for a failed file operation. */
export function fileErrorMessage(error: FileError): string {
  switch (error) {
    case "notAuthorized":
      return "You do not have permission to change files in this Nation.";
    case "notNationMember":
      return "Only Nation members can change files here.";
    case "sampleReadOnly":
      return "The sample Nation is read-only. Deploy your own Nation to store files.";
    case "duplicateName":
      return "A folder or file with that name already exists here.";
    case "folderNotEmpty":
      return "That folder still contains items. Empty it before deleting.";
    case "invalidMove":
      return "That move is not allowed.";
    case "missingName":
      return "Enter a name first.";
    case "nameTooLong":
      return "That name is too long. Try a shorter one.";
    case "crossNationAccess":
      return "That item belongs to another Nation.";
    case "unknownFolder":
      return "That folder no longer exists.";
    case "unknownFile":
      return "That file no longer exists.";
    default:
      return "The change could not be saved. Please try again.";
  }
}

/** The two ways the file area can be laid out. */
export type FilesView = "grid" | "list";

/** The fields a file list can be sorted by. */
export type FilesSort = "name" | "date" | "size";

/** The sort direction. */
export type SortDirection = "asc" | "desc";

/** A user's persisted Files display preference. */
export interface FilesPreference {
  view: FilesView;
  sort: FilesSort;
  direction: SortDirection;
}

export const defaultFilesPreference: FilesPreference = {
  view: "grid",
  sort: "name",
  direction: "asc",
};

const PREFERENCE_KEY = "sovereign.os.files.preference";

/** Read the stored Files display preference, falling back to the default. */
export function readFilesPreference(): FilesPreference {
  if (typeof window === "undefined") return defaultFilesPreference;
  try {
    const raw = window.localStorage.getItem(PREFERENCE_KEY);
    if (!raw) return defaultFilesPreference;
    const parsed = JSON.parse(raw) as Partial<FilesPreference>;
    return {
      view: parsed.view === "list" ? "list" : "grid",
      sort:
        parsed.sort === "date" || parsed.sort === "size" ? parsed.sort : "name",
      direction: parsed.direction === "desc" ? "desc" : "asc",
    };
  } catch {
    return defaultFilesPreference;
  }
}

/** Persist the Files display preference so it survives navigation. */
export function writeFilesPreference(preference: FilesPreference): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFERENCE_KEY, JSON.stringify(preference));
  } catch {
    // A storage failure never blocks the in-memory preference.
  }
}

/** Compare two files by the chosen field and direction. */
export function compareFiles(
  a: NationFile,
  b: NationFile,
  sort: FilesSort,
  direction: SortDirection,
): number {
  const sign = direction === "asc" ? 1 : -1;
  if (sort === "size") {
    if (a.size === b.size) return a.name.localeCompare(b.name);
    return a.size < b.size ? -sign : sign;
  }
  if (sort === "date") {
    if (a.timestamp === b.timestamp) return a.name.localeCompare(b.name);
    return a.timestamp < b.timestamp ? -sign : sign;
  }
  return a.name.localeCompare(b.name) * sign;
}

/** Whether a file matches a free-text search query. */
export function fileMatchesQuery(file: NationFile, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (needle === "") return true;
  return (
    file.name.toLowerCase().includes(needle) ||
    file.contentType.toLowerCase().includes(needle)
  );
}
