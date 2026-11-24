import { UserCheck, UserMinus, UserPlus } from "lucide-react";
import { useState } from "react";

import {
  type AuthorityPosition,
  type AuthorityPositionStatus,
  AuthorityTermEventKind,
  type NationId,
} from "@/backend";
import { formatDate } from "@/components/os/governance/activity/activityLabels";
import {
  useAcceptAuthorityAppointment,
  useAppointAuthoritySuccessor,
  useRecordAuthorityDeparture,
} from "@/hooks/useGovernanceLifecycle";
import { Principal } from "@icp-sdk/core/principal";

const STATUS_LABEL: Record<AuthorityPositionStatus, string> = {
  filled: "Filled",
  vacant: "Vacant",
  suspended: "Suspended",
  retired: "Retired",
};

const DEPARTURE_KINDS: { kind: AuthorityTermEventKind; label: string }[] = [
  { kind: AuthorityTermEventKind.resignation, label: "Resignation" },
  { kind: AuthorityTermEventKind.retirement, label: "Retirement" },
  { kind: AuthorityTermEventKind.removal, label: "Constitutional removal" },
  { kind: AuthorityTermEventKind.replacement, label: "Replacement" },
];

type Action = "appoint" | "accept" | "depart";

/**
 * The authority seats: each position with its label, term, holder and status,
 * plus the three constitutional actions — appoint a successor, accept an
 * appointment, and record a departure. Every action opens an explicit
 * confirmation step naming the authorization the constitution requires.
 */
export default function AuthorityPositionsPanel({
  nation,
  positions,
  isLoading,
  isError,
  onRetry,
}: {
  nation: NationId;
  positions: AuthorityPosition[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  const [active, setActive] = useState<{
    position: AuthorityPosition;
    action: Action;
  } | null>(null);

  if (isLoading) {
    return (
      <section
        data-ocid="os.governance.control_center.authorities_loading"
        aria-busy="true"
        className="space-y-3"
      >
        {Array.from({ length: 3 }, (_, i) => `authority-skeleton-${i}`).map(
          (id) => (
            <div
              key={id}
              className="shell-panel h-24 animate-pulse bg-muted/40"
            />
          ),
        )}
      </section>
    );
  }

  if (isError) {
    return (
      <section
        data-ocid="os.governance.control_center.authorities_error"
        className="shell-panel space-y-3 p-5"
      >
        <p className="text-sm text-muted-foreground">
          The authority positions could not be loaded.
        </p>
        <button
          type="button"
          data-ocid="os.governance.control_center.authorities_retry_button"
          onClick={onRetry}
          className="os-focus-ring inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-smooth hover:opacity-90"
        >
          Try again
        </button>
      </section>
    );
  }

  return (
    <section
      data-ocid="os.governance.control_center.authorities_panel"
      className="space-y-3"
    >
      <div className="space-y-1">
        <h3 className="font-display text-lg font-medium tracking-tight text-foreground">
          Authorities
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Each seat is separate from the person in it. A successor must accept
          their own appointment before they hold the seat.
        </p>
      </div>

      {positions.length === 0 ? (
        <div
          data-ocid="os.governance.control_center.authorities_empty_state"
          className="shell-panel p-5 text-sm text-muted-foreground"
        >
          No authority seats have been created yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {positions.map((position, index) => (
            <li
              key={position.id.toString()}
              data-ocid={`os.governance.control_center.authority_item.${index + 1}`}
              className="shell-panel space-y-3 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 space-y-0.5">
                  <p className="font-display text-base font-medium text-foreground">
                    {position.seatLabel}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {position.holderDisplayLabel.trim().length > 0
                      ? position.holderDisplayLabel
                      : "Seat vacant"}
                  </p>
                </div>
                <span className="text-stamp shrink-0 rounded-sm border border-border px-2 py-1 text-muted-foreground">
                  {STATUS_LABEL[position.status]}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Term {formatDate(position.termStart)} –{" "}
                {formatDate(position.termEnd)}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  data-ocid={`os.governance.control_center.appoint_button.${index + 1}`}
                  onClick={() => setActive({ position, action: "appoint" })}
                  className="os-focus-ring inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-smooth hover:opacity-90"
                >
                  <UserPlus className="size-4" aria-hidden="true" />
                  Appoint successor
                </button>
                <button
                  type="button"
                  data-ocid={`os.governance.control_center.accept_button.${index + 1}`}
                  onClick={() => setActive({ position, action: "accept" })}
                  className="os-focus-ring inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-smooth hover:opacity-90"
                >
                  <UserCheck className="size-4" aria-hidden="true" />
                  Accept appointment
                </button>
                <button
                  type="button"
                  data-ocid={`os.governance.control_center.depart_button.${index + 1}`}
                  onClick={() => setActive({ position, action: "depart" })}
                  className="os-focus-ring inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-smooth hover:opacity-90"
                >
                  <UserMinus className="size-4" aria-hidden="true" />
                  Record departure
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {active ? (
        <AuthorityActionDialog
          nation={nation}
          position={active.position}
          action={active.action}
          onClose={() => setActive(null)}
        />
      ) : null}
    </section>
  );
}

/** The explicit confirmation step for one authority action. */
function AuthorityActionDialog({
  nation,
  position,
  action,
  onClose,
}: {
  nation: NationId;
  position: AuthorityPosition;
  action: Action;
  onClose: () => void;
}) {
  const appoint = useAppointAuthoritySuccessor();
  const accept = useAcceptAuthorityAppointment();
  const depart = useRecordAuthorityDeparture();

  const [successor, setSuccessor] = useState("");
  const [label, setLabel] = useState("");
  const [reason, setReason] = useState("");
  const [kind, setKind] = useState<AuthorityTermEventKind>(
    AuthorityTermEventKind.resignation,
  );
  const [error, setError] = useState<string | null>(null);

  const pending = appoint.isPending || accept.isPending || depart.isPending;

  const title =
    action === "appoint"
      ? "Appoint a successor"
      : action === "accept"
        ? "Accept this appointment"
        : "Record a departure";

  const authorization =
    action === "appoint"
      ? "The constitution requires an existing authority to appoint a successor, and the successor must accept with their own Internet Identity before the seat changes hands."
      : action === "accept"
        ? "The constitution requires each authority to accept their own appointment with their own Internet Identity. No one can accept on another person's behalf."
        : "The constitution requires a recorded reason for every departure. A departure immediately revokes that authority's permissions.";

  function handleConfirm() {
    setError(null);
    if (action === "appoint") {
      let principal: Principal;
      try {
        principal = Principal.fromText(successor.trim());
      } catch {
        setError("Enter a valid principal ID for the successor.");
        return;
      }
      if (reason.trim().length === 0) {
        setError("A reason is required for the record.");
        return;
      }
      appoint.mutate(
        {
          nation,
          position: position.id,
          successor: principal,
          successorDisplayLabel: label.trim(),
          reason: reason.trim(),
        },
        {
          onSuccess: (result) => {
            if (result.__kind__ === "ok") onClose();
            else setError("The appointment could not be recorded.");
          },
          onError: () => setError("The appointment could not be recorded."),
        },
      );
      return;
    }
    if (action === "accept") {
      accept.mutate(
        { nation, position: position.id },
        {
          onSuccess: (result) => {
            if (result.__kind__ === "ok") onClose();
            else setError("This appointment could not be accepted.");
          },
          onError: () => setError("This appointment could not be accepted."),
        },
      );
      return;
    }
    if (reason.trim().length === 0) {
      setError("A reason is required for the record.");
      return;
    }
    depart.mutate(
      { nation, position: position.id, kind, reason: reason.trim() },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "ok") onClose();
          else setError("The departure could not be recorded.");
        },
        onError: () => setError("The departure could not be recorded."),
      },
    );
  }

  return (
    <div
      data-ocid="os.governance.control_center.authority_dialog"
      className="shell-panel-alt space-y-3 p-4"
    >
      <div className="space-y-1">
        <p className="font-display text-base font-medium text-foreground">
          {title}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {position.seatLabel}
        </p>
      </div>
      <p className="rounded-md border border-warning/50 bg-warning/10 p-3 text-sm leading-relaxed text-foreground">
        {authorization}
      </p>

      {action === "appoint" ? (
        <div className="space-y-2">
          <label className="block space-y-1">
            <span className="text-stamp text-muted-foreground">
              Successor principal ID
            </span>
            <input
              data-ocid="os.governance.control_center.successor_input"
              value={successor}
              onChange={(e) => setSuccessor(e.target.value)}
              placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxx"
              className="os-focus-ring min-h-[44px] w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm text-foreground"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-stamp text-muted-foreground">
              Display name (optional)
            </span>
            <input
              data-ocid="os.governance.control_center.successor_label_input"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="os-focus-ring min-h-[44px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
        </div>
      ) : null}

      {action === "depart" ? (
        <label className="block space-y-1">
          <span className="text-stamp text-muted-foreground">
            Departure kind
          </span>
          <select
            data-ocid="os.governance.control_center.departure_kind_select"
            value={kind}
            onChange={(e) => setKind(e.target.value as AuthorityTermEventKind)}
            className="os-focus-ring min-h-[44px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
          >
            {DEPARTURE_KINDS.map((option) => (
              <option key={option.kind} value={option.kind}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {action !== "accept" ? (
        <label className="block space-y-1">
          <span className="text-stamp text-muted-foreground">Reason</span>
          <textarea
            data-ocid="os.governance.control_center.reason_input"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className="os-focus-ring w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
          />
        </label>
      ) : null}

      {error ? (
        <p
          data-ocid="os.governance.control_center.authority_error"
          className="text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          data-ocid="os.governance.control_center.authority_confirm_button"
          onClick={handleConfirm}
          disabled={pending}
          className="os-focus-ring inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-smooth hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Recording…" : "Confirm"}
        </button>
        <button
          type="button"
          data-ocid="os.governance.control_center.authority_cancel_button"
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
