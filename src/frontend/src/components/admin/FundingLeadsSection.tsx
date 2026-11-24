import { LeadPathway } from "@/backend";
import { useLeads } from "@/hooks/useQueries";

import LeadControls from "./LeadControls";
import LeadSectionShell from "./LeadSectionShell";
import { formatTimestamp, fundingSupportLabels, orDash } from "./leadFormat";

/**
 * Strategic Funding Leads — contact, organization, email, intended support,
 * optional budget range, registration date and lead status.
 */
export default function FundingLeadsSection() {
  const query = useLeads(LeadPathway.strategicFundingPartner);

  return (
    <LeadSectionShell
      ocid="engagement.funding"
      title="Strategic funding leads"
      description="Strategic funding partner enquiries:"
      query={query}
      csvFilename="sovereign-strategic-funding-leads.csv"
      csvHeaders={[
        "Contact",
        "Organization",
        "Email",
        "Intended support",
        "Budget range",
        "Status",
        "Registered",
      ]}
      csvRow={(lead) => [
        lead.name,
        orDash(lead.organization),
        lead.email,
        lead.intendedSupport ? fundingSupportLabels[lead.intendedSupport] : "—",
        orDash(lead.budgetRange),
        lead.status,
        formatTimestamp(lead.timestamp),
      ]}
    >
      {(leads) =>
        leads.map((lead, index) => (
          <li
            key={lead.id.toString()}
            data-ocid={`engagement.funding.item.${index + 1}`}
            className="shell-panel p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="font-display text-base font-medium tracking-tight text-foreground">
                  {lead.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {orDash(lead.organization)}
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
                <dt className="text-muted-foreground">Intended support</dt>
                <dd className="min-w-0 text-foreground">
                  {lead.intendedSupport
                    ? fundingSupportLabels[lead.intendedSupport]
                    : "—"}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-muted-foreground">Budget range</dt>
                <dd className="min-w-0 text-foreground">
                  {orDash(lead.budgetRange)}
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
