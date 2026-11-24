import { FileText, HardDrive, Info } from "lucide-react";
import { useState } from "react";

import type { NationFile, NationId } from "@/backend";
import SampleFilePreview from "@/components/os/attachments/SampleFilePreview";
import {
  type SampleStoredFile,
  sampleStoredFiles,
} from "@/components/os/attachments/sampleAttachments";
import FilePreview from "@/components/os/files/FilePreview";
import { formatBytes } from "@/components/os/files/fileUtils";
import { useNationFiles } from "@/hooks/useSovereign";

/**
 * The Nation's stored files, shown alongside the Documents app's document
 * records so the same stored file is reachable from both places. A real Nation
 * lists its stored files and opens them through the Files preview; the sample
 * Nation lists its fictional stored files read-only.
 */
export default function StoredFilesPanel({
  nation,
  readOnly,
}: {
  nation: NationId;
  readOnly: boolean;
}) {
  const filesQuery = useNationFiles(nation, null);
  const [previewFile, setPreviewFile] = useState<NationFile | null>(null);
  const [previewSample, setPreviewSample] = useState<SampleStoredFile | null>(
    null,
  );

  const storedFiles = filesQuery.data ?? [];

  return (
    <section
      data-ocid="os.documents.stored_files"
      aria-label="Stored files"
      className="shell-panel space-y-3 p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <HardDrive className="size-4 text-accent" aria-hidden="true" />
          <span className="text-stamp text-muted-foreground">Stored files</span>
        </span>
        <span className="text-xs text-muted-foreground">
          {readOnly
            ? `${sampleStoredFiles.length} fictional files`
            : `${storedFiles.length} files`}
        </span>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        The Nation's stored files. Governance, Discussions, Projects and
        Calendar reference these same files, so a record and this library point
        at one stored copy.
      </p>

      {readOnly ? (
        <p
          data-ocid="os.documents.stored_files.readonly_notice"
          className="flex items-start gap-2 rounded-md border border-dashed border-accent bg-accent/10 px-3 py-2 text-xs leading-relaxed text-accent-foreground"
        >
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            These stored files are fictional sample data. Open any of them to
            see its details; deploy your own Nation to store and manage real
            files.
          </span>
        </p>
      ) : null}

      {readOnly ? (
        <ul data-ocid="os.documents.stored_files.list" className="space-y-2">
          {sampleStoredFiles.map((file) => (
            <li key={file.id}>
              <button
                type="button"
                data-ocid={`os.documents.stored_file.${file.id}`}
                onClick={() => setPreviewSample(file)}
                className="os-focus-ring flex w-full min-h-[44px] items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 text-left transition-smooth hover:border-primary/50"
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
                    {formatBytes(BigInt(file.size))} · {file.contentType}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : filesQuery.isLoading ? (
        <p
          data-ocid="os.documents.stored_files.loading_state"
          className="text-sm text-muted-foreground"
        >
          Loading the Nation's stored files…
        </p>
      ) : filesQuery.isError ? (
        <p
          data-ocid="os.documents.stored_files.error_state"
          role="alert"
          className="text-sm text-destructive"
        >
          The stored files could not be loaded. Please try again.
        </p>
      ) : storedFiles.length === 0 ? (
        <p
          data-ocid="os.documents.stored_files.empty_state"
          className="text-sm text-muted-foreground"
        >
          This Nation has no stored files yet. Upload a file in the Files app
          and it will appear here.
        </p>
      ) : (
        <ul data-ocid="os.documents.stored_files.list" className="space-y-2">
          {storedFiles.map((file) => (
            <li key={file.id.toString()}>
              <button
                type="button"
                data-ocid={`os.documents.stored_file.${file.id}`}
                onClick={() => setPreviewFile(file)}
                className="os-focus-ring flex w-full min-h-[44px] items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 text-left transition-smooth hover:border-primary/50"
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
              </button>
            </li>
          ))}
        </ul>
      )}

      {previewFile ? (
        <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} />
      ) : null}

      {previewSample ? (
        <SampleFilePreview
          file={previewSample}
          onClose={() => setPreviewSample(null)}
        />
      ) : null}
    </section>
  );
}
