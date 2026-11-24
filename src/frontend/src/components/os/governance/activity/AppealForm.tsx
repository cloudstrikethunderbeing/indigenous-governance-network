import { CheckCircle2, Scale } from "lucide-react";
import { type FormEvent, useState } from "react";

import { AppealKind, type GovernanceProposal } from "@/backend";
import { useFileAppeal } from "@/components/os/governance/activity/useActivityData";

/** The three plain-language choices for what an appeal is about. */
const appealChoices: { kind: AppealKind; label: string; hint: string }[] = [
  {
    kind: AppealKind.membershipRejection,
    label: "A membership decision",
    hint: "Someone was not approved to join, or a membership was changed.",
  },
  {
    kind: AppealKind.inactivity,
    label: "An inactivity decision",
    hint: "A member was marked inactive or removed for not taking part.",
  },
  {
    kind: AppealKind.governanceDecision,
    label: "A governance decision",
    hint: "A decision the community made that you disagree with.",
  },
];

/** A plain-language message for a failed appeal. */
function appealErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("notAuthorized")) {
    return "Only members of this organization can file an appeal. Sign in as a member and try again.";
  }
  if (message.includes("missingSummary")) {
    return "Please write a short description of what happened.";
  }
  return "Your appeal could not be filed. Please try again.";
}

/**
 * A short guided form to file an appeal from the Activity section. It asks
 * three simple questions — what the appeal is about, which decision it concerns
 * and what happened — then files it. The appeal's progress then appears in the
 * same timeline.
 */
export default function AppealForm({
  nation,
  decisions,
  readOnly,
}: {
  nation: bigint;
  decisions: GovernanceProposal[];
  readOnly: boolean;
}) {
  const fileAppeal = useFileAppeal();

  const [kind, setKind] = useState<AppealKind>(AppealKind.governanceDecision);
  const [subjectId, setSubjectId] = useState<string>("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [filed, setFiled] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const trimmed = summary.trim();
    if (trimmed.length === 0) {
      setError("Please write a short description of what happened.");
      return;
    }
    const subject = subjectId === "" ? 0n : BigInt(subjectId);
    fileAppeal.mutate(
      { nation, kind, subjectId: subject, summary: trimmed },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "ok") {
            setFiled(true);
            setSummary("");
            setSubjectId("");
          } else {
            setError(appealErrorMessage(new Error(result.err)));
          }
        },
        onError: (mutationError) => {
          setError(appealErrorMessage(mutationError));
        },
      },
    );
  }

  if (filed) {
    return (
      <section
        data-ocid="os.governance.activity.appeal_success_state"
        className="shell-panel space-y-3 p-5"
      >
        <div className="flex items-center gap-2">
          <CheckCircle2
            className="size-5 shrink-0 text-success"
            aria-hidden="true"
          />
          <p className="font-display text-base font-medium text-foreground">
            Your appeal was filed
          </p>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          It now appears in the timeline above. You will see its progress there
          as it is reviewed.
        </p>
        <button
          type="button"
          data-ocid="os.governance.activity.appeal_again_button"
          onClick={() => setFiled(false)}
          className="os-focus-ring inline-flex min-h-[44px] items-center justify-center rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-smooth hover:bg-muted"
        >
          File another appeal
        </button>
      </section>
    );
  }

  return (
    <section
      data-ocid="os.governance.activity.appeal_form"
      className="shell-panel space-y-5 p-5"
    >
      <div className="flex items-center gap-2">
        <Scale className="size-5 shrink-0 text-accent" aria-hidden="true" />
        <h3 className="font-display text-base font-medium text-foreground">
          File an appeal
        </h3>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">
        If you disagree with a decision, you can ask for it to be reviewed. It
        takes three short steps.
      </p>

      {readOnly ? (
        <p
          data-ocid="os.governance.activity.appeal_readonly"
          className="rounded-lg border border-border bg-muted/40 p-3 text-sm leading-relaxed text-muted-foreground"
        >
          This is the sample organization, so appeals cannot be filed here. Sign
          in as a member of your own organization to file an appeal.
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-foreground">
            1. What is this about?
          </legend>
          <div className="space-y-2">
            {appealChoices.map((choice) => (
              <label
                key={choice.kind}
                className="flex min-h-[44px] cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-3 transition-smooth hover:bg-muted/40"
              >
                <input
                  type="radio"
                  name="appeal-kind"
                  value={choice.kind}
                  data-ocid={`os.governance.activity.appeal_kind.${choice.kind}`}
                  checked={kind === choice.kind}
                  onChange={() => setKind(choice.kind)}
                  className="mt-1 size-4 shrink-0 accent-[oklch(var(--primary))]"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">
                    {choice.label}
                  </span>
                  <span className="block text-xs leading-relaxed text-muted-foreground">
                    {choice.hint}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="space-y-2">
          <label
            htmlFor="appeal-subject"
            className="block text-sm font-medium text-foreground"
          >
            2. Which decision? (optional)
          </label>
          <select
            id="appeal-subject"
            data-ocid="os.governance.activity.appeal_subject_select"
            value={subjectId}
            onChange={(event) => setSubjectId(event.target.value)}
            className="os-focus-ring min-h-[44px] w-full rounded-lg border border-input bg-card px-3 py-3 text-sm text-foreground"
          >
            <option value="">Something else</option>
            {decisions.map((decision) => (
              <option
                key={decision.id.toString()}
                value={decision.id.toString()}
              >
                {decision.title}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="appeal-summary"
            className="block text-sm font-medium text-foreground"
          >
            3. What happened?
          </label>
          <textarea
            id="appeal-summary"
            data-ocid="os.governance.activity.appeal_summary_textarea"
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            rows={3}
            maxLength={500}
            placeholder="In one or two sentences, tell us what you disagree with."
            className="os-focus-ring w-full rounded-lg border border-input bg-card px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {error ? (
          <p
            data-ocid="os.governance.activity.appeal_error_state"
            role="alert"
            className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-foreground"
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          data-ocid="os.governance.activity.appeal_submit_button"
          disabled={fileAppeal.isPending || readOnly}
          className="os-focus-ring inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-smooth hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {fileAppeal.isPending ? "Filing your appeal…" : "File appeal"}
        </button>
      </form>
    </section>
  );
}
