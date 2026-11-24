import type { FileAttachmentTarget } from "@/backend";
import { targetKey } from "@/components/os/attachments/attachmentTargets";

/**
 * Fictional attachments for the built-in Sample Nation.
 *
 * The sample Nation is read-only and the backend seeds no stored files for it,
 * so its attachments are illustrative sample data. Each entry names a stored
 * file from the sample library so the same file is reachable from the record
 * that references it and from the Documents app. Nothing here is persisted and
 * no figure represents a real community or file.
 */

/** A fictional stored file referenced by a sample attachment. */
export interface SampleStoredFile {
  /** Matches the sample document id in the shared sample library. */
  id: number;
  name: string;
  contentType: string;
  size: number;
}

/** The fictional stored files the sample attachments point at. */
export const sampleStoredFiles: SampleStoredFile[] = [
  {
    id: 1,
    name: "community-data-control-charter.pdf",
    contentType: "application/pdf",
    size: 184_320,
  },
  {
    id: 2,
    name: "water-rights-research-brief.pdf",
    contentType: "application/pdf",
    size: 262_144,
  },
  {
    id: 3,
    name: "spring-gathering-notes.txt",
    contentType: "text/plain",
    size: 8_192,
  },
];

/** One fictional attachment shown on a sample record. */
export interface SampleAttachment {
  /** A stable id for the fictional attachment. */
  id: string;
  /** The stored file this attachment references. */
  file: SampleStoredFile;
  /** The record the file is attached to. */
  target: FileAttachmentTarget;
}

/** Look up a fictional stored file by its sample document id. */
export function sampleStoredFile(id: number): SampleStoredFile | null {
  return sampleStoredFiles.find((file) => file.id === id) ?? null;
}

/**
 * The fictional attachments, keyed by their target. The sample Nation's
 * proposals, discussion posts, projects, events and documents each reference
 * one of the shared sample files.
 */
const sampleAttachmentsByTarget: Record<string, SampleAttachment[]> = {};

function register(
  target: FileAttachmentTarget,
  fileId: number,
  attachmentId: string,
) {
  const file = sampleStoredFile(fileId);
  if (!file) return;
  const key = targetKey(target);
  const existing = sampleAttachmentsByTarget[key] ?? [];
  existing.push({ id: attachmentId, file, target });
  sampleAttachmentsByTarget[key] = existing;
}

// Governance proposals (sample proposal ids 1–4).
register({ __kind__: "proposal", proposal: 1n }, 1, "sample-att-1");
register({ __kind__: "proposal", proposal: 2n }, 2, "sample-att-2");
// Discussion posts (sample post ids 1–3).
register({ __kind__: "discussionPost", discussionPost: 1n }, 1, "sample-att-3");
register({ __kind__: "discussionPost", discussionPost: 2n }, 2, "sample-att-4");
// Projects (sample project ids 1–3).
register({ __kind__: "project", project: 1n }, 2, "sample-att-5");
register({ __kind__: "project", project: 2n }, 1, "sample-att-6");
// Calendar events (sample event ids 1–3).
register({ __kind__: "calendarEvent", calendarEvent: 1n }, 1, "sample-att-7");
register({ __kind__: "calendarEvent", calendarEvent: 3n }, 3, "sample-att-8");
// Documents (sample document ids 1–3).
register({ __kind__: "document", document: 1n }, 1, "sample-att-9");
register({ __kind__: "document", document: 2n }, 2, "sample-att-10");
register({ __kind__: "document", document: 3n }, 3, "sample-att-11");

/** The fictional attachments for a target, or an empty list. */
export function sampleAttachmentsFor(
  target: FileAttachmentTarget,
): SampleAttachment[] {
  return sampleAttachmentsByTarget[targetKey(target)] ?? [];
}
