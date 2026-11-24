import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  type FoundingSeatSummary,
  FoundingSetupStatus,
  GovernanceError,
  type GovernanceRuleSet,
  type LaunchStatus,
  type NationId,
  type NationLauncherConfig,
  NationLifecycleState,
  SovereignError,
  WorkspaceAppStatus,
} from "@/backend";
import OsAppPage from "@/components/os/OsAppPage";
import GovernanceProgress from "@/components/os/governance/GovernanceProgress";
import type { GovernanceViewKey } from "@/components/os/governance/governanceSections";
import FoundingCouncilPanel from "@/components/os/launcher/FoundingCouncilPanel";
import LaunchReveal from "@/components/os/launcher/LaunchReveal";
import LauncherSignedOutNotice from "@/components/os/launcher/LauncherSignedOutNotice";
import LauncherStepApps from "@/components/os/launcher/LauncherStepApps";
import LauncherStepConstitution from "@/components/os/launcher/LauncherStepConstitution";
import LauncherStepGovernance from "@/components/os/launcher/LauncherStepGovernance";
import LauncherStepIdentity from "@/components/os/launcher/LauncherStepIdentity";
import LauncherStepMembership from "@/components/os/launcher/LauncherStepMembership";
import LauncherStepRail from "@/components/os/launcher/LauncherStepRail";
import LauncherStepReview from "@/components/os/launcher/LauncherStepReview";
import {
  type LauncherDraft,
  constitutionQuestions,
  initialLauncherDraft,
  launcherSteps,
  selectableApps,
  toMembershipVotingConfig,
  toNationTheme,
} from "@/components/os/launcher/launcherTypes";
import {
  useBeginFoundingSetup,
  useConfirmFoundingSeat,
  useCreateNationFromLauncher,
  useDefaultRuleSet,
  useGovernanceModelOptions,
  useLaunchStatus,
  useMyNations,
  useResumeLaunch,
  useSaveConstitution,
  useValidateGovernanceRuleSet,
} from "@/hooks/useSovereign";

/** A plain-language message for a launch error returned by the canister. */
function launchErrorMessage(error: SovereignError): string {
  switch (error) {
    case SovereignError.missingName:
      return "Please give your Nation a name before launching.";
    case SovereignError.missingGovernanceModel:
      return "Please choose a governance structure before launching.";
    case SovereignError.missingApps:
      return "Please select at least one application before launching.";
    case SovereignError.invalidTheme:
      return "The selected theme is not valid. Please choose another.";
    case SovereignError.notAuthorized:
      return "You are not authorized to launch a Nation. Please sign in again.";
    default:
      return "Your Nation could not be launched. Please try again.";
  }
}

/**
 * A plain-language message for a rule set the canister rejected. The message
 * never uses governance jargon; it says what needs to change in ordinary words.
 */
function ruleSetErrorMessage(error: GovernanceError): string {
  switch (error) {
    case GovernanceError.invalidThreshold:
      return "One of your choices needs a different amount. Please pick another answer.";
    case GovernanceError.invalidRuleSet:
      return "Some of your rules need a small change before they can be saved. Please review your answers.";
    case GovernanceError.missingTitle:
      return "Your rules need a name before they can be saved.";
    case GovernanceError.notAuthorized:
      return "You are not authorized to save these rules. Please sign in again.";
    case GovernanceError.notNationMember:
      return "Only a member of this Nation can save its rules.";
    default:
      return "Your rules could not be saved. Please review your answers and try again.";
  }
}

/** The default plain-language answer for each constitution question. */
function defaultConstitutionAnswers(): Record<string, string> {
  const answers: Record<string, string> = {};
  for (const question of constitutionQuestions) {
    answers[question.key] = question.options[0].key;
  }
  return answers;
}

/** A launch step that stopped, with what was saved before it. */
interface LaunchFailure {
  nation: NationId;
  nationName: string;
  /** The step that stopped, in plain words. */
  step: string;
  /** What was already saved before the step that stopped. */
  saved: string[];
  /** A plain-language reason the step stopped. */
  reason: string;
  /** Whether the creator can resume this same Nation. */
  canResume: boolean;
}

/** The plain-language name of the step a launch stopped at. */
function stoppedStepLabel(status: LaunchStatus): string {
  if (!status.constitutionSaved) return "Saving your rules";
  const callerSeat = status.callerSeats[0];
  if (!callerSeat) return "Recording your founding seat";
  return "Confirming your founding seat";
}

/** What a launch had already saved, in plain words. */
function savedStepsLabel(status: LaunchStatus): string[] {
  const saved: string[] = ["Your Nation was created"];
  if (status.setupStatus === FoundingSetupStatus.foundingSetup) {
    saved.push("Founding setup started");
  }
  if (status.callerSeats.length > 0) {
    saved.push("Your founding seat was recorded");
  }
  if (status.constitutionSaved) {
    saved.push("Your rules were saved");
  }
  return saved;
}

/**
 * A plain-language reason a launch stopped, from the canister's launch status.
 * Expired and cancelled setups are reported with what the creator can do next
 * instead of a generic retry message.
 */
function stoppedReason(status: LaunchStatus): string {
  if (status.setupStatus === FoundingSetupStatus.expired) {
    return "Your founding setup window has expired. You can start a new launch to set up this Nation again.";
  }
  if (status.setupStatus === FoundingSetupStatus.cancelled) {
    return "This Nation's founding setup was cancelled. You can start a new launch to set it up again.";
  }
  if (status.blockedReason.trim().length > 0) return status.blockedReason;
  return "One step did not finish. You can resume from where it stopped.";
}

/** A plain-language reason a resume could not continue. */
function resumeErrorMessage(error: GovernanceError): string {
  switch (error) {
    case GovernanceError.setupExpiredRecoverable:
      return "Your founding setup window has expired. Start a new launch to set up this Nation again.";
    case GovernanceError.setupCancelledRecoverable:
      return "This Nation's founding setup was cancelled. Start a new launch to set it up again.";
    case GovernanceError.notInFoundingSetup:
      return "This Nation is no longer in founding setup, so there is nothing left to resume.";
    case GovernanceError.notAuthorized:
      return "You are not authorized to resume this launch. Please sign in again.";
    default:
      return "This launch could not be resumed. Please try again.";
  }
}

/** The caller's own founding seat, if the canister reports one. */
function callerSeat(status: LaunchStatus): FoundingSeatSummary | null {
  return status.callerSeats[0] ?? null;
}

/**
 * The Nation OS launcher. A signed-in user names their Nation, picks an example
 * template and governance structure, configures membership and voting, selects
 * apps and a theme, builds the organization's constitution from a few simple
 * questions, then reviews, confirms the governance rules and launches.
 *
 * Launching creates the Nation, begins its founding setup, confirms the
 * creator's own Founding Authority #1 seat in place (never appointing them into
 * a seat they already hold) and saves the confirmed constitution. The Nation
 * then lands in Pending Activation with 1/3 founding progress — it is never
 * reported as active, because activation needs three distinct authorities. If
 * the creator already has a Nation, that same Nation is resumed instead of
 * creating a duplicate, and a failed step keeps the Nation with a Resume action.
 */
export default function LaunchNationPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const signedIn = !!identity && !identity.getPrincipal().isAnonymous();
  const callerPrincipal = identity?.getPrincipal() ?? null;

  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<LauncherDraft>(initialLauncherDraft);
  const [answers, setAnswers] = useState<Record<string, string>>(
    defaultConstitutionAnswers,
  );
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [constitutionError, setConstitutionError] = useState<string | null>(
    null,
  );
  const [constitutionSaved, setConstitutionSaved] = useState(false);
  const [launchedNation, setLaunchedNation] = useState<NationId | null>(null);
  const [launchedName, setLaunchedName] = useState("");
  const [launchedTemplate, setLaunchedTemplate] = useState(
    initialLauncherDraft.constitutionTemplateKey,
  );
  const [resumed, setResumed] = useState(false);
  const [failure, setFailure] = useState<LaunchFailure | null>(null);

  const governance = useGovernanceModelOptions();
  const defaultRuleSet = useDefaultRuleSet(draft.templateKey);
  const myNations = useMyNations();
  const createNation = useCreateNationFromLauncher();
  const saveConstitution = useSaveConstitution();
  const validateRuleSet = useValidateGovernanceRuleSet();
  const beginFounding = useBeginFoundingSetup();
  const confirmSeat = useConfirmFoundingSeat();
  const resumeLaunch = useResumeLaunch();
  const failureStatus = useLaunchStatus(failure?.nation ?? null);

  const governanceOptions = governance.data ?? [];
  const defaultGovernanceModelKey = governanceOptions[0]?.modelKey ?? "";

  /**
   * Pre-select a sensible default governance structure once the canister
   * reports the available models, so a first-time user can continue without
   * configuring anything. The user can still change it on step two.
   */
  useEffect(() => {
    if (defaultGovernanceModelKey.length === 0) return;
    setDraft((current) =>
      current.governanceModelKey.length > 0
        ? current
        : { ...current, governanceModelKey: defaultGovernanceModelKey },
    );
  }, [defaultGovernanceModelKey]);

  function patchDraft(patch: Partial<LauncherDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function answerQuestion(questionKey: string, answerKey: string) {
    setAnswers((current) => ({ ...current, [questionKey]: answerKey }));
    setConstitutionError(null);
    setConstitutionSaved(false);
  }

  const nameValid = draft.name.trim().length > 0;
  const governanceValid = draft.governanceModelKey.length > 0;
  const appsValid = draft.selectedAppKeys.length > 0;
  const constitutionValid = constitutionQuestions.every(
    (question) => (answers[question.key] ?? "").length > 0,
  );

  /** Whether the current step's required choices are complete. */
  function canAdvance(): boolean {
    if (step === 1) return nameValid;
    if (step === 2) return governanceValid;
    if (step === 4) return appsValid;
    if (step === 5) return constitutionValid && constitutionSaved;
    return true;
  }

  function goNext() {
    if (!canAdvance()) return;
    setStep((current) => Math.min(current + 1, launcherSteps.length));
  }

  function goBack() {
    setStep((current) => Math.max(current - 1, 1));
  }

  /** The governance views the launcher's choices already set up. */
  function completedGovernanceViews(): GovernanceViewKey[] {
    const views: GovernanceViewKey[] = ["constitutional", "membership"];
    if (draft.votingModel.length > 0) views.push("voting");
    if (draft.rulesConfirmed) views.push("proposals");
    return views;
  }

  /**
   * The rules the Constitution Builder's answers produce. The canister's
   * default rule set for the chosen template supplies every advanced field; the
   * builder's plain-language answers override the few the user actually chose.
   */
  const constitutionRules = useMemo<GovernanceRuleSet | null>(() => {
    const base = defaultRuleSet.data;
    if (!base) return null;
    const decisionStyle = answers.decisionStyle ?? "";
    const whoJoins = answers.whoJoins ?? "";
    const discussionTime = answers.discussionTime ?? "";
    const approvalThresholdPercent =
      decisionStyle === "supermajority"
        ? 75n
        : decisionStyle === "consensus"
          ? 90n
          : 60n;
    const discussionDays =
      discussionTime === "oneDay" ? 1n : discussionTime === "oneWeek" ? 7n : 3n;
    const membershipEligibility =
      whoJoins === "open"
        ? "Anyone in the community may join."
        : whoJoins === "requestApproval"
          ? "People request to join and an administrator approves each request."
          : "Members join only when an administrator invites them.";
    return {
      ...base,
      approvalThresholdPercent,
      proposalDiscussionPeriodDays: discussionDays,
      membershipEligibility,
    };
  }, [defaultRuleSet.data, answers]);

  /**
   * Validate the chosen rules before they are saved. A rejected rule set is
   * reported in plain language and nothing is marked ready. The rules are
   * actually saved, and the founding setup begun, when the Nation is launched
   * on the final step.
   */
  function saveConstitutionRules() {
    setConstitutionError(null);
    const rules = constitutionRules;
    if (!rules) {
      setConstitutionError(
        "Your rules are still loading. Please wait a moment and try again.",
      );
      return;
    }
    validateRuleSet.mutate(rules, {
      onSuccess: (error) => {
        if (error) {
          setConstitutionError(ruleSetErrorMessage(error));
          return;
        }
        setConstitutionSaved(true);
        patchDraft({ constitutionConfirmed: true });
      },
      onError: () => {
        setConstitutionError(
          "Your rules could not be checked. Please check your connection and try again.",
        );
      },
    });
  }

  const isSavingConstitution = validateRuleSet.isPending;

  /** Record a stopped launch, keeping the Nation and what was saved. */
  function recordFailure(
    nation: NationId,
    nationName: string,
    stoppedStep: string,
    saved: string[],
    reason: string,
    canResume: boolean,
  ) {
    setFailure({
      nation,
      nationName,
      step: stoppedStep,
      saved,
      reason,
      canResume,
    });
    setLaunchError(null);
  }

  /**
   * Launch the Nation. The canister only accepts a constitution while the
   * Nation is in Founding Setup, so the launch runs in the order the backend
   * requires: create the Nation, begin its founding setup, confirm the
   * creator's own Founding Authority #1 seat in place, then save the confirmed
   * rules.
   *
   * The Nation is then left in Pending Activation with 1/3 founding progress.
   * Activation is never attempted here: it needs three distinct authorities to
   * accept, so calling it now would only produce a false failure. A Nation the
   * creator already has is resumed, not duplicated, and a failed step keeps the
   * Nation with a Resume action instead of a generic retry.
   */
  async function launch() {
    setLaunchError(null);
    setFailure(null);
    const config: NationLauncherConfig = {
      name: draft.name.trim(),
      shortDescription: draft.shortDescription.trim(),
      region: draft.region.trim(),
      governanceModelKey: draft.governanceModelKey,
      membershipVoting: toMembershipVotingConfig(draft),
      selectedApps: selectableApps
        .filter((app) => draft.selectedAppKeys.includes(app.appKey))
        .map((app) => ({
          appKey: app.appKey,
          displayName: app.displayName,
          oneLineDescription: app.oneLineDescription,
          status:
            app.status === "preview"
              ? WorkspaceAppStatus.preview
              : WorkspaceAppStatus.working,
          iconKey: app.iconKey,
        })),
      theme: toNationTheme(draft),
    };

    const rules = constitutionRules ?? defaultRuleSet.data;
    if (!rules) {
      setLaunchError(
        "Your rules are still loading. Please wait a moment and try again.",
      );
      return;
    }

    if (!callerPrincipal) {
      setLaunchError(
        "Your founding authority could not be recorded. Please sign in again.",
      );
      return;
    }

    try {
      // Recover a partially created Nation: if the creator already has one,
      // resume it rather than creating a duplicate.
      const existing = myNations.data?.[0];
      let nation: NationId;
      let isResumed = false;
      let nationName = config.name;

      if (existing) {
        nation = existing.id;
        nationName = existing.name;
        isResumed = true;
        const begun = await beginFounding.mutateAsync(nation);
        if (begun.__kind__ !== "ok") {
          recordFailure(
            nation,
            nationName,
            "Starting the founding setup",
            ["Your Nation was found"],
            "Your existing Nation could not resume its founding setup. You can resume this launch to try again.",
            true,
          );
          return;
        }
      } else {
        const created = await createNation.mutateAsync(config);
        if (created.__kind__ !== "ok") {
          setLaunchError(launchErrorMessage(created.err));
          return;
        }
        nation = created.ok;

        const begun = await beginFounding.mutateAsync(nation);
        if (begun.__kind__ !== "ok") {
          recordFailure(
            nation,
            nationName,
            "Starting the founding setup",
            ["Your Nation was created"],
            "Your Nation was created, but its founding setup could not start. You can resume this launch to try again.",
            true,
          );
          return;
        }
      }

      // Confirm the creator's own Founding Authority #1 seat in place. The
      // canister accepts a pending seat the caller already holds and is a no-op
      // when it is already accepted, so the creator is never appointed into a
      // seat they already hold.
      const status = await resumeLaunch.mutateAsync(nation);
      if (status.__kind__ !== "ok") {
        recordFailure(
          nation,
          nationName,
          "Reading your founding seat",
          ["Your Nation was created", "Founding setup started"],
          resumeErrorMessage(status.err),
          status.err !== GovernanceError.setupExpiredRecoverable &&
            status.err !== GovernanceError.setupCancelledRecoverable,
        );
        return;
      }

      const seat = callerSeat(status.ok);
      if (!seat) {
        recordFailure(
          nation,
          nationName,
          "Recording your founding seat",
          ["Your Nation was created", "Founding setup started"],
          "Your founding seat could not be found. You can resume this launch to try again.",
          true,
        );
        return;
      }

      const confirmed = await confirmSeat.mutateAsync({
        nation,
        appointment: seat.appointmentId,
      });
      if (confirmed.__kind__ !== "ok") {
        recordFailure(
          nation,
          nationName,
          "Confirming your founding seat",
          ["Your Nation was created", "Founding setup started"],
          "Your founding seat could not be confirmed. You can resume this launch to try again.",
          true,
        );
        return;
      }

      const saved = await saveConstitution.mutateAsync({
        nation,
        templateKey: draft.constitutionTemplateKey,
        rules,
      });
      if (saved.__kind__ !== "ok") {
        recordFailure(
          nation,
          nationName,
          "Saving your rules",
          [
            "Your Nation was created",
            "Founding setup started",
            "Your founding seat was confirmed",
          ],
          ruleSetErrorMessage(saved.err),
          true,
        );
        return;
      }

      setLaunchedName(nationName);
      setLaunchedTemplate(draft.constitutionTemplateKey);
      setResumed(isResumed);
      setLaunchedNation(nation);
    } catch {
      setLaunchError(
        "Your Nation could not be launched. Please check your connection and try again.",
      );
    }
  }

  /**
   * Resume a launch that stopped. The canister reports the current launch
   * status and never re-runs a step that is already saved; the page then
   * continues from the step that stopped.
   */
  async function resume() {
    if (!failure) return;
    setLaunchError(null);
    const result = await resumeLaunch.mutateAsync(failure.nation);
    if (result.__kind__ !== "ok") {
      setFailure({
        ...failure,
        reason: resumeErrorMessage(result.err),
        canResume:
          result.err !== GovernanceError.setupExpiredRecoverable &&
          result.err !== GovernanceError.setupCancelledRecoverable,
      });
      return;
    }
    const status = result.ok;
    if (status.lifecycleState === NationLifecycleState.active) {
      setLaunchedName(failure.nationName);
      setLaunchedTemplate(draft.constitutionTemplateKey);
      setResumed(true);
      setLaunchedNation(failure.nation);
      setFailure(null);
      return;
    }
    if (status.constitutionSaved && callerSeat(status)) {
      setLaunchedName(failure.nationName);
      setLaunchedTemplate(draft.constitutionTemplateKey);
      setResumed(true);
      setLaunchedNation(failure.nation);
      setFailure(null);
      return;
    }
    setFailure({
      ...failure,
      step: stoppedStepLabel(status),
      saved: savedStepsLabel(status),
      reason: stoppedReason(status),
      canResume: status.canResume,
    });
  }

  const isLaunching =
    createNation.isPending ||
    beginFounding.isPending ||
    confirmSeat.isPending ||
    resumeLaunch.isPending ||
    saveConstitution.isPending;

  if (launchedNation !== null) {
    return (
      <OsAppPage appKey="launcher">
        <div data-ocid="page.os_launcher" className="min-w-0 space-y-6">
          <div
            data-ocid="os.launcher.success_state"
            className="flex min-w-0 items-start gap-3 rounded-lg border border-success/40 bg-success/10 p-4"
          >
            <CheckCircle2
              className="mt-0.5 size-5 shrink-0 text-success"
              aria-hidden="true"
            />
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {resumed
                  ? `${launchedName} is ready to continue`
                  : `${launchedName} is created`}
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {resumed
                  ? "We found your existing Nation and resumed its founding setup instead of creating a duplicate."
                  : "Your Nation, its constitution and your founding seat are saved. It is pending activation until all three founding authorities accept."}
              </p>
            </div>
          </div>

          <LaunchReveal
            nation={launchedNation}
            nationName={launchedName}
            templateKey={launchedTemplate}
            onInvite={() => {
              document
                .getElementById("founding-council")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            onOpenNation={() => {
              void navigate({ to: "/os/nation" });
            }}
          />

          <div id="founding-council" className="scroll-mt-24">
            <FoundingCouncilPanel
              nation={launchedNation}
              nationName={launchedName}
            />
          </div>
        </div>
      </OsAppPage>
    );
  }

  return (
    <OsAppPage appKey="launcher">
      <div data-ocid="page.os_launcher" className="min-w-0 space-y-6">
        <div className="space-y-2">
          <p className="text-stamp text-accent">Deploy a Nation</p>
          <h2 className="font-display text-2xl font-medium tracking-tight text-foreground md:text-3xl">
            Launch your Nation OS
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Six guided steps to a private, community-controlled workspace for
            your Nation or organization.
          </p>
        </div>

        {!signedIn ? (
          <LauncherSignedOutNotice />
        ) : (
          <div className="min-w-0 space-y-6">
            <div
              data-ocid="os.launcher.identity_notice"
              className="flex min-w-0 items-start gap-3 rounded-lg border border-border bg-muted/40 p-4"
            >
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Signing in with Internet Identity makes this account your
                  Nation&apos;s deployer and Founding Authority #1.
                </p>
                <p className="break-all font-mono text-[11px] text-muted-foreground">
                  Founding Authority #1 holder:{" "}
                  {callerPrincipal ? callerPrincipal.toString() : "—"}
                </p>
              </div>
            </div>

            {failure ? (
              <div
                data-ocid="os.launcher.failure_state"
                className="min-w-0 space-y-3 rounded-lg border border-warning/40 bg-warning/10 p-4"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <AlertTriangle
                    className="mt-0.5 size-5 shrink-0 text-warning"
                    aria-hidden="true"
                  />
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      {failure.nationName} was kept — the launch stopped at:{" "}
                      {failure.step}
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {failure.reason}
                    </p>
                  </div>
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    What was saved
                  </p>
                  <ul className="space-y-1">
                    {failure.saved.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <CheckCircle2
                          className="mt-0.5 size-4 shrink-0 text-success"
                          aria-hidden="true"
                        />
                        <span className="min-w-0">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {failure.canResume ? (
                  <button
                    type="button"
                    data-ocid="os.launcher.resume_button"
                    disabled={resumeLaunch.isPending}
                    onClick={() => {
                      void resume();
                    }}
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60"
                  >
                    <RotateCcw className="size-4" aria-hidden="true" />
                    {resumeLaunch.isPending ? "Resuming…" : "Resume launch"}
                  </button>
                ) : (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    This Nation can no longer be resumed. Start a new launch to
                    set it up again.
                  </p>
                )}
                {failureStatus.data ? (
                  <p className="text-xs text-muted-foreground">
                    {Number(failureStatus.data.acceptedAuthorities)} of{" "}
                    {Number(failureStatus.data.requiredAuthorities)} founding
                    authorities have accepted.
                  </p>
                ) : null}
              </div>
            ) : null}

            <LauncherStepRail currentStep={step} onSelectStep={setStep} />

            <GovernanceProgress
              completed={completedGovernanceViews()}
              compact
            />

            <div className="shell-panel min-w-0 p-4 md:p-6">
              {step === 1 ? (
                <LauncherStepIdentity draft={draft} onChange={patchDraft} />
              ) : null}
              {step === 2 ? (
                <LauncherStepGovernance
                  draft={draft}
                  options={governance.data ?? []}
                  isLoading={governance.isLoading}
                  isError={governance.isError}
                  onChange={patchDraft}
                />
              ) : null}
              {step === 3 ? (
                <LauncherStepMembership draft={draft} onChange={patchDraft} />
              ) : null}
              {step === 4 ? (
                <LauncherStepApps draft={draft} onChange={patchDraft} />
              ) : null}
              {step === 5 ? (
                <LauncherStepConstitution
                  draft={draft}
                  answers={answers}
                  validationMessage={constitutionError}
                  isSaving={isSavingConstitution}
                  saved={constitutionSaved}
                  onChange={patchDraft}
                  onAnswer={answerQuestion}
                  onSave={saveConstitutionRules}
                />
              ) : null}
              {step === 6 ? (
                <LauncherStepReview
                  draft={draft}
                  governanceOptions={governance.data ?? []}
                  isLaunching={isLaunching}
                  launchError={launchError}
                  onLaunch={() => {
                    void launch();
                  }}
                  onConfirmRules={(confirmed) =>
                    patchDraft({ rulesConfirmed: confirmed })
                  }
                />
              ) : null}
            </div>

            <div className="flex min-w-0 flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                data-ocid="os.launcher.back_button"
                disabled={step === 1}
                onClick={goBack}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-smooth hover:border-primary/50 hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                Back
              </button>

              {step < launcherSteps.length ? (
                <button
                  type="button"
                  data-ocid="os.launcher.next_button"
                  disabled={!canAdvance()}
                  onClick={goNext}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
                >
                  Continue
                  <ArrowRight className="size-4" aria-hidden="true" />
                </button>
              ) : null}
            </div>

            {step === 1 && !nameValid ? (
              <p
                data-ocid="os.launcher.name_required_hint"
                className="text-xs text-muted-foreground"
              >
                Enter a name to continue.
              </p>
            ) : null}
            {step === 2 && !governanceValid ? (
              <p
                data-ocid="os.launcher.governance_required_hint"
                className="text-xs text-muted-foreground"
              >
                Choose a governance structure to continue.
              </p>
            ) : null}
            {step === 4 && !appsValid ? (
              <p
                data-ocid="os.launcher.apps_required_hint"
                className="text-xs text-muted-foreground"
              >
                Select at least one application to continue.
              </p>
            ) : null}
            {step === 5 && !constitutionSaved ? (
              <p
                data-ocid="os.launcher.constitution_required_hint"
                className="text-xs text-muted-foreground"
              >
                Save your rules to continue.
              </p>
            ) : null}
          </div>
        )}
      </div>
    </OsAppPage>
  );
}
