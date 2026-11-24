import { Send } from "lucide-react";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/**
 * The Copilot question composer. Owns its own draft text so a refetch or a
 * pending answer never clears what the visitor is typing.
 */
export default function CopilotComposer({
  onSubmit,
  pending,
  draft,
  onDraftChange,
}: {
  onSubmit: (question: string) => void;
  pending: boolean;
  draft: string;
  onDraftChange: (value: string) => void;
}) {
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = draft.trim();
    if (question.length === 0) {
      setValidationError("Type a question before asking the Copilot.");
      return;
    }
    setValidationError(null);
    onSubmit(question);
  }

  return (
    <form
      data-ocid="os.copilot.composer"
      onSubmit={handleSubmit}
      className="shell-panel space-y-2 p-3"
    >
      <label
        htmlFor="copilot-question"
        className="text-stamp text-muted-foreground"
      >
        Ask about the workspace
      </label>
      <Textarea
        id="copilot-question"
        data-ocid="os.copilot.question_input"
        value={draft}
        onChange={(event) => {
          onDraftChange(event.target.value);
          if (validationError) setValidationError(null);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }
        }}
        placeholder="e.g. What proposals are open right now?"
        rows={2}
        aria-invalid={validationError ? true : undefined}
        aria-describedby={
          validationError ? "copilot-question-error" : undefined
        }
        className="min-h-[44px] resize-none"
      />
      {validationError ? (
        <p
          id="copilot-question-error"
          data-ocid="os.copilot.question_error"
          role="alert"
          className="text-xs font-medium text-destructive"
        >
          {validationError}
        </p>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Answers are advisory and cite workspace sources.
        </p>
        <Button
          type="submit"
          data-ocid="os.copilot.ask_button"
          disabled={pending}
          className="min-h-[44px] rounded-lg"
        >
          <Send className="size-4" aria-hidden="true" />
          {pending ? "Asking…" : "Ask"}
        </Button>
      </div>
    </form>
  );
}
