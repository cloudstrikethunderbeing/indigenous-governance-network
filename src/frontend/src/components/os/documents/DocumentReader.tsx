import { Lock, Share2 } from "lucide-react";

import RecordAttachments from "@/components/os/attachments/RecordAttachments";
import { documentTarget } from "@/components/os/attachments/attachmentTargets";
import { sampleAttachmentsFor } from "@/components/os/attachments/sampleAttachments";
import {
  type LibraryDocument,
  categoryFor,
} from "@/components/os/documents/documentLibrary";

/**
 * The document reader: the full readable body of the selected record, with its
 * category, author, last-updated date and community-controlled sharing intent.
 * The record can reference the Nation's stored files through the shared
 * attachments surface.
 */
export default function DocumentReader({
  document,
  nation,
  readOnly,
  onClose,
}: {
  document: LibraryDocument;
  nation: bigint;
  readOnly: boolean;
  onClose: () => void;
}) {
  const category = categoryFor(document.category);
  const target = documentTarget(BigInt(document.id));

  return (
    <article
      data-ocid={`os.documents.reader.${document.id}`}
      aria-label={`${document.title} — document reader`}
      className="shell-panel space-y-4 p-5"
    >
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="network-chip">{category.label}</span>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            {document.sharedWithNetwork ? (
              <Share2 className="size-3.5" aria-hidden="true" />
            ) : (
              <Lock className="size-3.5" aria-hidden="true" />
            )}
            {document.sharedWithNetwork
              ? "Shared with the SOVEREIGN Network"
              : "Private to Nation members"}
          </span>
        </div>
        <h3 className="font-display text-xl font-medium tracking-tight text-foreground">
          {document.title}
        </h3>
        <p className="text-xs text-muted-foreground">
          {document.author} · Updated {document.updated}
        </p>
        <div className="rule-accent" />
      </header>

      <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
        {document.body}
      </p>

      <RecordAttachments
        nation={nation}
        target={target}
        readOnly={readOnly}
        sampleAttachments={sampleAttachmentsFor(target)}
      />

      <button
        type="button"
        data-ocid={`os.documents.close_reader.${document.id}`}
        onClick={onClose}
        className="os-focus-ring inline-flex min-h-11 items-center rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground transition-smooth hover:bg-muted"
      >
        Back to library
      </button>
    </article>
  );
}
