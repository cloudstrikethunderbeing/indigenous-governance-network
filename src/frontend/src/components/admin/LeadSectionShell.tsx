import { AlertCircle, Download, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

import type { LeadList } from "@/backend";

import { buildCsv, downloadCsv } from "./leadFormat";

/**
 * The shared frame for a lead section: loading, error and honest empty states,
 * a CSV export of exactly the rows the backend returned, and the lead list.
 */
export default function LeadSectionShell({
  ocid,
  title,
  description,
  query,
  csvFilename,
  csvHeaders,
  csvRow,
  children,
}: {
  ocid: string;
  title: string;
  description: string;
  query: {
    data: LeadList | null | undefined;
    isLoading: boolean;
    isError: boolean;
  };
  csvFilename: string;
  csvHeaders: string[];
  csvRow: (lead: LeadList["leads"][number]) => string[];
  children: (leads: LeadList["leads"]) => ReactNode;
}) {
  const { data, isLoading, isError } = query;

  if (isLoading) {
    return (
      <output
        data-ocid={`${ocid}.loading_state`}
        className="flex items-center gap-2 text-sm text-muted-foreground"
      >
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Loading {title.toLowerCase()}…
      </output>
    );
  }

  if (isError || !data) {
    return (
      <p
        data-ocid={`${ocid}.error_state`}
        role="alert"
        className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
      >
        <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
        {title} could not be loaded. Please try again.
      </p>
    );
  }

  const leads = data.leads;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {description}{" "}
          <span className="text-tabular font-medium text-foreground">
            {data.total.toString()}
          </span>{" "}
          {data.total === 1n ? "record" : "records"}.
        </p>
        <button
          type="button"
          data-ocid={`${ocid}.export_button`}
          disabled={leads.length === 0}
          onClick={() =>
            downloadCsv(
              csvFilename,
              buildCsv(
                csvHeaders,
                leads.map((lead) => csvRow(lead)),
              ),
            )
          }
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition-smooth hover:border-primary/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Download className="size-3.5" aria-hidden="true" />
          Export CSV
        </button>
      </div>

      {leads.length === 0 ? (
        <p
          data-ocid={`${ocid}.empty_state`}
          className="rounded-lg border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground"
        >
          No {title.toLowerCase()} have been recorded yet.
        </p>
      ) : (
        <ul data-ocid={`${ocid}.list`} className="space-y-3">
          {children(leads)}
        </ul>
      )}
    </div>
  );
}
