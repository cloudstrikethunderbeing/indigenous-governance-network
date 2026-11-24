import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useMemo } from "react";

import type { NationId } from "@/backend";
import OsAppPage from "@/components/os/OsAppPage";
import FilesBrowser from "@/components/os/files/FilesBrowser";
import { useSampleNationId } from "@/components/os/files/useSampleNationId";
import { useMyNations } from "@/hooks/useSovereign";

/**
 * The Files app: a Finder-inspired browser for the Nation's folders and files.
 *
 * The active Nation is resolved before the browser mounts. A signed-in member's
 * own Nation is writable; every other caller sees the built-in sample Nation,
 * whose id comes from the backend's `ensureSampleWorkspace()` rather than a
 * hardcoded value, so the app and the canister agree on which Nation is the
 * sample. The sample Nation is read-only for every visitor.
 */
export default function FilesAppPage() {
  const { identity } = useInternetIdentity();
  const signedIn = !!identity && !identity.getPrincipal().isAnonymous();

  const myNationsQuery = useMyNations();
  const sampleNationId = useSampleNationId();

  // A signed-in member's own Nation is writable; the sample Nation is read-only
  // for every caller.
  const activeNation = useMemo(() => {
    if (!signedIn) return null;
    const owned = (myNationsQuery.data ?? []).filter(
      (nation) => !nation.isSample,
    );
    return owned[0] ?? null;
  }, [signedIn, myNationsQuery.data]);

  const nationId: NationId = activeNation?.id ?? sampleNationId;
  const readOnly = activeNation === null;

  return (
    <OsAppPage appKey="files">
      <div className="space-y-5">
        <header className="space-y-2">
          <p className="text-stamp text-accent">Files</p>
          <h2 className="font-display text-2xl font-medium tracking-tight text-foreground">
            Nation files
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Folders and files the Nation stores, kept private to its members.
            Organize records into folders, upload from your device, and preview
            images and PDFs without leaving the workspace.
          </p>
          <div className="rule-accent" />
        </header>

        <FilesBrowser nationId={nationId} readOnly={readOnly} />
      </div>
    </OsAppPage>
  );
}
