import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  ArrowRightLeft,
  Download,
  LogOut,
  ShieldOff,
  UserMinus,
  UserX,
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";

import type { Principal } from "@icp-sdk/core/principal";

import {
  DepartureKind,
  DepartureStatus,
  type MemberDeparture,
  type NationMember,
  createActor,
} from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery } from "@tanstack/react-query";

import { GovernanceCapability } from "@/backend";
import { useActiveNation } from "@/components/os/attachments/useActiveNation";
import {
  formatDate,
  personLabel,
} from "@/components/os/governance/activity/activityLabels";
import {
  useCallerCapabilities,
  useNationMembers,
} from "@/components/os/governance/members/useGovernanceMembers";
import {
  lifecycleErrorMessage,
  useMemberDepartures,
  useRecordMemberDeparture,
} from "@/hooks/useGovernanceLifecycle";

/**
 * The Departures panel: a member can leave voluntarily or retire, and an
 * authorized authority can suspend or constitutionally remove a member. When a
 * departure becomes effective the backend revokes operational permissions
 * immediately; historical contributions and governance records stay readable to
 * authorized members. A member can export their own authorized personal
 * records at any time.
 */

/** The two departure kinds a member may choose for themselves. */
const SELF_KINDS: { kind: DepartureKind; label: string; hint: string }[] = [
  {
    kind: DepartureKind.voluntaryDeparture,
    label: "Leave voluntarily",
    hint: "Step away from the organization on your own terms.",
  },
  {
    kind: DepartureKind.retirement,
    label: "Retire",
    hint: "End your active service after a long contribution.",
  },
];

/** The two departure kinds an authorized authority may record for someone. */
const AUTHORITY_KINDS: { kind: DepartureKind; label: string; hint: string }[] =
  [
    {
      kind: DepartureKind.suspension,
      label: "Suspend",
      hint: "Pause a member's permissions while a concern is reviewed.",
    },
    {
      kind: DepartureKind.constitutionalRemoval,
      label: "Remove under the rules",
      hint: "Remove a member following the organization's own rules.",
    },
  ];

/** A plain-language name for a departure kind. */
function kindLabel(kind: DepartureKind): string {
  switch (kind) {
    case DepartureKind.voluntaryDeparture:
      return "Left voluntarily";
    case DepartureKind.retirement:
      return "Retired";
    case DepartureKind.suspension:
      return "Suspended";
    case DepartureKind.constitutionalRemoval:
      return "Removed under the rules";
    default:
      return "Departure";
  }
}

/** A plain-language name for a departure status. */
function statusLabel(status: DepartureStatus): string {
  switch (status) {
    case DepartureStatus.notice:
      return "Notice given";
    case DepartureStatus.underReview:
      return "Under review";
    case DepartureStatus.appealed:
      return "Appeal open";
    case DepartureStatus.effective:
      return "Effective";
    case DepartureStatus.withdrawn:
      return "Withdrawn";
    default:
      return "Recorded";
  }
}

/** The status chip colour class for a departure status. */
function statusClass(status: DepartureStatus): string {
  switch (status) {
    case DepartureStatus.effective:
      return "status-won";
    case DepartureStatus.appealed:
      return "status-progress";
    case DepartureStatus.underReview:
      return "status-progress";
    case DepartureStatus.notice:
      return "status-new";
    default:
      return "status-closed";
  }
}

/** Export the signed-in member's own authorized personal records. */
function useExportMyRecords(nation: bigint) {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.exportMyRecords(nation);
    },
  });
}

export default function DeparturePanel() {
  const { nationId, readOnly } = useActiveNation();
  const { identity } = useInternetIdentity();

  const membersQuery = useNationMembers(nationId);
  const capabilitiesQuery = useCallerCapabilities(nationId);
  const departuresQuery = useMemberDepartures(nationId);
  const recordDeparture = useRecordMemberDeparture();
  const exportRecords = useExportMyRecords(nationId);

  const [selfKind, setSelfKind] = useState<DepartureKind>(
    DepartureKind.voluntaryDeparture,
  );
  const [selfNotice, setSelfNotice] = useState("");
  const [selfError, setSelfError] = useState<string | null>(null);
  const [selfDone, setSelfDone] = useState(false);

  const [targetMember, setTargetMember] = useState<string>("");
  const [authorityKind, setAuthorityKind] = useState<DepartureKind>(
    DepartureKind.suspension,
  );
  const [authorityNotice, setAuthorityNotice] = useState("");
  const [authorityError, setAuthorityError] = useState<string | null>(null);
  const [authorityDone, setAuthorityDone] = useState(false);

  const [exportError, setExportError] = useState<string | null>(null);
  const [exportDone, setExportDone] = useState(false);

  const caller = useMemo<Principal | null>(() => {
    if (!identity) return null;
    const principal = identity.getPrincipal();
    return principal.isAnonymous() ? null : principal;
  }, [identity]);

  const members = useMemo(() => membersQuery.data ?? [], [membersQuery.data]);
  const departures = useMemo(
    () => departuresQuery.data ?? [],
    [departuresQuery.data],
  );
  const capabilities = useMemo(
    () => capabilitiesQuery.data ?? [],
    [capabilitiesQuery.data],
  );

  const canModify = capabilities.includes(GovernanceCapability.modify);
  const canAct = canModify && !readOnly;

  const memberName = useMemo(() => {
    const byPrincipal = new Map(
      members.map((member) => [member.member.toText(), member.displayName]),
    );
    return (principal: Principal): string =>
      byPrincipal.get(principal.toText()) ?? personLabel(principal);
  }, [members]);

  const otherMembers = useMemo<NationMember[]>(() => {
    if (!caller) return members;
    return members.filter(
      (member) => member.member.toText() !== caller.toText(),
    );
  }, [members, caller]);

  const ownDepartures = useMemo(() => {
    if (!caller) return [];
    return departures.filter(
      (departure) => departure.member.toText() === caller.toText(),
    );
  }, [departures, caller]);

  function handleSelfDeparture() {
    setSelfError(null);
    setSelfDone(false);
    if (!caller) {
      setSelfError("Sign in to record your departure.");
      return;
    }
    const notice = selfNotice.trim();
    if (notice.length === 0) {
      setSelfError("Please add a short note explaining your departure.");
      return;
    }
    recordDeparture.mutate(
      { nation: nationId, member: caller, kind: selfKind, notice },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "err") {
            setSelfError(lifecycleErrorMessage(result.err));
            return;
          }
          setSelfNotice("");
          setSelfDone(true);
        },
        onError: () =>
          setSelfError(
            "Your departure could not be recorded. Please try again.",
          ),
      },
    );
  }

  function handleAuthorityDeparture() {
    setAuthorityError(null);
    setAuthorityDone(false);
    const target = otherMembers.find(
      (member) => member.member.toText() === targetMember,
    );
    if (!target) {
      setAuthorityError("Choose the member this applies to.");
      return;
    }
    const notice = authorityNotice.trim();
    if (notice.length === 0) {
      setAuthorityError("Please explain the reason for this action.");
      return;
    }
    recordDeparture.mutate(
      {
        nation: nationId,
        member: target.member,
        kind: authorityKind,
        notice,
      },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "err") {
            setAuthorityError(lifecycleErrorMessage(result.err));
            return;
          }
          setAuthorityNotice("");
          setTargetMember("");
          setAuthorityDone(true);
        },
        onError: () =>
          setAuthorityError(
            "That action could not be recorded. Please try again.",
          ),
      },
    );
  }

  function handleExport() {
    setExportError(null);
    setExportDone(false);
    exportRecords.mutate(undefined, {
      onSuccess: (record) => {
        const payload = {
          exportedAt: new Date().toISOString(),
          nation: record.nation.toString(),
          member: record.member.toText(),
          admission: record.admission ?? null,
          recordedVotes: record.recordedVotes.map((vote) => ({
            decision: vote.decision,
            choice: vote.choice,
            confidential: vote.confidential,
            timestamp: vote.timestamp.toString(),
          })),
          censusEntries: record.censusEntries.map((entry) => ({
            kind: entry.kind,
            summary: entry.summary,
            timestamp: entry.timestamp.toString(),
          })),
          departures: record.departures.map((departure) => ({
            kind: departure.kind,
            status: departure.status,
            notice: departure.notice,
            timestamp: departure.timestamp.toString(),
          })),
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `my-records-${record.nation.toString()}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        setExportDone(true);
      },
      onError: () =>
        setExportError("Your records could not be exported. Please try again."),
    });
  }

  const isLoading = membersQuery.isLoading || departuresQuery.isLoading;

  return (
    <div className="space-y-5">
      <p
        data-ocid="os.governance.departures.revocation_notice"
        className="shell-panel-alt flex items-start gap-3 p-4 text-sm leading-relaxed text-foreground"
      >
        <ShieldOff
          className="mt-0.5 size-5 shrink-0 text-primary"
          aria-hidden="true"
        />
        <span>
          When a departure becomes effective, the member&rsquo;s operational
          permissions are revoked immediately. Their past contributions and
          governance records stay readable to authorized members.
        </span>
      </p>

      {isLoading ? (
        <div
          data-ocid="os.governance.departures.loading_state"
          aria-busy="true"
          className="space-y-3"
        >
          {Array.from({ length: 2 }, (_, i) => `skeleton-${i}`).map((id) => (
            <div
              key={id}
              className="shell-panel h-28 animate-pulse bg-muted/40"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Leave or retire — the member's own choice */}
          <section
            data-ocid="os.governance.departures.self_panel"
            className="shell-panel space-y-4 p-5"
          >
            <div className="flex items-center gap-2">
              <LogOut className="size-5 text-primary" aria-hidden="true" />
              <h3 className="font-display text-lg font-semibold text-foreground">
                Leave or retire
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              You can step away from this organization at any time. Your choice
              is recorded and your permissions end when it takes effect.
            </p>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-foreground">
                How are you leaving?
              </legend>
              {SELF_KINDS.map((option) => (
                <label
                  key={option.kind}
                  className={`flex min-h-[44px] cursor-pointer items-start gap-3 rounded-lg border p-3 transition-smooth ${
                    selfKind === option.kind
                      ? "border-primary bg-primary/5"
                      : "border-input bg-card hover:border-accent"
                  }`}
                >
                  <input
                    type="radio"
                    name="self-departure-kind"
                    value={option.kind}
                    checked={selfKind === option.kind}
                    onChange={() => setSelfKind(option.kind)}
                    className="mt-1 size-4 accent-primary"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-foreground">
                      {option.label}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {option.hint}
                    </span>
                  </span>
                </label>
              ))}
            </fieldset>

            <div className="space-y-1.5">
              <label
                htmlFor="self-departure-notice"
                className="text-sm font-medium text-foreground"
              >
                A short note
              </label>
              <textarea
                id="self-departure-notice"
                data-ocid="os.governance.departures.self_notice_input"
                value={selfNotice}
                onChange={(event) => setSelfNotice(event.target.value)}
                rows={3}
                placeholder="Share why you are leaving, in your own words."
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {selfError ? (
              <p
                data-ocid="os.governance.departures.self_error"
                role="alert"
                className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {selfError}
              </p>
            ) : null}
            {selfDone ? (
              <p
                data-ocid="os.governance.departures.self_success"
                className="rounded-md border border-success/40 bg-success/10 px-3 py-2 text-sm text-foreground"
              >
                Your departure has been recorded. Thank you for your
                contribution.
              </p>
            ) : null}

            <button
              type="button"
              data-ocid="os.governance.departures.self_submit_button"
              onClick={handleSelfDeparture}
              disabled={recordDeparture.isPending || !caller}
              className="os-focus-ring inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive transition-smooth hover:bg-destructive/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <UserMinus className="size-4" aria-hidden="true" />
              {recordDeparture.isPending ? "Recording…" : "Record my departure"}
            </button>
            {!caller ? (
              <p className="text-xs text-muted-foreground">
                Sign in to record your own departure.
              </p>
            ) : null}
          </section>

          {/* Suspend or remove — an authorized authority */}
          <section
            data-ocid="os.governance.departures.authority_panel"
            className="shell-panel space-y-4 p-5"
          >
            <div className="flex items-center gap-2">
              <UserX className="size-5 text-primary" aria-hidden="true" />
              <h3 className="font-display text-lg font-semibold text-foreground">
                Suspend or remove a member
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              An authorized authority can pause a member&rsquo;s permissions or
              remove them under the organization&rsquo;s rules. Involuntary
              removals go through notice, review and an appeal before they
              become final.
            </p>

            {!canAct ? (
              <p
                data-ocid="os.governance.departures.authority_readonly"
                className="rounded-md border border-border bg-muted/40 px-3 py-3 text-sm text-muted-foreground"
              >
                Only an authorized authority can suspend or remove a member.
              </p>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label
                    htmlFor="authority-departure-member"
                    className="text-sm font-medium text-foreground"
                  >
                    Which member?
                  </label>
                  <select
                    id="authority-departure-member"
                    data-ocid="os.governance.departures.authority_member_select"
                    value={targetMember}
                    onChange={(event) => setTargetMember(event.target.value)}
                    className="min-h-[44px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Choose a member</option>
                    {otherMembers.map((member) => (
                      <option
                        key={member.member.toText()}
                        value={member.member.toText()}
                      >
                        {member.displayName || personLabel(member.member)}
                      </option>
                    ))}
                  </select>
                </div>

                <fieldset className="space-y-2">
                  <legend className="text-sm font-medium text-foreground">
                    What action?
                  </legend>
                  {AUTHORITY_KINDS.map((option) => (
                    <label
                      key={option.kind}
                      className={`flex min-h-[44px] cursor-pointer items-start gap-3 rounded-lg border p-3 transition-smooth ${
                        authorityKind === option.kind
                          ? "border-primary bg-primary/5"
                          : "border-input bg-card hover:border-accent"
                      }`}
                    >
                      <input
                        type="radio"
                        name="authority-departure-kind"
                        value={option.kind}
                        checked={authorityKind === option.kind}
                        onChange={() => setAuthorityKind(option.kind)}
                        className="mt-1 size-4 accent-primary"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-foreground">
                          {option.label}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {option.hint}
                        </span>
                      </span>
                    </label>
                  ))}
                </fieldset>

                <div className="space-y-1.5">
                  <label
                    htmlFor="authority-departure-notice"
                    className="text-sm font-medium text-foreground"
                  >
                    Reason
                  </label>
                  <textarea
                    id="authority-departure-notice"
                    data-ocid="os.governance.departures.authority_notice_input"
                    value={authorityNotice}
                    onChange={(event) => setAuthorityNotice(event.target.value)}
                    rows={3}
                    placeholder="Explain the reason clearly and fairly."
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                {authorityError ? (
                  <p
                    data-ocid="os.governance.departures.authority_error"
                    role="alert"
                    className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  >
                    {authorityError}
                  </p>
                ) : null}
                {authorityDone ? (
                  <p
                    data-ocid="os.governance.departures.authority_success"
                    className="rounded-md border border-success/40 bg-success/10 px-3 py-2 text-sm text-foreground"
                  >
                    The action has been recorded. The member will be notified
                    and may appeal.
                  </p>
                ) : null}

                <button
                  type="button"
                  data-ocid="os.governance.departures.authority_submit_button"
                  onClick={handleAuthorityDeparture}
                  disabled={recordDeparture.isPending}
                  className="os-focus-ring inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-smooth hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ArrowRightLeft className="size-4" aria-hidden="true" />
                  {recordDeparture.isPending
                    ? "Recording…"
                    : "Record this action"}
                </button>
              </>
            )}
          </section>
        </div>
      )}

      {/* Export my own records */}
      <section
        data-ocid="os.governance.departures.export_panel"
        className="shell-panel space-y-3 p-5"
      >
        <div className="flex items-center gap-2">
          <Download className="size-5 text-primary" aria-hidden="true" />
          <h3 className="font-display text-lg font-semibold text-foreground">
            Export your records
          </h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Download a copy of the personal records you are authorized to see:
          your admission, recorded votes, participation and departures.
        </p>
        {exportError ? (
          <p
            data-ocid="os.governance.departures.export_error"
            role="alert"
            className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {exportError}
          </p>
        ) : null}
        {exportDone ? (
          <p
            data-ocid="os.governance.departures.export_success"
            className="rounded-md border border-success/40 bg-success/10 px-3 py-2 text-sm text-foreground"
          >
            Your records have been downloaded.
          </p>
        ) : null}
        <button
          type="button"
          data-ocid="os.governance.departures.export_button"
          onClick={handleExport}
          disabled={exportRecords.isPending || !caller}
          className="os-focus-ring inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-input bg-card px-4 py-3 text-sm font-semibold text-foreground transition-smooth hover:border-accent hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Download className="size-4" aria-hidden="true" />
          {exportRecords.isPending ? "Preparing…" : "Download my records"}
        </button>
      </section>

      {/* Departure history */}
      <section
        data-ocid="os.governance.departures.history_panel"
        className="shell-panel space-y-3 p-5"
      >
        <h3 className="font-display text-lg font-semibold text-foreground">
          Departure record
        </h3>
        {departures.length === 0 ? (
          <p
            data-ocid="os.governance.departures.empty_state"
            className="text-sm text-muted-foreground"
          >
            No one has left this organization. Departures will appear here.
          </p>
        ) : (
          <ul className="space-y-2">
            {departures.map((departure, index) => (
              <DepartureRow
                key={departure.id.toString()}
                departure={departure}
                name={memberName(departure.member)}
                index={index + 1}
              />
            ))}
          </ul>
        )}
        {ownDepartures.length > 0 ? (
          <p className="text-xs text-muted-foreground">
            Your own departure is recorded above. Your past contributions remain
            part of the organization&rsquo;s history.
          </p>
        ) : null}
      </section>
    </div>
  );
}

/** One recorded departure in the history list. */
function DepartureRow({
  departure,
  name,
  index,
}: {
  departure: MemberDeparture;
  name: string;
  index: number;
}): ReactNode {
  return (
    <li
      data-ocid={`os.governance.departures.item.${index}`}
      className="rounded-lg border border-border bg-card p-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">{name}</span>
        <span className={`status-chip ${statusClass(departure.status)}`}>
          {statusLabel(departure.status)}
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {kindLabel(departure.kind)} · {formatDate(departure.timestamp)}
      </p>
      {departure.notice ? (
        <p className="mt-2 text-sm text-foreground">{departure.notice}</p>
      ) : null}
      {departure.permissionRevokedAt !== undefined ? (
        <p className="mt-1 text-xs text-muted-foreground">
          Permissions revoked {formatDate(departure.permissionRevokedAt)}.
        </p>
      ) : null}
    </li>
  );
}
