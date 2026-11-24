import { Handshake } from "lucide-react";

import type { CollaborationProfile } from "@/backend";

function TagList({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li key={item} className="network-chip">
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * A single opt-in collaborator profile with its published skills, interests,
 * needs and partnership opportunities, plus a Request Introduction action.
 */
export default function CollaboratorCard({
  profile,
  index,
  onRequestIntroduction,
  pending,
}: {
  profile: CollaborationProfile;
  index: number;
  onRequestIntroduction: (profile: CollaborationProfile) => void;
  pending?: boolean;
}) {
  return (
    <article
      data-ocid={`discovery.collaborator_card.${index}`}
      className="network-panel flex flex-col gap-3 p-4"
    >
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-base font-medium tracking-tight text-foreground">
          {profile.displayName}
        </h3>
        <span className="network-chip w-fit">
          {profile.party.__kind__ === "community" ? "Community" : "Member"}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <TagList items={profile.skills} />
        <TagList items={profile.interests} />
        <TagList items={profile.needs} />
        <TagList items={profile.partnershipOpportunities} />
      </div>

      <button
        type="button"
        data-ocid={`discovery.collaborator_card.request_introduction_button.${index}`}
        disabled={pending}
        onClick={() => onRequestIntroduction(profile)}
        className="inline-flex w-fit items-center gap-2 rounded-full border border-primary px-3 py-1.5 text-xs font-medium text-primary transition-smooth hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <Handshake className="size-3.5" aria-hidden="true" />
        Request Introduction
      </button>
    </article>
  );
}
