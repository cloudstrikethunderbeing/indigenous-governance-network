import { Send } from "lucide-react";
import { type FormEvent, useState } from "react";

import { SubmissionVisibility } from "@/backend";
import { useSubmitDiscoverySubmission } from "@/hooks/useDiscovery";

const CLASSIFICATION_LABEL: Record<string, string> = {
  idea: "Idea",
  feedback: "Feedback",
  need: "Need",
  opportunity: "Opportunity",
  potentialProposal: "Potential proposal",
};

/**
 * The Discovery Assistant: a prominent conversational input that accepts
 * free-text ideas, feedback, needs, opportunities and potential proposals.
 * Each submission is classified and stored, and the submitter sees the
 * classification result and a confirmation.
 */
export default function DiscoveryAssistant({
  community,
}: {
  community: bigint;
}) {
  const [text, setText] = useState("");
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const submit = useSubmitDiscoverySubmission();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const captured = text.trim();
    if (captured.length === 0) return;
    setText("");
    setConfirmation(null);
    submit.mutate(
      {
        community,
        body: captured,
        category: "general",
        visibility: SubmissionVisibility.publicVisible,
      },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "ok") {
            const label =
              CLASSIFICATION_LABEL[result.ok.classification] ??
              result.ok.classification;
            setConfirmation(
              `Saved and classified as: ${label}. It is now visible in the community workspace.`,
            );
          } else {
            setConfirmation(
              "We could not save that submission. Please try again.",
            );
          }
        },
        onError: () => {
          setText((current) => (current === "" ? captured : current));
          setConfirmation(
            "We could not save that submission. Please try again.",
          );
        },
      },
    );
  };

  return (
    <section
      data-ocid="discovery.assistant"
      aria-label="Discovery Assistant"
      className="network-panel flex flex-col gap-3 p-5"
    >
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl font-medium tracking-tight text-foreground">
          What should we accomplish together?
        </h2>
        <p className="text-sm text-muted-foreground">
          Share an idea, feedback, a need or an opportunity in your own words.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label htmlFor="discovery-assistant-input" className="sr-only">
          Your idea, feedback, need or opportunity
        </label>
        <textarea
          id="discovery-assistant-input"
          data-ocid="discovery.assistant.textarea"
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={3}
          placeholder="Describe what your community needs or could contribute…"
          className="w-full resize-y rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Classified automatically as an idea, feedback, need, opportunity or
            potential proposal.
          </p>
          <button
            type="submit"
            data-ocid="discovery.assistant.submit_button"
            disabled={submit.isPending || text.trim().length === 0}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-smooth hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Send className="size-4" aria-hidden="true" />
            {submit.isPending ? "Saving…" : "Submit"}
          </button>
        </div>
      </form>

      {confirmation ? (
        <output
          data-ocid="discovery.assistant.success_state"
          className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground"
        >
          {confirmation}
        </output>
      ) : null}
    </section>
  );
}
