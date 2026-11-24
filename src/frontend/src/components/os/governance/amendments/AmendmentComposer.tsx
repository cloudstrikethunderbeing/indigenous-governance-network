import { Loader2, Plus, ScrollText, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import type { GovernanceRuleSet, NationId, RuleChange } from "@/backend";
import { useActiveNation } from "@/components/os/attachments/useActiveNation";
import {
  formatRuleValue,
  ruleExplanations,
  ruleGroups,
} from "@/components/os/governance/rules/ruleExplanations";
import { useActiveRuleSet } from "@/components/os/governance/rules/useRules";
import { useProposeAmendment } from "@/hooks/useGovernanceLifecycle";

/** One rule the member has chosen to change, with its new value. */
interface DraftChange {
  field: keyof GovernanceRuleSet;
  afterValue: string;
}

/** The default voting window for a new amendment, in days. */
const DEFAULT_VOTING_DAYS = 14;

/** Every rule field, in the order the rule groups present them. */
const ALL_FIELDS: (keyof GovernanceRuleSet)[] = ruleGroups.flatMap(
  (group) => group.fields,
);

/** A plain label for a rule field. */
function fieldLabel(field: keyof GovernanceRuleSet): string {
  return ruleExplanations[field].label;
}

/** Convert a date input value to a nanosecond backend timestamp. */
function dateToTimestamp(value: string): bigint | null {
  if (!value) return null;
  const date = new Date(`${value}T23:59:59`);
  if (Number.isNaN(date.getTime())) return null;
  return BigInt(date.getTime()) * 1_000_000n;
}

/** A date input value a few days from now, used as the default deadline. */
function defaultDeadlineValue(): string {
  const date = new Date();
  date.setDate(date.getDate() + DEFAULT_VOTING_DAYS);
  return date.toISOString().slice(0, 10);
}

/**
 * The amendment composer: an eligible member picks the rules to change, enters
 * the new values, sets a voting deadline and proposes the amendment. The
 * current value of every chosen rule is shown beside its new value so the
 * change is unambiguous before it is submitted.
 */
export default function AmendmentComposer() {
  const { nationId, readOnly } = useActiveNation();
  const ruleSetQuery = useActiveRuleSet(nationId);
  const propose = useProposeAmendment();

  const rules = ruleSetQuery.data ?? null;

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [deadline, setDeadline] = useState(defaultDeadlineValue);
  const [changes, setChanges] = useState<DraftChange[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [proposedTitle, setProposedTitle] = useState<string | null>(null);

  const availableFields = useMemo(
    () => ALL_FIELDS.filter((field) => !changes.some((c) => c.field === field)),
    [changes],
  );

  const addChange = () => {
    const next = availableFields[0];
    if (!next) return;
    setChanges((current) => [...current, { field: next, afterValue: "" }]);
  };

  const updateChange = (index: number, patch: Partial<DraftChange>) => {
    setChanges((current) =>
      current.map((change, i) =>
        i === index ? { ...change, ...patch } : change,
      ),
    );
  };

  const removeChange = (index: number) => {
    setChanges((current) => current.filter((_, i) => i !== index));
  };

  const canSubmit =
    !readOnly &&
    !propose.isPending &&
    title.trim().length > 0 &&
    summary.trim().length > 0 &&
    changes.length > 0 &&
    changes.every((change) => change.afterValue.trim().length > 0) &&
    dateToTimestamp(deadline) !== null;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setProposedTitle(null);

    const votingDeadline = dateToTimestamp(deadline);
    if (!votingDeadline) {
      setError("Choose a valid voting deadline.");
      return;
    }

    const ruleChanges: RuleChange[] = changes.map((change) => ({
      fieldName: change.field,
      beforeValue: rules ? formatRuleValue(change.field, rules) : "",
      afterValue: change.afterValue.trim(),
    }));

    const capturedTitle = title.trim();
    propose.mutate(
      {
        nation: nationId,
        title: capturedTitle,
        summary: summary.trim(),
        changes: ruleChanges,
        votingDeadline,
      },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "err") {
            setError(lifecycleMessage(result.err));
            return;
          }
          setProposedTitle(capturedTitle);
          setTitle("");
          setSummary("");
          setChanges([]);
          setDeadline(defaultDeadlineValue());
        },
        onError: () => {
          setError("The amendment could not be proposed. Please try again.");
        },
      },
    );
  };

  if (ruleSetQuery.isLoading) {
    return (
      <div
        data-ocid="os.governance.amendments.composer_loading"
        aria-busy="true"
        className="shell-panel h-40 animate-pulse bg-muted/40"
      />
    );
  }

  if (!rules) {
    return (
      <section
        data-ocid="os.governance.amendments.composer_empty_state"
        className="shell-panel space-y-2 p-5"
      >
        <p className="font-display text-base font-medium text-foreground">
          No rules to amend yet
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Your organization has not confirmed its constitution yet. Once it has,
          you can propose changes to its rules here.
        </p>
      </section>
    );
  }

  return (
    <form
      data-ocid="os.governance.amendments.composer"
      onSubmit={handleSubmit}
      className="shell-panel space-y-5 p-5"
    >
      <header className="flex items-start gap-3">
        <span className="gov-seal size-11 shrink-0" aria-hidden="true">
          <ScrollText className="size-5" />
        </span>
        <div className="min-w-0 space-y-1">
          <p className="text-stamp text-accent">Propose an amendment</p>
          <h3 className="font-display text-lg font-medium tracking-tight text-foreground">
            Change the rules, together
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Pick the rules you want to change and enter their new values. Your
            proposal goes to the community for discussion and a vote.
          </p>
        </div>
      </header>

      {readOnly ? (
        <p
          data-ocid="os.governance.amendments.composer_readonly"
          className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
        >
          You are viewing the Sample Nation. Sign in with your own Nation to
          propose an amendment.
        </p>
      ) : null}

      <div className="space-y-1">
        <label
          htmlFor="amendment-title"
          className="text-sm font-medium text-foreground"
        >
          Title
        </label>
        <input
          id="amendment-title"
          data-ocid="os.governance.amendments.title_input"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Shorten the waiting time to join"
          className="os-focus-ring min-h-[44px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="space-y-1">
        <label
          htmlFor="amendment-summary"
          className="text-sm font-medium text-foreground"
        >
          Why this change
        </label>
        <textarea
          id="amendment-summary"
          data-ocid="os.governance.amendments.summary_input"
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          rows={3}
          placeholder="Explain in plain words why these rules should change."
          className="os-focus-ring w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <section aria-label="Rules to change" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground">Rules to change</p>
          <button
            type="button"
            data-ocid="os.governance.amendments.add_rule_button"
            onClick={addChange}
            disabled={availableFields.length === 0 || readOnly}
            className="os-focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-input bg-card px-3 py-2 text-sm font-medium text-foreground transition-smooth hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add a rule
          </button>
        </div>

        {changes.length === 0 ? (
          <p
            data-ocid="os.governance.amendments.changes_empty_state"
            className="shell-panel-alt p-4 text-sm text-muted-foreground"
          >
            No rules chosen yet. Add a rule to start your amendment.
          </p>
        ) : (
          <ul className="space-y-3">
            {changes.map((change, index) => (
              <li
                key={change.field}
                data-ocid={`os.governance.amendments.change.${index + 1}`}
                className="shell-panel-alt space-y-3 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1 space-y-1">
                    <label
                      htmlFor={`amendment-rule-${index}`}
                      className="text-sm font-medium text-foreground"
                    >
                      Rule
                    </label>
                    <select
                      id={`amendment-rule-${index}`}
                      data-ocid={`os.governance.amendments.rule_select.${index + 1}`}
                      value={change.field}
                      onChange={(event) =>
                        updateChange(index, {
                          field: event.target.value as keyof GovernanceRuleSet,
                          afterValue: "",
                        })
                      }
                      className="os-focus-ring min-h-[44px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground"
                    >
                      {[change.field, ...availableFields].map((field) => (
                        <option key={field} value={field}>
                          {fieldLabel(field)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    data-ocid={`os.governance.amendments.remove_rule_button.${index + 1}`}
                    onClick={() => removeChange(index)}
                    aria-label={`Remove ${fieldLabel(change.field)}`}
                    className="os-focus-ring inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-input bg-card text-muted-foreground transition-smooth hover:border-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-stamp text-muted-foreground">
                      Current value
                    </p>
                    <p className="text-tabular text-sm font-semibold text-foreground">
                      {formatRuleValue(change.field, rules)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor={`amendment-after-${index}`}
                      className="text-stamp text-accent"
                    >
                      New value
                    </label>
                    <input
                      id={`amendment-after-${index}`}
                      data-ocid={`os.governance.amendments.after_input.${index + 1}`}
                      type="text"
                      value={change.afterValue}
                      onChange={(event) =>
                        updateChange(index, { afterValue: event.target.value })
                      }
                      placeholder="Enter the new value"
                      className="os-focus-ring min-h-[44px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="space-y-1">
        <label
          htmlFor="amendment-deadline"
          className="text-sm font-medium text-foreground"
        >
          Voting deadline
        </label>
        <input
          id="amendment-deadline"
          data-ocid="os.governance.amendments.deadline_input"
          type="date"
          value={deadline}
          onChange={(event) => setDeadline(event.target.value)}
          className="os-focus-ring min-h-[44px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground sm:max-w-xs"
        />
        <p className="text-xs text-muted-foreground">
          Voting closes at the end of this day.
        </p>
      </div>

      {error ? (
        <p
          data-ocid="os.governance.amendments.composer_error"
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      {proposedTitle ? (
        <output
          data-ocid="os.governance.amendments.composer_success"
          className="block rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-foreground"
        >
          “{proposedTitle}” was proposed. It now appears below for discussion
          and voting.
        </output>
      ) : null}

      <button
        type="submit"
        data-ocid="os.governance.amendments.submit_button"
        disabled={!canSubmit}
        className="os-focus-ring inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {propose.isPending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : null}
        Propose amendment
      </button>
    </form>
  );
}

/** A plain-language message for a failed amendment proposal. */
function lifecycleMessage(error: string): string {
  switch (error) {
    case "notAuthorized":
      return "You do not have permission to propose an amendment.";
    case "missingTitle":
      return "A title is required.";
    case "missingSummary":
      return "A short explanation is required.";
    case "notNationMember":
      return "Only members of this Nation can propose an amendment.";
    case "invalidThreshold":
      return "That value is not valid for this rule.";
    default:
      return "The amendment could not be proposed. Please try again.";
  }
}
