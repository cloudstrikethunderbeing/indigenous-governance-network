import { createActor } from "@/backend";
import type { NationId } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";

/**
 * Read hooks for the Our Rules section: the organization's active constitution,
 * the rules currently in force, and the history of every amendment. These are
 * read-only queries — the rules are never edited directly from this section.
 */

/** The organization's active constitution, or null when none is confirmed. */
export function useActiveConstitution(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["activeConstitution", nation.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getActiveConstitution(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** The rules currently in force for the organization, or null when none. */
export function useActiveRuleSet(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["activeRuleSet", nation.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getActiveRuleSet(nation);
    },
    enabled: !!actor && !isFetching,
  });
}

/** Every amendment made to the organization's rules, newest first. */
export function useAmendments(nation: NationId) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["amendments", nation.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAmendments(nation);
    },
    enabled: !!actor && !isFetching,
  });
}
