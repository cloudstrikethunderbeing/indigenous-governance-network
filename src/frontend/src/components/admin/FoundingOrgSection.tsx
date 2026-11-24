import { LeadPathway } from "@/backend";
import { useLeads } from "@/hooks/useQueries";

import LeadControls from "./LeadControls";
import LeadSectionShell from "./LeadSectionShell";
import { formatTimestamp, orDash, yesNo } from "./leadFormat";

/**
 * Founding Organization Leads — organization, contact, email, intended
 * deployment, prepaid interest, optional budget range, registration date and
 * lead status.
 */
export default function FoundingOrgSection() {
  const query = useLeads(LeadPathway.foundingOrganization);

  return (
    <LeadSectionShell
      ocid="engagement.founding"
      title="Founding organization leads"
      description="Founding organization expressions of interest:"
      query={query}
      csvFilename="sovereign-founding-organization-leads.csv"
      csvHeaders={[
        "Organization",
        "Contact",
        "Email",
        "Intended deployment",
        "Prepaid interest",
        "Budget range",
        "Status",
        "Registered",
      ]}
      csvRow={(lead) => [
        orDash(lead.organization),
        lead.name,
        lead.email,
        orDash(lead.intendedDeployment),
        yesNo(lead.prepaidInterest),
        orDash(lead.budgetRange),
        lead.status,
        formatTimestamp(lead.timestamp),
      ]}
    >
      {(leads) =>
        leads.map((lead, index) => (
          <li
            key={lead.id.toString()}
            data-ocid={`engagement.founding.item.${index + 1}`}
            className="shell-panel p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="font-display text-base font-medium tracking-tight text-foreground">
                  {orDash(lead.organization)}
                </p>
                <p className="text-sm text-muted-foreground">{lead.name}</p>
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
              <div className="flex gap-2 sm:col-span-2">
                <dt className="shrink-0 text-muted-foreground">
                  Intended deployment
                </dt>
                <dd className="min-w-0 text-foreground">
                  {orDash(lead.intendedDeployment)}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-muted-foreground">Prepaid interest</dt>
                <dd className="text-foreground">
                  {yesNo(lead.prepaidInterest)}
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
