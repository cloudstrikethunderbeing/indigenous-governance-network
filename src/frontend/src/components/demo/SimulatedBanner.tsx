import { Info } from "lucide-react";

import { simulationNotice } from "@/data/demoData";

/**
 * Persistent, unobtrusive disclosure that the DAO & Economy area is a
 * simulated demonstration and not a live system.
 */
export default function SimulatedBanner() {
  return (
    <div
      data-ocid="demo.banner"
      role="note"
      className="demo-banner flex items-center justify-center gap-2 px-4 py-2 text-center"
    >
      <Info className="size-3.5 shrink-0" aria-hidden="true" />
      <span>{simulationNotice}</span>
    </div>
  );
}
