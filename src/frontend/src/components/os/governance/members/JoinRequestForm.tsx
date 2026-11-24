import { Clock, Loader2, Send, UserX } from "lucide-react";
import { useState } from "react";

import type { JoinRequest } from "@/backend";
import { formatDate } from "@/components/os/governance/activity/activityLabels";

/**
 * The applicant's side of the join flow. A signed-in person who is not yet a
 * member writes a short introduction and asks to join; while the request is
 * pending they see its status and can withdraw it. The backend decides whether
 * a request is allowed — a member or a person with a request already pending
 * cannot create a duplicate.
 */
export default function JoinRequestForm({
  ownRequest,
  isSubmitting,
  isWithdrawing,
  error,
  onSubmit,
  onWithdraw,
}: {
  ownRequest: JoinRequest | null;
  isSubmitting: boolean;
  isWithdrawing: boolean;
  error: string | null;
  onSubmit: (input: { displayName: string; message: string }) => void;
  onWithdraw: (request: JoinRequest) => void;
}) {
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");

  if (ownRequest) {
    return (
      <section
        data-ocid="os.governance.members.join_request_status_panel"
        aria-label="Your request to join"
        className="shell-panel space-y-3 p-4"
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning-foreground">
            <Clock className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">
              Your request is pending review
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              You asked to join on {formatDate(ownRequest.timestamp)}. You will
              be notified when it is approved, rejected or expires.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            {ownRequest.approvers.length} of{" "}
            {Number(ownRequest.requiredApprovals)} approvals
          </span>
          <span>Expires {formatDate(ownRequest.expiresAt)}</span>
        </div>

        <button
          type="button"
          data-ocid="os.governance.members.withdraw_request_button"
          disabled={isWithdrawing}
          onClick={() => onWithdraw(ownRequest)}
          className="os-focus-ring inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-input bg-card px-4 py-3 text-sm font-semibold text-foreground transition-smooth hover:border-destructive/60 hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isWithdrawing ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <UserX className="size-4" aria-hidden="true" />
          )}
          Withdraw my request
        </button>
      </section>
    );
  }

  const canSubmit = displayName.trim().length > 0 && !isSubmitting;

  return (
    <section
      data-ocid="os.governance.members.join_request_form"
      aria-label="Ask to join"
      className="shell-panel space-y-4 p-4"
    >
      <div className="space-y-1">
        <p className="text-stamp text-accent">Ask to join</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Tell the organization who you are and why you would like to join. An
          authorized approver will review your request.
        </p>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="join-display-name"
          className="block text-sm font-medium text-foreground"
        >
          Your name
        </label>
        <input
          id="join-display-name"
          data-ocid="os.governance.members.join_name_input"
          type="text"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="How the organization should know you"
          className="os-focus-ring w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="join-message"
          className="block text-sm font-medium text-foreground"
        >
          Why would you like to join?
        </label>
        <textarea
          id="join-message"
          data-ocid="os.governance.members.join_message_input"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={3}
          placeholder="A short introduction (optional)."
          className="os-focus-ring w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {error ? (
        <p
          data-ocid="os.governance.members.join_error"
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      <button
        type="button"
        data-ocid="os.governance.members.join_submit_button"
        disabled={!canSubmit}
        onClick={() => {
          if (!canSubmit) return;
          onSubmit({
            displayName: displayName.trim(),
            message: message.trim(),
          });
        }}
        className="os-focus-ring inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Send className="size-4" aria-hidden="true" />
        )}
        Send my request
      </button>
    </section>
  );
}
