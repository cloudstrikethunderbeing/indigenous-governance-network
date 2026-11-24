import { useState } from "react";

import type { Lead, LeadStatus } from "@/backend";
import { useSaveLeadNote, useUpdateLeadStatus } from "@/hooks/useQueries";

import {
  leadStatusClass,
  leadStatusLabels,
  leadStatusOrder,
} from "./leadFormat";

/**
 * The status control and private note editor shared by every lead section.
 * Both write through the existing admin hooks; the note is private to this page.
 */
export default function LeadControls({
  lead,
  index,
}: {
  lead: Lead;
  index: number;
}) {
  const updateStatus = useUpdateLeadStatus();
  const saveNote = useSaveLeadNote();
  const [note, setNote] = useState(lead.adminNote ?? "");

  const statusId = `lead-status-${lead.id.toString()}`;
  const noteId = `lead-note-${lead.id.toString()}`;

  return (
    <div className="mt-3 space-y-3 border-t border-border/60 pt-3">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={statusId} className="text-stamp text-muted-foreground">
          Status
        </label>
        <span
          data-ocid={`engagement.lead_status_chip.${index}`}
          className={`status-chip ${leadStatusClass[lead.status]}`}
        >
          {leadStatusLabels[lead.status]}
        </span>
        <select
          id={statusId}
          data-ocid={`engagement.lead_status_select.${index}`}
          value={lead.status}
          disabled={updateStatus.isPending}
          onChange={(event) =>
            updateStatus.mutate({
              leadId: lead.id,
              status: event.target.value as LeadStatus,
            })
          }
          className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground transition-smooth focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60"
        >
          {leadStatusOrder.map((status) => (
            <option key={status} value={status}>
              {leadStatusLabels[status]}
            </option>
          ))}
        </select>
        {updateStatus.isError ? (
          <span
            data-ocid={`engagement.lead_status_error.${index}`}
            role="alert"
            className="text-xs font-medium text-destructive"
          >
            Status update failed.
          </span>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor={noteId} className="text-stamp text-muted-foreground">
          Private note
        </label>
        <textarea
          id={noteId}
          data-ocid={`engagement.lead_note_input.${index}`}
          value={note}
          rows={2}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Visible only to administrators"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-smooth focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-ocid={`engagement.lead_note_save_button.${index}`}
            disabled={saveNote.isPending}
            onClick={() =>
              saveNote.mutate({
                leadId: lead.id,
                note: note.trim() === "" ? null : note.trim(),
              })
            }
            className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-smooth hover:border-primary/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60"
          >
            {saveNote.isPending ? "Saving…" : "Save note"}
          </button>
          {saveNote.isSuccess ? (
            <output
              data-ocid={`engagement.lead_note_success.${index}`}
              className="text-xs font-medium text-primary"
            >
              Note saved.
            </output>
          ) : null}
          {saveNote.isError ? (
            <span
              data-ocid={`engagement.lead_note_error.${index}`}
              role="alert"
              className="text-xs font-medium text-destructive"
            >
              Note could not be saved.
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
