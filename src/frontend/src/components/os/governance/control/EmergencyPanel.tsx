import { AlertTriangle, RotateCcw, ShieldAlert } from "lucide-react";
import { useState } from "react";

import {
  type EmergencySuspension,
  EmergencySuspensionStatus,
  type NationId,
} from "@/backend";
import { formatDateTime } from "@/components/os/governance/activity/activityLabels";
import {
  useApproveEmergencySuspension,
  useRequestEmergencySuspension,
  useRestoreEmergencySuspension,
} from "@/hooks/useGovernanceLifecycle";

const STATUS_LABEL: Record<EmergencySuspensionStatus, string> = {
  active: "Active",
  expired: "Expired",
  restored: "Restored",
};

/**
 * Emergency procedures: two of three authorities can request, approve and
 * restore a narrowly scoped, temporary suspension. The scope and expiry are
 * always visible, and every action opens an explicit confirmation step.
 */
export default function EmergencyPanel({
  nation,
  suspensions,
  isLoading,
  isError,
  onRetry,
}: {
  nation: NationId;
  suspensions: EmergencySuspension[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  const [mode, setMode] = useState<"request" | "approve" | "restore" | null>(
    null,
  );
  const [target, setTarget] = useState<EmergencySuspension | null>(null);

  const active = suspensions.filter(
    (s) => s.status === EmergencySuspensionStatus.active,
  );

  return (
    <section
      data-ocid="os.governance.control_center.emergency_panel"
      className="shell-panel space-y-3 p-5"
    >
      <div className="flex items-center gap-2">
        <ShieldAlert className="size-4 text-destructive" aria-hidden="true" />
        <h3 className="font-display text-lg font-medium tracking-tight text-foreground">
          Emergency procedures
        </h3>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Two of three authorities must agree. A suspension is temporary and
        narrowly scoped — it can never amend the constitution, seize assets,
        remove authorities or dissolve the Nation.
      </p>

      {isLoading ? (
        <p aria-busy="true" className="text-sm text-muted-foreground">
          Reading emergency records…
        </p>
      ) : isError ? (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            The emergency records could not be loaded.
          </p>
          <button
            type="button"
            data-ocid="os.governance.control_center.emergency_retry_button"
            onClick={onRetry}
            className="os-focus-ring inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-smooth hover:opacity-90"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          {active.length === 0 ? (
            <p
              data-ocid="os.governance.control_center.emergency_empty_state"
              className="text-sm text-muted-foreground"
            >
              No emergency suspension is in effect.
            </p>
          ) : (
            <ul className="space-y-2">
              {active.map((suspension, index) => (
                <li
                  key={suspension.id.toString()}
                  data-ocid={`os.governance.control_center.emergency_item.${index + 1}`}
                  className="space-y-2 rounded-md border border-destructive/40 bg-destructive/5 p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-stamp inline-flex items-center gap-1.5 rounded-sm border border-destructive/50 bg-destructive/10 px-2 py-1 text-destructive">
                      <AlertTriangle className="size-3.5" aria-hidden="true" />
                      {STATUS_LABEL[suspension.status]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Expires {formatDateTime(suspension.expiresAt)}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground">
                    {suspension.reason}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Scope:{" "}
                    {suspension.affectedFunctions.length > 0
                      ? suspension.affectedFunctions.join(", ")
                      : "No functions listed"}{" "}
                    · {suspension.affectedAccounts.length} account
                    {suspension.affectedAccounts.length === 1 ? "" : "s"} ·{" "}
                    {suspension.approvingAuthorities.length} of 2 approvals
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      data-ocid={`os.governance.control_center.emergency_approve_button.${index + 1}`}
                      onClick={() => {
                        setTarget(suspension);
                        setMode("approve");
                      }}
                      className="os-focus-ring inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-smooth hover:opacity-90"
                    >
                      Approve as second authority
                    </button>
                    <button
                      type="button"
                      data-ocid={`os.governance.control_center.emergency_restore_button.${index + 1}`}
                      onClick={() => {
                        setTarget(suspension);
                        setMode("restore");
                      }}
                      className="os-focus-ring inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-smooth hover:opacity-90"
                    >
                      <RotateCcw className="size-4" aria-hidden="true" />
                      Restore normal operation
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            data-ocid="os.governance.control_center.emergency_request_button"
            onClick={() => {
              setTarget(null);
              setMode("request");
            }}
            className="os-focus-ring inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-smooth hover:opacity-90"
          >
            Request an emergency suspension
          </button>
        </>
      )}

      {mode ? (
        <EmergencyActionDialog
          nation={nation}
          mode={mode}
          target={target}
          onClose={() => {
            setMode(null);
            setTarget(null);
          }}
        />
      ) : null}
    </section>
  );
}

/** The explicit confirmation step for one emergency action. */
function EmergencyActionDialog({
  nation,
  mode,
  target,
  onClose,
}: {
  nation: NationId;
  mode: "request" | "approve" | "restore";
  target: EmergencySuspension | null;
  onClose: () => void;
}) {
  const request = useRequestEmergencySuspension();
  const approve = useApproveEmergencySuspension();
  const restore = useRestoreEmergencySuspension();

  const [reason, setReason] = useState("");
  const [scope, setScope] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const pending = request.isPending || approve.isPending || restore.isPending;

  const title =
    mode === "request"
      ? "Request an emergency suspension"
      : mode === "approve"
        ? "Approve this suspension"
        : "Restore normal operation";

  const authorization =
    mode === "request"
      ? "The constitution allows an emergency suspension only when two of three authorities agree, for a narrow scope and a short time. Your request alone does not suspend anything."
      : mode === "approve"
        ? "The constitution requires a second authority to approve. You cannot approve your own request."
        : "The constitution requires a recorded note when normal operation is restored.";

  function handleConfirm() {
    setError(null);
    if (mode === "request") {
      if (reason.trim().length === 0) {
        setError("A reason is required.");
        return;
      }
      const functions = scope
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      request.mutate(
        {
          nation,
          reason: reason.trim(),
          affectedAccounts: [],
          affectedFunctions: functions,
        },
        {
          onSuccess: (result) => {
            if (result.__kind__ === "ok") onClose();
            else setError("The request could not be recorded.");
          },
          onError: () => setError("The request could not be recorded."),
        },
      );
      return;
    }
    if (!target) {
      setError("Choose a suspension first.");
      return;
    }
    if (mode === "approve") {
      approve.mutate(
        { nation, suspension: target.id },
        {
          onSuccess: (result) => {
            if (result.__kind__ === "ok") onClose();
            else setError("This suspension could not be approved.");
          },
          onError: () => setError("This suspension could not be approved."),
        },
      );
      return;
    }
    if (note.trim().length === 0) {
      setError("A note is required to restore normal operation.");
      return;
    }
    restore.mutate(
      { nation, suspension: target.id, note: note.trim() },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "ok") onClose();
          else setError("Normal operation could not be restored.");
        },
        onError: () => setError("Normal operation could not be restored."),
      },
    );
  }

  return (
    <div
      data-ocid="os.governance.control_center.emergency_dialog"
      className="space-y-3 rounded-md border border-warning/50 bg-warning/10 p-4"
    >
      <p className="font-display text-base font-medium text-foreground">
        {title}
      </p>
      <p className="text-sm leading-relaxed text-foreground">{authorization}</p>

      {mode === "request" ? (
        <>
          <label className="block space-y-1">
            <span className="text-stamp text-muted-foreground">Reason</span>
            <textarea
              data-ocid="os.governance.control_center.emergency_reason_input"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="os-focus-ring w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-stamp text-muted-foreground">
              Narrow scope (comma-separated functions)
            </span>
            <input
              data-ocid="os.governance.control_center.emergency_scope_input"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              placeholder="e.g. treasury withdrawals, document sharing"
              className="os-focus-ring min-h-[44px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
        </>
      ) : null}

      {mode === "restore" ? (
        <label className="block space-y-1">
          <span className="text-stamp text-muted-foreground">
            Restoration note
          </span>
          <textarea
            data-ocid="os.governance.control_center.emergency_note_input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="os-focus-ring w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
          />
        </label>
      ) : null}

      {error ? (
        <p
          data-ocid="os.governance.control_center.emergency_error"
          className="text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          data-ocid="os.governance.control_center.emergency_confirm_button"
          onClick={handleConfirm}
          disabled={pending}
          className="os-focus-ring inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-smooth hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Recording…" : "Confirm"}
        </button>
        <button
          type="button"
          data-ocid="os.governance.control_center.emergency_cancel_button"
          onClick={onClose}
          disabled={pending}
          className="os-focus-ring inline-flex min-h-[44px] items-center justify-center rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-smooth hover:opacity-90 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
