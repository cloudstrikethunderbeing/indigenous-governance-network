import { Link } from "@tanstack/react-router";
import { Check, CheckCircle2, Clock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  type AmendmentProposal,
  AmendmentProposalStatus,
  type NationProposal,
  SovereignError,
  type VoteChoice,
  type VotingEligibility,
} from "@/backend";
import OsAppPage from "@/components/os/OsAppPage";
import { useActiveNation } from "@/components/os/attachments/useActiveNation";
import { useSampleNationId } from "@/components/os/files/useSampleNationId";
import FoundingProgressPanel from "@/components/os/governance/FoundingProgressPanel";
import GovernanceProgress from "@/components/os/governance/GovernanceProgress";
import GovernanceSectionShell from "@/components/os/governance/GovernanceSectionShell";
import ProposalDetail from "@/components/os/governance/ProposalDetail";
import ProposalList from "@/components/os/governance/ProposalList";
import RecoveryPlanPanel from "@/components/os/governance/RecoveryPlanPanel";
import VotingEligibilityNotice from "@/components/os/governance/VotingEligibilityNotice";
import ActivitySection from "@/components/os/governance/activity/ActivitySection";
import GovernanceHistoryPanel from "@/components/os/governance/activity/GovernanceHistoryPanel";
import AmendmentComparison from "@/components/os/governance/amendments/AmendmentComparison";
import AmendmentComposer from "@/components/os/governance/amendments/AmendmentComposer";
import AmendmentDiscussion from "@/components/os/governance/amendments/AmendmentDiscussion";
import ConstitutionVersionHistory from "@/components/os/governance/amendments/ConstitutionVersionHistory";
import DissolutionWorkflow from "@/components/os/governance/dissolution/DissolutionWorkflow";
import {
  type GovernanceSectionKey,
  type GovernanceViewKey,
  governanceSections,
  governanceViews,
  viewsForSection,
} from "@/components/os/governance/governanceSections";
import MembersSection from "@/components/os/governance/members/MembersSection";
import DeparturePanel from "@/components/os/governance/membership/DeparturePanel";
import RemovalReviewPanel from "@/components/os/governance/membership/RemovalReviewPanel";
import OurRulesSection from "@/components/os/governance/rules/OurRulesSection";
import { useActiveRuleSet } from "@/components/os/governance/rules/useRules";
import {
  useFoundingStatus,
  useGovernanceHistory,
  useVotingEligibility,
} from "@/hooks/useGovernanceEnforcement";
import {
  useActivationRequirements,
  useAmendmentProposals,
  useConstitutionVersions,
} from "@/hooks/useGovernanceLifecycle";
import {
  useCastNationVote,
  useEnsureSampleWorkspace,
  useNation,
  useNationMembers,
  useNationProposals,
} from "@/hooks/useSovereign";

/** A plain-language message for a failed vote. */
function voteErrorMessage(error: SovereignError): string {
  switch (error) {
    case SovereignError.notAuthorized:
      return "Voting is closed for this proposal.";
    case SovereignError.unknownProposal:
      return "This proposal could not be found. Reload the app and try again.";
    default:
      return "Your vote could not be recorded. Please try again.";
  }
}

/**
 * The Governance app, restructured into exactly four sections — Our Rules,
 * Decisions, Members and Activity. The eight governance views live inside these
 * four sections; there is no additional top-level navigation. The Decisions
 * section keeps the existing proposal list, detail and vote workflow.
 */
export default function GovernanceAppPage() {
  const ensureWorkspace = useEnsureSampleWorkspace();
  const sampleNationId = useSampleNationId();
  const proposalsQuery = useNationProposals(sampleNationId);
  const castVote = useCastNationVote();
  const { nationId, readOnly } = useActiveNation();

  const foundingStatus = useFoundingStatus(nationId);
  const requirements = useActivationRequirements(nationId);
  const nation = useNation(nationId);
  const eligibility = useVotingEligibility(nationId);
  const history = useGovernanceHistory(nationId);
  const members = useNationMembers(nationId);

  const [section, setSection] = useState<GovernanceSectionKey>("our-rules");
  const [view, setView] = useState<GovernanceViewKey>("constitutional");
  const [selectedId, setSelectedId] = useState<bigint | null>(null);
  const [recordedChoice, setRecordedChoice] = useState<VoteChoice | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);

  // Switching section opens that section's first view.
  function handleSelectSection(next: GovernanceSectionKey) {
    setSection(next);
    const firstView = viewsForSection(next)[0];
    if (firstView) setView(firstView.key);
  }

  // Seed the sample Nation workspace once so a visitor always has proposals.
  const { mutate: ensure } = ensureWorkspace;
  useEffect(() => {
    ensure();
  }, [ensure]);

  const proposals = useMemo(
    () => proposalsQuery.data ?? [],
    [proposalsQuery.data],
  );

  // The Nation's activation state, derived from its founding setup status.
  const activated = foundingStatus.data?.activated ?? false;

  // Display names keyed by principal text, so the history reads by name.
  const memberNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const member of members.data ?? []) {
      if (member.displayName.trim().length > 0) {
        map.set(member.member.toText(), member.displayName);
      }
    }
    return map;
  }, [members.data]);

  // Keep a valid selection as the list loads and changes.
  const selected = useMemo<NationProposal | null>(() => {
    if (proposals.length === 0) return null;
    const match = proposals.find((p) => p.id === selectedId);
    return match ?? proposals[0];
  }, [proposals, selectedId]);

  // A new selection starts with no recorded vote for this visitor.
  const { mutate: vote } = castVote;
  function handleSelect(id: bigint) {
    setSelectedId(id);
    setRecordedChoice(null);
    setVoteError(null);
  }

  function handleVote(choice: VoteChoice) {
    if (!selected) return;
    setVoteError(null);
    vote(
      { proposal: selected.id, choice },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "ok") {
            setRecordedChoice(choice);
          } else {
            setVoteError(voteErrorMessage(result.err));
          }
        },
        onError: () => {
          setVoteError("Your vote could not be recorded. Please try again.");
        },
      },
    );
  }

  const isLoading = proposalsQuery.isLoading || ensureWorkspace.isPending;

  // The governance areas that are set up. The Decisions area is set up as soon
  // as the sample Nation has proposals; the rest are completed by the section
  // bodies.
  const completedViews = useMemo<GovernanceViewKey[]>(() => {
    const done: GovernanceViewKey[] = [];
    if (proposals.length > 0) {
      done.push("proposals", "voting");
    }
    return done;
  }, [proposals.length]);

  const activeSection = governanceSections.find((s) => s.key === section);

  return (
    <OsAppPage appKey="governance">
      <div className="space-y-5">
        <header className="space-y-2">
          <p className="text-stamp text-accent">Governance</p>
          <h2 className="font-display text-2xl font-medium tracking-tight text-foreground">
            {activeSection?.label ?? "Governance"}
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {activeSection?.description ??
              "Run your organization with four simple sections."}
          </p>
          <div className="rule-accent" />
        </header>

        <GovernanceProgress completed={completedViews} compact />

        <FoundingProgressPanel
          nation={nationId}
          nationName={nation.data?.name ?? "Your Nation"}
        />

        <ActivationRequirementsPanel
          activated={activated}
          requirements={requirements.data ?? null}
          isLoading={requirements.isLoading}
        />

        <RecoveryPlanPanel />

        <GovernanceSectionShell
          active={section}
          onSelect={handleSelectSection}
          activeView={view}
          onSelectView={setView}
        >
          {section === "our-rules" ? (
            view === "constitutional" ? (
              <OurRulesSection />
            ) : view === "amendments" ? (
              <AmendmentsSection nationId={nationId} readOnly={readOnly} />
            ) : (
              <ViewPlaceholder view={view} />
            )
          ) : section === "members" ? (
            view === "membership" ? (
              <MembersSection />
            ) : view === "departures" ? (
              <DeparturesSection />
            ) : (
              <ViewPlaceholder view={view} />
            )
          ) : section === "decisions" ? (
            <DecisionsSection
              isLoading={isLoading}
              isError={proposalsQuery.isError}
              onRetry={() => void proposalsQuery.refetch()}
              proposals={proposals}
              selected={selected}
              nationId={nationId}
              readOnly={readOnly}
              onSelect={handleSelect}
              onVote={handleVote}
              isVoting={castVote.isPending}
              voteError={voteError}
              recordedChoice={recordedChoice}
              eligibility={eligibility.data ?? null}
              isEligibilityLoading={eligibility.isLoading}
            />
          ) : section === "activity" ? (
            view === "lifecycle" ? (
              <DissolutionWorkflow />
            ) : (
              <div className="space-y-6">
                <ActivitySection />
                <section className="space-y-3" aria-label="Governance history">
                  <div className="space-y-1">
                    <h3 className="font-display text-lg font-medium tracking-tight text-foreground">
                      Governance history
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Every appointment, acceptance, approval, rejection, vote
                      and rule change, recorded for good.
                    </p>
                  </div>
                  <GovernanceHistoryPanel
                    entries={history.data ?? []}
                    memberNames={memberNames}
                    isLoading={history.isLoading}
                    isError={history.isError}
                    onRetry={() => void history.refetch()}
                  />
                </section>
              </div>
            )
          ) : (
            <SectionPlaceholder section={section} />
          )}
        </GovernanceSectionShell>
      </div>
    </OsAppPage>
  );
}

/**
 * The outstanding activation requirements, in plain language, so it is obvious
 * what still stands between the Nation and becoming Active.
 */
function ActivationRequirementsPanel({
  activated,
  requirements,
  isLoading,
}: {
  activated: boolean;
  requirements: {
    constitutionRatifiedByAll: boolean;
    outstanding: string[];
    hasConfirmedConstitution: boolean;
    required: bigint;
    accepted: bigint;
    planRatified: boolean;
  } | null;
  isLoading: boolean;
}) {
  if (activated) {
    return (
      <section
        data-ocid="os.governance.activation_requirements"
        aria-label="Activation requirements"
        className="shell-panel flex items-start gap-3 p-4 md:p-5"
      >
        <CheckCircle2
          className="mt-0.5 size-5 shrink-0 text-success"
          aria-hidden="true"
        />
        <div className="min-w-0 space-y-1">
          <p className="font-display text-base font-medium text-foreground">
            Your Nation is Active
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Every activation requirement is met. Your constitution is in force.
          </p>
        </div>
      </section>
    );
  }

  const accepted = Number(requirements?.accepted ?? 0n);
  const required = Number(requirements?.required ?? 3n);
  const outstanding = requirements?.outstanding ?? [];

  return (
    <section
      data-ocid="os.governance.activation_requirements"
      aria-label="Activation requirements"
      className="shell-panel min-w-0 space-y-3 p-4 md:p-5"
    >
      <div className="space-y-1">
        <p className="text-stamp text-accent">Before you go live</p>
        <h3 className="font-display text-lg font-medium tracking-tight text-foreground">
          What is still needed
        </h3>
      </div>

      {isLoading ? (
        <div
          data-ocid="os.governance.activation_requirements.loading_state"
          className="space-y-2"
          aria-busy="true"
        >
          {Array.from({ length: 3 }, (_, i) => `req-skeleton-${i}`).map(
            (id) => (
              <div
                key={id}
                className="h-10 animate-pulse rounded-lg bg-muted/40"
              />
            ),
          )}
        </div>
      ) : (
        <ul className="space-y-2">
          <RequirementRow
            index={1}
            done={accepted >= required}
            label={`Three distinct founding authorities accept (${accepted}/${required})`}
          />
          <RequirementRow
            index={2}
            done={requirements?.hasConfirmedConstitution ?? false}
            label="A constitution is confirmed"
          />
          <RequirementRow
            index={3}
            done={requirements?.constitutionRatifiedByAll ?? false}
            label="Every founding authority ratifies the same constitution version"
          />
          <RequirementRow
            index={4}
            done={requirements?.planRatified ?? false}
            label="The succession and recovery plan is ratified"
          />
        </ul>
      )}

      {outstanding.length > 0 ? (
        <p className="text-xs leading-relaxed text-muted-foreground">
          {outstanding.join(" · ")}
        </p>
      ) : null}
    </section>
  );
}

/** One activation requirement with a done or pending marker. */
function RequirementRow({
  index,
  done,
  label,
}: {
  index: number;
  done: boolean;
  label: string;
}) {
  return (
    <li
      data-ocid={`os.governance.activation_requirements.item.${index}`}
      className="flex items-start gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5"
    >
      <span
        aria-hidden="true"
        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${
          done
            ? "bg-success text-success-foreground"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {done ? <Check className="size-3" /> : <Clock className="size-3" />}
      </span>
      <span
        className={`min-w-0 text-sm leading-relaxed ${
          done ? "text-muted-foreground line-through" : "text-foreground"
        }`}
      >
        {label}
      </span>
    </li>
  );
}

/** The Decisions section: the existing proposal list, detail and vote flow. */
function DecisionsSection({
  isLoading,
  isError,
  onRetry,
  proposals,
  selected,
  nationId,
  readOnly,
  onSelect,
  onVote,
  isVoting,
  voteError,
  recordedChoice,
  eligibility,
  isEligibilityLoading,
}: {
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  proposals: NationProposal[];
  selected: NationProposal | null;
  nationId: bigint;
  readOnly: boolean;
  onSelect: (id: bigint) => void;
  onVote: (choice: VoteChoice) => void;
  isVoting: boolean;
  voteError: string | null;
  recordedChoice: VoteChoice | null;
  eligibility: VotingEligibility | null;
  isEligibilityLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div
        data-ocid="os.governance.loading_state"
        className="space-y-3"
        aria-busy="true"
      >
        {Array.from({ length: 3 }, (_, i) => `skeleton-${i}`).map((id) => (
          <div
            key={id}
            className="shell-panel h-28 animate-pulse bg-muted/40"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div
        data-ocid="os.governance.error_state"
        role="alert"
        className="shell-panel space-y-3 p-5"
      >
        <p className="font-display text-base font-medium text-foreground">
          The proposals could not be loaded.
        </p>
        <p className="text-sm text-muted-foreground">
          Check your connection and try again.
        </p>
        <button
          type="button"
          data-ocid="os.governance.retry_button"
          onClick={onRetry}
          className="os-focus-ring inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-smooth hover:opacity-90"
        >
          Try again
        </button>
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <div
        data-ocid="os.governance.empty_state"
        className="shell-panel space-y-2 p-5"
      >
        <p className="font-display text-base font-medium text-foreground">
          No proposals yet
        </p>
        <p className="text-sm text-muted-foreground">
          This sample Nation has no proposals to show right now.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <VotingEligibilityNotice
        eligibility={eligibility}
        isLoading={isEligibilityLoading}
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section aria-label="Proposals" className="min-w-0">
          <ProposalList
            proposals={proposals}
            selectedId={selected?.id ?? null}
            onSelect={onSelect}
          />
        </section>

        {selected ? (
          <section aria-label="Proposal detail" className="min-w-0">
            <ProposalDetail
              proposal={selected}
              nation={nationId}
              readOnly={readOnly}
              onVote={onVote}
              isVoting={isVoting}
              voteError={voteError}
              recordedChoice={recordedChoice}
            />
          </section>
        ) : null}
      </div>
    </div>
  );
}

/**
 * The Amendments view: propose a change to the rules, compare it side by side
 * with the rules in force, discuss it, and read the ratified version history.
 * The backend enforces who may propose and ratify.
 */
function AmendmentsSection({
  nationId,
  readOnly,
}: {
  nationId: bigint;
  readOnly: boolean;
}) {
  const amendmentsQuery = useAmendmentProposals(nationId);
  const versionsQuery = useConstitutionVersions(nationId);
  const ruleSetQuery = useActiveRuleSet(nationId);

  const amendments = useMemo(
    () => amendmentsQuery.data ?? [],
    [amendmentsQuery.data],
  );

  // The most recent amendment that is still open, so its comparison and
  // discussion are shown without an extra click.
  const activeAmendment = useMemo<AmendmentProposal | null>(() => {
    const open = amendments.filter(
      (a) =>
        a.status === AmendmentProposalStatus.discussion ||
        a.status === AmendmentProposalStatus.voting,
    );
    return open[0] ?? amendments[0] ?? null;
  }, [amendments]);

  return (
    <div className="space-y-6">
      <AmendmentComposer />

      {activeAmendment ? (
        <div className="space-y-6">
          <AmendmentComparison
            changes={activeAmendment.changes}
            currentRules={ruleSetQuery.data ?? null}
          />
          <AmendmentDiscussion
            thread={activeAmendment.discussionThread ?? null}
            readOnly={readOnly}
          />
        </div>
      ) : null}

      <section aria-label="Constitution version history" className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-display text-lg font-medium tracking-tight text-foreground">
            Version history
          </h3>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Every ratified version of the rules, newest first. A change only
            takes effect after ratification, and the previous version stays in
            history.
          </p>
        </div>
        <ConstitutionVersionHistory
          versions={versionsQuery.data ?? []}
          isLoading={versionsQuery.isLoading}
          isError={versionsQuery.isError}
          onRetry={() => void versionsQuery.refetch()}
        />
      </section>
    </div>
  );
}

/**
 * The Departures view: a member leaving, retiring or being suspended, plus the
 * involuntary-removal review with its notice, review and appeal steps. The
 * backend enforces who may act and when a removal becomes final.
 */
function DeparturesSection() {
  return (
    <div className="space-y-6">
      <DeparturePanel />
      <RemovalReviewPanel />
    </div>
  );
}

/** A clearly-labelled placeholder for a section body a later task fills in. */
function SectionPlaceholder({ section }: { section: GovernanceSectionKey }) {
  const entry = governanceSections.find((s) => s.key === section);
  return (
    <div
      data-ocid={`os.governance.section_placeholder.${section}`}
      className="shell-panel space-y-2 p-5"
    >
      <p className="font-display text-base font-medium text-foreground">
        {entry?.label ?? "This section"}
      </p>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {entry?.description ?? "This part of Governance is being prepared."}
      </p>
    </div>
  );
}

/**
 * A clearly-labelled placeholder for a governance view whose detailed body is
 * built by a later task. The Control Center view links to its own route.
 */
function ViewPlaceholder({ view }: { view: GovernanceViewKey }) {
  const entry = governanceViews.find((v) => v.key === view);
  return (
    <div
      data-ocid={`os.governance.view_placeholder.${view}`}
      className="shell-panel space-y-3 p-5"
    >
      <div className="space-y-1">
        <p className="font-display text-base font-medium text-foreground">
          {entry?.label ?? "This view"}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {entry?.description ?? "This part of Governance is being prepared."}
        </p>
      </div>
      {view === "control-center" ? (
        <Link
          to="/os/governance/control-center"
          data-ocid="os.governance.view_placeholder.control_center_link"
          className="os-focus-ring inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-smooth hover:opacity-90"
        >
          Open the Control Center
        </Link>
      ) : null}
    </div>
  );
}
