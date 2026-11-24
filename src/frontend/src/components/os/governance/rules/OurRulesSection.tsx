import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Compass, ScrollText } from "lucide-react";
import { useMemo } from "react";

import type { Constitution, GovernanceRuleSet } from "@/backend";
import { useActiveNation } from "@/components/os/attachments/useActiveNation";
import GovernanceProgress from "@/components/os/governance/GovernanceProgress";
import type { GovernanceViewKey } from "@/components/os/governance/governanceSections";
import AmendmentHistory from "@/components/os/governance/rules/AmendmentHistory";
import ProposalAttachmentsPanel from "@/components/os/governance/rules/ProposalAttachmentsPanel";
import {
  formatRuleValue,
  ruleExplanations,
  ruleGroups,
} from "@/components/os/governance/rules/ruleExplanations";
import {
  useActiveConstitution,
  useActiveRuleSet,
  useAmendments,
} from "@/components/os/governance/rules/useRules";

/**
 * The Our Rules section body: the organization's active constitution and its
 * governance rules in plain language, grouped so a non-expert can read them,
 * with a plain-language explanation beside each rule. It also shows the
 * amendment history, explains that changes go through an amendment, and offers
 * the interactive governance demonstration.
 *
 * Rules are never edited directly here — the only update path is the
 * organization's own approved governance process.
 */
export default function OurRulesSection() {
  const { nationId } = useActiveNation();
  const constitutionQuery = useActiveConstitution(nationId);
  const ruleSetQuery = useActiveRuleSet(nationId);
  const amendmentsQuery = useAmendments(nationId);

  const rules = ruleSetQuery.data ?? null;
  const amendments = useMemo(
    () => amendmentsQuery.data ?? [],
    [amendmentsQuery.data],
  );

  // The rules area is set up once the organization has an active rule set.
  const completedViews = useMemo<GovernanceViewKey[]>(() => {
    const done: GovernanceViewKey[] = [];
    if (rules) done.push("constitutional");
    return done;
  }, [rules]);

  return (
    <div className="space-y-5">
      <GovernanceProgress completed={completedViews} />

      <ConstitutionSummary
        constitution={constitutionQuery.data ?? null}
        isLoading={constitutionQuery.isLoading}
        isError={constitutionQuery.isError}
        onRetry={() => void constitutionQuery.refetch()}
      />

      <RulesInPlainLanguage
        rules={rules}
        isLoading={ruleSetQuery.isLoading}
        isError={ruleSetQuery.isError}
        onRetry={() => void ruleSetQuery.refetch()}
      />

      <AmendmentPathNotice />

      <ProposalAttachmentsPanel />

      <section aria-label="Amendment history" className="space-y-3">
        <header className="space-y-1">
          <p className="text-stamp text-accent">Amendment history</p>
          <h3 className="font-display text-lg font-medium tracking-tight text-foreground">
            Every change, under the rules of its time
          </h3>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Each change shows when it was made and the rules that were in effect
            at that time, so a past decision is always read under the rules that
            applied when it happened.
          </p>
        </header>
        <AmendmentHistory
          amendments={amendments}
          isLoading={amendmentsQuery.isLoading}
          isError={amendmentsQuery.isError}
          onRetry={() => void amendmentsQuery.refetch()}
        />
      </section>

      <ExploreGovernanceEntry />
    </div>
  );
}

/** The active constitution, shown as a signed instrument summary. */
function ConstitutionSummary({
  constitution,
  isLoading,
  isError,
  onRetry,
}: {
  constitution: Constitution | null;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  if (isLoading) {
    return (
      <div
        data-ocid="os.governance.rules.constitution_loading"
        aria-busy="true"
        className="shell-panel h-32 animate-pulse bg-muted/40"
      />
    );
  }

  if (isError) {
    return (
      <div
        data-ocid="os.governance.rules.constitution_error"
        role="alert"
        className="shell-panel space-y-3 p-5"
      >
        <p className="font-display text-base font-medium text-foreground">
          The constitution could not be loaded.
        </p>
        <button
          type="button"
          data-ocid="os.governance.rules.constitution_retry_button"
          onClick={onRetry}
          className="os-focus-ring inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-smooth hover:opacity-90"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!constitution) {
    return (
      <div
        data-ocid="os.governance.rules.constitution_empty_state"
        className="shell-panel space-y-2 p-5"
      >
        <p className="font-display text-base font-medium text-foreground">
          No constitution confirmed yet
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Your organization has not confirmed its rules yet. Open the
          Constitution Builder to write and confirm them.
        </p>
      </div>
    );
  }

  return (
    <article
      data-ocid="os.governance.rules.constitution"
      className="gov-constitution space-y-4 p-5 md:p-6"
    >
      <header className="flex flex-wrap items-start gap-4">
        <span
          aria-hidden="true"
          className="gov-seal flex size-12 shrink-0 items-center justify-center rounded-full"
        >
          <ScrollText className="size-5" />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-stamp text-muted-foreground">
            Constitution in force
          </p>
          <h3 className="font-display text-xl font-medium tracking-tight text-foreground">
            The rules your organization follows
          </h3>
          <p className="text-sm text-muted-foreground">
            Version {constitution.version.toString()} · Confirmed{" "}
            {formatConfirmedDate(constitution.timestamp)}
          </p>
        </div>
      </header>
      <p className="text-sm leading-relaxed text-muted-foreground">
        This is the constitution your community has agreed to. Every rule below
        comes from it, and every change to it is recorded in the amendment
        history.
      </p>
    </article>
  );
}

/** Format a constitution's confirmation timestamp, or a plain fallback. */
function formatConfirmedDate(timestamp: bigint): string {
  const date = new Date(Number(timestamp / 1_000_000n));
  if (Number.isNaN(date.getTime())) return "date unavailable";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** The rules in force, grouped and explained in plain language. */
function RulesInPlainLanguage({
  rules,
  isLoading,
  isError,
  onRetry,
}: {
  rules: GovernanceRuleSet | null;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  if (isLoading) {
    return (
      <div
        data-ocid="os.governance.rules.loading_state"
        aria-busy="true"
        className="space-y-3"
      >
        {Array.from({ length: 3 }, (_, i) => `rules-skeleton-${i}`).map(
          (id) => (
            <div
              key={id}
              className="shell-panel h-28 animate-pulse bg-muted/40"
            />
          ),
        )}
      </div>
    );
  }

  if (isError) {
    return (
      <div
        data-ocid="os.governance.rules.error_state"
        role="alert"
        className="shell-panel space-y-3 p-5"
      >
        <p className="font-display text-base font-medium text-foreground">
          The rules could not be loaded.
        </p>
        <p className="text-sm text-muted-foreground">
          Check your connection and try again.
        </p>
        <button
          type="button"
          data-ocid="os.governance.rules.retry_button"
          onClick={onRetry}
          className="os-focus-ring inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-smooth hover:opacity-90"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!rules) {
    return (
      <div
        data-ocid="os.governance.rules.empty_state"
        className="shell-panel space-y-2 p-5"
      >
        <p className="font-display text-base font-medium text-foreground">
          No rules in force yet
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Once your organization confirms its constitution, its rules will
          appear here in plain language.
        </p>
      </div>
    );
  }

  return (
    <section aria-label="Rules in plain language" className="space-y-4">
      <header className="space-y-1">
        <p className="text-stamp text-accent">Your rules, in plain language</p>
        <h3 className="font-display text-lg font-medium tracking-tight text-foreground">
          What each rule means
        </h3>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Grouped so anyone can read them. Each rule is paired with a short
          explanation in everyday words.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {ruleGroups.map((group) => (
          <section
            key={group.key}
            data-ocid={`os.governance.rules.group.${group.key}`}
            className="shell-panel space-y-3 p-4"
          >
            <div className="space-y-1">
              <h4 className="font-display text-base font-medium text-foreground">
                {group.label}
              </h4>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {group.description}
              </p>
            </div>
            <dl className="space-y-3">
              {group.fields.map((field) => (
                <div
                  key={field}
                  data-ocid={`os.governance.rules.rule.${field}`}
                  className="gov-clause space-y-0.5"
                >
                  <dt className="text-sm font-medium text-foreground">
                    {ruleExplanations[field].label}
                  </dt>
                  <dd className="text-sm leading-relaxed text-muted-foreground">
                    {ruleExplanations[field].explanation}
                  </dd>
                  <dd className="text-tabular text-sm font-semibold text-accent">
                    {formatRuleValue(field, rules)}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </section>
  );
}

/** One plain sentence explaining that changes go through an amendment. */
function AmendmentPathNotice() {
  return (
    <section
      data-ocid="os.governance.rules.amendment_path"
      className="shell-panel flex items-start gap-3 p-4"
    >
      <span className="os-icon-glyph size-10 shrink-0" aria-hidden="true">
        <BookOpen className="size-5" />
      </span>
      <div className="min-w-0 space-y-1">
        <p className="text-stamp text-accent">How rules change</p>
        <p className="text-sm leading-relaxed text-foreground">
          Rules are never edited directly — every change goes through an
          amendment your organization approves together.
        </p>
      </div>
    </section>
  );
}

/** The prominent entry point to the interactive governance demonstration. */
function ExploreGovernanceEntry() {
  return (
    <Link
      to="/os/constitution"
      data-ocid="os.governance.rules.explore_governance_link"
      className="gov-cta-panel os-focus-ring flex min-h-[44px] flex-col gap-3 p-5 transition-smooth hover:opacity-95 sm:flex-row sm:items-center sm:justify-between"
    >
      <span className="flex items-start gap-3">
        <Compass className="mt-0.5 size-6 shrink-0" aria-hidden="true" />
        <span className="min-w-0 space-y-1">
          <span className="block font-display text-lg font-medium leading-snug">
            Explore How Governance Works
          </span>
          <span className="block text-sm leading-relaxed opacity-90">
            Try the interactive demonstration: pick an example, read the rules
            it would produce, and see how a change would work.
          </span>
        </span>
      </span>
      <span className="gov-cta-inverse inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold">
        Open the demonstration
        <ArrowRight className="size-4" aria-hidden="true" />
      </span>
    </Link>
  );
}
