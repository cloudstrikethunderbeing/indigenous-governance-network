import type { ReactNode } from "react";

import OsWindow from "@/components/os/OsWindow";
import { osApps } from "@/components/os/appRegistry";
import { sampleNationNotice } from "@/data/sampleNation";

/**
 * Shared wrapper for every SOVEREIGN OS app page: renders the app window with
 * its chrome and a persistent sample-data disclosure above the app body.
 */
export default function OsAppPage({
  appKey,
  children,
}: {
  appKey: string;
  children: ReactNode;
}) {
  const app = osApps.find((entry) => entry.key === appKey);
  if (!app) return null;
  return (
    <OsWindow app={app}>
      <p
        data-ocid={`os.sample_notice.${appKey}`}
        role="note"
        className="mb-4 rounded-md border border-dashed border-accent bg-accent/10 px-3 py-2 text-xs font-medium text-accent-foreground"
      >
        {sampleNationNotice}
      </p>
      {children}
    </OsWindow>
  );
}
