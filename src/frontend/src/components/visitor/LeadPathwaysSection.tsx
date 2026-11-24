import {
  FundingSupportType,
  LeadError,
  OrganizationType,
  type SubmitLeadResult,
} from "@/backend";
import {
  useSubmitEarlyAccessLead,
  useSubmitFoundingOrganizationLead,
  useSubmitStrategicFundingLead,
} from "@/hooks/useQueries";
import { CheckCircle2, Loader2 } from "lucide-react";
import { type FormEvent, type ReactNode, useId, useState } from "react";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-smooth focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const labelClass = "text-stamp text-muted-foreground";

const organizationTypes: { value: OrganizationType; label: string }[] = [
  {
    value: OrganizationType.indigenousNationOrCommunity,
    label: "Indigenous Nation or community",
  },
  {
    value: OrganizationType.nonProfitOrCharity,
    label: "Non-profit or charity",
  },
  { value: OrganizationType.cooperative, label: "Cooperative" },
  { value: OrganizationType.smallBusiness, label: "Small business" },
  { value: OrganizationType.enterprise, label: "Enterprise" },
  {
    value: OrganizationType.governmentOrPublicSector,
    label: "Government or public sector",
  },
  {
    value: OrganizationType.educationalInstitution,
    label: "Educational institution",
  },
  { value: OrganizationType.other, label: "Other" },
];

const fundingSupportTypes: { value: FundingSupportType; label: string }[] = [
  {
    value: FundingSupportType.strategicPartnership,
    label: "Strategic partnership",
  },
  { value: FundingSupportType.sponsorship, label: "Sponsorship" },
  {
    value: FundingSupportType.grantOrPhilanthropy,
    label: "Grant or philanthropy",
  },
  {
    value: FundingSupportType.investmentInterest,
    label: "Investment interest",
  },
  { value: FundingSupportType.other, label: "Other" },
];

const budgetRanges = [
  "Under $10,000",
  "$10,000 – $50,000",
  "$50,000 – $250,000",
  "$250,000 – $1,000,000",
  "Over $1,000,000",
  "Prefer not to say",
];

/** Map a backend lead error to a visitor-facing message. */
function leadErrorMessage(error: LeadError): string {
  switch (error) {
    case LeadError.invalidEmail:
      return "Please enter a valid email address.";
    case LeadError.missingEmail:
      return "Please enter your email address.";
    case LeadError.missingName:
      return "Please enter your name.";
    case LeadError.missingOrganization:
      return "Please enter your organization.";
    case LeadError.missingConsent:
      return "Please confirm you agree to be contacted.";
    case LeadError.notAuthorized:
      return "This submission could not be accepted. Please try again later.";
    default:
      return "Something went wrong. Please try again.";
  }
}

/** Shared consent checkbox with a pathway-specific description. */
function ConsentField({
  id,
  checked,
  onChange,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-border bg-secondary/40 px-4 py-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 size-4 shrink-0 rounded border-input text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      />
      <label
        htmlFor={id}
        className="text-xs leading-relaxed text-muted-foreground"
      >
        {children}
      </label>
    </div>
  );
}

/** Shared success confirmation shown only after a genuine successful submission. */
function SuccessNote({
  ocid,
  children,
}: { ocid: string; children: ReactNode }) {
  return (
    <output
      data-ocid={ocid}
      className="flex items-start gap-3 rounded-lg border border-primary/40 bg-primary/5 px-5 py-4"
    >
      <CheckCircle2
        className="mt-0.5 size-5 shrink-0 text-primary"
        aria-hidden="true"
      />
      <p className="text-sm leading-relaxed text-foreground">{children}</p>
    </output>
  );
}

function ErrorNote({ ocid, message }: { ocid: string; message: string }) {
  return (
    <p
      data-ocid={ocid}
      role="alert"
      className="text-sm font-medium text-destructive"
    >
      {message}
    </p>
  );
}

function SubmitButton({
  ocid,
  pending,
  label,
}: {
  ocid: string;
  pending: boolean;
  label: string;
}) {
  return (
    <button
      type="submit"
      data-ocid={ocid}
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-smooth hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : null}
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Pathway A — Free Early Access                                       */
/* ------------------------------------------------------------------ */

function FreeEarlyAccessForm() {
  const nameId = useId();
  const emailId = useId();
  const orgId = useId();
  const typeId = useId();
  const useCaseId = useId();
  const consentId = useId();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [organizationType, setOrganizationType] = useState<
    OrganizationType | ""
  >("");
  const [useCase, setUseCase] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const mutation = useSubmitEarlyAccessLead();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (trimmedName === "") return setError("Please enter your name.");
    if (!EMAIL_PATTERN.test(trimmedEmail))
      return setError("Please enter a valid email address.");
    if (!consent) return setError("Please confirm you agree to be contacted.");

    mutation.mutate(
      {
        name: trimmedName,
        email: trimmedEmail,
        organization: organization.trim() === "" ? null : organization.trim(),
        organizationType: organizationType === "" ? null : organizationType,
        intendedDaoUseCase: useCase.trim() === "" ? null : useCase.trim(),
        consentToContact: consent,
      },
      {
        onSuccess: (result: SubmitLeadResult) => {
          if (result.__kind__ === "ok") {
            setSubmitted(true);
            return;
          }
          setError(leadErrorMessage(result.err));
        },
        onError: () => setError("Something went wrong. Please try again."),
      },
    );
  }

  if (submitted) {
    return (
      <SuccessNote ocid="pathway.free.success_state">
        You&apos;re on the free early access list. We&apos;ll be in touch as the
        sovereign platform opens.
      </SuccessNote>
    );
  }

  return (
    <form
      data-ocid="pathway.free.form"
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4"
    >
      <div className="space-y-2">
        <label htmlFor={nameId} className={labelClass}>
          Name <span className="text-primary">*</span>
        </label>
        <input
          id={nameId}
          data-ocid="pathway.free.name_input"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={inputClass}
          placeholder="Your name"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor={emailId} className={labelClass}>
          Email <span className="text-primary">*</span>
        </label>
        <input
          id={emailId}
          data-ocid="pathway.free.email_input"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={inputClass}
          placeholder="you@example.com"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor={orgId} className={labelClass}>
          Organization{" "}
          <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <input
          id={orgId}
          data-ocid="pathway.free.organization_input"
          type="text"
          autoComplete="organization"
          value={organization}
          onChange={(event) => setOrganization(event.target.value)}
          className={inputClass}
          placeholder="Where you are from, if you wish to share"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor={typeId} className={labelClass}>
          Organization type{" "}
          <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <select
          id={typeId}
          data-ocid="pathway.free.organization_type_select"
          value={organizationType}
          onChange={(event) =>
            setOrganizationType(event.target.value as OrganizationType | "")
          }
          className={inputClass}
        >
          <option value="">Select a type</option>
          {organizationTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <label htmlFor={useCaseId} className={labelClass}>
          Intended DAO use case{" "}
          <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <textarea
          id={useCaseId}
          data-ocid="pathway.free.use_case_textarea"
          rows={3}
          value={useCase}
          onChange={(event) => setUseCase(event.target.value)}
          className={inputClass}
          placeholder="What would your community govern together?"
        />
      </div>
      <ConsentField id={consentId} checked={consent} onChange={setConsent}>
        I agree to be contacted about SOVEREIGN free early access. Your details
        are used only to reach you about the platform and are never sold or
        shared. You can ask to be removed at any time.
      </ConsentField>
      {error ? (
        <ErrorNote ocid="pathway.free.error_state" message={error} />
      ) : null}
      <SubmitButton
        ocid="pathway.free.submit_button"
        pending={mutation.isPending}
        label="Request access"
      />
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Pathway B — Founding Organization                                   */
/* ------------------------------------------------------------------ */

function FoundingOrganizationForm() {
  const orgId = useId();
  const contactId = useId();
  const emailId = useId();
  const deploymentId = useId();
  const budgetId = useId();
  const prepaidId = useId();
  const consentId = useId();

  const [organization, setOrganization] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [intendedDeployment, setIntendedDeployment] = useState("");
  const [prepaidInterest, setPrepaidInterest] = useState(false);
  const [budgetRange, setBudgetRange] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const mutation = useSubmitFoundingOrganizationLead();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const trimmedOrg = organization.trim();
    const trimmedContact = contactName.trim();
    const trimmedEmail = email.trim();
    if (trimmedOrg === "") return setError("Please enter your organization.");
    if (trimmedContact === "") return setError("Please enter a contact name.");
    if (!EMAIL_PATTERN.test(trimmedEmail))
      return setError("Please enter a valid email address.");
    if (!consent) return setError("Please confirm you agree to be contacted.");

    mutation.mutate(
      {
        organization: trimmedOrg,
        contactName: trimmedContact,
        email: trimmedEmail,
        intendedDeployment:
          intendedDeployment.trim() === "" ? null : intendedDeployment.trim(),
        prepaidInterest,
        budgetRange: budgetRange === "" ? null : budgetRange,
        consentToContact: consent,
      },
      {
        onSuccess: (result: SubmitLeadResult) => {
          if (result.__kind__ === "ok") {
            setSubmitted(true);
            return;
          }
          setError(leadErrorMessage(result.err));
        },
        onError: () => setError("Something went wrong. Please try again."),
      },
    );
  }

  if (submitted) {
    return (
      <SuccessNote ocid="pathway.founding.success_state">
        Thank you — your expression of interest has been recorded. This is not a
        purchase or financial commitment, and no payment has been collected.
      </SuccessNote>
    );
  }

  return (
    <form
      data-ocid="pathway.founding.form"
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4"
    >
      <div className="space-y-2">
        <label htmlFor={orgId} className={labelClass}>
          Organization <span className="text-primary">*</span>
        </label>
        <input
          id={orgId}
          data-ocid="pathway.founding.organization_input"
          type="text"
          autoComplete="organization"
          required
          value={organization}
          onChange={(event) => setOrganization(event.target.value)}
          className={inputClass}
          placeholder="Your organization or Nation"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor={contactId} className={labelClass}>
          Contact name <span className="text-primary">*</span>
        </label>
        <input
          id={contactId}
          data-ocid="pathway.founding.contact_input"
          type="text"
          autoComplete="name"
          required
          value={contactName}
          onChange={(event) => setContactName(event.target.value)}
          className={inputClass}
          placeholder="Who should we speak with?"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor={emailId} className={labelClass}>
          Email <span className="text-primary">*</span>
        </label>
        <input
          id={emailId}
          data-ocid="pathway.founding.email_input"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={inputClass}
          placeholder="you@example.com"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor={deploymentId} className={labelClass}>
          Intended deployment{" "}
          <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <textarea
          id={deploymentId}
          data-ocid="pathway.founding.deployment_textarea"
          rows={3}
          value={intendedDeployment}
          onChange={(event) => setIntendedDeployment(event.target.value)}
          className={inputClass}
          placeholder="How do you imagine deploying a DAO for your community?"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor={budgetId} className={labelClass}>
          Budget range{" "}
          <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <select
          id={budgetId}
          data-ocid="pathway.founding.budget_select"
          value={budgetRange}
          onChange={(event) => setBudgetRange(event.target.value)}
          className={inputClass}
        >
          <option value="">Select a range</option>
          {budgetRanges.map((range) => (
            <option key={range} value={range}>
              {range}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-start gap-3 rounded-md border border-border bg-secondary/40 px-4 py-3">
        <input
          id={prepaidId}
          data-ocid="pathway.founding.prepaid_checkbox"
          type="checkbox"
          checked={prepaidInterest}
          onChange={(event) => setPrepaidInterest(event.target.checked)}
          className="mt-0.5 size-4 shrink-0 rounded border-input text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        />
        <label
          htmlFor={prepaidId}
          className="text-xs leading-relaxed text-muted-foreground"
        >
          I am interested in a prepaid founding arrangement. This is an
          expression of interest only — no payment is collected now.
        </label>
      </div>
      <ConsentField id={consentId} checked={consent} onChange={setConsent}>
        I agree to be contacted about the Founding Organization pathway. Your
        details are used only to reach you about SOVEREIGN and are never sold or
        shared.
      </ConsentField>
      {error ? (
        <ErrorNote ocid="pathway.founding.error_state" message={error} />
      ) : null}
      <SubmitButton
        ocid="pathway.founding.submit_button"
        pending={mutation.isPending}
        label="Apply to found"
      />
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Pathway C — Strategic Funding Partner                               */
/* ------------------------------------------------------------------ */

function StrategicFundingForm() {
  const contactId = useId();
  const orgId = useId();
  const emailId = useId();
  const supportId = useId();
  const budgetId = useId();
  const consentId = useId();

  const [contactName, setContactName] = useState("");
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [intendedSupport, setIntendedSupport] = useState<
    FundingSupportType | ""
  >("");
  const [budgetRange, setBudgetRange] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const mutation = useSubmitStrategicFundingLead();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const trimmedContact = contactName.trim();
    const trimmedEmail = email.trim();
    if (trimmedContact === "") return setError("Please enter a contact name.");
    if (!EMAIL_PATTERN.test(trimmedEmail))
      return setError("Please enter a valid email address.");
    if (!consent) return setError("Please confirm you agree to be contacted.");

    mutation.mutate(
      {
        contactName: trimmedContact,
        organization: organization.trim() === "" ? null : organization.trim(),
        email: trimmedEmail,
        intendedSupport: intendedSupport === "" ? null : intendedSupport,
        budgetRange: budgetRange === "" ? null : budgetRange,
        consentToContact: consent,
      },
      {
        onSuccess: (result: SubmitLeadResult) => {
          if (result.__kind__ === "ok") {
            setSubmitted(true);
            return;
          }
          setError(leadErrorMessage(result.err));
        },
        onError: () => setError("Something went wrong. Please try again."),
      },
    );
  }

  if (submitted) {
    return (
      <SuccessNote ocid="pathway.funding.success_state">
        Thank you — your enquiry has been recorded. No equity, returns or
        ownership is promised, and nothing has been purchased.
      </SuccessNote>
    );
  }

  return (
    <form
      data-ocid="pathway.funding.form"
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4"
    >
      <div className="space-y-2">
        <label htmlFor={contactId} className={labelClass}>
          Contact name <span className="text-primary">*</span>
        </label>
        <input
          id={contactId}
          data-ocid="pathway.funding.contact_input"
          type="text"
          autoComplete="name"
          required
          value={contactName}
          onChange={(event) => setContactName(event.target.value)}
          className={inputClass}
          placeholder="Who should we speak with?"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor={orgId} className={labelClass}>
          Organization{" "}
          <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <input
          id={orgId}
          data-ocid="pathway.funding.organization_input"
          type="text"
          autoComplete="organization"
          value={organization}
          onChange={(event) => setOrganization(event.target.value)}
          className={inputClass}
          placeholder="Your organization or fund"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor={emailId} className={labelClass}>
          Email <span className="text-primary">*</span>
        </label>
        <input
          id={emailId}
          data-ocid="pathway.funding.email_input"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={inputClass}
          placeholder="you@example.com"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor={supportId} className={labelClass}>
          Intended support{" "}
          <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <select
          id={supportId}
          data-ocid="pathway.funding.support_select"
          value={intendedSupport}
          onChange={(event) =>
            setIntendedSupport(event.target.value as FundingSupportType | "")
          }
          className={inputClass}
        >
          <option value="">Select a form of support</option>
          {fundingSupportTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <label htmlFor={budgetId} className={labelClass}>
          Budget range{" "}
          <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <select
          id={budgetId}
          data-ocid="pathway.funding.budget_select"
          value={budgetRange}
          onChange={(event) => setBudgetRange(event.target.value)}
          className={inputClass}
        >
          <option value="">Select a range</option>
          {budgetRanges.map((range) => (
            <option key={range} value={range}>
              {range}
            </option>
          ))}
        </select>
      </div>
      <ConsentField id={consentId} checked={consent} onChange={setConsent}>
        I agree to be contacted about strategic funding and partnership. Your
        details are used only to reach you about SOVEREIGN and are never sold or
        shared.
      </ConsentField>
      {error ? (
        <ErrorNote ocid="pathway.funding.error_state" message={error} />
      ) : null}
      <SubmitButton
        ocid="pathway.funding.submit_button"
        pending={mutation.isPending}
        label="Partner with us"
      />
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Section shell                                                       */
/* ------------------------------------------------------------------ */

/**
 * The three participation pathway forms: Free Early Access, Founding
 * Organization and Strategic Funding Partner. Each captures consent, submits
 * through its existing hook and confirms only after a genuine success.
 */
export default function LeadPathwaysSection() {
  return (
    <section
      id="pathways"
      data-ocid="deploy.pathways"
      aria-labelledby="deploy-pathways-heading"
      className="scroll-mt-24"
    >
      <div className="space-y-3">
        <p className="text-stamp text-accent">Three ways in</p>
        <h2
          id="deploy-pathways-heading"
          className="font-display text-3xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl"
        >
          Choose your participation pathway
        </h2>
        <div className="rule-accent" />
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          Every pathway is an expression of interest. Nothing here is a
          purchase, a financial commitment or a promise of ownership.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Free Early Access */}
        <div
          data-ocid="pathway.free.card"
          className="lead-pathway-card pathway-tier-free"
        >
          <span
            className="size-3 rounded-full bg-[oklch(var(--pathway-free))]"
            aria-hidden="true"
          />
          <h3 className="font-display text-xl font-medium text-foreground">
            Free Early Access
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Gain priority access to the sovereign platform and upcoming
            governance tools.
          </p>
          <FreeEarlyAccessForm />
        </div>

        {/* Founding Organization */}
        <div
          data-ocid="pathway.founding.card"
          className="lead-pathway-card pathway-tier-founding"
        >
          <span
            className="size-3 rounded-full bg-[oklch(var(--pathway-founding))]"
            aria-hidden="true"
          />
          <h3 className="font-display text-xl font-medium text-foreground">
            Founding Organization
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Help shape the core infrastructure and long-term organizational
            governance.
          </p>
          <div className="rounded-md border border-dashed border-accent/60 bg-accent/5 px-4 py-3">
            <p className="text-xs leading-relaxed text-foreground">
              This is an expression of interest, not a purchase or financial
              commitment. No payment is collected and no ownership is promised.
            </p>
          </div>
          <div>
            <p className="text-stamp text-muted-foreground">
              Potential benefits
            </p>
            <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-muted-foreground">
              {[
                "Priority onboarding",
                "Early access",
                "Founding recognition",
                "Preferential subscription pricing",
                "Product input",
              ].map((benefit) => (
                <li key={benefit} className="flex items-start gap-2">
                  <span
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent"
                    aria-hidden="true"
                  />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
          <FoundingOrganizationForm />
        </div>

        {/* Strategic Funding Partner */}
        <div
          data-ocid="pathway.funding.card"
          className="lead-pathway-card pathway-tier-funding"
        >
          <span
            className="size-3 rounded-full bg-[oklch(var(--pathway-funding))]"
            aria-hidden="true"
          />
          <h3 className="font-display text-xl font-medium text-foreground">
            Strategic Funding Partner
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Deploy institutional capital to support and scale community
            development.
          </p>
          <div className="rounded-md border border-dashed border-accent/60 bg-accent/5 px-4 py-3">
            <p className="text-xs leading-relaxed text-foreground">
              Supports development, partnerships and the broader Indigenous
              Governance Network / SOVEREIGN initiative, which carries a
              $500,000 funding objective. Subscriptions, prepayments, donations
              and investments are kept clearly separate. No equity, returns or
              ownership is promised.
            </p>
          </div>
          <StrategicFundingForm />
        </div>
      </div>
    </section>
  );
}
