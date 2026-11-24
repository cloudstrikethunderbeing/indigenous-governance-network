import { MessageSquare } from "lucide-react";

import type { DiscussionThread } from "@/backend";
import {
  formatAuthor,
  formatRelativeActivity,
} from "@/components/os/discussions/discussionFormat";

/**
 * The list of the sample Nation's discussion threads. Each row shows the
 * thread title, its author and when it was last active, and opens the thread.
 */
export default function DiscussionThreadList({
  threads,
  onSelect,
}: {
  threads: DiscussionThread[];
  onSelect: (thread: DiscussionThread) => void;
}) {
  return (
    <ul data-ocid="os.discussions.thread_list" className="space-y-2">
      {threads.map((thread, index) => {
        return (
          <li key={thread.id.toString()}>
            <button
              type="button"
              data-ocid={`os.discussions.thread.${index + 1}`}
              onClick={() => onSelect(thread)}
              className="flex w-full min-h-11 items-start gap-3 rounded-lg border border-border bg-card p-3 text-left transition-smooth hover:border-primary/40 hover:bg-muted/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <span
                aria-hidden="true"
                className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
              >
                <MessageSquare className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">
                  {thread.title}
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  Opened by {formatAuthor(thread.author)} ·{" "}
                  {formatRelativeActivity(thread.timestamp)}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
