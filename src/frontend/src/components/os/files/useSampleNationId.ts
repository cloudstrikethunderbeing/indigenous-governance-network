import { useEffect } from "react";

import type { NationId } from "@/backend";
import { sampleNationFallbackId } from "@/data/sampleNation";
import { useEnsureSampleWorkspace } from "@/hooks/useSovereign";

/**
 * Resolve the built-in sample Nation's id from the backend.
 *
 * The sample Nation is seeded lazily and its id is a backend-owned sentinel, so
 * the frontend must never assume a fixed value. This hook seeds the workspace
 * once and returns the id the backend reports. If the backend call cannot
 * complete, it falls back to the static sample identity so the read-only
 * workspace still renders; the sample Nation is read-only for every caller, so
 * the fallback can never write to another Nation.
 *
 * This is the single shared source for the sample Nation id: every surface that
 * needs it (the Files app, Nation Settings, and any future app) reads it here so
 * the app and the canister agree on which Nation is the sample.
 */
export function useSampleNationId(): NationId {
  const ensureWorkspace = useEnsureSampleWorkspace();
  const { mutate: ensure } = ensureWorkspace;

  useEffect(() => {
    ensure();
  }, [ensure]);

  return ensureWorkspace.data ?? BigInt(sampleNationFallbackId);
}
