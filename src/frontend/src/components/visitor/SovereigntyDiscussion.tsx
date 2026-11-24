import {
  CommentModerationStatus,
  type PublicComment,
  type VisitorSessionId,
} from "@/backend";
import { SignInButton } from "@/components/InternetIdentity";
import {
  usePublicComments,
  useReportComment,
  useSubmitPublicComment,
} from "@/hooks/useQueries";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { CheckCircle2, Flag, Loader2, MessageSquare } from "lucide-react";
import { type FormEvent, useId, useState } from "react";

const SESSION_STORAGE_KEY = "sovereign.visitor.session";

/**
 * A stable, anonymous visitor session id for this browser tab session.
 * It is a local visitor identifier only — never backend-owned data — so
 * sessionStorage is the correct home for it.
 */
function getVisitorSessionId(): VisitorSessionId {
  try {
    const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) return existing;
    const created =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, created);
    return created;
  } catch {
    return `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-smooth focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const labelClass = "text-stamp text-muted-foreground";

/** Format a backend nanosecond timestamp for display, with a safe fallback. */
function formatTimestamp(timestamp: bigint): string | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Only comments the backend marked visible are shown to visitors. */
function visibleComments(comments: PublicComment[]): PublicComment[] {
  return comments.filter(
    (comment) => comment.moderationStatus === CommentModerationStatus.visible,
  );
}

export default function SovereigntyDiscussion() {
  const { data: comments, isLoading, isError } = usePublicComments();
  const submitComment = useSubmitPublicComment();
  const reportComment = useReportComment();
  const { identity } = useInternetIdentity();

  const nameId = useId();
  const bodyId = useId();

  const [displayName, setDisplayName] = useState("");
  const [body, setBody] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [reportedIds, setReportedIds] = useState<bigint[]>([]);
  const [reportError, setReportError] = useState<string | null>(null);

  const signedIn = !!identity && !identity.getPrincipal().isAnonymous();
  const shown = visibleComments(comments ?? []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const trimmedBody = body.trim();
    if (trimmedBody === "") {
      setFormError("Please write a comment before submitting.");
      return;
    }

    const trimmedName = displayName.trim();
    const capturedBody = trimmedBody;
    const capturedName = trimmedName;

    // Clear the draft synchronously; restore it only if the save fails.
    setBody("");
    setDisplayName("");

    submitComment.mutate(
      {
        sessionId: getVisitorSessionId(),
        displayName: capturedName === "" ? null : capturedName,
        body: capturedBody,
      },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "ok") {
            setSubmitted(true);
            return;
          }
          setBody((current) => (current === "" ? capturedBody : current));
          setDisplayName((current) =>
            current === "" ? capturedName : current,
          );
          if (result.err === "missingBody") {
            setFormError("Please write a comment before submitting.");
          } else if (result.err === "bodyTooLong") {
            setFormError("Your comment is too long. Please shorten it.");
          } else if (result.err === "missingSessionId") {
            setFormError(
              "Your session could not be identified. Please reload and try again.",
            );
          } else {
            setFormError(
              "Your comment could not be submitted. Please try again.",
            );
          }
        },
        onError: () => {
          setBody((current) => (current === "" ? capturedBody : current));
          setDisplayName((current) =>
            current === "" ? capturedName : current,
          );
          setFormError(
            "Your comment could not be submitted. Please try again.",
          );
        },
      },
    );
  }

  function handleReport(commentId: bigint) {
    setReportError(null);
    reportComment.mutate(
      { sessionId: getVisitorSessionId(), commentId, reason: null },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "ok") {
            setReportedIds((current) =>
              current.includes(commentId) ? current : [...current, commentId],
            );
            return;
          }
          if (result.err === "alreadyReported") {
            setReportedIds((current) =>
              current.includes(commentId) ? current : [...current, commentId],
            );
            return;
          }
          setReportError(
            "This comment could not be reported. Please try again.",
          );
        },
        onError: () => {
          setReportError(
            "This comment could not be reported. Please try again.",
          );
        },
      },
    );
  }

  return (
    <section
      data-ocid="discussion.section"
      aria-labelledby="sovereignty-discussion-heading"
      className="space-y-6"
    >
      <div className="space-y-2">
        <p className="text-stamp text-accent">Public discussion</p>
        <h3
          id="sovereignty-discussion-heading"
          className="font-display text-xl font-medium tracking-tight text-foreground sm:text-2xl"
        >
          What does digital sovereignty mean to you?
        </h3>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Share your answer in your own words. No account is needed — you can
          post anonymously, or sign in with Internet Identity if you would like
          your identity recorded.
        </p>
      </div>

      {/* Submission form */}
      {submitted ? (
        <output
          data-ocid="discussion.success_state"
          className="flex items-start gap-3 rounded-lg border border-primary/40 bg-primary/5 px-5 py-4"
        >
          <CheckCircle2
            className="mt-0.5 size-5 shrink-0 text-primary"
            aria-hidden="true"
          />
          <p className="text-sm leading-relaxed text-foreground">
            Thank you — your comment has been recorded and will appear once it
            has been reviewed.
          </p>
        </output>
      ) : (
        <form
          data-ocid="discussion.form"
          onSubmit={handleSubmit}
          noValidate
          className="shell-panel space-y-4 p-5 sm:p-6"
        >
          <div className="space-y-2">
            <label htmlFor={nameId} className={labelClass}>
              Display name{" "}
              <span className="normal-case tracking-normal">(optional)</span>
            </label>
            <input
              id={nameId}
              data-ocid="discussion.name_input"
              type="text"
              name="displayName"
              autoComplete="nickname"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className={inputClass}
              placeholder="Leave blank to post anonymously"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor={bodyId} className={labelClass}>
              Your answer <span className="text-primary">*</span>
            </label>
            <textarea
              id={bodyId}
              data-ocid="discussion.textarea"
              name="body"
              rows={4}
              required
              value={body}
              onChange={(event) => setBody(event.target.value)}
              className={inputClass}
              placeholder="What does digital sovereignty mean to you?"
            />
          </div>

          {formError ? (
            <p
              data-ocid="discussion.error_state"
              role="alert"
              className="text-sm font-medium text-destructive"
            >
              {formError}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              data-ocid="discussion.submit_button"
              disabled={submitComment.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-smooth hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitComment.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              Submit comment
            </button>

            <div className="flex flex-col gap-1 sm:items-end">
              <span className="text-stamp text-muted-foreground">
                {signedIn ? "Identity recorded" : "Posting anonymously"}
              </span>
              <SignInButton className="text-xs font-medium text-primary underline-offset-2 transition-smooth hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" />
            </div>
          </div>
        </form>
      )}

      {/* Comment list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-stamp text-muted-foreground">
            Approved comments
          </h4>
          {shown.length > 0 ? (
            <span
              data-ocid="discussion.count"
              className="text-stamp text-muted-foreground"
            >
              {shown.length} {shown.length === 1 ? "comment" : "comments"}
            </span>
          ) : null}
        </div>

        {reportError ? (
          <p
            data-ocid="discussion.report_error_state"
            role="alert"
            className="text-sm font-medium text-destructive"
          >
            {reportError}
          </p>
        ) : null}

        {isLoading ? (
          <output
            data-ocid="discussion.loading_state"
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Loading comments…
          </output>
        ) : isError ? (
          <p
            data-ocid="discussion.list_error_state"
            role="alert"
            className="text-sm font-medium text-destructive"
          >
            Comments could not be loaded. Please try again later.
          </p>
        ) : shown.length === 0 ? (
          <div
            data-ocid="discussion.empty_state"
            className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center"
          >
            <MessageSquare
              className="size-6 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-foreground">
              No comments yet
            </p>
            <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
              Be the first to share what digital sovereignty means to you.
            </p>
          </div>
        ) : (
          <ul data-ocid="discussion.list" className="space-y-3">
            {shown.map((comment, index) => {
              const reported =
                comment.reported || reportedIds.includes(comment.id);
              const formatted = formatTimestamp(comment.timestamp);
              return (
                <li
                  key={comment.id.toString()}
                  data-ocid={`discussion.item.${index + 1}`}
                  className={`comment-card${reported ? " comment-reported" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {comment.displayName?.trim()
                          ? comment.displayName
                          : "Anonymous"}
                      </p>
                      {formatted ? (
                        <p className="text-stamp text-muted-foreground">
                          {formatted}
                        </p>
                      ) : null}
                    </div>
                    {reported ? (
                      <span className="status-chip status-closed shrink-0">
                        Reported
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
                    {comment.body}
                  </p>
                  {!reported ? (
                    <button
                      type="button"
                      data-ocid={`discussion.report_button.${index + 1}`}
                      disabled={reportComment.isPending}
                      onClick={() => handleReport(comment.id)}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-smooth hover:text-destructive focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Flag className="size-3.5" aria-hidden="true" />
                      Report
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
