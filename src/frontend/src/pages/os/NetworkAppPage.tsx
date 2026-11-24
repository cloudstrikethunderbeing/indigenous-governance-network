import { Loader2 } from "lucide-react";

import type { CollaborationState, NetworkNationProfile } from "@/backend";
import OsAppPage from "@/components/os/OsAppPage";
import NetworkCollaborationAreas from "@/components/os/network/NetworkCollaborationAreas";
import NetworkNationCard from "@/components/os/network/NetworkNationCard";
import NetworkOptInPanel from "@/components/os/network/NetworkOptInPanel";
import NetworkSovereigntyNote from "@/components/os/network/NetworkSovereigntyNote";
import { sampleNation, sampleNetworkNations } from "@/data/sampleNation";
import { useCollaborationState, useNetworkNations } from "@/hooks/useSovereign";

/** The sample Nation this workspace represents. */
const SAMPLE_NATION_ID = BigInt(sampleNation.id);

/** Fall back to the labelled sample list when the canister has no entries. */
function resolveNations(
  profiles: NetworkNationProfile[] | undefined,
): NetworkNationProfile[] {
  if (profiles && profiles.length > 0) return profiles;
  return sampleNetworkNations.map((nation) => ({
    nation: BigInt(nation.nation),
    name: nation.name,
    shortDescription: nation.shortDescription,
    region: nation.region,
    collaborationInterests: nation.collaborationInterests,
    networkOptIn: nation.networkOptIn,
    timestamp: 0n,
  }));
}

/**
 * The honest collaboration state for this Nation. Prefers the stored opt-in
 * read from the canister; when that read is unavailable, derives the same
 * state from the Nation's own listed profile so the control still reflects
 * the stored value rather than a decorative label.
 */
function resolveCollaborationState(
  state: CollaborationState | null | undefined,
  ownProfile: NetworkNationProfile | undefined,
): CollaborationState | null {
  if (state) return state;
  if (!ownProfile) return null;
  const optedIn = ownProfile.networkOptIn;
  return {
    nation: SAMPLE_NATION_ID,
    optedIn,
    displayLabel: optedIn
      ? "Open to Collaboration"
      : "Private — Not Participating",
    isSample: true,
  };
}

/**
 * The SOVEREIGN Network app (Preview): the Nation's collaboration state read
 * from its stored opt-in, the opt-in control, the areas the network
 * demonstrates, and the Nations whose participation is confirmed. Every
 * demonstration entry is clearly labelled.
 */
export default function NetworkAppPage() {
  const { data: nationsData, isLoading: nationsLoading } = useNetworkNations();
  const { data: collaborationState } = useCollaborationState(SAMPLE_NATION_ID);
  const nations = resolveNations(nationsData);

  const ownProfile = nations.find(
    (nation) => nation.nation === SAMPLE_NATION_ID,
  );
  const state = resolveCollaborationState(collaborationState, ownProfile);

  return (
    <OsAppPage appKey="network">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="text-stamp text-accent">SOVEREIGN Network · Preview</p>
          <h2 className="font-display text-2xl font-medium tracking-tight text-foreground">
            Nations open to collaboration
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Nations that have confirmed they are open to collaboration, with the
            areas they are open to working on. Participation is opt-in, and
            every Nation below is simulated demonstration data.
          </p>
          <div className="rule-accent" />
        </header>

        {state ? (
          <NetworkOptInPanel nationName={sampleNation.name} state={state} />
        ) : (
          <p
            data-ocid="os.network.state_error_state"
            role="alert"
            className="shell-panel p-4 text-sm text-muted-foreground"
          >
            The collaboration state could not be read. Please try again.
          </p>
        )}

        <NetworkSovereigntyNote />

        <NetworkCollaborationAreas />

        <section
          data-ocid="os.network.list_section"
          aria-label="Participating Nations"
          className="flex flex-col gap-3"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display text-lg font-medium tracking-tight text-foreground">
              Participating Nations
            </h3>
            <span className="text-stamp text-muted-foreground">
              Simulated demonstration data
            </span>
          </div>

          {nationsLoading ? (
            <output
              data-ocid="os.network.loading_state"
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Loading the network…
            </output>
          ) : (
            <ul data-ocid="os.network.list" className="flex flex-col gap-3">
              {nations.map((nation, index) => (
                <NetworkNationCard
                  key={nation.nation.toString()}
                  profile={nation}
                  index={index}
                />
              ))}
            </ul>
          )}
        </section>
      </div>
    </OsAppPage>
  );
}
