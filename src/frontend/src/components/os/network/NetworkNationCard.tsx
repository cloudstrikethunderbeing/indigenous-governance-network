import { MapPin } from "lucide-react";

import type { NetworkNationProfile } from "@/backend";

/**
 * One participating Nation in the SOVEREIGN Network: its short profile, its
 * region and the areas it is open to collaborating on. Every entry is
 * simulated sample data and is labelled as a demonstration.
 */
export default function NetworkNationCard({
  profile,
  index,
}: {
  profile: NetworkNationProfile;
  index: number;
}) {
  return (
    <li
      data-ocid={`os.network.item.${index + 1}`}
      className="shell-panel flex flex-col gap-3 p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="min-w-0 font-display text-base font-medium tracking-tight text-foreground">
          {profile.name}
        </h3>
        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          <span
            data-ocid={`os.network.demo_label.${index + 1}`}
            className="status-chip status-closed"
          >
            Demonstration
          </span>
          <span className="network-chip">
            <MapPin className="size-3" aria-hidden="true" />
            {profile.region}
          </span>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        {profile.shortDescription}
      </p>

      {profile.collaborationInterests.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <span className="text-stamp text-muted-foreground">
            Open to collaborating on
          </span>
          <ul className="flex flex-wrap gap-1.5">
            {profile.collaborationInterests.map((interest) => (
              <li key={interest} className="network-chip">
                {interest}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          No collaboration interests listed yet.
        </p>
      )}
    </li>
  );
}
