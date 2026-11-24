import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Inbox, Plus, ShieldCheck, Users } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";

import type { Principal } from "@icp-sdk/core/principal";

import {
  GovernanceCapability,
  GovernanceError,
  type GovernanceRole,
  type JoinRequest,
  JoinRequestStatus,
  type NationMember,
  type RoleDelegation,
} from "@/backend";
import { useActiveNation } from "@/components/os/attachments/useActiveNation";
import CensusSummaryCard from "@/components/os/governance/members/CensusSummaryCard";
import CustomRoleEditor from "@/components/os/governance/members/CustomRoleEditor";
import DelegationsPanel from "@/components/os/governance/members/DelegationsPanel";
import InviteMemberForm from "@/components/os/governance/members/InviteMemberForm";
import JoinRequestForm from "@/components/os/governance/members/JoinRequestForm";
import JoinRequestList from "@/components/os/governance/members/JoinRequestList";
import MemberRoster from "@/components/os/governance/members/MemberRoster";
import RolesPermissionsView from "@/components/os/governance/members/RolesPermissionsView";
import VotingEligibilityCard from "@/components/os/governance/members/VotingEligibilityCard";
import {
  useApproveMembership,
  useAssignRole,
  useCallerCapabilities,
  useCreateCustomRole,
  useNationMembers,
  useNationRoles,
  useRevokeRoleDelegation,
  useRoleAssignments,
  useRoleDelegations,
  useUpdateRoleCapabilities,
} from "@/components/os/governance/members/useGovernanceMembers";
import {
  findOwnRequest,
  useJoinRequests,
  useReviewJoinRequest,
  useSubmitJoinRequest,
  useWithdrawJoinRequest,
} from "@/components/os/governance/members/useJoinRequests";
import { useCensusSummary } from "@/hooks/useGovernanceActivity";
import { useVotingEligibility } from "@/hooks/useGovernanceEnforcement";

/** The three views inside the Members section. */
type MembersView = "membership" | "requests" | "roles";

/**
 * The Members section body: who belongs to the organization and what each
 * person can do, plus the roles-and-permissions view. Every action is hidden or
 * disabled unless the signed-in person holds the capability the backend
 * requires, and one plain sentence states that the organization's own system —
 * not this screen — enforces the permissions.
 */
export default function MembersSection() {
  const { nationId, readOnly } = useActiveNation();
  const { identity } = useInternetIdentity();
  const [view, setView] = useState<MembersView>("membership");

  const membersQuery = useNationMembers(nationId);
  const rolesQuery = useNationRoles(nationId);
  const assignmentsQuery = useRoleAssignments(nationId);
  const delegationsQuery = useRoleDelegations(nationId);
  const capabilitiesQuery = useCallerCapabilities(nationId);
  const censusQuery = useCensusSummary(nationId);
  const joinRequestsQuery = useJoinRequests(nationId);
  const eligibilityQuery = useVotingEligibility(nationId);

  const approveMembership = useApproveMembership();
  const assignRole = useAssignRole();
  const createCustomRole = useCreateCustomRole();
  const updateRoleCapabilities = useUpdateRoleCapabilities();
  const revokeRoleDelegation = useRevokeRoleDelegation();
  const submitJoinRequest = useSubmitJoinRequest();
  const reviewJoinRequest = useReviewJoinRequest();
  const withdrawJoinRequest = useWithdrawJoinRequest();

  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [approvingMember, setApprovingMember] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<GovernanceRole | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

  const members = useMemo(() => membersQuery.data ?? [], [membersQuery.data]);
  const roles = useMemo(() => rolesQuery.data ?? [], [rolesQuery.data]);
  const assignments = useMemo(
    () => assignmentsQuery.data ?? [],
    [assignmentsQuery.data],
  );
  const delegations = useMemo(
    () => delegationsQuery.data ?? [],
    [delegationsQuery.data],
  );
  const capabilities = useMemo(
    () => capabilitiesQuery.data ?? [],
    [capabilitiesQuery.data],
  );
  const joinRequests = useMemo(
    () => joinRequestsQuery.data ?? [],
    [joinRequestsQuery.data],
  );

  const caller = useMemo<Principal | null>(() => {
    if (!identity) return null;
    const principal = identity.getPrincipal();
    return principal.isAnonymous() ? null : principal;
  }, [identity]);

  // People who have asked to join and are still waiting for approval. Derived
  // from the join-request queue, not the roster, so a member with no permission
  // labels for another reason is never mistaken for a pending applicant.
  const pendingMembers = useMemo<NationMember[]>(() => {
    const memberByPrincipal = new Map(
      members.map((member) => [member.member.toText(), member]),
    );
    const seen = new Set<string>();
    const pending: NationMember[] = [];
    for (const request of joinRequests) {
      if (
        request.status !== JoinRequestStatus.pendingReview &&
        request.status !== JoinRequestStatus.underReview
      ) {
        continue;
      }
      const principalText = request.applicant.toText();
      if (seen.has(principalText)) continue;
      seen.add(principalText);
      const existing = memberByPrincipal.get(principalText);
      if (existing) {
        pending.push(existing);
      } else {
        pending.push({
          id: request.id,
          member: request.applicant,
          nation: request.nation,
          displayName: request.displayName,
          permissionLabels: [],
          timestamp: request.timestamp,
          roleLabel: "",
        });
      }
    }
    return pending;
  }, [members, joinRequests]);

  const ownRequest = useMemo(
    () => findOwnRequest(joinRequests, caller),
    [joinRequests, caller],
  );

  const openRequestCount = useMemo(
    () =>
      joinRequests.filter(
        (request) =>
          request.status === "pendingReview" ||
          request.status === "underReview",
      ).length,
    [joinRequests],
  );

  const canApprove = capabilities.includes(GovernanceCapability.approve);
  const canModify = capabilities.includes(GovernanceCapability.modify);
  const isLoading =
    membersQuery.isLoading ||
    rolesQuery.isLoading ||
    assignmentsQuery.isLoading;

  function handleApprove(member: Principal) {
    setApprovingMember(member.toText());
    approveMembership.mutate(
      { nation: nationId, member },
      { onSettled: () => setApprovingMember(null) },
    );
  }

  /**
   * Let a waiting person in and give them a role in one guided step. The
   * membership approval runs first; the role is granted once it succeeds, so a
   * rejected approval never leaves a role behind.
   */
  function handleInvite(input: { member: Principal; role: GovernanceRole }) {
    setInviteError(null);
    approveMembership.mutate(
      { nation: nationId, member: input.member },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "err") {
            setInviteError(
              "That person could not be let in. Please try again.",
            );
            return;
          }
          assignRole.mutate(
            { nation: nationId, member: input.member, role: input.role.id },
            {
              onError: () =>
                setInviteError(
                  "They were let in, but the role could not be set. Try again from their card.",
                ),
            },
          );
        },
        onError: () =>
          setInviteError("That person could not be let in. Please try again."),
      },
    );
  }

  function openCreateRole() {
    setEditingRole(null);
    setRoleError(null);
    setEditorOpen(true);
  }

  function openEditRole(role: GovernanceRole) {
    setEditingRole(role);
    setRoleError(null);
    setEditorOpen(true);
  }

  function handleSaveRole(input: {
    roleName: string;
    description: string;
    capabilities: GovernanceCapability[];
  }) {
    setRoleError(null);
    if (editingRole) {
      updateRoleCapabilities.mutate(
        {
          nation: nationId,
          role: editingRole.id,
          capabilities: input.capabilities,
        },
        {
          onSuccess: () => setEditorOpen(false),
          onError: () =>
            setRoleError("That change could not be saved. Please try again."),
        },
      );
    } else {
      createCustomRole.mutate(
        {
          nation: nationId,
          roleName: input.roleName,
          description: input.description,
          capabilities: input.capabilities,
        },
        {
          onSuccess: () => setEditorOpen(false),
          onError: () =>
            setRoleError(
              "That role could not be created. Check the name and try again.",
            ),
        },
      );
    }
  }

  function handleRevoke(delegation: RoleDelegation) {
    setRevokingId(delegation.id.toString());
    revokeRoleDelegation.mutate(
      { nation: nationId, delegation: delegation.id },
      { onSettled: () => setRevokingId(null) },
    );
  }

  function handleSubmitJoinRequest(input: {
    displayName: string;
    message: string;
  }) {
    setJoinError(null);
    submitJoinRequest.mutate(
      {
        nation: nationId,
        displayName: input.displayName,
        message: input.message,
      },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "err") {
            setJoinError(joinRefusalMessage(result.err));
          }
        },
        onError: () =>
          setJoinError("Your request could not be sent. Please try again."),
      },
    );
  }

  function handleWithdrawJoinRequest(request: JoinRequest) {
    setJoinError(null);
    withdrawJoinRequest.mutate(
      { nation: nationId, request: request.id },
      {
        onError: () =>
          setJoinError(
            "Your request could not be withdrawn. Please try again.",
          ),
      },
    );
  }

  function handleApproveRequest(request: JoinRequest) {
    setReviewingId(request.id.toString());
    reviewJoinRequest.mutate(
      { nation: nationId, request: request.id, approve: true },
      { onSettled: () => setReviewingId(null) },
    );
  }

  function handleRejectRequest(request: JoinRequest) {
    setReviewingId(request.id.toString());
    reviewJoinRequest.mutate(
      { nation: nationId, request: request.id, approve: false },
      { onSettled: () => setReviewingId(null) },
    );
  }

  return (
    <div className="space-y-5">
      <p
        data-ocid="os.governance.members.enforcement_notice"
        className="shell-panel-alt flex items-start gap-3 p-4 text-sm leading-relaxed text-foreground"
      >
        <ShieldCheck
          className="mt-0.5 size-5 shrink-0 text-primary"
          aria-hidden="true"
        />
        <span>
          These permissions are enforced by your organization&rsquo;s own
          system, not by what this screen shows.
        </span>
      </p>

      <CensusSummaryCard
        summary={censusQuery.data ?? null}
        isLoading={censusQuery.isLoading}
        isError={censusQuery.isError}
        onRetry={() => void censusQuery.refetch()}
      />

      <VotingEligibilityCard
        eligibility={eligibilityQuery.data ?? null}
        isLoading={eligibilityQuery.isLoading}
      />

      <div
        data-ocid="os.governance.members.view_tabs"
        role="tablist"
        aria-label="Members views"
        className="flex flex-wrap gap-2"
      >
        <ViewTab
          active={view === "membership"}
          icon={<Users className="size-5" aria-hidden="true" />}
          label="Who belongs"
          onClick={() => setView("membership")}
          ocid="os.governance.members.view_tab.membership"
        />
        <ViewTab
          active={view === "requests"}
          icon={<Inbox className="size-5" aria-hidden="true" />}
          label={
            openRequestCount > 0 ? `Requests (${openRequestCount})` : "Requests"
          }
          onClick={() => setView("requests")}
          ocid="os.governance.members.view_tab.requests"
        />
        <ViewTab
          active={view === "roles"}
          icon={<ShieldCheck className="size-5" aria-hidden="true" />}
          label="Roles & permissions"
          onClick={() => setView("roles")}
          ocid="os.governance.members.view_tab.roles"
        />
      </div>

      {isLoading ? (
        <div
          data-ocid="os.governance.members.loading_state"
          aria-busy="true"
          className="space-y-3"
        >
          {Array.from({ length: 3 }, (_, i) => `skeleton-${i}`).map((id) => (
            <div
              key={id}
              className="shell-panel h-24 animate-pulse bg-muted/40"
            />
          ))}
        </div>
      ) : view === "membership" ? (
        <div className="space-y-5">
          {canApprove && !readOnly ? (
            <InviteMemberForm
              pendingMembers={pendingMembers}
              roles={roles}
              isSaving={approveMembership.isPending || assignRole.isPending}
              error={inviteError}
              onConfirm={handleInvite}
            />
          ) : null}

          {members.length === 0 ? (
            <p
              data-ocid="os.governance.members.empty_state"
              className="shell-panel p-5 text-sm text-muted-foreground"
            >
              No one has joined yet. People who ask to join will appear here for
              approval.
            </p>
          ) : (
            <MemberRoster
              members={members}
              roles={roles}
              assignments={assignments}
              canApprove={canApprove && !readOnly}
              approvingMember={approvingMember}
              onApprove={handleApprove}
              onSelect={(member: NationMember) =>
                setSelectedMember(member.member.toText())
              }
              selectedMember={selectedMember}
            />
          )}

          <DelegationsPanel
            delegations={delegations}
            roles={roles}
            canManage={canModify && !readOnly}
            revokingId={revokingId}
            onRevoke={handleRevoke}
          />
        </div>
      ) : view === "requests" ? (
        <div className="space-y-5">
          {joinError ? (
            <p
              data-ocid="os.governance.members.join_error"
              role="alert"
              className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {joinError}
            </p>
          ) : null}

          {canApprove && !readOnly ? (
            <JoinRequestList
              requests={joinRequests}
              canApprove={canApprove && !readOnly}
              reviewingId={reviewingId}
              onApprove={handleApproveRequest}
              onReject={handleRejectRequest}
            />
          ) : caller && !readOnly ? (
            <JoinRequestForm
              ownRequest={ownRequest}
              isSubmitting={submitJoinRequest.isPending}
              isWithdrawing={withdrawJoinRequest.isPending}
              error={joinError}
              onSubmit={handleSubmitJoinRequest}
              onWithdraw={handleWithdrawJoinRequest}
            />
          ) : (
            <p
              data-ocid="os.governance.members.requests_signed_out"
              className="shell-panel p-5 text-sm text-muted-foreground"
            >
              Sign in to ask to join this organization or to review requests.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          <RolesPermissionsView roles={roles} onEditRole={openEditRole} />

          {canModify && !readOnly ? (
            editorOpen ? (
              <CustomRoleEditor
                editingRole={editingRole}
                isSaving={
                  createCustomRole.isPending || updateRoleCapabilities.isPending
                }
                error={roleError}
                onSave={handleSaveRole}
                onCancel={() => setEditorOpen(false)}
              />
            ) : (
              <button
                type="button"
                data-ocid="os.governance.members.add_role_button"
                onClick={openCreateRole}
                className="os-focus-ring inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-input bg-card px-4 py-3 text-sm font-semibold text-foreground transition-smooth hover:border-accent hover:bg-accent/10 sm:w-auto"
              >
                <Plus className="size-4" aria-hidden="true" />
                Add a custom role
              </button>
            )
          ) : (
            <p
              data-ocid="os.governance.members.roles_readonly"
              className="rounded-md border border-border bg-muted/40 px-3 py-3 text-sm text-muted-foreground"
            >
              Only someone with permission to change settings can add or edit
              roles.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/** One tab in the Members section's view switcher. */
function ViewTab({
  active,
  icon,
  label,
  onClick,
  ocid,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  ocid: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      data-ocid={ocid}
      onClick={onClick}
      className={`os-focus-ring inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-smooth ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-card text-foreground hover:border-accent hover:bg-accent/10"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/** A plain-language message for each refusal the backend can return. */
function joinRefusalMessage(error: GovernanceError): string {
  switch (error) {
    case GovernanceError.notAuthorized:
      return "You are not able to ask to join this organization right now.";
    case GovernanceError.unknownNation:
      return "This organization could not be found.";
    case GovernanceError.missingName:
      return "Please add your name before sending the request.";
    case GovernanceError.alreadyActivated:
      return "You are already a member of this organization.";
    default:
      return "Your request could not be sent. You may already be a member or have a request pending.";
  }
}
