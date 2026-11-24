import { Loader2, Plus, Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";

import type { ChallengeOption } from "@/backend";
import {
  useConfigureWeeklyChallenge,
  useWeeklyChallenge,
} from "@/hooks/useQueries";

/** A draft option row; optionId is assigned on save. */
type DraftOption = { key: string; labelText: string };

let optionKeySeed = 0;
function nextOptionKey(): string {
  optionKeySeed += 1;
  return `option-${optionKeySeed}`;
}

/**
 * The administrator control to configure the weekly challenge question and its
 * answer options through the existing hook. The current challenge is loaded
 * from the backend; the draft is local until the admin saves it.
 */
export default function WeeklyChallengeConfig() {
  const { data: challenge, isLoading } = useWeeklyChallenge();
  const configure = useConfigureWeeklyChallenge();

  const [weekKey, setWeekKey] = useState("");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<DraftOption[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // One-time initialization from the loaded challenge; never overwrites a draft.
  if (!initialized && !isLoading) {
    setInitialized(true);
    if (challenge) {
      setWeekKey(challenge.weekKey);
      setQuestion(challenge.question);
      setOptions(
        challenge.options.map((option) => ({
          key: nextOptionKey(),
          labelText: option.labelText,
        })),
      );
    } else {
      setOptions([
        { key: nextOptionKey(), labelText: "" },
        { key: nextOptionKey(), labelText: "" },
      ]);
    }
  }

  function updateOption(key: string, labelText: string) {
    setOptions((current) =>
      current.map((option) =>
        option.key === key ? { ...option, labelText } : option,
      ),
    );
  }

  function addOption() {
    setOptions((current) => [
      ...current,
      { key: nextOptionKey(), labelText: "" },
    ]);
  }

  function removeOption(key: string) {
    setOptions((current) => current.filter((option) => option.key !== key));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedWeekKey = weekKey.trim();
    const trimmedQuestion = question.trim();
    const cleaned = options
      .map((option) => option.labelText.trim())
      .filter((label) => label !== "");

    if (trimmedWeekKey === "") {
      setError("Please enter a week key, for example 2026-W45.");
      return;
    }
    if (trimmedQuestion === "") {
      setError("Please enter the challenge question.");
      return;
    }
    if (cleaned.length < 2) {
      setError("Please provide at least two answer options.");
      return;
    }

    const payload: ChallengeOption[] = cleaned.map((labelText, index) => ({
      optionId: BigInt(index + 1),
      labelText,
    }));

    configure.mutate(
      { weekKey: trimmedWeekKey, question: trimmedQuestion, options: payload },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "err") {
            setError("The challenge could not be saved. Please try again.");
          }
        },
        onError: () => {
          setError("The challenge could not be saved. Please try again.");
        },
      },
    );
  }

  return (
    <section
      data-ocid="engagement.challenge_config"
      aria-label="Weekly challenge configuration"
      className="shell-panel p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-base font-medium tracking-tight text-foreground">
          Weekly challenge
        </h3>
        {challenge ? (
          <span className="text-stamp text-muted-foreground">
            Current: {challenge.weekKey}
          </span>
        ) : null}
      </div>

      {isLoading ? (
        <output
          data-ocid="engagement.challenge_config.loading_state"
          className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Loading the current challenge…
        </output>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="challenge-week-key"
              className="text-stamp text-muted-foreground"
            >
              Week key
            </label>
            <input
              id="challenge-week-key"
              data-ocid="engagement.challenge_config.week_key_input"
              type="text"
              value={weekKey}
              onChange={(event) => setWeekKey(event.target.value)}
              placeholder="2026-W45"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-smooth focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="challenge-question"
              className="text-stamp text-muted-foreground"
            >
              Question
            </label>
            <textarea
              id="challenge-question"
              data-ocid="engagement.challenge_config.question_input"
              value={question}
              rows={2}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="What does digital sovereignty mean for your community?"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-smooth focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-stamp text-muted-foreground">
              Answer options
            </legend>
            <ul className="space-y-2">
              {options.map((option, index) => (
                <li key={option.key} className="flex items-center gap-2">
                  <input
                    data-ocid={`engagement.challenge_config.option_input.${index + 1}`}
                    type="text"
                    value={option.labelText}
                    aria-label={`Answer option ${index + 1}`}
                    onChange={(event) =>
                      updateOption(option.key, event.target.value)
                    }
                    placeholder={`Option ${index + 1}`}
                    className="min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-smooth focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  />
                  <button
                    type="button"
                    data-ocid={`engagement.challenge_config.remove_option_button.${index + 1}`}
                    aria-label={`Remove answer option ${index + 1}`}
                    disabled={options.length <= 2}
                    onClick={() => removeOption(option.key)}
                    className="rounded-md border border-border bg-card p-2 text-muted-foreground transition-smooth hover:border-destructive/50 hover:text-destructive focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              data-ocid="engagement.challenge_config.add_option_button"
              onClick={addOption}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-smooth hover:border-primary/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Plus className="size-3.5" aria-hidden="true" />
              Add option
            </button>
          </fieldset>

          {error ? (
            <p
              data-ocid="engagement.challenge_config.error_state"
              role="alert"
              className="text-sm font-medium text-destructive"
            >
              {error}
            </p>
          ) : null}

          {configure.isSuccess && !error ? (
            <output
              data-ocid="engagement.challenge_config.success_state"
              className="block text-sm font-medium text-primary"
            >
              The weekly challenge has been saved.
            </output>
          ) : null}

          <button
            type="submit"
            data-ocid="engagement.challenge_config.save_button"
            disabled={configure.isPending}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-smooth hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
          >
            {configure.isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            Save challenge
          </button>
        </form>
      )}
    </section>
  );
}
