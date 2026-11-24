import { WaitlistInterestArea, createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { type FormEvent, useId, useState } from "react";

/** The seven interest categories, in the order the backend declares them. */
const interestAreas: { value: WaitlistInterestArea; label: string }[] = [
  {
    value: WaitlistInterestArea.indigenousLeadershipAndGovernance,
    label: "Indigenous leadership and governance",
  },
  {
    value: WaitlistInterestArea.legalResearchAndPolicy,
    label: "Legal research and policy",
  },
  {
    value: WaitlistInterestArea.aiAndTechnology,
    label: "AI and technology",
  },
  {
    value: WaitlistInterestArea.digitalSovereigntyAndDataGovernance,
    label: "Digital sovereignty and data governance",
  },
  {
    value: WaitlistInterestArea.researchParticipation,
    label: "Research participation",
  },
  {
    value: WaitlistInterestArea.daoAndEcosystemDevelopment,
    label: "DAO and ecosystem development",
  },
  {
    value: WaitlistInterestArea.fundingAndStrategicPartnerships,
    label: "Funding and strategic partnerships",
  },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-smooth focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const labelClass = "text-stamp text-muted-foreground";

export default function WaitlistSection() {
  const { actor } = useActor(createActor);
  const nameId = useId();
  const emailId = useId();
  const orgId = useId();
  const interestId = useId();
  const consentId = useId();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [interestArea, setInterestArea] = useState<WaitlistInterestArea | "">(
    "",
  );
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: async (input: {
      name: string;
      email: string;
      organization: string;
      interestArea: WaitlistInterestArea | "";
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.submitWaitlistEntry(
        input.name,
        input.email,
        input.organization.trim() === "" ? null : input.organization.trim(),
        input.interestArea === "" ? null : input.interestArea,
      );
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (trimmedName === "") {
      setError("Please enter your name.");
      return;
    }
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!consent) {
      setError("Please confirm you agree to be contacted about SOVEREIGN.");
      return;
    }

    mutation.mutate(
      {
        name: trimmedName,
        email: trimmedEmail,
        organization,
        interestArea,
      },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "ok") {
            setSubmitted(true);
            setName("");
            setEmail("");
            setOrganization("");
            setInterestArea("");
            setConsent(false);
            return;
          }
          if (result.err === "missingName") {
            setError("Please enter your name.");
          } else if (result.err === "missingEmail") {
            setError("Please enter your email address.");
          } else {
            setError("Please enter a valid email address.");
          }
        },
        onError: () => {
          setError("Something went wrong. Please try again.");
        },
      },
    );
  }

  return (
    <section
      data-ocid="section.waitlist"
      aria-labelledby="waitlist-heading"
      className="border-b border-hairline bg-card"
    >
      <div className="mx-auto max-w-3xl px-6 py-20 sm:py-24">
        <div className="text-center">
          <p className="text-stamp text-accent">Early Access</p>
          <div className="rule-accent mx-auto mt-4 mb-6" />
          <h2
            id="waitlist-heading"
            className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
          >
            Be part of the Participation Economy.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            Join an Indigenous-led research network built on digital sovereignty
            and community-governed technology. Add your name and we will share
            early access as it opens.
          </p>
        </div>

        {submitted ? (
          <output
            data-ocid="waitlist.success_state"
            className="mx-auto mt-10 flex max-w-xl items-start gap-3 rounded-lg border border-primary/40 bg-primary/5 px-5 py-4"
          >
            <CheckCircle2
              className="mt-0.5 size-5 shrink-0 text-primary"
              aria-hidden="true"
            />
            <p className="text-sm leading-relaxed text-foreground">
              You&apos;re on the SOVEREIGN early access list. Thank you for your
              interest.
            </p>
          </output>
        ) : (
          <form
            data-ocid="waitlist.form"
            onSubmit={handleSubmit}
            noValidate
            className="mx-auto mt-10 max-w-xl space-y-5"
          >
            <div className="space-y-2">
              <label htmlFor={nameId} className={labelClass}>
                Name <span className="text-primary">*</span>
              </label>
              <input
                id={nameId}
                data-ocid="waitlist.name_input"
                type="text"
                name="name"
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
                Email address <span className="text-primary">*</span>
              </label>
              <input
                id={emailId}
                data-ocid="waitlist.email_input"
                type="email"
                name="email"
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
                Organization or Nation{" "}
                <span className="normal-case tracking-normal">(optional)</span>
              </label>
              <input
                id={orgId}
                data-ocid="waitlist.organization_input"
                type="text"
                name="organization"
                autoComplete="organization"
                value={organization}
                onChange={(event) => setOrganization(event.target.value)}
                className={inputClass}
                placeholder="Where you are from, if you wish to share"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor={interestId} className={labelClass}>
                Area of interest{" "}
                <span className="normal-case tracking-normal">(optional)</span>
              </label>
              <select
                id={interestId}
                data-ocid="waitlist.interest_select"
                name="interestArea"
                value={interestArea}
                onChange={(event) =>
                  setInterestArea(
                    event.target.value as WaitlistInterestArea | "",
                  )
                }
                className={inputClass}
              >
                <option value="">Select an area</option>
                {interestAreas.map((area) => (
                  <option key={area.value} value={area.value}>
                    {area.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-start gap-3 rounded-md border border-border bg-secondary/40 px-4 py-3">
              <input
                id={consentId}
                data-ocid="waitlist.consent_checkbox"
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                className="mt-0.5 size-4 shrink-0 rounded border-input text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              />
              <label
                htmlFor={consentId}
                className="text-xs leading-relaxed text-muted-foreground"
              >
                I agree to be contacted about SOVEREIGN early access. Your name,
                email and optional details are used only to reach you about the
                network and are never sold or shared. You can ask to be removed
                at any time.
              </label>
            </div>

            {error ? (
              <p
                data-ocid="waitlist.error_state"
                role="alert"
                className="text-sm font-medium text-destructive"
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              data-ocid="waitlist.submit_button"
              disabled={mutation.isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-subtle transition-smooth hover:bg-primary/90 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {mutation.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              JOIN THE WAITLIST
            </button>

            <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <ShieldCheck
                className="mt-0.5 size-4 shrink-0 text-accent"
                aria-hidden="true"
              />
              No account, wallet or Internet Identity is needed to join.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
