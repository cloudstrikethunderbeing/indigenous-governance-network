import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useEffect, useMemo } from "react";

import OsAppPage from "@/components/os/OsAppPage";
import { useActiveNation } from "@/components/os/attachments/useActiveNation";
import GovernanceHistoryPanel from "@/components/os/governance/activity/GovernanceHistoryPanel";
import AuthorityPositionsPanel from "@/components/os/governance/control/AuthorityPositionsPanel";
import ControlCenterOverview from "@/components/os/governance/control/ControlCenterOverview";
import EmergencyPanel from "@/components/os/governance/control/EmergencyPanel";
import LifecyclePanel from "@/components/os/governance/control/LifecyclePanel";
import SuccessionPlanPanel from "@/components/os/governance/control/SuccessionPlanPanel";
import MembersSection from "@/components/os/governance/members/MembersSection";
import { useNationMembers } from "@/components/os/governance/members/useGovernanceMembers";
import DeparturePanel from "@/components/os/governance/membership/DeparturePanel";
import RemovalReviewPanel from "@/components/os/governance/membership/RemovalReviewPanel";
import { useGovernanceHistory } from "@/hooks/useGovernanceActivity";
import {
  useAmendmentProposals,
  useAuthorityPositions,
  useConstitutionVersions,
  useEmergencySuspensions,
  useNationLifecycle,
  useSuccessionPlan,
} from "@/hooks/useGovernanceLifecycle";
import {
  useActiveConstitution,
  useEnsureSampleWorkspace,
} from "@/hooks/useSovereign";

/**
 * The Governance Control Center: the Nation's lifecycle state, its constitution
 * and amendments, its authorities, the succession and recovery plan, and the
 * emergency procedures — all in one place, each sensitive action behind an
 * explicit confirmation step.
 */
export default function GovernanceControlCenterPage() {
  const { nationId } = useActiveNation();
  const ensureWorkspace = useEnsureSampleWorkspace();

  const lifecycle = useNationLifecycle(nationId);
  const constitution = useActiveConstitution(nationId);
  const versions = useConstitutionVersions(nationId);
  const amendments = useAmendmentProposals(nationId);
  const positions = useAuthorityPositions(nationId);
  const succession = useSuccessionPlan(nationId);
  const suspensions = useEmergencySuspensions(nationId);
  const history = useGovernanceHistory(nationId);
  const members = useNationMembers(nationId);

  const state = lifecycle.data?.state ?? null;

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

  // Seed the sample Nation workspace once so a visitor always has data.
  const { mutate: ensure } = ensureWorkspace;
  useEffect(() => {
    ensure();
  }, [ensure]);

  return (
    <OsAppPage appKey="governance-control-center">
      <div className="space-y-6">
        <header className="space-y-2">
          <p className="text-stamp text-accent">Governance</p>
          <h2 className="font-display text-2xl font-medium tracking-tight text-foreground">
            Control Center
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            The Nation's state, its constitution and authorities, its succession
            plan, and the emergency procedures that keep it safe.
          </p>
          <div className="rule-accent" />
        </header>

        <ControlCenterOverview
          state={state}
          constitution={constitution.data ?? null}
          versions={versions.data ?? []}
          amendments={amendments.data ?? []}
          isLoading={lifecycle.isLoading}
        />

        <AuthorityPositionsPanel
          nation={nationId}
          positions={positions.data ?? []}
          isLoading={positions.isLoading}
          isError={positions.isError}
          onRetry={() => void positions.refetch()}
        />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <SuccessionPlanPanel
            nation={nationId}
            plan={succession.data ?? null}
            isLoading={succession.isLoading}
            isError={succession.isError}
            onRetry={() => void succession.refetch()}
          />
          <LifecyclePanel state={state} isLoading={lifecycle.isLoading} />
        </div>

        <EmergencyPanel
          nation={nationId}
          suspensions={suspensions.data ?? []}
          isLoading={suspensions.isLoading}
          isError={suspensions.isError}
          onRetry={() => void suspensions.refetch()}
        />

        <section
          aria-label="Membership"
          data-ocid="os.governance.control_center.membership"
          className="space-y-4"
        >
          <div className="space-y-1">
            <h3 className="font-display text-lg font-medium tracking-tight text-foreground">
              Membership
            </h3>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Who belongs to the Nation, what each person may do, and the
              requests waiting for a decision.
            </p>
          </div>
          <MembersSection />
        </section>

        <section
          aria-label="Appointments and departures"
          data-ocid="os.governance.control_center.departures"
          className="space-y-4"
        >
          <div className="space-y-1">
            <h3 className="font-display text-lg font-medium tracking-tight text-foreground">
              Appointments and departures
            </h3>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Leaving, retiring, suspension and constitutional removal, each
              with its notice, review and appeal path.
            </p>
          </div>
          <DeparturePanel />
          <RemovalReviewPanel />
        </section>

        <section
          aria-label="Governance history"
          data-ocid="os.governance.control_center.history"
          className="space-y-4"
        >
          <div className="space-y-1">
            <h3 className="font-display text-lg font-medium tracking-tight text-foreground">
              Governance history
            </h3>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Every appointment, acceptance, approval, rejection, vote and rule
              change, recorded for good.
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

        <Link
          to="/os/governance"
          data-ocid="os.governance.control_center.back_link"
          className="os-focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-smooth hover:opacity-90"
        >
          Back to Governance
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </OsAppPage>
  );
}
