import { ArrowLeft } from "lucide-react";

import type { DiscussionThread } from "@/backend";
import RecordAttachments from "@/components/os/attachments/RecordAttachments";
import { discussionPostTarget } from "@/components/os/attachments/attachmentTargets";
import { sampleAttachmentsFor } from "@/components/os/attachments/sampleAttachments";
import DiscussionReplyForm from "@/components/os/discussions/DiscussionReplyForm";
import {
  formatAuthor,
  formatDate,
} from "@/components/os/discussions/discussionFormat";
import { useDiscussionPosts } from "@/hooks/useSovereign";

/**
 * A single discussion thread: every post in order, followed by the reply
 * composer. Posts come from the Nation workspace API. Each post can reference
 * the Nation's stored files through the shared attachments surface.
 */
export default function DiscussionThreadView({
  thread,
  nation,
  readOnly,
  onBack,
}: {
  thread: DiscussionThread;
  nation: bigint;
  readOnly: boolean;
  onBack: () => void;
}) {
  const { data: posts, isLoading, isError } = useDiscussionPosts(thread.id);
  const ordered = [...(posts ?? [])].sort((a, b) =>
    a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0,
  );

  return (
    <div className="space-y-4">
      <button
        type="button"
        data-ocid="os.discussions.back_button"
        onClick={onBack}
        className="inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-medium text-primary transition-smooth hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All threads
      </button>

      <header className="space-y-1">
        <h3 className="font-display text-xl font-medium tracking-tight text-foreground">
          {thread.title}
        </h3>
        <p className="text-xs text-muted-foreground">
          Opened by {formatAuthor(thread.author)} ·{" "}
          {formatDate(thread.timestamp)}
        </p>
      </header>

      {isLoading ? (
        <p
          data-ocid="os.discussions.posts_loading_state"
          className="text-sm text-muted-foreground"
        >
          Loading posts…
        </p>
      ) : isError ? (
        <p
          data-ocid="os.discussions.posts_error_state"
          role="alert"
          className="text-sm text-destructive"
        >
          The posts in this thread could not be loaded.
        </p>
      ) : ordered.length === 0 ? (
        <p
          data-ocid="os.discussions.posts_empty_state"
          className="shell-panel-alt p-4 text-sm text-muted-foreground"
        >
          No posts yet. Be the first to reply.
        </p>
      ) : (
        <ol data-ocid="os.discussions.post_list" className="space-y-3">
          {ordered.map((post, index) => (
            <li
              key={post.id.toString()}
              data-ocid={`os.discussions.post.${index + 1}`}
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
              <RecordAttachments
                nation={nation}
                target={discussionPostTarget(post.id)}
                readOnly={readOnly}
                sampleAttachments={sampleAttachmentsFor(
                  discussionPostTarget(post.id),
                )}
              />
            </li>
          ))}
        </ol>
      )}

      <DiscussionReplyForm thread={thread.id} />
    </div>
  );
}
