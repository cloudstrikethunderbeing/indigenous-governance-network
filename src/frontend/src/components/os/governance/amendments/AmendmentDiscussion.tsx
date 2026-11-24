import { Loader2, MessageSquare } from "lucide-react";
import { useState } from "react";

import type { DiscussionThreadId } from "@/backend";
import {
  formatAuthor,
  formatDate,
} from "@/components/os/discussions/discussionFormat";
import {
  useDiscussionPosts,
  usePostDiscussionReply,
} from "@/hooks/useSovereign";

/**
 * The amendment discussion thread, open to eligible members. Every post is
 * shown in order, followed by a reply composer. Posts come from the Nation
 * workspace API; the backend enforces who may post.
 */
export default function AmendmentDiscussion({
  thread,
  readOnly,
}: {
  thread: DiscussionThreadId | null;
  readOnly: boolean;
}) {
  const { data: posts, isLoading, isError } = useDiscussionPosts(thread ?? 0n);
  const postReply = usePostDiscussionReply();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (thread === null) {
    return (
      <section
        data-ocid="os.governance.amendments.discussion_empty_state"
        className="shell-panel space-y-2 p-5"
      >
        <p className="font-display text-base font-medium text-foreground">
          No discussion thread yet
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          A discussion thread opens when this amendment is proposed.
        </p>
      </section>
    );
  }

  const ordered = [...(posts ?? [])].sort((a, b) =>
    a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0,
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const captured = body.trim();
    if (captured.length === 0) return;
    setBody("");
    postReply.mutate(
      { thread, body: captured },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "err") {
            setError("Your reply could not be posted. Please try again.");
            setBody((current) => (current === "" ? captured : current));
          }
        },
        onError: () => {
          setError("Your reply could not be posted. Please try again.");
          setBody((current) => (current === "" ? captured : current));
        },
      },
    );
  };

  return (
    <section
      data-ocid="os.governance.amendments.discussion"
      aria-label="Amendment discussion"
      className="space-y-4"
    >
      <header className="flex items-start gap-3">
        <span className="os-icon-glyph size-10 shrink-0" aria-hidden="true">
          <MessageSquare className="size-5" />
        </span>
        <div className="min-w-0 space-y-1">
          <p className="text-stamp text-accent">Discussion</p>
          <h3 className="font-display text-lg font-medium tracking-tight text-foreground">
            Talk it through
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Every eligible member can read and join this conversation before
            voting.
          </p>
        </div>
      </header>

      {isLoading ? (
        <p
          data-ocid="os.governance.amendments.discussion_loading"
          className="text-sm text-muted-foreground"
        >
          Loading the discussion…
        </p>
      ) : isError ? (
        <p
          data-ocid="os.governance.amendments.discussion_error"
          role="alert"
          className="text-sm text-destructive"
        >
          The discussion could not be loaded.
        </p>
      ) : ordered.length === 0 ? (
        <p
          data-ocid="os.governance.amendments.discussion_posts_empty_state"
          className="shell-panel-alt p-4 text-sm text-muted-foreground"
        >
          No posts yet. Be the first to share your view.
        </p>
      ) : (
        <ol
          data-ocid="os.governance.amendments.discussion_list"
          className="space-y-3"
        >
          {ordered.map((post, index) => (
            <li
              key={post.id.toString()}
              data-ocid={`os.governance.amendments.discussion_post.${index + 1}`}
              className="shell-panel space-y-1 p-4"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-foreground">
                  {formatAuthor(post.author)}
                </span>
                <time className="text-xs text-muted-foreground">
                  {formatDate(post.timestamp)}
                </time>
              </div>
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">
                {post.body}
              </p>
            </li>
          ))}
        </ol>
      )}

      {readOnly ? (
        <p
          data-ocid="os.governance.amendments.discussion_readonly"
          className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
        >
          You are viewing the Sample Nation. Sign in with your own Nation to
          join the discussion.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <label
            htmlFor="amendment-reply"
            className="text-sm font-medium text-foreground"
          >
            Add your view
          </label>
          <textarea
            id="amendment-reply"
            data-ocid="os.governance.amendments.reply_input"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={3}
            placeholder="Share your thoughts on this change."
            className="os-focus-ring w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
          />
          {error ? (
            <p
              data-ocid="os.governance.amendments.reply_error"
              role="alert"
              className="text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            data-ocid="os.governance.amendments.reply_button"
            disabled={postReply.isPending || body.trim().length === 0}
            className="os-focus-ring inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {postReply.isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            Post reply
          </button>
        </form>
      )}
    </section>
  );
}
