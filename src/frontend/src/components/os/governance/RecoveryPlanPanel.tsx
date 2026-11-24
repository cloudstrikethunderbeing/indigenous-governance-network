import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Principal } from "@icp-sdk/core/principal";
import {
  Check,
  CheckCircle2,
  Loader2,
  Plus,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import type {
  AlternateAuthority,
  CouncilMember,
  DesignatedSuccessor,
  NationId,
  RecoveryTrustee,
  SuccessionRecoveryPlan,
} from "@/backend";
import { useActiveNation } from "@/components/os/attachments/useActiveNation";
import { formatDate } from "@/components/os/governance/activity/activityLabels";
import {
  lifecycleErrorMessage,
  useRatifySuccessionPlan,
  useSaveSuccessionPlan,
  useSuccessionPlan,
} from "@/hooks/useGovernanceLifecycle";
import { useAuthorityPositions } from "@/hooks/useGovernanceLifecycle";
import { useMyNations } from "@/hooks/useSovereign";

/** A person entered by principal ID, with an optional display label. */
interface PersonEntry {
  key: string;
  principal: string;
  label: string;
}

/** A successor entry also names the authority seat it stands behind. */
interface SuccessorEntry extends PersonEntry {
  position: string;
}

/** The editable draft of the succession and recovery plan. */
interface PlanDraft {
  successors: SuccessorEntry[];
  alternates: SuccessorEntry[];
  council: PersonEntry[];
  trustees: PersonEntry[];
  threshold: string;
  procedure: string;
}

const EMPTY_PERSON: PersonEntry = { key: "", principal: "", label: "" };
const EMPTY_SUCCESSOR: SuccessorEntry = {
  key: "",
  principal: "",
  label: "",
  position: "",
};

/** A unique key for a freshly added draft row. */
function newRowKey(): string {
  return `row-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Build the editable draft from a saved plan, or start empty. */
function draftFromPlan(plan: SuccessionRecoveryPlan | null): PlanDraft {
  if (!plan) {
    return {
      successors: [{ ...EMPTY_SUCCESSOR, key: newRowKey() }],
      alternates: [{ ...EMPTY_SUCCESSOR, key: newRowKey() }],
      council: [{ ...EMPTY_PERSON, key: newRowKey() }],
      trustees: [{ ...EMPTY_PERSON, key: newRowKey() }],
      threshold: "2",
      procedure: "",
    };
  }
  return {
    successors: plan.designatedSuccessors.map((entry) => ({
      key: newRowKey(),
      principal: entry.successor.toText(),
      label: entry.successorDisplayLabel,
      position: entry.position.toString(),
    })),
    alternates: plan.alternateAuthorities.map((entry) => ({
      key: newRowKey(),
      principal: entry.alternate.toText(),
      label: entry.alternateDisplayLabel,
      position: entry.coversPosition.toString(),
    })),
    council: plan.membershipCouncil.map((entry) => ({
      key: newRowKey(),
      principal: entry.councilMember.toText(),
      label: entry.councilMemberDisplayLabel,
    })),
    trustees: plan.recoveryTrustees.map((entry) => ({
      key: newRowKey(),
      principal: entry.trustee.toText(),
      label: entry.trusteeDisplayLabel,
    })),
    threshold: plan.recoveryApprovalThreshold.toString(),
    procedure: plan.identityRecoveryProcedure,
  };
}

/** Parse a principal, returning null when the text is not a valid principal. */
function parsePrincipal(text: string): Principal | null {
  const trimmed = text.trim();
  if (trimmed.length === 0) return null;
  try {
    return Principal.fromText(trimmed);
  } catch {
    return null;
  }
}

/** A short, non-technical label for a person, falling back to their principal. */
function personLabel(principal: Principal, label: string): string {
  const trimmed = label.trim();
  if (trimmed.length > 0) return trimmed;
  const text = principal.toText();
  return `Member ${text.slice(-4).toUpperCase()}`;
}

/** A labelled text input used throughout the plan form. */
function Field({
  label,
  value,
  onChange,
  placeholder,
  ocid,
  mono,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ocid: string;
  mono?: boolean;
}) {
  return (
    <label className="min-w-0 space-y-1">
      <span className="block text-xs font-medium text-foreground">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        data-ocid={ocid}
        className={`min-h-[44px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground transition-smooth placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
          mono ? "font-mono text-xs" : ""
        }`}
      />
    </label>
  );
}

/** A removable row wrapper with a delete control. */
function RowShell({
  index,
  onRemove,
  canRemove,
  children,
}: {
  index: number;
  onRemove: () => void;
  canRemove: boolean;
  children: React.ReactNode;
}) {
  return (
    <li className="min-w-0 rounded-lg border border-border bg-card p-3">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1 space-y-2">{children}</div>
        {canRemove ? (
          <button
            type="button"
            aria-label={`Remove entry ${index}`}
            data-ocid={`os.governance.recovery_plan.remove_button.${index}`}
            onClick={onRemove}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-smooth hover:border-destructive/50 hover:text-destructive focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </li>
  );
}

/**
 * The succession and recovery plan panel. The founding authorities configure
 * designated successors, alternate authorities, an elected membership council,
 * independent recovery trustees, a recovery approval threshold and an identity
 * recovery procedure, save the plan, then ratify it so it becomes
 * constitutionally binding. The backend enforces who may save and ratify.
 */
export default function RecoveryPlanPanel() {
  const { nationId, readOnly } = useActiveNation();
  const plan = useSuccessionPlan(nationId);
  const positions = useAuthorityPositions(nationId);
  const myNations = useMyNations();
  const { identity } = useInternetIdentity();
  const save = useSaveSuccessionPlan();
  const ratify = useRatifySuccessionPlan();

  const [draft, setDraft] = useState<PlanDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const savedPlan = plan.data ?? null;
  const current = draft ?? draftFromPlan(savedPlan);

  // Only the Nation's founding authority may edit or ratify the plan.
  const caller = identity?.getPrincipal();
  const ownedNation = (myNations.data ?? []).find(
    (entry) => entry.id === nationId && !entry.isSample,
  );
  const canManage = !!caller && !!ownedNation && !caller.isAnonymous();
  const editable = canManage && !readOnly;

  const positionOptions = useMemo(
    () =>
      (positions.data ?? []).map((position) => ({
        id: position.id.toString(),
        label: position.seatLabel,
      })),
    [positions.data],
  );

  function update<K extends keyof PlanDraft>(key: K, value: PlanDraft[K]) {
    setSaved(false);
    setDraft({ ...current, [key]: value });
  }

  function updateSuccessor(
    key: "successors" | "alternates",
    index: number,
    patch: Partial<SuccessorEntry>,
  ) {
    const next = current[key].map((entry, i) =>
      i === index ? { ...entry, ...patch } : entry,
    );
    update(key, next);
  }

  function updatePerson(
    key: "council" | "trustees",
    index: number,
    patch: Partial<PersonEntry>,
  ) {
    const next = current[key].map((entry, i) =>
      i === index ? { ...entry, ...patch } : entry,
    );
    update(key, next);
  }

  function addSuccessor(key: "successors" | "alternates") {
    update(key, [...current[key], { ...EMPTY_SUCCESSOR, key: newRowKey() }]);
  }

  function addPerson(key: "council" | "trustees") {
    update(key, [...current[key], { ...EMPTY_PERSON, key: newRowKey() }]);
  }

  function removeSuccessor(key: "successors" | "alternates", index: number) {
    update(
      key,
      current[key].filter((_, i) => i !== index),
    );
  }

  function removePerson(key: "council" | "trustees", index: number) {
    update(
      key,
      current[key].filter((_, i) => i !== index),
    );
  }

  /** Validate the draft and build the plan the backend expects. */
  function buildPlan(): SuccessionRecoveryPlan | null {
    setError(null);

    const designatedSuccessors: DesignatedSuccessor[] = [];
    for (const entry of current.successors) {
      if (entry.principal.trim().length === 0) continue;
      const successor = parsePrincipal(entry.principal);
      if (!successor) {
        setError(
          "One of the successor principal IDs is not valid. Please check it and try again.",
        );
        return null;
      }
      if (entry.position.trim().length === 0) {
        setError("Choose the authority seat each successor stands behind.");
        return null;
      }
      designatedSuccessors.push({
        successor,
        position: BigInt(entry.position),
        successorDisplayLabel: personLabel(successor, entry.label),
      });
    }

    const alternateAuthorities: AlternateAuthority[] = [];
    for (const entry of current.alternates) {
      if (entry.principal.trim().length === 0) continue;
      const alternate = parsePrincipal(entry.principal);
      if (!alternate) {
        setError(
          "One of the alternate authority principal IDs is not valid. Please check it and try again.",
        );
        return null;
      }
      if (entry.position.trim().length === 0) {
        setError("Choose the seat each alternate authority covers.");
        return null;
      }
      alternateAuthorities.push({
        alternate,
        coversPosition: BigInt(entry.position),
        alternateDisplayLabel: personLabel(alternate, entry.label),
      });
    }

    const membershipCouncil: CouncilMember[] = [];
    for (const entry of current.council) {
      if (entry.principal.trim().length === 0) continue;
      const member = parsePrincipal(entry.principal);
      if (!member) {
        setError(
          "One of the council member principal IDs is not valid. Please check it and try again.",
        );
        return null;
      }
      membershipCouncil.push({
        councilMember: member,
        councilMemberDisplayLabel: personLabel(member, entry.label),
      });
    }

    const recoveryTrustees: RecoveryTrustee[] = [];
    for (const entry of current.trustees) {
      if (entry.principal.trim().length === 0) continue;
      const trustee = parsePrincipal(entry.principal);
      if (!trustee) {
        setError(
          "One of the recovery trustee principal IDs is not valid. Please check it and try again.",
        );
        return null;
      }
      recoveryTrustees.push({
        trustee,
        trusteeDisplayLabel: personLabel(trustee, entry.label),
      });
    }

    if (designatedSuccessors.length === 0) {
      setError("Add at least one designated successor before saving.");
      return null;
    }
    if (recoveryTrustees.length === 0) {
      setError("Add at least one independent recovery trustee before saving.");
      return null;
    }

    let threshold: bigint;
    try {
      threshold = BigInt(current.threshold.trim());
    } catch {
      setError("The recovery approval threshold must be a whole number.");
      return null;
    }
    if (threshold < 1n || threshold > BigInt(recoveryTrustees.length)) {
      setError(
        `The recovery approval threshold must be between 1 and ${recoveryTrustees.length}.`,
      );
      return null;
    }

    if (current.procedure.trim().length === 0) {
      setError("Describe the identity recovery procedure before saving.");
      return null;
    }

    return {
      nation: nationId,
      designatedSuccessors,
      alternateAuthorities,
      membershipCouncil,
      recoveryTrustees,
      recoveryApprovalThreshold: threshold,
      identityRecoveryProcedure: current.procedure.trim(),
      ratified: savedPlan?.ratified ?? false,
      ratifications: savedPlan?.ratifications ?? [],
      timestamp: savedPlan?.timestamp ?? 0n,
    };
  }

  function handleSave() {
    const next = buildPlan();
    if (!next) return;
    save.mutate(
      { nation: nationId, plan: next },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "err") {
            setError(lifecycleErrorMessage(result.err));
            return;
          }
          setSaved(true);
          setDraft(null);
        },
        onError: () =>
          setError(
            "The plan could not be saved. Please check your connection and try again.",
          ),
      },
    );
  }

  function handleRatify() {
    setError(null);
    ratify.mutate(nationId, {
      onSuccess: (result) => {
        if (result.__kind__ === "err") {
          setError(lifecycleErrorMessage(result.err));
        }
      },
      onError: () =>
        setError(
          "The plan could not be ratified. Please check your connection and try again.",
        ),
    });
  }

  const ratified = savedPlan?.ratified ?? false;

  return (
    <section
      data-ocid="os.governance.recovery_plan"
      aria-label="Succession and recovery plan"
      className="shell-panel min-w-0 space-y-5 p-4 md:p-6"
    >
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-stamp text-accent">Succession &amp; recovery</p>
          <h3 className="font-display text-xl font-medium tracking-tight text-foreground">
            Who carries the Nation forward
          </h3>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            Decide in advance who steps in if an authority leaves, and how a
            lost identity is recovered — so the Nation never depends on one
            person.
          </p>
        </div>
        <span
          data-ocid="os.governance.recovery_plan.status"
          className={`inline-flex shrink-0 items-center gap-2 self-start rounded-full border px-4 py-2 text-xs font-medium ${
            ratified
              ? "border-success/40 bg-success/10 text-success"
              : "border-warning/40 bg-warning/10 text-warning"
          }`}
        >
          <ShieldCheck className="size-4" aria-hidden="true" />
          {ratified
            ? "Ratified"
            : savedPlan
              ? "Saved, not ratified"
              : "Not set"}
        </span>
      </div>

      {plan.isLoading ? (
        <div
          data-ocid="os.governance.recovery_plan.loading_state"
          className="space-y-2"
          aria-busy="true"
        >
          {Array.from({ length: 3 }, (_, i) => `plan-skeleton-${i}`).map(
            (id) => (
              <div
                key={id}
                className="h-12 animate-pulse rounded-lg bg-muted/40"
              />
            ),
          )}
        </div>
      ) : !editable ? (
        <ReadOnlyPlan plan={savedPlan} />
      ) : (
        <div className="space-y-5">
          <PlanSection
            title="Designated successors"
            hint="The person who steps into each authority seat if it becomes vacant."
            icon={Users}
            onAdd={() => addSuccessor("successors")}
            addOcid="os.governance.recovery_plan.add_successor_button"
          >
            {current.successors.map((entry, index) => (
              <RowShell
                key={entry.key}
                index={index + 1}
                canRemove={current.successors.length > 1}
                onRemove={() => removeSuccessor("successors", index)}
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  <Field
                    label="Principal ID"
                    value={entry.principal}
                    onChange={(value) =>
                      updateSuccessor("successors", index, { principal: value })
                    }
                    placeholder="e.g. 2vxsx-fae"
                    ocid={`os.governance.recovery_plan.successor_principal_input.${index + 1}`}
                    mono
                  />
                  <Field
                    label="Label (optional)"
                    value={entry.label}
                    onChange={(value) =>
                      updateSuccessor("successors", index, { label: value })
                    }
                    placeholder="e.g. Elder council"
                    ocid={`os.governance.recovery_plan.successor_label_input.${index + 1}`}
                  />
                </div>
                <SeatSelect
                  value={entry.position}
                  onChange={(value) =>
                    updateSuccessor("successors", index, { position: value })
                  }
                  options={positionOptions}
                  ocid={`os.governance.recovery_plan.successor_seat_select.${index + 1}`}
                />
              </RowShell>
            ))}
          </PlanSection>

          <PlanSection
            title="Alternate authorities"
            hint="A backup who can cover a seat while its holder is unavailable."
            icon={ShieldCheck}
            onAdd={() => addSuccessor("alternates")}
            addOcid="os.governance.recovery_plan.add_alternate_button"
          >
            {current.alternates.map((entry, index) => (
              <RowShell
                key={entry.key}
                index={index + 1}
                canRemove={current.alternates.length > 1}
                onRemove={() => removeSuccessor("alternates", index)}
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  <Field
                    label="Principal ID"
                    value={entry.principal}
                    onChange={(value) =>
                      updateSuccessor("alternates", index, { principal: value })
                    }
                    placeholder="e.g. 2vxsx-fae"
                    ocid={`os.governance.recovery_plan.alternate_principal_input.${index + 1}`}
                    mono
                  />
                  <Field
                    label="Label (optional)"
                    value={entry.label}
                    onChange={(value) =>
                      updateSuccessor("alternates", index, { label: value })
                    }
                    placeholder="e.g. Youth representative"
                    ocid={`os.governance.recovery_plan.alternate_label_input.${index + 1}`}
                  />
                </div>
                <SeatSelect
                  value={entry.position}
                  onChange={(value) =>
                    updateSuccessor("alternates", index, { position: value })
                  }
                  options={positionOptions}
                  ocid={`os.governance.recovery_plan.alternate_seat_select.${index + 1}`}
                />
              </RowShell>
            ))}
          </PlanSection>

          <PlanSection
            title="Membership council"
            hint="Elected members who represent the community in recovery decisions."
            icon={Users}
            onAdd={() => addPerson("council")}
            addOcid="os.governance.recovery_plan.add_council_button"
          >
            {current.council.map((entry, index) => (
              <RowShell
                key={entry.key}
                index={index + 1}
                canRemove={current.council.length > 1}
                onRemove={() => removePerson("council", index)}
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  <Field
                    label="Principal ID"
                    value={entry.principal}
                    onChange={(value) =>
                      updatePerson("council", index, { principal: value })
                    }
                    placeholder="e.g. 2vxsx-fae"
                    ocid={`os.governance.recovery_plan.council_principal_input.${index + 1}`}
                    mono
                  />
                  <Field
                    label="Label (optional)"
                    value={entry.label}
                    onChange={(value) =>
                      updatePerson("council", index, { label: value })
                    }
                    placeholder="e.g. Community council"
                    ocid={`os.governance.recovery_plan.council_label_input.${index + 1}`}
                  />
                </div>
              </RowShell>
            ))}
          </PlanSection>

          <PlanSection
            title="Independent recovery trustees"
            hint="People outside the authorities who approve an identity recovery."
            icon={ShieldCheck}
            onAdd={() => addPerson("trustees")}
            addOcid="os.governance.recovery_plan.add_trustee_button"
          >
            {current.trustees.map((entry, index) => (
              <RowShell
                key={entry.key}
                index={index + 1}
                canRemove={current.trustees.length > 1}
                onRemove={() => removePerson("trustees", index)}
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  <Field
                    label="Principal ID"
                    value={entry.principal}
                    onChange={(value) =>
                      updatePerson("trustees", index, { principal: value })
                    }
                    placeholder="e.g. 2vxsx-fae"
                    ocid={`os.governance.recovery_plan.trustee_principal_input.${index + 1}`}
                    mono
                  />
                  <Field
                    label="Label (optional)"
                    value={entry.label}
                    onChange={(value) =>
                      updatePerson("trustees", index, { label: value })
                    }
                    placeholder="e.g. Independent trustee"
                    ocid={`os.governance.recovery_plan.trustee_label_input.${index + 1}`}
                  />
                </div>
              </RowShell>
            ))}
          </PlanSection>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Recovery approval threshold"
              value={current.threshold}
              onChange={(value) => update("threshold", value)}
              placeholder="e.g. 2"
              ocid="os.governance.recovery_plan.threshold_input"
            />
            <label className="min-w-0 space-y-1 sm:col-span-2">
              <span className="block text-xs font-medium text-foreground">
                Identity recovery procedure
              </span>
              <textarea
                value={current.procedure}
                onChange={(event) => update("procedure", event.target.value)}
                rows={4}
                placeholder="Describe how a member proves who they are and how trustees approve replacing a lost identity."
                data-ocid="os.governance.recovery_plan.procedure_textarea"
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground transition-smooth placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              />
            </label>
          </div>

          {error ? (
            <p
              role="alert"
              data-ocid="os.governance.recovery_plan.error_state"
              className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              <X className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </p>
          ) : null}

          {saved ? (
            <p
              data-ocid="os.governance.recovery_plan.success_state"
              className="flex items-start gap-2 rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-sm text-success"
            >
              <CheckCircle2
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <span>Your plan is saved. Ratify it to make it binding.</span>
            </p>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              data-ocid="os.governance.recovery_plan.save_button"
              disabled={save.isPending}
              onClick={handleSave}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
            >
              {save.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Check className="size-4" aria-hidden="true" />
              )}
              {save.isPending ? "Saving…" : "Save plan"}
            </button>
            <button
              type="button"
              data-ocid="os.governance.recovery_plan.ratify_button"
              disabled={ratify.isPending || !savedPlan || ratified}
              onClick={handleRatify}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition-smooth hover:border-primary/50 hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
            >
              {ratify.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <ShieldCheck className="size-4" aria-hidden="true" />
              )}
              {ratified
                ? "Ratified"
                : ratify.isPending
                  ? "Ratifying…"
                  : "Ratify plan"}
            </button>
          </div>
          {!savedPlan ? (
            <p className="text-xs leading-relaxed text-muted-foreground">
              Save the plan first, then ratify it to make it binding.
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}

/** A titled group of plan rows with an add control. */
function PlanSection({
  title,
  hint,
  icon: Icon,
  onAdd,
  addOcid,
  children,
}: {
  title: string;
  hint: string;
  icon: typeof Users;
  onAdd: () => void;
  addOcid: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          <Icon
            className="mt-0.5 size-4 shrink-0 text-accent"
            aria-hidden="true"
          />
          <div className="min-w-0 space-y-0.5">
            <p className="text-sm font-medium text-foreground">{title}</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {hint}
            </p>
          </div>
        </div>
        <button
          type="button"
          data-ocid={addOcid}
          onClick={onAdd}
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-semibold text-foreground transition-smooth hover:border-primary/50 hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Plus className="size-3.5" aria-hidden="true" />
          Add
        </button>
      </div>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

/** A select for choosing the authority seat an entry stands behind. */
function SeatSelect({
  value,
  onChange,
  options,
  ocid,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { id: string; label: string }[];
  ocid: string;
}) {
  return (
    <label className="min-w-0 space-y-1">
      <span className="block text-xs font-medium text-foreground">
        Authority seat
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        data-ocid={ocid}
        className="min-h-[44px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground transition-smooth focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <option value="">Choose a seat</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** The saved plan, shown read-only to members who cannot edit it. */
function ReadOnlyPlan({ plan }: { plan: SuccessionRecoveryPlan | null }) {
  if (!plan) {
    return (
      <p
        data-ocid="os.governance.recovery_plan.empty_state"
        className="text-sm leading-relaxed text-muted-foreground"
      >
        No succession and recovery plan has been set yet. The founding
        authorities set it up.
      </p>
    );
  }
  return (
    <div className="space-y-4">
      <ReadOnlyGroup
        title="Designated successors"
        items={plan.designatedSuccessors.map((entry) => ({
          label: entry.successorDisplayLabel,
          detail: `Seat ${entry.position.toString()}`,
        }))}
      />
      <ReadOnlyGroup
        title="Alternate authorities"
        items={plan.alternateAuthorities.map((entry) => ({
          label: entry.alternateDisplayLabel,
          detail: `Covers seat ${entry.coversPosition.toString()}`,
        }))}
      />
      <ReadOnlyGroup
        title="Membership council"
        items={plan.membershipCouncil.map((entry) => ({
          label: entry.councilMemberDisplayLabel,
          detail: "Council member",
        }))}
      />
      <ReadOnlyGroup
        title="Recovery trustees"
        items={plan.recoveryTrustees.map((entry) => ({
          label: entry.trusteeDisplayLabel,
          detail: "Independent trustee",
        }))}
      />
      <div className="rounded-lg border border-border bg-card p-3">
        <p className="text-xs font-medium text-muted-foreground">
          Recovery approval threshold
        </p>
        <p className="text-tabular font-mono text-sm font-semibold text-foreground">
          {plan.recoveryApprovalThreshold.toString()} trustee approvals
        </p>
      </div>
      <div className="rounded-lg border border-border bg-card p-3">
        <p className="text-xs font-medium text-muted-foreground">
          Identity recovery procedure
        </p>
        <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
          {plan.identityRecoveryProcedure}
        </p>
      </div>
      {plan.ratified ? (
        <p className="text-xs text-muted-foreground">
          Ratified by {plan.ratifications.length} authorities
          {plan.ratifications[0]
            ? ` · first on ${formatDate(plan.ratifications[0].ratifiedAt)}`
            : ""}
          .
        </p>
      ) : null}
    </div>
  );
}

/** A read-only list of people in one part of the plan. */
function ReadOnlyGroup({
  title,
  items,
}: {
  title: string;
  items: { label: string; detail: string }[];
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">None set.</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li
              key={`${title}-${item.label}-${item.detail}`}
              className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2"
            >
              <span className="min-w-0 truncate text-sm text-foreground">
                {item.label}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {item.detail}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
