import { Info, Paperclip, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import type { FileAttachmentTarget, NationFile, NationId } from "@/backend";
import AttachmentList, {
  type AttachmentView,
  AttachmentHeading,
  attachmentViewFromSample,
  attachmentViewFromStored,
} from "@/components/os/attachments/AttachmentList";
import AttachmentPicker from "@/components/os/attachments/AttachmentPicker";
import SampleFilePreview from "@/components/os/attachments/SampleFilePreview";
import type { SampleAttachment } from "@/components/os/attachments/sampleAttachments";
import FilePreview from "@/components/os/files/FilePreview";
import { fileErrorMessage } from "@/components/os/files/fileUtils";
import {
  useAttachFileToTarget,
  useDetachFile,
  useFileAttachments,
  useNationFiles,
} from "@/hooks/useSovereign";

/**
 * The attachments section for one referencing record. It is the single shared
 * surface used by Governance, Discussions, Projects, Calendar and Documents, so
 * every app references the same stored files instead of creating copies.
 *
 * For a real Nation an authorized member can attach an existing stored file or
 * detach one; the file opens through the Files preview. In the sample Nation
 * the attachments are fictional and read-only, and the section says so plainly.
 */
export default function RecordAttachments({
  nation,
  target,
  readOnly,
  sampleAttachments,
  heading = "Attached files",
}: {
  nation: NationId;
  target: FileAttachmentTarget;
  readOnly: boolean;
  sampleAttachments: SampleAttachment[];
  heading?: string;
}) {
  const attachmentsQuery = useFileAttachments(nation, target);
  const filesQuery = useNationFiles(nation, null);
  const attach = useAttachFileToTarget();
  const detach = useDetachFile();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<NationFile | null>(null);
  const [previewSample, setPreviewSample] = useState<SampleAttachment | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const filesById = useMemo(() => {
    const map = new Map<string, NationFile>();
    for (const file of filesQuery.data ?? []) {
      map.set(file.id.toString(), file);
    }
    return map;
  }, [filesQuery.data]);

  const views = useMemo<AttachmentView[]>(() => {
    if (readOnly) {
      return sampleAttachments.map(attachmentViewFromSample);
    }
    return (attachmentsQuery.data ?? []).map((attachment) =>
      attachmentViewFromStored(
        attachment,
        filesById.get(attachment.file.toString()) ?? null,
      ),
    );
  }, [readOnly, sampleAttachments, attachmentsQuery.data, filesById]);

  const attachedFileIds = useMemo(() => {
    const ids = new Set<string>();
    for (const attachment of attachmentsQuery.data ?? []) {
      ids.add(attachment.file.toString());
    }
    return ids;
  }, [attachmentsQuery.data]);

  function handleOpen(attachment: AttachmentView) {
    if (attachment.file) {
      setPreviewFile(attachment.file);
      return;
    }
    const sample = sampleAttachments.find(
      (entry) => entry.id === attachment.key,
    );
    if (sample) setPreviewSample(sample);
  }

  function handlePick(file: NationFile) {
    setError(null);
    attach.mutate(
      { nation, file: file.id, target },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "ok") setPickerOpen(false);
          else setError(fileErrorMessage(result.err));
        },
        onError: () => setError("The file could not be attached."),
      },
    );
  }

  function handleDetach(attachment: AttachmentView) {
    if (!attachment.attachment) return;
    setError(null);
    detach.mutate(
      { nation, attachment: attachment.attachment.id },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "err") setError(fileErrorMessage(result.err));
        },
        onError: () => setError("The file could not be detached."),
      },
    );
  }

  return (
    <section
      data-ocid="os.attachments.section"
      aria-label={heading}
      className="space-y-3 border-t border-border pt-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <AttachmentHeading count={views.length} />
        {readOnly ? null : (
          <button
            type="button"
            data-ocid="os.attachments.attach_button"
            onClick={() => setPickerOpen(true)}
            className="os-focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-smooth hover:bg-muted"
          >
            <Plus className="size-4" aria-hidden="true" />
            Attach file
          </button>
        )}
      </div>

      {readOnly ? (
        <p
          data-ocid="os.attachments.readonly_notice"
          className="flex items-start gap-2 rounded-md border border-dashed border-accent bg-accent/10 px-3 py-2 text-xs leading-relaxed text-accent-foreground"
        >
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            These attachments are fictional sample data. Visitors can open them,
            but attaching or detaching files is disabled in the sample Nation —
            deploy your own Nation to manage attachments.
          </span>
        </p>
      ) : null}

      {error ? (
        <p
          data-ocid="os.attachments.error_state"
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      <AttachmentList
        attachments={views}
        readOnly={readOnly}
        onOpen={handleOpen}
        onDetach={handleDetach}
        detachingId={detach.isPending ? "pending" : null}
      />

      {!readOnly && views.length === 0 ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Paperclip className="size-3.5" aria-hidden="true" />
          Attach an existing stored file to reference it from this record.
        </p>
      ) : null}

      {pickerOpen ? (
        <AttachmentPicker
          nation={nation}
          attachedFileIds={attachedFileIds}
          pending={attach.isPending}
          onPick={handlePick}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}

      {previewFile ? (
        <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} />
      ) : null}

      {previewSample ? (
        <SampleFilePreview
          file={previewSample.file}
          onClose={() => setPreviewSample(null)}
        />
      ) : null}
    </section>
  );
}
