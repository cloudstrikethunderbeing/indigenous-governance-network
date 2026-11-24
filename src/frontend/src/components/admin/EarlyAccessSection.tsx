import { LeadPathway } from "@/backend";
import { useLeads } from "@/hooks/useQueries";

import LeadControls from "./LeadControls";
import LeadSectionShell from "./LeadSectionShell";
import {
  formatTimestamp,
  orDash,
  organizationTypeLabels,
  yesNo,
} from "./leadFormat";

/**
 * Early Access Registrations — the Free Early Access leads with contact
 * details, registration date, organization, organization type, intended DAO
 * use case, consent and lead status.
 */
export default function EarlyAccessSection() {
  const query = useLeads(LeadPathway.freeEarlyAccess);

  return (
    <LeadSectionShell
      ocid="engagement.early_access"
      title="Early access registrations"
      description="Free early access registrations:"
      query={query}
      csvFilename="sovereign-early-access-registrations.csv"
      csvHeaders={[
        "Name",
        "Email",
        "Organization",
        "Organization type",
        "Intended DAO use case",
        "Consent to contact",
        "Status",
        "Registered",
      ]}
      csvRow={(lead) => [
        lead.name,
        lead.email,
        orDash(lead.organization),
        lead.organizationType
          ? organizationTypeLabels[lead.organizationType]
          : "—",
        orDash(lead.intendedDaoUseCase),
        yesNo(lead.consentToContact),
        lead.status,
        formatTimestamp(lead.timestamp),
      ]}
    >
      {(leads) =>
        leads.map((lead, index) => (
          <li
            key={lead.id.toString()}
            data-ocid={`engagement.early_access.item.${index + 1}`}
            className="shell-panel p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="font-display text-base font-medium tracking-tight text-foreground">
                  {lead.name}
                </p>
                <a
                  href={`mailto:${lead.email}`}
                  className="block truncate text-sm text-primary underline-offset-2 hover:underline"
                >
                  {lead.email}
                </a>
              </div>
              <span className="text-tabular shrink-0 text-xs text-muted-foreground">
                {formatTimestamp(lead.timestamp)}
              </span>
            </div>

            <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              <div className="flex gap-2">
                <dt className="text-muted-foreground">Organization</dt>
                <dd className="min-w-0 text-foreground">
                  {orDash(lead.organization)}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-muted-foreground">Type</dt>
                <dd className="min-w-0 text-foreground">
                  {lead.organizationType
                    ? organizationTypeLabels[lead.organizationType]
                    : "—"}
                </dd>
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <dt className="shrink-0 text-muted-foreground">
                  Intended DAO use case
                </dt>
                <dd className="min-w-0 text-foreground">
                  {orDash(lead.intendedDaoUseCase)}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-muted-foreground">Consent to contact</dt>
                <dd className="text-foreground">
                  {yesNo(lead.consentToContact)}
                </dd>
              </div>
            </dl>

            <LeadControls lead={lead} index={index + 1} />
          </li>
        ))
      }
    </LeadSectionShell>
  );
}
