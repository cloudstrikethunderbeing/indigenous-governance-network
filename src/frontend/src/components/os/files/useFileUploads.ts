import { ExternalBlob } from "@caffeineai/object-storage";
import { useCallback, useRef, useState } from "react";

import type { FileError, NationFolderId, NationId } from "@/backend";
import { fileErrorMessage } from "@/components/os/files/fileUtils";
import { useCreateNationFile } from "@/hooks/useSovereign";

/** The lifecycle state of one queued upload. */
export type UploadStatus = "pending" | "uploading" | "done" | "error";

/** One file in the upload queue, with its own progress and error state. */
export interface UploadItem {
  /** A stable id for the queue entry (name + index at enqueue time). */
  id: string;
  file: File;
  status: UploadStatus;
  progress: number;
  error: string | null;
}

/**
 * Manage multi-file uploads with per-file progress and a retry path. A failed
 * upload is marked in the queue and never leaves a phantom entry in the file
 * list, because the file record is only created once its bytes are stored.
 */
export function useFileUploads(
  nation: NationId,
  folder: NationFolderId | null,
) {
  const createFile = useCreateNationFile();
  const [items, setItems] = useState<UploadItem[]>([]);
  const counter = useRef(0);

  const update = useCallback((id: string, patch: Partial<UploadItem>) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }, []);

  const runUpload = useCallback(
    async (item: UploadItem) => {
      update(item.id, { status: "uploading", progress: 0, error: null });
      try {
        const bytes = new Uint8Array(await item.file.arrayBuffer());
        const blob = ExternalBlob.fromBytes(
          bytes,
          item.file.type || "application/octet-stream",
          item.file.name,
        ).withUploadProgress((pct) => update(item.id, { progress: pct }));

        const result = await createFile.mutateAsync({
          nation,
          folder,
          name: item.file.name,
          size: BigInt(item.file.size),
          contentType: item.file.type || "application/octet-stream",
          content: blob,
        });

        if (result.__kind__ === "err") {
          update(item.id, {
            status: "error",
            error: fileErrorMessage(result.err as FileError),
          });
        } else {
          update(item.id, { status: "done", progress: 100 });
        }
      } catch {
        update(item.id, {
          status: "error",
          error: "The upload failed. Check your connection and try again.",
        });
      }
    },
    [createFile, nation, folder, update],
  );

  /** Queue and start uploading a set of files. */
  const enqueue = useCallback(
    (files: File[]) => {
      if (files.length === 0) return;
      const queued: UploadItem[] = files.map((file) => {
        counter.current += 1;
        return {
          id: `upload-${counter.current}`,
          file,
          status: "pending",
          progress: 0,
          error: null,
        };
      });
      setItems((current) => [...current, ...queued]);
      for (const item of queued) void runUpload(item);
    },
    [runUpload],
  );

  /** Retry a single failed upload. */
  const retry = useCallback(
    (id: string) => {
      const item = items.find((entry) => entry.id === id);
      if (item) void runUpload(item);
    },
    [items, runUpload],
  );

  /** Remove a finished or failed entry from the queue. */
  const dismiss = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  /** Clear every completed entry. */
  const clearCompleted = useCallback(() => {
    setItems((current) => current.filter((item) => item.status !== "done"));
  }, []);

  const active = items.some(
    (item) => item.status === "pending" || item.status === "uploading",
  );

  return {
    items,
    enqueue,
    retry,
    dismiss,
    clearCompleted,
    active,
  };
}
