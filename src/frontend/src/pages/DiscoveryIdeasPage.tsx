import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Gavel,
  MessageSquare,
  Plus,
  ThumbsUp,
  Wrench,
} from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";

import {
  type CommunityProfile,
  CommunityVisibility,
  DirectoryEntryKind,
  PipelineInteractionKind as InteractionKind,
  type PipelineInteractionKind,
  type PipelineItem,
  type PipelineStage,
  type Recommendation,
} from "@/backend";
import DiscoveryAssistant from "@/components/discovery/DiscoveryAssistant";
import DiscoveryShell from "@/components/discovery/DiscoveryShell";
import EmptyState from "@/components/discovery/EmptyState";
import PipelineStages from "@/components/discovery/PipelineStages";
import RecommendationCard from "@/components/discovery/RecommendationCard";
import {
  useAddPipelineInteraction,
  useAdvancePipelineItem,
  useCommunityProfile,
  useCommunitySubmissions,
  useCreatePipelineItem,
  useCreateProposalFromPipelineItem,
  usePipelineInteractions,
  usePipelineItems,
  useRecommendations,
  useSaveCommunityProfile,
  useSearchDirectory,
} from "@/hooks/useDiscovery";
import { useIsCallerAdmin } from "@/hooks/useQueries";

/** Split a comma-separated field into trimmed, non-empty tags. */
function parseTags(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/* ------------------------------------------------------------------ */
/* Community context                                                   */
/* ------------------------------------------------------------------ */

/**
 * The workspace is scoped to one community. Communities are chosen from the
 * public, opted-in directory — the only community list the backend exposes —
 * plus any community the caller just created, so a first-time visitor can open
 * a workspace without a pre-existing community.
 */
function CommunityPicker({
  selected,
  onSelect,
  created,
}: {
  selected: bigint | null;
  onSelect: (community: bigint) => void;
  created: { id: bigint; name: string } | null;
}) {
  const { data: entries, isLoading } = useSearchDirectory(
    "",
    DirectoryEntryKind.community,
  );

  const communities = useMemo(() => {
    const stored = (entries ?? []).filter(
      (entry) => entry.kind === DirectoryEntryKind.community,
    );
    if (created && !stored.some((e) => e.referenceId === created.id)) {
      return [
        {
          referenceId: created.id,
          title: created.name,
          kind: DirectoryEntryKind.community,
          description: "",
          tags: [],
        },
        ...stored,
      ];
    }
    return stored;
  }, [entries, created]);

  if (isLoading && communities.length === 0) {
    return (
      <p
        data-ocid="discovery.ideas.community.loading_state"
        className="text-sm text-muted-foreground"
      >
        Loading communities…
      </p>
    );
  }

  if (communities.length === 0) {
    return (
      <EmptyState
        ocid="discovery.ideas.community.empty_state"
        title="No community workspace yet"
        description="Create a community profile below to open an idea and proposal workspace. You can also publish a profile from Find Collaborators."
        action={
          <Link
            to="/dao/discovery/collaborators"
            data-ocid="discovery.ideas.community.publish_link"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-smooth hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Publish a community profile
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="discovery-ideas-community"
        className="text-stamp text-muted-foreground"
      >
        Community workspace
      </label>
      <select
        id="discovery-ideas-community"
        data-ocid="discovery.ideas.community.select"
        value={selected === null ? "" : selected.toString()}
        onChange={(event) => {
          const value = event.target.value;
          if (value !== "") onSelect(BigInt(value));
        }}
        className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:max-w-md"
      >
        <option value="" disabled>
          Select a community…
        </option>
        {communities.map((community) => (
          <option
            key={community.referenceId.toString()}
            value={community.referenceId.toString()}
          >
            {community.title}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Community profile creation                                          */
/* ------------------------------------------------------------------ */

/**
 * Create or save the caller's community profile through the existing
 * useSaveCommunityProfile hook. On success the new community id is handed
 * back so the workspace opens immediately, without a pre-existing community.
 */
function CommunityProfileForm({
  onCreated,
}: {
  onCreated: (community: { id: bigint; name: string }) => void;
}) {
  const { identity } = useInternetIdentity();
  const principal =
    identity && !identity.getPrincipal().isAnonymous()
      ? identity.getPrincipal()
      : null;
  const save = useSaveCommunityProfile();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [region, setRegion] = useState("");
  const [objectives, setObjectives] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const canSubmit = principal !== null && name.trim().length > 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!principal || !canSubmit) return;
    const profile: CommunityProfile = {
      id: 0n,
      name: name.trim(),
      description: description.trim(),
      region: region.trim(),
      objectives: parseTags(objectives),
      projectNeeds: [],
      interests: [],
      skills: [],
      partnershipOpportunities: [],
      visibility: CommunityVisibility.publicVisible,
      discoveryOptIn: true,
      owner: principal,
      timestamp: 0n,
    };
    setNotice(null);
    save.mutate(profile, {
      onSuccess: (result) => {
        if (result.__kind__ === "ok") {
          onCreated({ id: result.ok, name: profile.name });
          setNotice("Community workspace created.");
        } else {
          setNotice("We could not create the workspace. Please try again.");
        }
      },
      onError: () => {
        setNotice("We could not create the workspace. Please try again.");
      },
    });
  }

  return (
    <section
      data-ocid="discovery.ideas.community_form"
      aria-label="Create a community workspace"
      className="network-panel flex flex-col gap-4 p-5"
    >
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-base font-medium tracking-tight text-foreground">
          Create a community workspace
        </h2>
        <p className="text-xs text-muted-foreground">
          Publish a community profile to open an idea and proposal workspace.
          You choose what is shared, and you can update it at any time.
        </p>
      </div>

      {principal === null ? (
        <p className="text-sm text-muted-foreground">
          Sign in with Internet Identity to create a community workspace.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-stamp text-muted-foreground">
              Community name
            </span>
            <input
              type="text"
              data-ocid="discovery.ideas.community_form.name_input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Coastal Research Collective"
              className="rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-stamp text-muted-foreground">Region</span>
              <input
                type="text"
                data-ocid="discovery.ideas.community_form.region_input"
                value={region}
                onChange={(event) => setRegion(event.target.value)}
                placeholder="e.g. Pacific Northwest"
                className="rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-stamp text-muted-foreground">
                Objectives (comma separated)
              </span>
              <input
                type="text"
                data-ocid="discovery.ideas.community_form.objectives_input"
                value={objectives}
                onChange={(event) => setObjectives(event.target.value)}
                placeholder="housing, water rights"
                className="rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-stamp text-muted-foreground">
              Description
            </span>
            <textarea
              data-ocid="discovery.ideas.community_form.description_textarea"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={2}
              placeholder="What does your community work on?"
              className="w-full resize-y rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              data-ocid="discovery.ideas.community_form.submit_button"
              disabled={!canSubmit || save.isPending}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-smooth hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Plus className="size-4" aria-hidden="true" />
              {save.isPending ? "Creating…" : "Create workspace"}
            </button>
            {notice ? (
              <output
                data-ocid="discovery.ideas.community_form.notice"
                className="text-xs text-muted-foreground"
              >
                {notice}
              </output>
            ) : null}
          </div>
        </form>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Recommendations                                                     */
/* ------------------------------------------------------------------ */

function RecommendationsSection({ community }: { community: bigint }) {
  const { data: recommendations, isLoading } = useRecommendations(community);

  return (
    <section
      data-ocid="discovery.ideas.recommendations"
      aria-label="Suggested for Your Community"
      className="flex flex-col gap-3"
    >
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-lg font-medium tracking-tight text-foreground">
          Suggested for Your Community
        </h2>
        <p className="text-sm text-muted-foreground">
          Derived from stored ideas, proposals, profiles and interests — never
          invented activity.
        </p>
      </div>

      {isLoading ? (
        <p
          data-ocid="discovery.ideas.recommendations.loading_state"
          className="text-sm text-muted-foreground"
        >
          Reading stored data…
        </p>
      ) : recommendations && recommendations.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {recommendations.map((recommendation: Recommendation, index) => (
            <li key={`${recommendation.kind}-${recommendation.referenceId}`}>
              <RecommendationCard
                recommendation={recommendation}
                index={index}
              />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          ocid="discovery.ideas.recommendations.empty_state"
          title="Nothing to suggest yet"
          description="Share the first idea above. As your community stores ideas, proposals and profiles, relevant suggestions appear here."
        />
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Pipeline                                                            */
/* ------------------------------------------------------------------ */

const INTERACTION_META: Record<
  PipelineInteractionKind,
  { label: string; icon: typeof MessageSquare }
> = {
  comment: { label: "Comment", icon: MessageSquare },
  support: { label: "Support", icon: ThumbsUp },
  improvement: { label: "Suggest improvement", icon: Wrench },
};

function PipelineItemCard({
  item,
  index,
  canGovern,
}: {
  item: PipelineItem;
  index: number;
  canGovern: boolean;
}) {
  const [kind, setKind] = useState<PipelineInteractionKind>(
    InteractionKind.comment,
  );
  const [body, setBody] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const { data: interactions, isLoading } = usePipelineInteractions(item.id);
  const addInteraction = useAddPipelineInteraction();
  const advanceItem = useAdvancePipelineItem();
  const createProposal = useCreateProposalFromPipelineItem();

  const handleSelectStage = (stage: PipelineStage) => {
    if (!canGovern || stage === item.stage) return;
    setNotice(null);
    advanceItem.mutate(
      { itemId: item.id, to: stage },
      {
        onSuccess: (result) => {
          setNotice(
            result.__kind__ === "ok"
              ? "Stage updated."
              : "Stages advance one step at a time, and only the community owner may advance them.",
          );
        },
        onError: () => {
          setNotice("We could not update the stage. Please try again.");
        },
      },
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const captured = body.trim();
    if (captured.length === 0) return;
    setBody("");
    setNotice(null);
    addInteraction.mutate(
      { itemId: item.id, kind, body: captured },
      {
        onSuccess: (result) => {
          setNotice(
            result.__kind__ === "ok"
              ? "Added to this idea."
              : "We could not add that. Please try again.",
          );
        },
        onError: () => {
          setBody((current) => (current === "" ? captured : current));
          setNotice("We could not add that. Please try again.");
        },
      },
    );
  };

  const handleCreateProposal = () => {
    setNotice(null);
    createProposal.mutate(item.id, {
      onSuccess: (result) => {
        setNotice(
          result.__kind__ === "ok"
            ? "Formal proposal created in the governance flow."
            : "Only the community owner can create a formal proposal.",
        );
      },
      onError: () => {
        setNotice("We could not create the proposal. Please try again.");
      },
    });
  };

  return (
    <article
      data-ocid={`discovery.ideas.pipeline_item.${index}`}
      className="network-panel flex flex-col gap-4 p-4"
    >
      <div className="flex flex-col gap-2">
        <h3 className="font-display text-base font-medium tracking-tight text-foreground">
          {item.title}
        </h3>
        <PipelineStages
          current={item.stage}
          interactive={canGovern}
          onSelect={handleSelectStage}
        />
      </div>

      {item.proposalId !== undefined ? (
        <Link
          to="/dao/governance"
          data-ocid={`discovery.ideas.pipeline_item.governance_link.${index}`}
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary transition-smooth hover:gap-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Gavel className="size-4" aria-hidden="true" />
          View the proposal in Governance
        </Link>
      ) : null}

      <div className="flex flex-col gap-2">
        {isLoading ? (
          <p className="text-xs text-muted-foreground">Loading discussion…</p>
        ) : interactions && interactions.length > 0 ? (
          <ul
            data-ocid={`discovery.ideas.pipeline_item.interactions.${index}`}
            className="flex flex-col gap-2"
          >
            {interactions.map((interaction) => {
              const meta = INTERACTION_META[interaction.kind];
              return (
                <li
                  key={interaction.id.toString()}
                  className="flex items-start gap-2 rounded-md bg-muted px-3 py-2"
                >
                  <meta.icon
                    className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <div className="flex min-w-0 flex-col">
                    <span className="text-stamp text-muted-foreground">
                      {meta.label}
                    </span>
                    <span className="text-sm text-foreground">
                      {interaction.body}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">
            No comments yet. Be the first to weigh in before a formal proposal
            exists.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(INTERACTION_META) as PipelineInteractionKind[]).map(
            (value) => (
              <button
                key={value}
                type="button"
                data-ocid={`discovery.ideas.pipeline_item.kind.${value}.${index}`}
                aria-pressed={kind === value}
                onClick={() => setKind(value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-smooth focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                  kind === value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-foreground hover:bg-muted"
                }`}
              >
                {INTERACTION_META[value].label}
              </button>
            ),
          )}
        </div>
        <label
          htmlFor={`discovery-ideas-interaction-${index}`}
          className="sr-only"
        >
          {INTERACTION_META[kind].label} on {item.title}
        </label>
        <textarea
          id={`discovery-ideas-interaction-${index}`}
          data-ocid={`discovery.ideas.pipeline_item.textarea.${index}`}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={2}
          placeholder="Add a comment, express support or suggest an improvement…"
          className="w-full resize-y rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            data-ocid={`discovery.ideas.pipeline_item.submit_button.${index}`}
            disabled={addInteraction.isPending || body.trim().length === 0}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-smooth hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {addInteraction.isPending ? "Adding…" : "Add"}
          </button>
          {canGovern && item.proposalId === undefined ? (
            <button
              type="button"
              data-ocid={`discovery.ideas.pipeline_item.proposal_button.${index}`}
              disabled={createProposal.isPending}
              onClick={handleCreateProposal}
              className="inline-flex items-center gap-2 rounded-full border border-primary px-4 py-2 text-sm font-medium text-primary transition-smooth hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Gavel className="size-4" aria-hidden="true" />
              {createProposal.isPending
                ? "Creating…"
                : "Create formal proposal"}
            </button>
          ) : null}
        </div>
        {notice ? (
          <output
            data-ocid={`discovery.ideas.pipeline_item.notice.${index}`}
            className="text-xs text-muted-foreground"
          >
            {notice}
          </output>
        ) : null}
      </form>
    </article>
  );
}

/**
 * Start a pipeline item from a stored submission. Lists the community's stored
 * submissions and creates a pipeline item through the existing
 * useCreatePipelineItem hook, so the seven-stage pipeline can be populated.
 */
function StartPipelineItemForm({ community }: { community: bigint }) {
  const { data: submissions, isLoading } = useCommunitySubmissions(community);
  const createItem = useCreatePipelineItem();
  const [submissionId, setSubmissionId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const stored = submissions ?? [];
  const canSubmit =
    submissionId !== "" && title.trim().length > 0 && !createItem.isPending;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setNotice(null);
    createItem.mutate(
      { submissionId: BigInt(submissionId), title: title.trim() },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "ok") {
            setTitle("");
            setSubmissionId("");
            setNotice("Added to the pipeline.");
          } else {
            setNotice(
              "Only the submission's author or the community owner can start it in the pipeline.",
            );
          }
        },
        onError: () => {
          setNotice("We could not start that item. Please try again.");
        },
      },
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      data-ocid="discovery.ideas.pipeline.start_form"
      aria-label="Start an idea in the pipeline"
      className="network-panel-alt flex flex-col gap-3 p-4"
    >
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-sm font-medium tracking-tight text-foreground">
          Start an idea in the pipeline
        </h3>
        <p className="text-xs text-muted-foreground">
          Choose a stored submission and give it a pipeline title to gather
          feedback and collaboration before a formal proposal.
        </p>
      </div>

      {isLoading ? (
        <p
          data-ocid="discovery.ideas.pipeline.start_form.loading_state"
          className="text-xs text-muted-foreground"
        >
          Reading stored submissions…
        </p>
      ) : stored.length === 0 ? (
        <p
          data-ocid="discovery.ideas.pipeline.start_form.empty_state"
          className="text-xs text-muted-foreground"
        >
          No stored submissions yet. Submit an idea above, then start it here.
        </p>
      ) : (
        <>
          <label className="flex flex-col gap-1">
            <span className="text-stamp text-muted-foreground">
              Stored submission
            </span>
            <select
              data-ocid="discovery.ideas.pipeline.start_form.submission_select"
              value={submissionId}
              onChange={(event) => setSubmissionId(event.target.value)}
              className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <option value="" disabled>
                Select a submission…
              </option>
              {stored.map((submission) => (
                <option
                  key={submission.id.toString()}
                  value={submission.id.toString()}
                >
                  {submission.category || "Untitled submission"} —{" "}
                  {submission.body.length > 60
                    ? `${submission.body.slice(0, 59)}…`
                    : submission.body}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-stamp text-muted-foreground">
              Pipeline title
            </span>
            <input
              type="text"
              data-ocid="discovery.ideas.pipeline.start_form.title_input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Community housing initiative"
              className="rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              data-ocid="discovery.ideas.pipeline.start_form.submit_button"
              disabled={!canSubmit}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-smooth hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Plus className="size-4" aria-hidden="true" />
              {createItem.isPending ? "Starting…" : "Start in pipeline"}
            </button>
            {notice ? (
              <output
                data-ocid="discovery.ideas.pipeline.start_form.notice"
                className="text-xs text-muted-foreground"
              >
                {notice}
              </output>
            ) : null}
          </div>
        </>
      )}
    </form>
  );
}

function PipelineSection({
  community,
  canGovern,
}: {
  community: bigint;
  canGovern: boolean;
}) {
  const { data: items, isLoading } = usePipelineItems(community);

  return (
    <section
      data-ocid="discovery.ideas.pipeline"
      aria-label="Idea-to-proposal pipeline"
      className="flex flex-col gap-3"
    >
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-lg font-medium tracking-tight text-foreground">
          Idea-to-Proposal Pipeline
        </h2>
        <p className="text-sm text-muted-foreground">
          Follow each idea from Idea through Community Feedback, Collaboration,
          Draft Proposal, Governance Vote, Approved Action and Results.
        </p>
      </div>

      <StartPipelineItemForm community={community} />

      {isLoading ? (
        <p
          data-ocid="discovery.ideas.pipeline.loading_state"
          className="text-sm text-muted-foreground"
        >
          Reading the pipeline…
        </p>
      ) : items && items.length > 0 ? (
        <div className="flex flex-col gap-3">
          {items.map((item, index) => (
            <PipelineItemCard
              key={item.id.toString()}
              item={item}
              index={index}
              canGovern={canGovern}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          ocid="discovery.ideas.pipeline.empty_state"
          title="No ideas in the pipeline yet"
          description="Submit an idea above, then start it in the pipeline to gather feedback and collaboration before a formal proposal."
        />
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

/**
 * Discovery — Share an Idea. The idea and proposal workspace: the
 * conversational Discovery Assistant, the community-scoped recommendations and
 * the interactive seven-stage idea-to-proposal pipeline. Every value shown is
 * read from stored backend data for the selected community.
 */
export default function DiscoveryIdeasPage() {
  const [community, setCommunity] = useState<bigint | null>(null);
  const [createdCommunity, setCreatedCommunity] = useState<{
    id: bigint;
    name: string;
  } | null>(null);
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: profile } = useCommunityProfile(community);

  const caller = identity?.getPrincipal().toString();
  const canGovern =
    !!isAdmin || (!!caller && !!profile && profile.owner.toString() === caller);

  return (
    <DiscoveryShell
      title="Share an Idea"
      description="Submit an idea, need or opportunity in plain language and follow it toward a formal proposal."
    >
      <CommunityPicker
        selected={community}
        onSelect={setCommunity}
        created={createdCommunity}
      />

      {community !== null ? (
        <>
          <DiscoveryAssistant community={community} />
          <RecommendationsSection community={community} />
          <PipelineSection community={community} canGovern={canGovern} />
        </>
      ) : (
        <>
          <EmptyState
            ocid="discovery.ideas.select_prompt"
            title="Choose a community workspace"
            description="Select a community above, or create one below, to submit ideas, see suggestions and follow the idea-to-proposal pipeline."
          />
          <CommunityProfileForm
            onCreated={(created) => {
              setCreatedCommunity(created);
              setCommunity(created.id);
            }}
          />
        </>
      )}
    </DiscoveryShell>
  );
}
