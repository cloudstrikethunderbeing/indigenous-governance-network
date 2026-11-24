import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  Archive,
  CheckCircle2,
  Download,
  FileCheck2,
  Hourglass,
  Landmark,
  Megaphone,
  ShieldCheck,
  Vote,
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";

import type { Principal } from "@icp-sdk/core/principal";

import {
  type Dissolution,
  DissolutionStatus,
  VoteChoice,
  createActor,
} from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { GovernanceCapability } from "@/backend";
import { useActiveNation } from "@/components/os/attachments/useActiveNation";
import {
  formatDate,
  formatDateTime,
} from "@/components/os/governance/activity/activityLabels";
import { useCallerCapabilities } from "@/components/os/governance/members/useGovernanceMembers";
import {
  lifecycleErrorMessage,
  useArchiveDissolution,
  useDissolutions,
  useProposeDissolution,
} from "@/hooks/useGovernanceLifecycle";

/**
 * The dissolution workflow. Dissolving the Nation is a formal, constitutionally
 * governed process: a proposal with a clear explanation, member notification,
 * a vote at 90 percent with enhanced quorum, a cooling-off period, an
 * outstanding-obligations review, an authorized data export, a final
 * confirmation and Archived status.
 *
 * Archiving closes the digital Nation workspace only. It never dissolves the
 * Nation, extinguishes Indigenous rights or surrenders sovereignty. Asset
 * settlement and legal dissolution are outside this simulated functionality.
 */

/** The ordered steps of the dissolution workflow. */
const WORKFLOW_STEPS: { key: string; label: string; description: string }[] = [
  {
    key: "proposal",
    label: "Proposal",
    description: "A formal proposal with a clear explanation.",
  },
  {
    key: "notification",
    label: "Notify members",
    description: "Every member is told the proposal exists.",
  },
  {
    key: "voting",
    label: "Vote at 90%",
    description: "Members vote with an enhanced quorum.",
  },
  {
    key: "cooling-off",
    label: "Cooling-off",
    description: "A pause before anything can be finalized.",
  },
  {
    key: "obligations",
    label: "Obligations review",
    description: "Outstanding obligations are reviewed.",
  },
  {
    key: "export",
    label: "Data export",
    description: "An authorized export of the record is made.",
  },
  {
    key: "confirmation",
    label: "Final confirmation",
    description: "An authority confirms the final step.",
  },
  {
    key: "archived",
    label: "Archived",
    description: "The workspace is closed and archived.",
  },
];

/** The workflow step a dissolution currently sits at. */
function currentStep(dissolution: Dissolution): number {
  switch (dissolution.status) {
    case DissolutionStatus.proposed:
      return dissolution.memberNotifiedAt !== undefined ? 2 : 1;
    case DissolutionStatus.voting:
      return 2;
    case DissolutionStatus.approved:
      return 3;
    case DissolutionStatus.coolingOff:
      return 4;
    case DissolutionStatus.archived:
      return 8;
    default:
      return 0;
  }
}

/** A plain-language name for a dissolution status. */
function statusLabel(status: DissolutionStatus): string {
  switch (status) {
    case DissolutionStatus.proposed:
      return "Proposed";
    case DissolutionStatus.voting:
      return "Voting";
    case DissolutionStatus.approved:
      return "Approved";
    case DissolutionStatus.rejected:
      return "Rejected";
    case DissolutionStatus.coolingOff:
      return "Cooling-off";
    case DissolutionStatus.withdrawn:
      return "Withdrawn";
    case DissolutionStatus.archived:
      return "Archived";
    default:
      return "Recorded";
  }
}

/** The status chip colour class for a dissolution status. */
function statusClass(status: DissolutionStatus): string {
  switch (status) {
    case DissolutionStatus.archived:
      return "status-closed";
    case DissolutionStatus.rejected:
    case DissolutionStatus.withdrawn:
      return "status-closed";
    case DissolutionStatus.approved:
    case DissolutionStatus.coolingOff:
      return "status-won";
    default:
      return "status-progress";
  }
}

/** Open voting on a proposed dissolution. */
function useOpenDissolutionVoting() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { nation: bigint; dissolution: bigint }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.openDissolutionVoting(input.nation, input.dissolution);
    },
    onSuccess: (_result, input) => {
      void queryClient.invalidateQueries({
        queryKey: ["dissolutions", input.nation.toString()],
      });
    },
  });
}

/** Cast a vote on a dissolution. */
function useCastDissolutionVote() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nation: bigint;
      dissolution: bigint;
      choice: VoteChoice;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.castDissolutionVote(
        input.nation,
        input.dissolution,
        input.choice,
      );
    },
    onSuccess: (_result, input) => {
      void queryClient.invalidateQueries({
        queryKey: ["dissolutions", input.nation.toString()],
      });
    },
  });
}

/** Close voting and tally the result. */
function useCloseDissolutionVoting() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { nation: bigint; dissolution: bigint }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.closeDissolutionVoting(input.nation, input.dissolution);
    },
    onSuccess: (_result, input) => {
      void queryClient.invalidateQueries({
        queryKey: ["dissolutions", input.nation.toString()],
      });
    },
  });
}

/** Record the outstanding-obligations review. */
function useRecordObligationsReview() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nation: bigint;
      dissolution: bigint;
      note: string;
      outstandingObligations: string[];
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.recordObligationsReview(
        input.nation,
        input.dissolution,
        input.note,
        input.outstandingObligations,
      );
    },
    onSuccess: (_result, input) => {
      void queryClient.invalidateQueries({
        queryKey: ["dissolutions", input.nation.toString()],
      });
    },
  });
}

/** Record the authorized data export. */
function useRecordDataExport() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nation: bigint;
      dissolution: bigint;
      exportReference: string;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.recordDataExport(
        input.nation,
        input.dissolution,
        input.exportReference,
      );
    },
    onSuccess: (_result, input) => {
      void queryClient.invalidateQueries({
        queryKey: ["dissolutions", input.nation.toString()],
      });
    },
  });
}

export default function DissolutionWorkflow() {
  const { nationId, readOnly } = useActiveNation();
  const { identity } = useInternetIdentity();

  const capabilitiesQuery = useCallerCapabilities(nationId);
  const dissolutionsQuery = useDissolutions(nationId);
  const proposeDissolution = useProposeDissolution();
  const openVoting = useOpenDissolutionVoting();
  const castVote = useCastDissolutionVote();
  const closeVoting = useCloseDissolutionVoting();
  const recordObligations = useRecordObligationsReview();
  const recordExport = useRecordDataExport();
  const archiveDissolution = useArchiveDissolution();

  const [proposalTitle, setProposalTitle] = useState("");
  const [proposalExplanation, setProposalExplanation] = useState("");
  const [obligationNote, setObligationNote] = useState("");
  const [obligations, setObligations] = useState("");
  const [exportReference, setExportReference] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const caller = useMemo<Principal | null>(() => {
    if (!identity) return null;
    const principal = identity.getPrincipal();
    return principal.isAnonymous() ? null : principal;
  }, [identity]);

  const capabilities = useMemo(
    () => capabilitiesQuery.data ?? [],
    [capabilitiesQuery.data],
  );
  const canModify = capabilities.includes(GovernanceCapability.modify);
  const canVote = capabilities.includes(GovernanceCapability.vote);
  const canAct = canModify && !readOnly;

  const dissolutions = useMemo(
    () => dissolutionsQuery.data ?? [],
    [dissolutionsQuery.data],
  );

  const active = useMemo<Dissolution | null>(() => {
    const open = dissolutions.filter(
      (item) =>
        item.status !== DissolutionStatus.archived &&
        item.status !== DissolutionStatus.withdrawn &&
        item.status !== DissolutionStatus.rejected,
    );
    return open[0] ?? dissolutions[0] ?? null;
  }, [dissolutions]);

  function resetMessages() {
    setError(null);
    setDone(null);
  }

  function handlePropose() {
    resetMessages();
    const title = proposalTitle.trim();
    const explanation = proposalExplanation.trim();
    if (title.length === 0) {
      setError("Please give the proposal a clear title.");
      return;
    }
    if (explanation.length === 0) {
      setError("Please explain why dissolution is being proposed.");
      return;
    }
    proposeDissolution.mutate(
      { nation: nationId, proposal: title, explanation },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "err") {
            setError(lifecycleErrorMessage(result.err));
            return;
          }
          setProposalTitle("");
          setProposalExplanation("");
          setDone(
            "The proposal has been recorded. Members can now be notified.",
          );
        },
        onError: () =>
          setError("The proposal could not be recorded. Please try again."),
      },
    );
  }

  function handleOpenVoting(dissolution: Dissolution) {
    resetMessages();
    setBusyId(dissolution.id.toString());
    openVoting.mutate(
      { nation: nationId, dissolution: dissolution.id },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "err") {
            setError(lifecycleErrorMessage(result.err));
            return;
          }
          setDone("Voting is now open.");
        },
        onError: () =>
          setError("Voting could not be opened. Please try again."),
        onSettled: () => setBusyId(null),
      },
    );
  }

  function handleVote(dissolution: Dissolution, choice: VoteChoice) {
    resetMessages();
    setBusyId(dissolution.id.toString());
    castVote.mutate(
      { nation: nationId, dissolution: dissolution.id, choice },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "err") {
            setError(lifecycleErrorMessage(result.err));
            return;
          }
          setDone("Your vote has been recorded.");
        },
        onError: () => setError("Your vote could not be recorded."),
        onSettled: () => setBusyId(null),
      },
    );
  }

  function handleCloseVoting(dissolution: Dissolution) {
    resetMessages();
    setBusyId(dissolution.id.toString());
    closeVoting.mutate(
      { nation: nationId, dissolution: dissolution.id },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "err") {
            setError(lifecycleErrorMessage(result.err));
            return;
          }
          setDone("Voting has closed and the result is recorded.");
        },
        onError: () => setError("Voting could not be closed."),
        onSettled: () => setBusyId(null),
      },
    );
  }

  function handleObligations(dissolution: Dissolution) {
    resetMessages();
    const note = obligationNote.trim();
    if (note.length === 0) {
      setError("Please add a short note describing the review.");
      return;
    }
    const list = obligations
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    setBusyId(dissolution.id.toString());
    recordObligations.mutate(
      {
        nation: nationId,
        dissolution: dissolution.id,
        note,
        outstandingObligations: list,
      },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "err") {
            setError(lifecycleErrorMessage(result.err));
            return;
          }
          setObligationNote("");
          setObligations("");
          setDone("The obligations review has been recorded.");
        },
        onError: () => setError("The review could not be recorded."),
        onSettled: () => setBusyId(null),
      },
    );
  }

  function handleExport(dissolution: Dissolution) {
    resetMessages();
    const reference = exportReference.trim();
    if (reference.length === 0) {
      setError("Please describe the export that was made.");
      return;
    }
    setBusyId(dissolution.id.toString());
    recordExport.mutate(
      {
        nation: nationId,
        dissolution: dissolution.id,
        exportReference: reference,
      },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "err") {
            setError(lifecycleErrorMessage(result.err));
            return;
          }
          setExportReference("");
          setDone("The data export has been recorded.");
        },
        onError: () => setError("The export could not be recorded."),
        onSettled: () => setBusyId(null),
      },
    );
  }

  function handleArchive(dissolution: Dissolution) {
    resetMessages();
    setBusyId(dissolution.id.toString());
    archiveDissolution.mutate(
      { nation: nationId, dissolution: dissolution.id },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "err") {
            setError(lifecycleErrorMessage(result.err));
            return;
          }
          setDone("The workspace is now archived.");
        },
        onError: () => setError("The workspace could not be archived."),
        onSettled: () => setBusyId(null),
      },
    );
  }

  const isLoading = dissolutionsQuery.isLoading;

  return (
    <div className="space-y-5">
      {/* The sovereignty safeguard — always visible */}
      <p
        data-ocid="os.governance.dissolution.safeguard_notice"
        className="shell-panel-alt flex items-start gap-3 p-4 text-sm leading-relaxed text-foreground"
      >
        <Landmark
          className="mt-0.5 size-5 shrink-0 text-primary"
          aria-hidden="true"
        />
        <span>
          Archiving closes the digital Nation workspace only. It never dissolves
          the Nation, extinguishes Indigenous rights or surrenders sovereignty.
          Asset settlement and legal dissolution are outside this simulated
          functionality.
        </span>
      </p>

      {/* The workflow steps */}
      <ol
        data-ocid="os.governance.dissolution.steps"
        className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4"
      >
        {WORKFLOW_STEPS.map((step, index) => {
          const reached = active ? index < currentStep(active) : false;
          return (
            <li
              key={step.key}
              data-ocid={`os.governance.dissolution.step.${index + 1}`}
              className={`flex items-start gap-2 rounded-lg border p-3 ${
                reached
                  ? "border-primary/40 bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              <span
                className={`phase-node shrink-0 ${reached ? "phase-node-active" : ""}`}
              >
                {index + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold text-foreground">
                  {step.label}
                </span>
                <span className="block text-[0.7rem] leading-snug text-muted-foreground">
                  {step.description}
                </span>
              </span>
            </li>
          );
        })}
      </ol>

      {error ? (
        <p
          data-ocid="os.governance.dissolution.error"
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}
      {done ? (
        <p
          data-ocid="os.governance.dissolution.success"
          className="rounded-md border border-success/40 bg-success/10 px-3 py-2 text-sm text-foreground"
        >
          {done}
        </p>
      ) : null}

      {isLoading ? (
        <div
          data-ocid="os.governance.dissolution.loading_state"
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
      ) : active ? (
        <DissolutionCard
          dissolution={active}
          caller={caller}
          canAct={canAct}
          canVote={canVote}
          busy={busyId === active.id.toString()}
          obligationNote={obligationNote}
          obligations={obligations}
          exportReference={exportReference}
          onObligationNoteChange={setObligationNote}
          onObligationsChange={setObligations}
          onExportReferenceChange={setExportReference}
          onOpenVoting={() => handleOpenVoting(active)}
          onVote={(choice) => handleVote(active, choice)}
          onCloseVoting={() => handleCloseVoting(active)}
          onObligations={() => handleObligations(active)}
          onExport={() => handleExport(active)}
          onArchive={() => handleArchive(active)}
        />
      ) : canAct ? (
        <section
          data-ocid="os.governance.dissolution.proposal_panel"
          className="shell-panel space-y-4 p-5"
        >
          <div className="flex items-center gap-2">
            <Megaphone className="size-5 text-primary" aria-hidden="true" />
            <h3 className="font-display text-lg font-semibold text-foreground">
              Propose dissolution
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Start a formal proposal. It needs a clear explanation, a vote at 90
            percent with enhanced quorum, and a cooling-off period before
            anything can be finalized.
          </p>
          <div className="space-y-1.5">
            <label
              htmlFor="dissolution-title"
              className="text-sm font-medium text-foreground"
            >
              Proposal title
            </label>
            <input
              id="dissolution-title"
              data-ocid="os.governance.dissolution.title_input"
              value={proposalTitle}
              onChange={(event) => setProposalTitle(event.target.value)}
              placeholder="A short, clear title"
              className="min-h-[44px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="dissolution-explanation"
              className="text-sm font-medium text-foreground"
            >
              Explanation
            </label>
            <textarea
              id="dissolution-explanation"
              data-ocid="os.governance.dissolution.explanation_input"
              value={proposalExplanation}
              onChange={(event) => setProposalExplanation(event.target.value)}
              rows={4}
              placeholder="Explain clearly why this is being proposed."
              className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <button
            type="button"
            data-ocid="os.governance.dissolution.propose_button"
            onClick={handlePropose}
            disabled={proposeDissolution.isPending}
            className="os-focus-ring inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-smooth hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Megaphone className="size-4" aria-hidden="true" />
            {proposeDissolution.isPending
              ? "Recording…"
              : "Record the proposal"}
          </button>
        </section>
      ) : (
        <p
          data-ocid="os.governance.dissolution.empty_state"
          className="shell-panel p-5 text-sm text-muted-foreground"
        >
          No dissolution is in progress. Only an authorized authority can
          propose one.
        </p>
      )}
    </div>
  );
}

/** The active dissolution, with the next step and its controls. */
function DissolutionCard({
  dissolution,
  caller,
  canAct,
  canVote,
  busy,
  obligationNote,
  obligations,
  exportReference,
  onObligationNoteChange,
  onObligationsChange,
  onExportReferenceChange,
  onOpenVoting,
  onVote,
  onCloseVoting,
  onObligations,
  onExport,
  onArchive,
}: {
  dissolution: Dissolution;
  caller: Principal | null;
  canAct: boolean;
  canVote: boolean;
  busy: boolean;
  obligationNote: string;
  obligations: string;
  exportReference: string;
  onObligationNoteChange: (value: string) => void;
  onObligationsChange: (value: string) => void;
  onExportReferenceChange: (value: string) => void;
  onOpenVoting: () => void;
  onVote: (choice: VoteChoice) => void;
  onCloseVoting: () => void;
  onObligations: () => void;
  onExport: () => void;
  onArchive: () => void;
}): ReactNode {
  const step = currentStep(dissolution);
  const tally = dissolution.tally;
  const totalVotes =
    tally.votesInFavor + tally.votesAgainst + tally.votesAbstain;
  const favorPercent =
    totalVotes > 0n ? Number((tally.votesInFavor * 100n) / totalVotes) : 0;
  const isArchived = dissolution.status === DissolutionStatus.archived;
  const isClosed =
    dissolution.status === DissolutionStatus.withdrawn ||
    dissolution.status === DissolutionStatus.rejected;

  return (
    <section
      data-ocid="os.governance.dissolution.card"
      className="shell-panel space-y-4 p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-semibold text-foreground">
            {dissolution.proposal}
          </h3>
          <p className="text-xs text-muted-foreground">
            Proposed {formatDate(dissolution.timestamp)}
          </p>
        </div>
        <span className={`status-chip ${statusClass(dissolution.status)}`}>
          {statusLabel(dissolution.status)}
        </span>
      </div>

      <p className="text-sm leading-relaxed text-foreground">
        {dissolution.explanation}
      </p>

      {/* Vote tally */}
      <div className="rounded-lg border border-border bg-muted/30 p-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            In favour {tally.votesInFavor.toString()} · Against{" "}
            {tally.votesAgainst.toString()} · Abstain{" "}
            {tally.votesAbstain.toString()}
          </span>
          <span className="text-tabular">
            {tally.approvalThresholdPercent.toString()}% needed
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-smooth"
            style={{ width: `${Math.min(favorPercent, 100)}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {favorPercent}% in favour · quorum {tally.quorumPercent.toString()}%
        </p>
      </div>

      {dissolution.memberNotifiedAt !== undefined ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Megaphone className="size-3.5" aria-hidden="true" />
          Members notified {formatDateTime(dissolution.memberNotifiedAt)}.
        </p>
      ) : null}

      {dissolution.obligationsReview ? (
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Obligations review
          </p>
          <p className="mt-1 text-sm text-foreground">
            {dissolution.obligationsReview.note}
          </p>
          {dissolution.obligationsReview.outstandingObligations.length > 0 ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
              {dissolution.obligationsReview.outstandingObligations
                .map((item, index) => ({ item, id: `obligation-${index}` }))
                .map(({ item, id }) => (
                  <li key={id}>{item}</li>
                ))}
            </ul>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">
              No outstanding obligations were listed.
            </p>
          )}
        </div>
      ) : null}

      {dissolution.dataExportReference ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Download className="size-3.5" aria-hidden="true" />
          Data export recorded: {dissolution.dataExportReference}
        </p>
      ) : null}

      {dissolution.finalConfirmation ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="size-3.5 text-success" aria-hidden="true" />
          Final confirmation{" "}
          {formatDateTime(dissolution.finalConfirmation.ratifiedAt)}.
        </p>
      ) : null}

      {isArchived ? (
        <p
          data-ocid="os.governance.dissolution.archived_state"
          className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground"
        >
          <Archive className="size-4" aria-hidden="true" />
          This workspace is archived. The Nation itself is not dissolved.
        </p>
      ) : isClosed ? (
        <p className="text-sm text-muted-foreground">
          This proposal was {statusLabel(dissolution.status).toLowerCase()} and
          will not proceed.
        </p>
      ) : (
        <div className="space-y-3">
          {/* Step: open voting */}
          {step <= 1 && canAct ? (
            <button
              type="button"
              data-ocid="os.governance.dissolution.open_voting_button"
              onClick={onOpenVoting}
              disabled={busy}
              className="os-focus-ring inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-smooth hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Vote className="size-4" aria-hidden="true" />
              {busy ? "Opening…" : "Open voting"}
            </button>
          ) : null}

          {/* Step: voting */}
          {dissolution.status === DissolutionStatus.voting ? (
            <div className="space-y-2">
              {canVote && caller ? (
                <div className="flex flex-wrap gap-2">
                  <VoteButton
                    label="Vote in favour"
                    ocid="os.governance.dissolution.vote_favor_button"
                    disabled={busy}
                    onClick={() => onVote(VoteChoice.inFavor)}
                  />
                  <VoteButton
                    label="Vote against"
                    ocid="os.governance.dissolution.vote_against_button"
                    disabled={busy}
                    onClick={() => onVote(VoteChoice.against)}
                  />
                  <VoteButton
                    label="Abstain"
                    ocid="os.governance.dissolution.vote_abstain_button"
                    disabled={busy}
                    onClick={() => onVote(VoteChoice.abstain)}
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Voting is open. Members with a vote can take part.
                </p>
              )}
              {canAct ? (
                <button
                  type="button"
                  data-ocid="os.governance.dissolution.close_voting_button"
                  onClick={onCloseVoting}
                  disabled={busy}
                  className="os-focus-ring inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-input bg-card px-4 py-3 text-sm font-semibold text-foreground transition-smooth hover:border-accent hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FileCheck2 className="size-4" aria-hidden="true" />
                  {busy ? "Closing…" : "Close voting"}
                </button>
              ) : null}
            </div>
          ) : null}

          {/* Step: cooling-off */}
          {dissolution.status === DissolutionStatus.coolingOff ? (
            <p className="flex items-center gap-2 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-foreground">
              <Hourglass className="size-4 text-warning" aria-hidden="true" />
              Cooling-off until {formatDateTime(dissolution.coolingOffEnd)}.
            </p>
          ) : null}

          {/* Step: obligations review */}
          {dissolution.status === DissolutionStatus.coolingOff &&
          !dissolution.obligationsReview &&
          canAct ? (
            <div className="space-y-2">
              <label
                htmlFor="obligation-note"
                className="text-sm font-medium text-foreground"
              >
                Obligations review note
              </label>
              <textarea
                id="obligation-note"
                data-ocid="os.governance.dissolution.obligations_note_input"
                value={obligationNote}
                onChange={(event) => onObligationNoteChange(event.target.value)}
                rows={2}
                placeholder="Describe the review of outstanding obligations."
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <label
                htmlFor="obligation-list"
                className="text-sm font-medium text-foreground"
              >
                Outstanding obligations (one per line)
              </label>
              <textarea
                id="obligation-list"
                data-ocid="os.governance.dissolution.obligations_list_input"
                value={obligations}
                onChange={(event) => onObligationsChange(event.target.value)}
                rows={3}
                placeholder="List anything still outstanding, or leave blank."
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <button
                type="button"
                data-ocid="os.governance.dissolution.obligations_button"
                onClick={onObligations}
                disabled={busy}
                className="os-focus-ring inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-smooth hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ShieldCheck className="size-4" aria-hidden="true" />
                {busy ? "Recording…" : "Record the review"}
              </button>
            </div>
          ) : null}

          {/* Step: data export */}
          {dissolution.obligationsReview &&
          !dissolution.dataExportReference &&
          canAct ? (
            <div className="space-y-2">
              <label
                htmlFor="export-reference"
                className="text-sm font-medium text-foreground"
              >
                Data export reference
              </label>
              <input
                id="export-reference"
                data-ocid="os.governance.dissolution.export_input"
                value={exportReference}
                onChange={(event) =>
                  onExportReferenceChange(event.target.value)
                }
                placeholder="Describe the authorized export that was made"
                className="min-h-[44px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <button
                type="button"
                data-ocid="os.governance.dissolution.export_button"
                onClick={onExport}
                disabled={busy}
                className="os-focus-ring inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-input bg-card px-4 py-3 text-sm font-semibold text-foreground transition-smooth hover:border-accent hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Download className="size-4" aria-hidden="true" />
                {busy ? "Recording…" : "Record the export"}
              </button>
            </div>
          ) : null}

          {/* Step: final confirmation and archive */}
          {dissolution.obligationsReview &&
          dissolution.dataExportReference &&
          canAct ? (
            <button
              type="button"
              data-ocid="os.governance.dissolution.archive_button"
              onClick={onArchive}
              disabled={busy}
              className="os-focus-ring inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive transition-smooth hover:bg-destructive/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Archive className="size-4" aria-hidden="true" />
              {busy ? "Archiving…" : "Confirm and archive the workspace"}
            </button>
          ) : null}
        </div>
      )}
    </section>
  );
}

/** One vote choice button. */
function VoteButton({
  label,
  ocid,
  disabled,
  onClick,
}: {
  label: string;
  ocid: string;
  disabled: boolean;
  onClick: () => void;
}): ReactNode {
  return (
    <button
      type="button"
      data-ocid={ocid}
      onClick={onClick}
      disabled={disabled}
      className="os-focus-ring inline-flex min-h-[44px] items-center justify-center rounded-lg border border-input bg-card px-4 py-3 text-sm font-semibold text-foreground transition-smooth hover:border-accent hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {label}
    </button>
  );
}
