import type { Principal } from "@icp-sdk/core/principal";

import {
  type GovernanceCapability,
  type GovernanceRole,
  type GovernanceRoleId,
  type NationId,
  type RoleAssignment,
  type RoleAssignmentId,
  type RoleDelegationId,
  createActor,
} from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * React Query hooks for the Governance Members section.
 *
 * Every read and write goes through the generated actor bindings. The backend
 * enforces who may do what; these hooks only carry the caller's request and
 * refresh the affected lists afterwards.
 */

/* ------------------------------------------------------------------ */
/* Reads                                                               */
/* ------------------------------------------------------------------ */

/** The organization's members with their role and permission labels. */
export function useNationMembers(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["nationMembers", nation.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listNationMembers(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** The organization's roles, ensuring the ten built-in roles exist first. */
export function useNationRoles(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["nationRoles", nation.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.ensureNationRoles(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** Every role assignment in the organization. */
export function useRoleAssignments(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["roleAssignments", nation.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listRoleAssignments(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** Every role delegation in the organization, active or expired. */
export function useRoleDelegations(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["roleDelegations", nation.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listRoleDelegations(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** The capabilities the signed-in caller holds in this organization. */
export function useCallerCapabilities(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["callerCapabilities", nation.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCallerCapabilities(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** How many approvals a pending member still needs, and how many they have. */
export function useMembershipApprovalStatus(
  nation: NationId,
  member: Principal,
) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["membershipApproval", nation.toString(), member.toText()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMembershipApprovalStatus(nation, member);
    },
    enabled: !!actor && !isFetching,
  });
}

/* ------------------------------------------------------------------ */
/* Writes                                                              */
/* ------------------------------------------------------------------ */

/** Create a custom role within the platform's security constraints. */
export function useCreateCustomRole() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nation: NationId;
      roleName: string;
      description: string;
      capabilities: GovernanceCapability[];
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.createCustomRole(
        input.nation,
        input.roleName,
        input.description,
        input.capabilities,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["nationRoles"] });
    },
  });
}

/** Change exactly what a role is allowed to do. */
export function useUpdateRoleCapabilities() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nation: NationId;
      role: GovernanceRoleId;
      capabilities: GovernanceCapability[];
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.updateRoleCapabilities(
        input.nation,
        input.role,
        input.capabilities,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["nationRoles"] });
    },
  });
}

/** Give a member a role. A member may hold more than one role. */
export function useAssignRole() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nation: NationId;
      member: Principal;
      role: GovernanceRoleId;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.assignRole(input.nation, input.member, input.role);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["roleAssignments"] });
    },
  });
}

/** Take a role away from a member. */
export function useRevokeRole() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nation: NationId;
      assignment: RoleAssignmentId;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.revokeRole(input.nation, input.assignment);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["roleAssignments"] });
    },
  });
}

/** Let someone act for a member until a set date, then it ends on its own. */
export function useCreateRoleDelegation() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nation: NationId;
      delegate: Principal;
      role: GovernanceRoleId;
      capabilities: GovernanceCapability[];
      expiresAt: bigint;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.createRoleDelegation(
        input.nation,
        input.delegate,
        input.role,
        input.capabilities,
        input.expiresAt,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["roleDelegations"] });
    },
  });
}

/** End a delegation early. */
export function useRevokeRoleDelegation() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nation: NationId;
      delegation: RoleDelegationId;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.revokeRoleDelegation(input.nation, input.delegation);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["roleDelegations"] });
    },
  });
}

/** Approve a pending member's request to join. */
export function useApproveMembership() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { nation: NationId; member: Principal }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.approveMembership(input.nation, input.member);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["nationMembers"] });
      void queryClient.invalidateQueries({ queryKey: ["membershipApproval"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Derived helpers                                                     */
/* ------------------------------------------------------------------ */

/** The roles a member holds, resolved from the assignment list. */
export function rolesForMember(
  member: Principal,
  assignments: RoleAssignment[],
  roles: GovernanceRole[],
): GovernanceRole[] {
  const memberText = member.toText();
  const roleIds = new Set(
    assignments
      .filter((assignment) => assignment.member.toText() === memberText)
      .map((assignment) => assignment.role.toString()),
  );
  return roles.filter((role) => roleIds.has(role.id.toString()));
}
