import { Lightbulb } from "lucide-react";

/**
 * A few example questions a visitor can tap to get started. Tapping one fills
 * the composer with that question.
 */
export default function CopilotStarterQuestions({
  questions,
  onSelect,
  disabled,
}: {
  questions: string[];
  onSelect: (question: string) => void;
  disabled: boolean;
}) {
  return (
    <section
      data-ocid="os.copilot.starters_section"
      aria-label="Example questions"
      className="space-y-2"
    >
      <div className="flex items-center gap-2">
        <Lightbulb className="size-4 text-accent" aria-hidden="true" />
        <p className="text-stamp text-muted-foreground">Try asking</p>
      </div>
      <ul className="flex flex-wrap gap-2">
        {questions.map((question, index) => (
          <li key={question}>
            <button
              type="button"
              data-ocid={`os.copilot.starter.${index + 1}`}
              onClick={() => onSelect(question)}
              disabled={disabled}
              className="os-focus-ring inline-flex min-h-[44px] items-center rounded-full border border-border bg-card px-4 py-2 text-left text-sm text-foreground transition-smooth hover:border-accent hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {question}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
