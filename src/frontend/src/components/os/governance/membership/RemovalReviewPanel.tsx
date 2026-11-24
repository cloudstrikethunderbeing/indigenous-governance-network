import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  CheckCircle2,
  Gavel,
  MessageSquareWarning,
  Scale,
  ShieldAlert,
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";

import type { Principal } from "@icp-sdk/core/principal";

import {
  DepartureKind,
  DepartureStatus,
  type MemberDeparture,
  createActor,
} from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { GovernanceCapability } from "@/backend";
import { useActiveNation } from "@/components/os/attachments/useActiveNation";
import {
  formatDate,
  personLabel,
} from "@/components/os/governance/activity/activityLabels";
import {
  useCallerCapabilities,
  useNationMembers,
} from "@/components/os/governance/members/useGovernanceMembers";
import {
  lifecycleErrorMessage,
  useMemberDepartures,
} from "@/hooks/useGovernanceLifecycle";

/**
 * The removal review panel. An involuntary removal is never final on its own:
 * it moves through notice, then review, and the member may appeal before it
 * becomes effective. This panel shows each step, who acts, and the appeal path,
 * and lets the right person take the next step.
 */

/** The three steps every involuntary removal passes through. */
const REVIEW_STEPS: { key: string; label: string; description: string }[] = [
  {
    key: "notice",
    label: "Notice",
    description: "The member is told what is proposed and why.",
  },
  {
    key: "review",
    label: "Review",
    description: "An authorized authority reviews the facts fairly.",
  },
  {
    key: "appeal",
    label: "Appeal",
    description: "The member may appeal before the removal is final.",
  },
];

/** The step a departure currently sits at. */
function currentStep(status: DepartureStatus): number {
  switch (status) {
    case DepartureStatus.notice:
      return 0;
    case DepartureStatus.underReview:
      return 1;
    case DepartureStatus.appealed:
      return 2;
    case DepartureStatus.effective:
      return 3;
    default:
      return 0;
  }
}

/** A plain-language name for a departure status. */
function statusLabel(status: DepartureStatus): string {
  switch (status) {
    case DepartureStatus.notice:
      return "Notice given";
    case DepartureStatus.underReview:
      return "Under review";
    case DepartureStatus.appealed:
      return "Appeal open";
    case DepartureStatus.effective:
      return "Final";
    case DepartureStatus.withdrawn:
      return "Withdrawn";
    default:
      return "Recorded";
  }
}

/** Review a departure, moving it from notice to under review. */
function useReviewDeparture() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nation: bigint;
      departure: bigint;
      reviewNote: string;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.reviewMemberDeparture(
        input.nation,
        input.departure,
        input.reviewNote,
      );
    },
    onSuccess: (_result, input) => {
      void queryClient.invalidateQueries({
        queryKey: ["memberDepartures", input.nation.toString()],
      });
    },
  });
}

/** Appeal a departure as the affected member. */
function useAppealDeparture() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nation: bigint;
      departure: bigint;
      summary: string;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.appealMemberDeparture(
        input.nation,
        input.departure,
        input.summary,
      );
    },
    onSuccess: (_result, input) => {
      void queryClient.invalidateQueries({
        queryKey: ["memberDepartures", input.nation.toString()],
      });
    },
  });
}

/** Make a reviewed departure final. */
function useFinalizeDeparture() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { nation: bigint; departure: bigint }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.finalizeMemberDeparture(input.nation, input.departure);
    },
    onSuccess: (_result, input) => {
      void queryClient.invalidateQueries({
        queryKey: ["memberDepartures", input.nation.toString()],
      });
      void queryClient.invalidateQueries({
        queryKey: ["nationMembers", input.nation.toString()],
      });
    },
  });
}

export default function RemovalReviewPanel() {
  const { nationId, readOnly } = useActiveNation();
  const { identity } = useInternetIdentity();

  const membersQuery = useNationMembers(nationId);
  const capabilitiesQuery = useCallerCapabilities(nationId);
  const departuresQuery = useMemberDepartures(nationId);
  const reviewDeparture = useReviewDeparture();
  const appealDeparture = useAppealDeparture();
  const finalizeDeparture = useFinalizeDeparture();

  const [reviewNote, setReviewNote] = useState("");
  const [appealSummary, setAppealSummary] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const caller = useMemo<Principal | null>(() => {
    if (!identity) return null;
    const principal = identity.getPrincipal();
    return principal.isAnonymous() ? null : principal;
  }, [identity]);

  const members = useMemo(() => membersQuery.data ?? [], [membersQuery.data]);
  const capabilities = useMemo(
    () => capabilitiesQuery.data ?? [],
    [capabilitiesQuery.data],
  );
  const canModify = capabilities.includes(GovernanceCapability.modify);
  const canAct = canModify && !readOnly;

  const memberName = useMemo(() => {
    const byPrincipal = new Map(
      members.map((member) => [member.member.toText(), member.displayName]),
    );
    return (principal: Principal): string =>
      byPrincipal.get(principal.toText()) ?? personLabel(principal);
  }, [members]);

  // Only involuntary removals and suspensions go through this review path.
  const involuntary = useMemo<MemberDeparture[]>(() => {
    return (departuresQuery.data ?? []).filter(
      (departure) =>
        departure.kind === DepartureKind.constitutionalRemoval ||
        departure.kind === DepartureKind.suspension,
    );
  }, [departuresQuery.data]);

  function resetMessages() {
    setError(null);
    setDone(null);
  }

  function handleReview(departure: MemberDeparture) {
    resetMessages();
    const note = reviewNote.trim();
    if (note.length === 0) {
      setError("Please add a short review note before continuing.");
      return;
    }
    setActiveId(departure.id.toString());
    reviewDeparture.mutate(
      { nation: nationId, departure: departure.id, reviewNote: note },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "err") {
            setError(lifecycleErrorMessage(result.err));
            return;
          }
          setReviewNote("");
          setDone("The review has been recorded.");
        },
        onError: () =>
          setError("The review could not be recorded. Please try again."),
        onSettled: () => setActiveId(null),
      },
    );
  }

  function handleAppeal(departure: MemberDeparture) {
    resetMessages();
    const summary = appealSummary.trim();
    if (summary.length === 0) {
      setError("Please explain why you are appealing.");
      return;
    }
    setActiveId(departure.id.toString());
    appealDeparture.mutate(
      { nation: nationId, departure: departure.id, summary },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "err") {
            setError(lifecycleErrorMessage(result.err));
            return;
          }
          setAppealSummary("");
          setDone("Your appeal has been opened.");
        },
        onError: () =>
          setError("Your appeal could not be opened. Please try again."),
        onSettled: () => setActiveId(null),
      },
    );
  }

  function handleFinalize(departure: MemberDeparture) {
    resetMessages();
    setActiveId(departure.id.toString());
    finalizeDeparture.mutate(
      { nation: nationId, departure: departure.id },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "err") {
            setError(lifecycleErrorMessage(result.err));
            return;
          }
          setDone("The removal is now final. Permissions have been revoked.");
        },
        onError: () =>
          setError("The removal could not be finalized. Please try again."),
        onSettled: () => setActiveId(null),
      },
    );
  }

  return (
    <div className="space-y-5">
      <p
        data-ocid="os.governance.removal.notice"
        className="shell-panel-alt flex items-start gap-3 p-4 text-sm leading-relaxed text-foreground"
      >
        <Scale
          className="mt-0.5 size-5 shrink-0 text-primary"
          aria-hidden="true"
        />
        <span>
          An involuntary removal is never final on its own. It moves through
          notice, then review, and the member may appeal before it takes effect.
        </span>
      </p>

      {/* The three steps, always visible so the path is clear */}
      <ol
        data-ocid="os.governance.removal.steps"
        className="grid gap-3 sm:grid-cols-3"
      >
        {REVIEW_STEPS.map((step, index) => (
          <li
            key={step.key}
            data-ocid={`os.governance.removal.step.${index + 1}`}
            className="shell-panel flex items-start gap-3 p-4"
          >
            <span className="phase-node shrink-0">{index + 1}</span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-foreground">
                {step.label}
              </span>
              <span className="block text-xs text-muted-foreground">
                {step.description}
              </span>
            </span>
          </li>
        ))}
      </ol>

      {error ? (
        <p
          data-ocid="os.governance.removal.error"
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}
      {done ? (
        <p
          data-ocid="os.governance.removal.success"
          className="rounded-md border border-success/40 bg-success/10 px-3 py-2 text-sm text-foreground"
        >
          {done}
        </p>
      ) : null}

      {departuresQuery.isLoading ? (
        <div
          data-ocid="os.governance.removal.loading_state"
          aria-busy="true"
          className="space-y-3"
        >
          {Array.from({ length: 2 }, (_, i) => `skeleton-${i}`).map((id) => (
            <div
              key={id}
              className="shell-panel h-32 animate-pulse bg-muted/40"
            />
          ))}
        </div>
      ) : involuntary.length === 0 ? (
        <p
          data-ocid="os.governance.removal.empty_state"
          className="shell-panel p-5 text-sm text-muted-foreground"
        >
          No removals or suspensions are in progress. When one is recorded, its
          notice, review and appeal will appear here.
        </p>
      ) : (
        <ul className="space-y-4">
          {involuntary.map((departure, index) => (
            <RemovalCard
              key={departure.id.toString()}
              departure={departure}
              name={memberName(departure.member)}
              index={index + 1}
              caller={caller}
              canAct={canAct}
              busy={activeId === departure.id.toString()}
              reviewNote={reviewNote}
              appealSummary={appealSummary}
              onReviewNoteChange={setReviewNote}
              onAppealSummaryChange={setAppealSummary}
              onReview={() => handleReview(departure)}
              onAppeal={() => handleAppeal(departure)}
              onFinalize={() => handleFinalize(departure)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

/** One involuntary removal, with its current step and the next action. */
function RemovalCard({
  departure,
  name,
  index,
  caller,
  canAct,
  busy,
  reviewNote,
  appealSummary,
  onReviewNoteChange,
  onAppealSummaryChange,
  onReview,
  onAppeal,
  onFinalize,
}: {
  departure: MemberDeparture;
  name: string;
  index: number;
  caller: Principal | null;
  canAct: boolean;
  busy: boolean;
  reviewNote: string;
  appealSummary: string;
  onReviewNoteChange: (value: string) => void;
  onAppealSummaryChange: (value: string) => void;
  onReview: () => void;
  onAppeal: () => void;
  onFinalize: () => void;
}): ReactNode {
  const step = currentStep(departure.status);
  const isSubject =
    caller !== null && caller.toText() === departure.member.toText();
  const isFinal = departure.status === DepartureStatus.effective;
  const isWithdrawn = departure.status === DepartureStatus.withdrawn;

  return (
    <li
      data-ocid={`os.governance.removal.item.${index}`}
      className="shell-panel space-y-4 p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">
            {departure.kind === DepartureKind.suspension
              ? "Suspension"
              : "Removal under the rules"}{" "}
            · Notice given {formatDate(departure.timestamp)}
          </p>
        </div>
        <span
          className={`status-chip ${
            isFinal
              ? "status-won"
              : isWithdrawn
                ? "status-closed"
                : "status-progress"
          }`}
        >
          {statusLabel(departure.status)}
        </span>
      </div>

      {/* Step progress */}
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {REVIEW_STEPS.map((stepDef, stepIndex) => (
          <span
            key={stepDef.key}
            className={`h-1.5 flex-1 rounded-full ${
              stepIndex < step ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          The notice
        </p>
        <p className="mt-1 text-sm text-foreground">{departure.notice}</p>
      </div>

      {departure.reviewNote ? (
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Review note
          </p>
          <p className="mt-1 text-sm text-foreground">{departure.reviewNote}</p>
        </div>
      ) : null}

      {isFinal ? (
        <p className="flex items-center gap-2 text-sm text-foreground">
          <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
          This removal is final. The member&rsquo;s permissions have been
          revoked.
        </p>
      ) : isWithdrawn ? (
        <p className="text-sm text-muted-foreground">
          This removal was withdrawn and will not take effect.
        </p>
      ) : (
        <div className="space-y-3">
          {/* Review step — an authorized authority */}
          {departure.status === DepartureStatus.notice ? (
            canAct ? (
              <div className="space-y-2">
                <label
                  htmlFor={`review-note-${departure.id.toString()}`}
                  className="text-sm font-medium text-foreground"
                >
                  Review note
                </label>
                <textarea
                  id={`review-note-${departure.id.toString()}`}
                  data-ocid={`os.governance.removal.review_input.${index}`}
                  value={reviewNote}
                  onChange={(event) => onReviewNoteChange(event.target.value)}
                  rows={2}
                  placeholder="Record what you reviewed and what you found."
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <button
                  type="button"
                  data-ocid={`os.governance.removal.review_button.${index}`}
                  onClick={onReview}
                  disabled={busy}
                  className="os-focus-ring inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-smooth hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Gavel className="size-4" aria-hidden="true" />
                  {busy ? "Recording…" : "Record the review"}
                </button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Waiting for an authorized authority to review this removal.
              </p>
            )
          ) : null}

          {/* Appeal step — the affected member */}
          {departure.status === DepartureStatus.underReview ? (
            isSubject ? (
              <div className="space-y-2">
                <label
                  htmlFor={`appeal-summary-${departure.id.toString()}`}
                  className="text-sm font-medium text-foreground"
                >
                  Your appeal
                </label>
                <textarea
                  id={`appeal-summary-${departure.id.toString()}`}
                  data-ocid={`os.governance.removal.appeal_input.${index}`}
                  value={appealSummary}
                  onChange={(event) =>
                    onAppealSummaryChange(event.target.value)
                  }
                  rows={2}
                  placeholder="Explain why this removal should be reconsidered."
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <button
                  type="button"
                  data-ocid={`os.governance.removal.appeal_button.${index}`}
                  onClick={onAppeal}
                  disabled={busy}
                  className="os-focus-ring inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-input bg-card px-4 py-3 text-sm font-semibold text-foreground transition-smooth hover:border-accent hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <MessageSquareWarning className="size-4" aria-hidden="true" />
                  {busy ? "Opening…" : "Open an appeal"}
                </button>
              </div>
            ) : canAct ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  The review is recorded. The member may appeal before this
                  becomes final.
                </p>
                <button
                  type="button"
                  data-ocid={`os.governance.removal.finalize_button.${index}`}
                  onClick={onFinalize}
                  disabled={busy}
                  className="os-focus-ring inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive transition-smooth hover:bg-destructive/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ShieldAlert className="size-4" aria-hidden="true" />
                  {busy ? "Finalizing…" : "Make this removal final"}
                </button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Under review. The member may appeal before this becomes final.
              </p>
            )
          ) : null}

          {/* Appeal open — the authority decides after the appeal */}
          {departure.status === DepartureStatus.appealed ? (
            canAct ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  An appeal is open. Review it before making the removal final.
                </p>
                <button
                  type="button"
                  data-ocid={`os.governance.removal.finalize_button.${index}`}
                  onClick={onFinalize}
                  disabled={busy}
                  className="os-focus-ring inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive transition-smooth hover:bg-destructive/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ShieldAlert className="size-4" aria-hidden="true" />
                  {busy ? "Finalizing…" : "Make this removal final"}
                </button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                An appeal is open. The removal will not become final until the
                appeal is decided.
              </p>
            )
          ) : null}
        </div>
      )}
    </li>
  );
}
