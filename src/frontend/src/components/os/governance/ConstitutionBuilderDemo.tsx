import { Check, ScrollText, Sparkles } from "lucide-react";
import { useState } from "react";

import {
  type ConstitutionTemplate,
  constitutionTemplates,
  draftConstitution,
  ruleImpacts,
} from "@/data/constitutionDemo";

/**
 * The interactive Constitution Builder demonstration. A visitor picks an
 * example template, reads the plain-language rules it would produce, previews
 * how a rule change would affect the organization, and confirms a draft
 * constitution. Everything is fictional and clearly labelled; confirming only
 * reveals the signed-instrument preview, it saves nothing.
 */
export default function ConstitutionBuilderDemo() {
  const [templateKey, setTemplateKey] = useState<string>(
    constitutionTemplates[0].key,
  );
  const [confirmed, setConfirmed] = useState(false);

  const template =
    constitutionTemplates.find((entry) => entry.key === templateKey) ??
    constitutionTemplates[0];

  function chooseTemplate(next: ConstitutionTemplate) {
    setTemplateKey(next.key);
    setConfirmed(false);
  }

  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <p className="text-stamp text-accent">Constitution Builder</p>
        <h2 className="font-display text-2xl font-medium tracking-tight text-foreground">
          Write your organization&rsquo;s rules
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Pick an example to start from, read the rules in plain language, then
          confirm. You can change every rule later through your own governance
          process.
        </p>
        <div className="rule-accent" />
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <ConstitutionSheet
          template={template}
          confirmed={confirmed}
          onConfirm={() => setConfirmed(true)}
        />

        <div className="space-y-5">
          <TemplatePicker selectedKey={templateKey} onSelect={chooseTemplate} />
          <RuleImpactPanel />
          <CtaPanel />
        </div>
      </div>
    </div>
  );
}

/** The central constitution sheet: a signed instrument with numbered clauses. */
function ConstitutionSheet({
  template,
  confirmed,
  onConfirm,
}: {
  template: ConstitutionTemplate;
  confirmed: boolean;
  onConfirm: () => void;
}) {
  return (
    <article
      data-ocid="os.constitution.sheet"
      className="gov-constitution space-y-5 p-5 md:p-7"
    >
      <header className="space-y-3 text-center">
        <span
          aria-hidden="true"
          className={`gov-seal mx-auto flex size-14 items-center justify-center rounded-full ${
            confirmed ? "animate-gov-seal-in" : ""
          }`}
        >
          <ScrollText className="size-6" />
        </span>
        <div className="space-y-1">
          <p className="text-stamp text-muted-foreground">
            {draftConstitution.status}
          </p>
          <h3 className="font-display text-xl font-medium tracking-tight text-foreground md:text-2xl">
            {draftConstitution.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            Based on the {template.label} example · {draftConstitution.version}
          </p>
        </div>
      </header>

      <ol className="space-y-4">
        {draftConstitution.clauses.map((clause) => (
          <li key={clause.number} className="gov-clause space-y-1.5">
            <div className="flex items-baseline gap-2">
              <span className="gov-clause-num text-sm">{clause.number}.</span>
              <h4 className="font-display text-base font-medium text-foreground">
                {clause.title}
              </h4>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {clause.body}
            </p>
          </li>
        ))}
      </ol>

      <div className="space-y-3 border-t border-border pt-4">
        {confirmed ? (
          <output
            data-ocid="os.constitution.confirmed"
            className="flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-foreground"
          >
            <Check className="size-4 text-primary" aria-hidden="true" />
            Your draft constitution is confirmed. This is a demonstration — no
            rules were saved.
          </output>
        ) : (
          <p className="text-sm leading-relaxed text-muted-foreground">
            Confirming shows how your rules would read as a signed instrument.
            Nothing is saved in this demonstration.
          </p>
        )}
        <button
          type="button"
          data-ocid="os.constitution.confirm_button"
          onClick={onConfirm}
          disabled={confirmed}
          className="os-focus-ring inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Sparkles className="size-4" aria-hidden="true" />
          {confirmed ? "Confirmed" : "Confirm this constitution"}
        </button>
      </div>
    </article>
  );
}

/** The example template picker. Every template is labelled an example. */
function TemplatePicker({
  selectedKey,
  onSelect,
}: {
  selectedKey: string;
  onSelect: (template: ConstitutionTemplate) => void;
}) {
  return (
    <section
      data-ocid="os.constitution.templates"
      aria-label="Start with a template"
      className="shell-panel space-y-3 p-4"
    >
      <div className="space-y-1">
        <p className="text-stamp text-accent">Start with a template</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Each template is an example. Choose the closest fit, then make it your
          own.
        </p>
      </div>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {constitutionTemplates.map((template) => {
          const isSelected = template.key === selectedKey;
          return (
            <li key={template.key}>
              <button
                type="button"
                data-ocid={`os.constitution.template.${template.key}`}
                aria-pressed={isSelected}
                onClick={() => onSelect(template)}
                className={`gov-template-card os-focus-ring flex h-full w-full flex-col gap-1.5 p-3 text-left ${
                  isSelected ? "gov-template-card-selected" : ""
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-display text-sm font-medium text-foreground">
                    {template.label}
                  </span>
                  <span className="gov-template-example-chip">Example</span>
                </span>
                <span className="text-xs leading-relaxed text-muted-foreground">
                  {template.description}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** The rule impact simulation: what changing a rule would affect. */
function RuleImpactPanel() {
  return (
    <section
      data-ocid="os.constitution.rule_impact"
      aria-label="Rule impact simulation"
      className="shell-panel space-y-3 p-4"
    >
      <div className="space-y-1">
        <p className="text-stamp text-accent">Rule impact simulation</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          A preview of how your rules would work in practice.
        </p>
      </div>
      <ul className="space-y-2">
        {ruleImpacts.map((rule) => (
          <li
            key={rule.key}
            data-ocid={`os.constitution.rule.${rule.key}`}
            className="gov-demo-impact space-y-0.5 py-1 pl-3"
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-medium text-foreground">
                {rule.label}
              </span>
              <span className="text-tabular text-xs font-semibold text-accent">
                {rule.value}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {rule.impact}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** The closing call to action. */
function CtaPanel() {
  return (
    <section
      data-ocid="os.constitution.cta"
      className="gov-cta-panel space-y-3 rounded-xl p-5 text-center"
    >
      <p className="font-display text-lg font-medium leading-snug">
        Your organization. Your rules. Build your DAO.
      </p>
      <p className="text-sm opacity-90">
        This is a demonstration. Deploy your own Nation to make it real.
      </p>
      <span className="gov-cta-inverse inline-flex min-h-[44px] items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold">
        Start building
      </span>
    </section>
  );
}
