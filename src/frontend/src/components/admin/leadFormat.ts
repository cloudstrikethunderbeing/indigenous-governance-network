import type {
  FundingSupportType,
  LeadStatus,
  OrganizationType,
} from "@/backend";

/** Human labels for the seven lead statuses, in pipeline order. */
export const leadStatusOrder: LeadStatus[] = [
  "new",
  "contacted",
  "interested",
  "foundingOrganizationProspect",
  "strategicPartner",
  "converted",
  "notProceeding",
] as LeadStatus[];

export const leadStatusLabels: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  interested: "Interested",
  foundingOrganizationProspect: "Founding Organization Prospect",
  strategicPartner: "Strategic Partner",
  converted: "Converted",
  notProceeding: "Not Proceeding",
};

/** The status-chip modifier class that matches each status. */
export const leadStatusClass: Record<LeadStatus, string> = {
  new: "status-new",
  contacted: "status-progress",
  interested: "status-progress",
  foundingOrganizationProspect: "status-progress",
  strategicPartner: "status-progress",
  converted: "status-won",
  notProceeding: "status-closed",
};

export const organizationTypeLabels: Record<OrganizationType, string> = {
  indigenousNationOrCommunity: "Indigenous Nation or Community",
  nonProfitOrCharity: "Non-profit or Charity",
  educationalInstitution: "Educational Institution",
  governmentOrPublicSector: "Government or Public Sector",
  enterprise: "Enterprise",
  smallBusiness: "Small Business",
  cooperative: "Cooperative",
  other: "Other",
};

export const fundingSupportLabels: Record<FundingSupportType, string> = {
  grantOrPhilanthropy: "Grant or Philanthropy",
  investmentInterest: "Investment Interest",
  strategicPartnership: "Strategic Partnership",
  sponsorship: "Sponsorship",
  other: "Other",
};

/** Convert a Motoko nanosecond timestamp to a readable date, or null when invalid. */
export function timestampToDate(timestamp: bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Format a backend timestamp as a short local date, with a fallback. */
export function formatTimestamp(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "Unknown date";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Render an optional text field, or an em dash when absent. */
export function orDash(value: string | undefined | null): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
}

/** Render an optional boolean as Yes / No / em dash. */
export function yesNo(value: boolean | undefined | null): string {
  if (value === undefined || value === null) return "—";
  return value ? "Yes" : "No";
}

/** Escape a single CSV cell, quoting when it contains a comma, quote or newline. */
function csvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Build a CSV document from a header row and body rows. */
export function buildCsv(headers: string[], rows: string[][]): string {
  const lines = [headers, ...rows].map((row) => row.map(csvCell).join(","));
  return lines.join("\r\n");
}

/** Trigger a browser download of a CSV document. */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
