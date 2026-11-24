import { useEffect, useState } from "react";

import type { DiscussionThread } from "@/backend";
import OsAppPage from "@/components/os/OsAppPage";
import { useActiveNation } from "@/components/os/attachments/useActiveNation";
import DiscussionThreadList from "@/components/os/discussions/DiscussionThreadList";
import DiscussionThreadView from "@/components/os/discussions/DiscussionThreadView";
import { sampleNationNotice } from "@/data/sampleNation";
import {
  useDiscussionThreads,
  useEnsureSampleWorkspace,
  useNations,
} from "@/hooks/useSovereign";

/**
 * The Discussions app: the sample Nation's conversation threads and their
 * posts, read from the Nation workspace API, with an interactive reply
 * workflow. All content is clearly-labelled simulated sample data.
 */
export default function DiscussionsAppPage() {
  const [selected, setSelected] = useState<DiscussionThread | null>(null);
  const { nationId, readOnly } = useActiveNation();

  const { data: nations, isLoading: nationsLoading } = useNations();
  const { mutate: ensureSample, isPending: isEnsuringSample } =
    useEnsureSampleWorkspace();

  // Seed the built-in sample Nation once when the canister has none yet.
  useEffect(() => {
    if (
      !nationsLoading &&
      nations &&
      nations.length === 0 &&
      !isEnsuringSample
    ) {
      ensureSample();
    }
  }, [nationsLoading, nations, isEnsuringSample, ensureSample]);

  const {
    data: threads,
    isLoading: threadsLoading,
    isError: threadsError,
  } = useDiscussionThreads(nationId);

  const isLoading = nationsLoading || threadsLoading;
  const hasThreads = (threads?.length ?? 0) > 0;

  return (
    <OsAppPage appKey="discussions">
      <div className="space-y-4">
        <header className="space-y-2">
          <p className="text-stamp text-accent">Discussions</p>
          <h2 className="font-display text-2xl font-medium tracking-tight text-foreground">
            Community threads
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Open conversations among Nation members. Read any thread and add a
            reply — your reply is stored in the sample workspace.
          </p>
          <div className="rule-accent" />
        </header>

        <p
          data-ocid="os.discussions.sample_label"
          className="rounded-md border border-dashed border-accent bg-accent/10 px-3 py-2 text-xs font-medium text-accent-foreground"
        >
          {sampleNationNotice}
        </p>

        {selected ? (
          <DiscussionThreadView
            thread={selected}
            nation={nationId}
            readOnly={readOnly}
            onBack={() => setSelected(null)}
          />
        ) : isLoading ? (
          <p
            data-ocid="os.discussions.loading_state"
            className="text-sm text-muted-foreground"
          >
            Loading threads…
          </p>
        ) : threadsError ? (
          <p
            data-ocid="os.discussions.error_state"
            role="alert"
            className="text-sm text-destructive"
          >
            The discussion threads could not be loaded. Please try again.
          </p>
        ) : hasThreads ? (
          <DiscussionThreadList
            threads={threads ?? []}
            onSelect={setSelected}
          />
        ) : (
          <p
            data-ocid="os.discussions.empty_state"
            className="shell-panel-alt p-4 text-sm text-muted-foreground"
          >
            No discussion threads yet. Threads appear here once the sample
            workspace is ready.
          </p>
        )}
      </div>
    </OsAppPage>
  );
}
