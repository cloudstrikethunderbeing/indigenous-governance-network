import { useMemo } from "react";

import { useActiveNation } from "@/components/os/attachments/useActiveNation";
import ActivityTimeline from "@/components/os/governance/activity/ActivityTimeline";
import AppealForm from "@/components/os/governance/activity/AppealForm";
import ParticipationSummary from "@/components/os/governance/activity/ParticipationSummary";
import {
  useCensusSummary,
  useGovernanceProposals,
} from "@/components/os/governance/activity/useActivityData";
import { useActivityTimeline } from "@/components/os/governance/activity/useActivityTimeline";

/**
 * The Activity section body: a single plain-language timeline of what has
 * happened in the organization, newest first, covering decisions, votes, member
 * changes, rule changes and appeals. A short guided form lets a member file an
 * appeal, and its progress then appears in the same timeline. Everything is
 * read for the active Nation only, and no technical identifier is shown.
 */
export default function ActivitySection() {
  const { nationId, readOnly } = useActiveNation();

  const { entries, isLoading, isError, refetch } =
    useActivityTimeline(nationId);
  const summary = useCensusSummary(nationId);
  const proposals = useGovernanceProposals(nationId);

  const decisions = useMemo(() => proposals.data ?? [], [proposals.data]);

  return (
    <div className="space-y-6">
      <ParticipationSummary
        summary={summary.data ?? null}
        isLoading={summary.isLoading}
      />

      <section className="space-y-3" aria-label="Activity timeline">
        <div className="space-y-1">
          <h3 className="font-display text-lg font-medium tracking-tight text-foreground">
            What has happened
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Every decision, vote, member change, rule change and appeal, newest
            first.
          </p>
        </div>
        <ActivityTimeline
          entries={entries}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
        />
      </section>

      <AppealForm nation={nationId} decisions={decisions} readOnly={readOnly} />
    </div>
  );
}
