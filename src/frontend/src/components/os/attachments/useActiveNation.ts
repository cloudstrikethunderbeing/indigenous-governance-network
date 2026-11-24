import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useMemo } from "react";

import type { NationId } from "@/backend";
import { sampleNation } from "@/data/sampleNation";
import { useMyNations } from "@/hooks/useSovereign";

/** The sample Nation's id, matching the backend's seeded sample workspace. */
export const SAMPLE_NATION_ID = BigInt(sampleNation.id);

/**
 * Resolve the Nation the workspace apps read and write. A signed-in member's
 * own Nation is writable; every other caller sees the built-in Sample Nation,
 * which is read-only for everyone. This mirrors the Files app so every app
 * references the same Nation and the same stored files.
 */
export function useActiveNation(): {
  nationId: NationId;
  readOnly: boolean;
  isLoading: boolean;
} {
  const { identity } = useInternetIdentity();
  const signedIn = !!identity && !identity.getPrincipal().isAnonymous();
  const myNationsQuery = useMyNations();

  const activeNation = useMemo(() => {
    if (!signedIn) return null;
    const owned = (myNationsQuery.data ?? []).filter(
      (nation) => !nation.isSample,
    );
    return owned[0] ?? null;
  }, [signedIn, myNationsQuery.data]);

  return {
    nationId: activeNation?.id ?? SAMPLE_NATION_ID,
    readOnly: activeNation === null,
    isLoading: signedIn && myNationsQuery.isLoading,
  };
}
