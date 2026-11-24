import {
  BarChart3,
  Handshake,
  MessageSquare,
  ShieldAlert,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

import { SignInButton } from "@/components/InternetIdentity";
import EarlyAccessSection from "@/components/admin/EarlyAccessSection";
import FoundingOrgSection from "@/components/admin/FoundingOrgSection";
import FundingLeadsSection from "@/components/admin/FundingLeadsSection";
import ModerationSection from "@/components/admin/ModerationSection";
import VisitorAnalyticsSection from "@/components/admin/VisitorAnalyticsSection";
import { useIsCallerAdmin } from "@/hooks/useQueries";

/** The five admin sections, in the order the page presents them. */
const adminSections = [
  {
    id: "analytics",
    label: "Visitor Analytics",
    icon: BarChart3,
    description:
      "Popup impressions, challenge starts and completions, response distributions, comments, returning visitors and conversion.",
  },
  {
    id: "early-access",
    label: "Early Access Registrations",
    icon: Users,
    description:
      "Free early access registrations with contact details, organization type and intended DAO use case.",
  },
  {
    id: "founding",
    label: "Founding Organization Leads",
    icon: Handshake,
    description:
      "Founding organization expressions of interest with intended deployment, prepaid interest and budget range.",
  },
  {
    id: "funding",
    label: "Strategic Funding Leads",
    icon: ShieldAlert,
    description:
      "Strategic funding partner enquiries with intended support type and budget range.",
  },
  {
    id: "moderation",
    label: "Public Participation & Moderation",
    icon: MessageSquare,
    description:
      "Public comments with moderation controls and review of reported comments.",
  },
] as const;

/** A titled admin section frame; the section body is added by the page task. */
function AdminSection({
  id,
  label,
  icon: Icon,
  description,
  children,
}: {
  id: string;
  label: string;
  icon: typeof BarChart3;
  description: string;
  children: ReactNode;
}) {
  const headingId = `admin-${id}-heading`;
  return (
    <section
      id={id}
      data-ocid={`engagement.section.${id}`}
      aria-labelledby={headingId}
      className="scroll-mt-24 space-y-4"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
          <Icon className="size-5 text-primary" aria-hidden="true" />
        </span>
        <div className="min-w-0 space-y-1">
          <h2
            id={headingId}
            className="font-display text-xl font-medium tracking-tight text-foreground md:text-2xl"
          >
            {label}
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      {children}
    </section>
  );
}

/**
 * The admin-only engagement and lead management page at "/dao/engagement".
 *
 * This foundation shell owns the route, the admin guard and the five section
 * frames. The section bodies (analytics charts, lead tables, status controls,
 * private notes, CSV export and moderation controls) are implemented by the
 * page task that follows.
 */
export default function AdminEngagementPage() {
  const { data: isAdmin, isLoading } = useIsCallerAdmin();

  if (isLoading) {
    return (
      <output
        data-ocid="engagement.loading_state"
        className="block text-sm text-muted-foreground"
      >
        Checking your access…
      </output>
    );
  }

  if (isAdmin !== true) {
    return (
      <section
        data-ocid="engagement.access_denied"
        aria-labelledby="engagement-denied-heading"
        className="shell-panel mx-auto max-w-lg space-y-4 p-6 text-center sm:p-8"
      >
        <ShieldAlert
          className="mx-auto size-8 text-primary"
          aria-hidden="true"
        />
        <h1
          id="engagement-denied-heading"
          className="font-display text-2xl font-medium tracking-tight text-foreground"
        >
          Administrators only
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          This page holds private lead and visitor data. Sign in with an
          administrator account to view it.
        </p>
        <div className="flex justify-center">
          <SignInButton className="rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-smooth hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60" />
        </div>
      </section>
    );
  }

  return (
    <div data-ocid="page.admin_engagement" className="space-y-10">
      <header className="space-y-3">
        <p className="text-stamp text-accent">Administration</p>
        <h1 className="font-display text-3xl font-medium tracking-tight text-foreground md:text-4xl">
          Engagement &amp; Lead Management
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          Visitor analytics, lead registrations and public participation
          moderation. Private contact information is shown only here.
        </p>
        <div className="rule-accent" />
      </header>

      <nav
        aria-label="Engagement sections"
        data-ocid="engagement.subnav"
        className="shell-panel sticky top-16 z-20 -mx-4 overflow-x-auto px-4 py-2 md:mx-0 md:px-3"
      >
        <ul className="flex items-center gap-1">
          {adminSections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                data-ocid={`engagement.subnav_link.${section.id}`}
                className="inline-flex whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-smooth hover:bg-accent/10 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {adminSections.map((section) => (
        <AdminSection
          key={section.id}
          id={section.id}
          label={section.label}
          icon={section.icon}
          description={section.description}
        >
          {section.id === "analytics" ? <VisitorAnalyticsSection /> : null}
          {section.id === "early-access" ? <EarlyAccessSection /> : null}
          {section.id === "founding" ? <FoundingOrgSection /> : null}
          {section.id === "funding" ? <FundingLeadsSection /> : null}
          {section.id === "moderation" ? <ModerationSection /> : null}
        </AdminSection>
      ))}
    </div>
  );
}
