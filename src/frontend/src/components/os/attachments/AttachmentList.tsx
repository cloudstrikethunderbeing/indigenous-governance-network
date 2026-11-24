import { FileText, Lock, Paperclip, X } from "lucide-react";

import type { FileAttachment, NationFile } from "@/backend";
import type { SampleAttachment } from "@/components/os/attachments/sampleAttachments";
import { formatBytes } from "@/components/os/files/fileUtils";

/** One attachment as the list presents it, real or fictional. */
export interface AttachmentView {
  /** A stable key for the row. */
  key: string;
  /** The stored file's display name. */
  name: string;
  /** The stored file's content type. */
  contentType: string;
  /** The stored file's size in bytes. */
  size: bigint;
  /** The real stored file, when this attachment references one. */
  file: NationFile | null;
  /** The real attachment link, when this is a stored attachment. */
  attachment: FileAttachment | null;
}

/** Build a view row from a real stored attachment and its resolved file. */
export function attachmentViewFromStored(
  attachment: FileAttachment,
  file: NationFile | null,
): AttachmentView {
  return {
    key: attachment.id.toString(),
    name: file?.name ?? "Stored file",
    contentType: file?.contentType ?? "application/octet-stream",
    size: file?.size ?? 0n,
    file,
    attachment,
  };
}

/** Build a view row from a fictional sample attachment. */
export function attachmentViewFromSample(
  sample: SampleAttachment,
): AttachmentView {
  return {
    key: sample.id,
    name: sample.file.name,
    contentType: sample.file.contentType,
    size: BigInt(sample.file.size),
    file: null,
    attachment: null,
  };
}

/**
 * The attachments shown on a referencing record. Each row opens the same
 * stored file through the Files preview. In the sample Nation the rows are
 * fictional and read-only, and the list says so plainly.
 */
export default function AttachmentList({
  attachments,
  readOnly,
  onOpen,
  onDetach,
  detachingId,
}: {
  attachments: AttachmentView[];
  readOnly: boolean;
  onOpen: (attachment: AttachmentView) => void;
  onDetach: (attachment: AttachmentView) => void;
  detachingId: string | null;
}) {
  if (attachments.length === 0) {
    return (
      <p
        data-ocid="os.attachments.empty_state"
        className="text-xs text-muted-foreground"
      >
        No files attached yet.
      </p>
    );
  }

  return (
    <ul data-ocid="os.attachments.list" className="space-y-2">
      {attachments.map((attachment) => (
        <li
          key={attachment.key}
          data-ocid={`os.attachments.item.${attachment.key}`}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2"
        >
          <FileText
            className="size-4 shrink-0 text-accent"
            aria-hidden="true"
          />
          <button
            type="button"
            data-ocid={`os.attachments.open_button.${attachment.key}`}
            onClick={() => onOpen(attachment)}
            className="os-focus-ring min-w-0 flex-1 rounded-md text-left transition-smooth hover:text-primary"
          >
            <span className="block truncate text-sm font-medium text-foreground">
              {attachment.name}
            </span>
            <span className="block font-mono text-xs text-muted-foreground">
              {formatBytes(attachment.size)} ·{" "}
              {attachment.contentType || "unknown type"}
            </span>
          </button>
          {readOnly ? (
            <span
              data-ocid={`os.attachments.readonly_badge.${attachment.key}`}
              className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground"
            >
              <Lock className="size-3.5" aria-hidden="true" />
              Read-only
            </span>
          ) : (
            <button
              type="button"
              data-ocid={`os.attachments.detach_button.${attachment.key}`}
              aria-label={`Detach ${attachment.name}`}
              disabled={detachingId === attachment.key}
              onClick={() => onDetach(attachment)}
              className="os-focus-ring flex size-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-smooth hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

/** The section heading shared by every attachment surface. */
export function AttachmentHeading({ count }: { count: number }) {
  return (
    <span className="flex items-center gap-2">
      <Paperclip className="size-4 text-accent" aria-hidden="true" />
      <span className="text-stamp text-muted-foreground">
        Attached files{count > 0 ? ` (${count})` : ""}
      </span>
    </span>
  );
}
