import { Check, ChevronDown, Sparkles } from "lucide-react";

import {
  type ConstitutionAnswer,
  type ConstitutionQuestion,
  type ConstitutionTemplateOption,
  type LauncherDraft,
  constitutionAdvancedSettings,
  constitutionQuestions,
  constitutionTemplateOptions,
} from "@/components/os/launcher/launcherTypes";

/**
 * Step five — the Constitution Builder. It asks a few simple questions in plain
 * language, starts from a recommended template with sensible defaults already
 * filled in, and keeps the advanced rule settings hidden behind an optional
 * expandable area so the default path stays short. The chosen rules are
 * validated before they are saved; a plain-language message explains anything
 * that needs to change.
 */
export default function LauncherStepConstitution({
  draft,
  answers,
  validationMessage,
  isSaving,
  saved,
  onChange,
  onAnswer,
  onSave,
}: {
  draft: LauncherDraft;
  /** The plain-language answer chosen for each question, keyed by question. */
  answers: Record<string, string>;
  /** A plain-language message when the rules need to change, or null. */
  validationMessage: string | null;
  /** Whether the constitution is being validated. */
  isSaving: boolean;
  /** Whether the chosen rules have been validated and are ready to save. */
  saved: boolean;
  onChange: (patch: Partial<LauncherDraft>) => void;
  onAnswer: (questionKey: string, answerKey: string) => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="font-display text-xl font-medium tracking-tight text-foreground">
          Set your organization&rsquo;s rules
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Answer a few simple questions. We start you from a recommended
          template with sensible answers already chosen, so you can continue
          without changing anything.
        </p>
      </div>

      <fieldset
        data-ocid="os.launcher.constitution_template_fieldset"
        className="space-y-2"
      >
        <legend className="text-sm font-medium text-foreground">
          Start from an example
        </legend>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Every template is an example — none of them assumes your
          organization&rsquo;s legal or traditional governance authority.
        </p>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {constitutionTemplateOptions.map((template) => (
            <li key={template.key}>
              <ConstitutionTemplateCard
                template={template}
                selected={template.key === draft.constitutionTemplateKey}
                onSelect={() =>
                  onChange({ constitutionTemplateKey: template.key })
                }
              />
            </li>
          ))}
        </ul>
      </fieldset>

      <div className="space-y-4">
        {constitutionQuestions.map((question) => (
          <ConstitutionQuestionBlock
            key={question.key}
            question={question}
            selectedKey={answers[question.key] ?? ""}
            onSelect={(answerKey) => onAnswer(question.key, answerKey)}
          />
        ))}
      </div>

      <ConstitutionAdvancedPanel
        open={draft.constitutionAdvancedOpen}
        onToggle={() =>
          onChange({
            constitutionAdvancedOpen: !draft.constitutionAdvancedOpen,
          })
        }
      />

      {validationMessage ? (
        <p
          role="alert"
          data-ocid="os.launcher.constitution_validation_error"
          className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {validationMessage}
        </p>
      ) : null}

      {saved ? (
        <output
          data-ocid="os.launcher.constitution_saved"
          className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-foreground"
        >
          <Check className="size-4 text-primary" aria-hidden="true" />
          Your rules are ready. Continue to review and launch — your rules are
          saved and your founding setup activates when you launch.
        </output>
      ) : (
        <button
          type="button"
          data-ocid="os.launcher.constitution_save_button"
          disabled={isSaving}
          onClick={onSave}
          className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60 sm:w-auto"
        >
          <Sparkles className="size-4" aria-hidden="true" />
          {isSaving ? "Saving your rules…" : "Save my rules"}
        </button>
      )}
    </div>
  );
}

/** One example template card, with a Recommended badge on the default. */
function ConstitutionTemplateCard({
  template,
  selected,
  onSelect,
}: {
  template: ConstitutionTemplateOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      data-ocid={`os.launcher.constitution_template.${template.key}`}
      aria-pressed={selected}
      onClick={onSelect}
      className={`gov-template-card os-focus-ring h-full w-full ${
        selected ? "gov-template-card-selected" : ""
      }`}
    >
      <span className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-display text-sm font-medium text-foreground">
          {template.label}
        </span>
        <span className="flex flex-wrap items-center gap-1.5">
          {template.recommended ? (
            <span className="badge-stage-demo">Recommended</span>
          ) : null}
          <span className="gov-template-example-chip">Example</span>
        </span>
      </span>
      <span className="text-xs leading-relaxed text-muted-foreground">
        {template.description}
      </span>
    </button>
  );
}

/** One plain-language question with its short explanation and answers. */
function ConstitutionQuestionBlock({
  question,
  selectedKey,
  onSelect,
}: {
  question: ConstitutionQuestion;
  selectedKey: string;
  onSelect: (answerKey: string) => void;
}) {
  return (
    <fieldset
      data-ocid={`os.launcher.constitution_question.${question.key}`}
      className="space-y-2"
    >
      <legend className="text-sm font-medium text-foreground">
        {question.question}
      </legend>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {question.explanation}
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {question.options.map((option) => (
          <ConstitutionAnswerCard
            key={option.key}
            questionKey={question.key}
            answer={option}
            selected={option.key === selectedKey}
            onSelect={() => onSelect(option.key)}
          />
        ))}
      </div>
    </fieldset>
  );
}

/** One plain-language answer card. */
function ConstitutionAnswerCard({
  questionKey,
  answer,
  selected,
  onSelect,
}: {
  questionKey: string;
  answer: ConstitutionAnswer;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      data-ocid={`os.launcher.constitution_answer.${questionKey}.${answer.key}`}
      className={`flex min-h-[44px] cursor-pointer items-start gap-3 rounded-lg border p-3 transition-smooth ${
        selected
          ? "border-primary bg-primary/5"
          : "border-border bg-muted/40 hover:border-primary/40"
      }`}
    >
      <input
        type="radio"
        name={`launcher-constitution-${questionKey}`}
        value={answer.key}
        checked={selected}
        onChange={onSelect}
        data-ocid={`os.launcher.constitution_radio.${questionKey}.${answer.key}`}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${
          selected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-input bg-card"
        }`}
      >
        {selected ? <Check className="size-3" /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-foreground">
          {answer.label}
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
          {answer.detail}
        </span>
      </span>
    </label>
  );
}

/** The advanced rule settings, hidden until the user asks for them. */
function ConstitutionAdvancedPanel({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <section
      data-ocid="os.launcher.constitution_advanced_panel"
      className="space-y-3"
      aria-label="Advanced rule settings"
    >
      <button
        type="button"
        data-ocid="os.launcher.constitution_advanced_toggle"
        aria-expanded={open}
        aria-controls="launcher-constitution-advanced"
        onClick={onToggle}
        className="os-focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-smooth hover:border-primary/50 hover:bg-muted"
      >
        <ChevronDown
          className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
        {open ? "Hide advanced settings" : "Show advanced settings"}
      </button>

      {open ? (
        <div
          id="launcher-constitution-advanced"
          data-ocid="os.launcher.constitution_advanced_settings"
          className="gov-advanced-panel space-y-3 p-4"
        >
          <p className="text-xs leading-relaxed text-muted-foreground">
            These are the defaults your template applies. You can change every
            one of them later through your own governance process.
          </p>
          <ul className="space-y-3">
            {constitutionAdvancedSettings.map((setting) => (
              <li
                key={setting.key}
                data-ocid={`os.launcher.constitution_advanced.${setting.key}`}
                className="flex flex-col gap-0.5 border-b border-border/60 pb-3 last:border-b-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-medium text-foreground">
                    {setting.label}
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {setting.explanation}
                  </p>
                </div>
                <p className="text-tabular shrink-0 text-sm font-semibold text-accent">
                  {setting.value}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
