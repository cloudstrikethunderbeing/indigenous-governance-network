import { AlertCircle, Eye, EyeOff, Flag, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

import { CommentModerationStatus } from "@/backend";
import { useModerateComment, usePublicComments } from "@/hooks/useQueries";

import { formatTimestamp } from "./leadFormat";

/** A single comment card with its moderation status and controls. */
function CommentCard({
  comment,
  index,
}: {
  comment: {
    id: bigint;
    displayName?: string;
    body: string;
    moderationStatus: CommentModerationStatus;
    timestamp: bigint;
    reported: boolean;
  };
  index: number;
}) {
  const moderate = useModerateComment();

  const statusLabel =
    comment.moderationStatus === CommentModerationStatus.visible
      ? "Visible"
      : comment.moderationStatus === CommentModerationStatus.hidden
        ? "Hidden"
        : "Removed";

  const statusClass =
    comment.moderationStatus === CommentModerationStatus.visible
      ? "status-won"
      : comment.moderationStatus === CommentModerationStatus.hidden
        ? "status-progress"
        : "status-closed";

  return (
    <li
      data-ocid={`engagement.moderation.item.${index}`}
      className={`comment-card ${comment.reported ? "comment-reported" : ""} ${
        comment.moderationStatus === CommentModerationStatus.hidden
          ? "comment-hidden"
          : ""
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">
            {comment.displayName?.trim() || "Anonymous visitor"}
          </p>
          <p className="text-tabular text-xs text-muted-foreground">
            {formatTimestamp(comment.timestamp)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {comment.reported ? (
            <span
              data-ocid={`engagement.moderation.reported_badge.${index}`}
              className="status-chip status-progress"
            >
              <Flag className="size-3" aria-hidden="true" />
              Reported
            </span>
          ) : null}
          <span
            data-ocid={`engagement.moderation.status_chip.${index}`}
            className={`status-chip ${statusClass}`}
          >
            {statusLabel}
          </span>
        </div>
      </div>

      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
        {comment.body}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {comment.moderationStatus === CommentModerationStatus.visible ? (
          <button
            type="button"
            data-ocid={`engagement.moderation.hide_button.${index}`}
            disabled={moderate.isPending}
            onClick={() =>
              moderate.mutate({
                commentId: comment.id,
                status: CommentModerationStatus.hidden,
              })
            }
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-smooth hover:border-primary/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60"
          >
            <EyeOff className="size-3.5" aria-hidden="true" />
            Hide
          </button>
        ) : (
          <button
            type="button"
            data-ocid={`engagement.moderation.restore_button.${index}`}
            disabled={moderate.isPending}
            onClick={() =>
              moderate.mutate({
                commentId: comment.id,
                status: CommentModerationStatus.visible,
              })
            }
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-smooth hover:border-primary/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60"
          >
            <Eye className="size-3.5" aria-hidden="true" />
            Restore
          </button>
        )}
        <button
          type="button"
          data-ocid={`engagement.moderation.remove_button.${index}`}
          disabled={moderate.isPending}
          onClick={() =>
            moderate.mutate({
              commentId: comment.id,
              status: CommentModerationStatus.removed,
            })
          }
          className="inline-flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-1.5 text-xs font-medium text-destructive transition-smooth hover:bg-destructive/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60"
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
          Remove
        </button>
        {moderate.isError ? (
          <span
            data-ocid={`engagement.moderation.error.${index}`}
            role="alert"
            className="text-xs font-medium text-destructive"
          >
            Moderation failed.
          </span>
        ) : null}
      </div>
    </li>
  );
}

/**
 * Public Participation & Moderation — the recorded public comments with their
 * moderation status and report counts, hide/remove controls, and a review of
 * reported comments.
 */
export default function ModerationSection() {
  const { data, isLoading, isError } = usePublicComments();
  const [reportedOnly, setReportedOnly] = useState(false);

  if (isLoading) {
    return (
      <output
        data-ocid="engagement.moderation.loading_state"
        className="flex items-center gap-2 text-sm text-muted-foreground"
      >
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Loading public comments…
      </output>
    );
  }

  if (isError || !data) {
    return (
      <p
        data-ocid="engagement.moderation.error_state"
        role="alert"
        className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
      >
        <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
        Public comments could not be loaded. Please try again.
      </p>
    );
  }

  const reportedCount = data.filter((comment) => comment.reported).length;
  const visible = reportedOnly
    ? data.filter((comment) => comment.reported)
    : data;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          <span className="text-tabular font-medium text-foreground">
            {data.length}
          </span>{" "}
          {data.length === 1 ? "comment" : "comments"} recorded,{" "}
          <span className="text-tabular font-medium text-foreground">
            {reportedCount}
          </span>{" "}
          reported.
        </p>
        <button
          type="button"
          data-ocid="engagement.moderation.reported_filter"
          aria-pressed={reportedOnly}
          onClick={() => setReportedOnly((current) => !current)}
          className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition-smooth focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
            reportedOnly
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-foreground hover:border-primary/50"
          }`}
        >
          <Flag className="size-3.5" aria-hidden="true" />
          Reported only
        </button>
      </div>

      {visible.length === 0 ? (
        <p
          data-ocid="engagement.moderation.empty_state"
          className="rounded-lg border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground"
        >
          {reportedOnly
            ? "No comments have been reported."
            : "No public comments have been recorded yet."}
        </p>
      ) : (
        <ul data-ocid="engagement.moderation.list" className="space-y-3">
          {visible.map((comment, index) => (
            <CommentCard
              key={comment.id.toString()}
              comment={comment}
              index={index + 1}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
