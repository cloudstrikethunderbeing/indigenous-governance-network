import { BookOpen, FileSignature, ShieldCheck } from "lucide-react";

import type {
  AmendmentProposal,
  Constitution,
  ConstitutionVersion,
} from "@/backend";
import type { NationLifecycleState } from "@/backend";
import {
  LifecycleStatusBadge,
  lifecycleExplanation,
} from "@/components/os/governance/NationStatusBadge";
import { formatDate } from "@/components/os/governance/activity/activityLabels";
import {
  formatRuleValue,
  ruleExplanations,
} from "@/components/os/governance/rules/ruleExplanations";

/** The rules a reader should see first, in plain language. */
const KEY_RULES = [
  "approvalThresholdPercent",
  "quorumPercent",
  "amendmentProcedure",
  "dissolutionProcedure",
] as const;

const AMENDMENT_STATUS_LABEL: Record<AmendmentProposal["status"], string> = {
  ratified: "Ratified",
  voting: "Voting open",
  rejected: "Rejected",
  discussion: "In discussion",
  withdrawn: "Withdrawn",
};

/**
 * The top of the Control Center: the Nation's current state with its plain
 * explanation, the constitution in force, and the amendments that have been
 * proposed against it. Read-only — every change happens in the panels below.
 */
export default function ControlCenterOverview({
  state,
  constitution,
  versions,
  amendments,
  isLoading,
}: {
  state: NationLifecycleState | null;
  constitution: Constitution | null;
  versions: ConstitutionVersion[];
  amendments: AmendmentProposal[];
  isLoading: boolean;
}) {
  const latestVersion =
    versions.length > 0 ? versions[versions.length - 1] : null;
  const openAmendments = amendments.filter(
    (a) => a.status === "voting" || a.status === "discussion",
  );

  return (
    <div className="space-y-5">
      <section
        data-ocid="os.governance.control_center.state_panel"
        className="shell-panel space-y-3 p-5"
      >
        <div className="flex items-start gap-3">
          <span className="os-icon-glyph size-10 shrink-0" aria-hidden="true">
            <ShieldCheck className="size-5" />
          </span>
          <div className="min-w-0 space-y-1">
            <p className="text-stamp text-accent">Current state</p>
            {isLoading ? (
              <p
                data-ocid="os.governance.control_center.loading_state"
                aria-busy="true"
                className="text-sm text-muted-foreground"
              >
                Reading the Nation's state…
              </p>
            ) : state ? (
              <LifecycleStatusBadge state={state} showExplanation />
            ) : (
              <p
                data-ocid="os.governance.control_center.empty_state"
                className="text-sm leading-relaxed text-muted-foreground"
              >
                The Nation's state could not be read right now.
              </p>
            )}
          </div>
        </div>
        {state ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {lifecycleExplanation(state)}
          </p>
        ) : null}
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section
          data-ocid="os.governance.control_center.constitution_panel"
          className="shell-panel space-y-3 p-5"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 text-accent" aria-hidden="true" />
            <h3 className="font-display text-base font-medium text-foreground">
              Constitution in force
            </h3>
          </div>
          {constitution ? (
            <>
              <p className="text-sm text-muted-foreground">
                Version {constitution.version.toString()} · confirmed{" "}
                {formatDate(constitution.timestamp)}
              </p>
              <dl className="space-y-2">
                {KEY_RULES.map((field) => (
                  <div key={field} className="flex flex-col gap-0.5">
                    <dt className="text-stamp text-muted-foreground">
                      {ruleExplanations[field].label}
                    </dt>
                    <dd className="text-sm leading-relaxed text-foreground">
                      {formatRuleValue(field, constitution.rules)}
                    </dd>
                  </div>
                ))}
              </dl>
              {latestVersion ? (
                <p className="text-xs text-muted-foreground">
                  Latest ratified version: {latestVersion.version.toString()} ·{" "}
                  {formatDate(latestVersion.timestamp)}
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground">
              No constitution has been confirmed for this Nation yet.
            </p>
          )}
        </section>

        <section
          data-ocid="os.governance.control_center.amendments_panel"
          className="shell-panel space-y-3 p-5"
        >
          <div className="flex items-center gap-2">
            <FileSignature className="size-4 text-accent" aria-hidden="true" />
            <h3 className="font-display text-base font-medium text-foreground">
              Amendments
            </h3>
          </div>
          {amendments.length === 0 ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              No amendments have been proposed. The constitution stands as
              written.
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {openAmendments.length} open · {amendments.length} total
              </p>
              <ul className="space-y-2">
                {amendments.slice(0, 4).map((amendment) => (
                  <li
                    key={amendment.id.toString()}
                    data-ocid="os.governance.control_center.amendment_item"
                    className="flex items-start justify-between gap-3 border-t border-border pt-2 first:border-t-0 first:pt-0"
                  >
                    <span className="min-w-0 text-sm leading-snug text-foreground">
                      {amendment.title}
                    </span>
                    <span className="text-stamp shrink-0 text-muted-foreground">
                      {AMENDMENT_STATUS_LABEL[amendment.status]}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
