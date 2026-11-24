import { Send } from "lucide-react";
import { useState } from "react";

import { SovereignError } from "@/backend";
import { usePostDiscussionReply } from "@/hooks/useSovereign";

/** Human-readable messages for the backend's reply errors. */
const ERROR_MESSAGE: Partial<Record<SovereignError, string>> = {
  [SovereignError.missingBody]: "Write a reply before posting.",
  [SovereignError.bodyTooLong]: "That reply is too long. Please shorten it.",
  [SovereignError.unknownThread]: "This thread is no longer available.",
  [SovereignError.notAuthorized]:
    "You do not have permission to reply to this thread.",
};

/**
 * The reply composer for a discussion thread. The draft is local UI state; a
 * submitted reply is stored through the Nation workspace API and appears in
 * the thread once the posts query refreshes.
 */
export default function DiscussionReplyForm({ thread }: { thread: bigint }) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const reply = usePostDiscussionReply();

  const trimmed = draft.trim();
  const canSubmit = trimmed.length > 0 && !reply.isPending;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    const body = trimmed;
    setError(null);
    setDraft("");
    reply.mutate(
      { thread, body },
      {
        onError: () => {
          setError("Your reply could not be posted. Please try again.");
          setDraft((current) => (current === "" ? body : current));
        },
        onSuccess: (result) => {
          if (result.__kind__ === "err") {
            setError(
              ERROR_MESSAGE[result.err] ??
                "Your reply could not be posted. Please try again.",
            );
            setDraft((current) => (current === "" ? body : current));
          }
        },
      },
    );
  };

  return (
    <form
      data-ocid="os.discussions.reply_form"
      onSubmit={handleSubmit}
      className="shell-panel space-y-3 p-4"
    >
      <label
        htmlFor="discussion-reply"
        className="text-stamp block text-muted-foreground"
      >
        Add a reply
      </label>
      <textarea
        id="discussion-reply"
        data-ocid="os.discussions.reply_input"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        rows={3}
        placeholder="Share your perspective with the community…"
        className="w-full resize-y rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      />
      {error ? (
        <p
          data-ocid="os.discussions.reply_error"
          role="alert"
          className="text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Replies are stored in the sample workspace.
        </p>
        <button
          type="submit"
          data-ocid="os.discussions.reply_submit_button"
          disabled={!canSubmit}
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-smooth hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="size-4" aria-hidden="true" />
          {reply.isPending ? "Posting…" : "Post reply"}
        </button>
      </div>
    </form>
  );
}
