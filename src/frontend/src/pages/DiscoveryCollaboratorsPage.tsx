import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Handshake, Lock, ShieldCheck, Sparkles, UserPlus } from "lucide-react";
import { type FormEvent, useState } from "react";

import type { CollaborationProfile } from "@/backend";
import { SignInButton } from "@/components/InternetIdentity";
import CollaboratorCard from "@/components/discovery/CollaboratorCard";
import DiscoveryDirectory from "@/components/discovery/DiscoveryDirectory";
import DiscoveryShell from "@/components/discovery/DiscoveryShell";
import EmptyState from "@/components/discovery/EmptyState";
import IntroductionRequestList from "@/components/discovery/IntroductionRequestList";
import {
  useMatchingCollaborators,
  useMyIntroductions,
  useRequestIntroduction,
  useRespondToIntroduction,
  useSaveCollaborationProfile,
} from "@/hooks/useDiscovery";

/** Split a comma-separated field into trimmed, non-empty tags. */
function parseTags(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/* ------------------------------------------------------------------ */
/* Opt-in control — publish the caller's collaboration profile         */
/* ------------------------------------------------------------------ */

function OptInPanel() {
  const { identity } = useInternetIdentity();
  const principal =
    identity && !identity.getPrincipal().isAnonymous()
      ? identity.getPrincipal()
      : null;
  const save = useSaveCollaborationProfile();

  const [displayName, setDisplayName] = useState("");
  const [skills, setSkills] = useState("");
  const [interests, setInterests] = useState("");
  const [needs, setNeeds] = useState("");
  const [opportunities, setOpportunities] = useState("");
  const [optIn, setOptIn] = useState(true);
  const [saved, setSaved] = useState(false);

  const canSubmit = principal !== null && displayName.trim().length > 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!principal || !canSubmit) return;
    const profile: CollaborationProfile = {
      id: 0n,
      displayName: displayName.trim(),
      skills: parseTags(skills),
      interests: parseTags(interests),
      needs: parseTags(needs),
      partnershipOpportunities: parseTags(opportunities),
      party: { __kind__: "member", member: principal },
      discoveryOptIn: optIn,
      timestamp: 0n,
    };
    setSaved(false);
    save.mutate(profile, { onSuccess: () => setSaved(true) });
  }

  return (
    <section
      data-ocid="discovery.opt_in_panel"
      aria-label="Publish your collaboration profile"
      className="network-panel flex flex-col gap-4 p-5"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground"
        >
          <UserPlus className="size-4" />
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="font-display text-base font-medium tracking-tight text-foreground">
            Publish your collaboration profile
          </h2>
          <p className="text-xs text-muted-foreground">
            Opt in to be discoverable across communities. You choose exactly
            what is shared, and you can opt out at any time.
          </p>
        </div>
      </div>

      {principal === null ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-muted-foreground">
            Sign in with Internet Identity to publish a profile and request
            introductions.
          </p>
          <SignInButton className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-smooth hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-stamp text-muted-foreground">
              Display name
            </span>
            <input
              type="text"
              data-ocid="discovery.opt_in_panel.display_name_input"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="e.g. Coastal Research Collective"
              className="rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-stamp text-muted-foreground">
                Skills (comma separated)
              </span>
              <input
                type="text"
                data-ocid="discovery.opt_in_panel.skills_input"
                value={skills}
                onChange={(event) => setSkills(event.target.value)}
                placeholder="data science, facilitation"
                className="rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-stamp text-muted-foreground">
                Interests (comma separated)
              </span>
              <input
                type="text"
                data-ocid="discovery.opt_in_panel.interests_input"
                value={interests}
                onChange={(event) => setInterests(event.target.value)}
                placeholder="water rights, open data"
                className="rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-stamp text-muted-foreground">
                Project needs (comma separated)
              </span>
              <input
                type="text"
                data-ocid="discovery.opt_in_panel.needs_input"
                value={needs}
                onChange={(event) => setNeeds(event.target.value)}
                placeholder="legal review, translation"
                className="rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-stamp text-muted-foreground">
                Partnership opportunities (comma separated)
              </span>
              <input
                type="text"
                data-ocid="discovery.opt_in_panel.opportunities_input"
                value={opportunities}
                onChange={(event) => setOpportunities(event.target.value)}
                placeholder="joint research, shared grants"
                className="rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              data-ocid="discovery.opt_in_panel.opt_in_checkbox"
              checked={optIn}
              onChange={(event) => setOptIn(event.target.checked)}
              className="size-4 rounded border-input accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
            List my profile in the opt-in directory
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              data-ocid="discovery.opt_in_panel.save_button"
              disabled={!canSubmit || save.isPending}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-smooth hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <ShieldCheck className="size-4" aria-hidden="true" />
              {save.isPending ? "Publishing…" : "Publish profile"}
            </button>
            {saved ? (
              <output
                data-ocid="discovery.opt_in_panel.success_state"
                className="text-xs text-muted-foreground"
              >
                Your profile is published.
              </output>
            ) : null}
            {save.isError ? (
              <p
                role="alert"
                data-ocid="discovery.opt_in_panel.error_state"
                className="text-xs text-destructive"
              >
                Could not publish your profile. Please try again.
              </p>
            ) : null}
          </div>
        </form>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Recommendations — matching collaborators for a community context    */
/* ------------------------------------------------------------------ */

function RecommendationsSection() {
  const [communityInput, setCommunityInput] = useState("");
  const community = /^\d+$/.test(communityInput.trim())
    ? BigInt(communityInput.trim())
    : null;
  const { data: collaborators, isLoading } =
    useMatchingCollaborators(community);
  const request = useRequestIntroduction();
  const [selected, setSelected] = useState<CollaborationProfile | null>(null);
  const [message, setMessage] = useState("");

  function handleRequest(profile: CollaborationProfile) {
    setSelected(profile);
    setMessage("");
  }

  function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || message.trim().length === 0) return;
    const target = selected.party;
    const body = message.trim();
    request.mutate(
      { target, message: body },
      { onSuccess: () => setSelected(null) },
    );
  }

  return (
    <section
      data-ocid="discovery.recommendations"
      aria-label="Connection recommendations"
      className="flex flex-col gap-3"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-base font-medium tracking-tight text-foreground">
            Recommended connections
          </h2>
          <p className="text-xs text-muted-foreground">
            Opted-in profiles matched to your community. Your own community is
            never shown.
          </p>
        </div>
        <label className="flex flex-col gap-1 sm:w-56">
          <span className="text-stamp text-muted-foreground">
            Your community ID
          </span>
          <input
            type="text"
            inputMode="numeric"
            data-ocid="discovery.recommendations.community_input"
            value={communityInput}
            onChange={(event) => setCommunityInput(event.target.value)}
            placeholder="e.g. 0"
            className="rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
        </label>
      </div>

      {community === null ? (
        <EmptyState
          ocid="discovery.recommendations.empty_state"
          title="Set your community to see matches"
          description="Enter your community ID to see opted-in communities and members whose skills, interests and needs align with yours."
        />
      ) : isLoading ? (
        <p
          data-ocid="discovery.recommendations.loading_state"
          className="text-sm text-muted-foreground"
        >
          Finding relevant connections…
        </p>
      ) : collaborators && collaborators.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {collaborators.map((profile, index) => (
            <CollaboratorCard
              key={profile.id.toString()}
              profile={profile}
              index={index}
              onRequestIntroduction={handleRequest}
              pending={request.isPending}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          ocid="discovery.recommendations.empty_state"
          title="No matching profiles yet"
          description="No opted-in profiles match this community yet. Publish your own profile to invite others to connect."
        />
      )}

      {selected ? (
        <form
          onSubmit={submitRequest}
          data-ocid="discovery.request_introduction_dialog"
          aria-label="Request an introduction"
          className="network-panel flex flex-col gap-3 p-4"
        >
          <div className="flex items-center gap-2">
            <Handshake className="size-4 text-primary" aria-hidden="true" />
            <span className="text-sm font-medium text-foreground">
              Request an introduction to {selected.displayName}
            </span>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-stamp text-muted-foreground">Message</span>
            <textarea
              data-ocid="discovery.request_introduction_dialog.message_textarea"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={3}
              placeholder="Share why you would like to connect."
              className="rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              data-ocid="discovery.request_introduction_dialog.submit_button"
              disabled={message.trim().length === 0 || request.isPending}
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-smooth hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {request.isPending ? "Sending…" : "Send request"}
            </button>
            <button
              type="button"
              data-ocid="discovery.request_introduction_dialog.cancel_button"
              onClick={() => setSelected(null)}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-smooth hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Cancel
            </button>
          </div>
          {request.isError ? (
            <p
              role="alert"
              data-ocid="discovery.request_introduction_dialog.error_state"
              className="text-xs text-destructive"
            >
              Could not send the request. Please try again.
            </p>
          ) : null}
        </form>
      ) : null}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Introduction requests — both parties must approve                   */
/* ------------------------------------------------------------------ */

function IntroductionsSection() {
  const { data: requests, isLoading } = useMyIntroductions();
  const respond = useRespondToIntroduction();

  return (
    <section
      data-ocid="discovery.introductions"
      aria-label="Your introduction requests"
      className="flex flex-col gap-3"
    >
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-base font-medium tracking-tight text-foreground">
          Your introduction requests
        </h2>
        <p className="text-xs text-muted-foreground">
          Contact details are shared only once both parties approve.
        </p>
      </div>

      {isLoading ? (
        <p
          data-ocid="discovery.introductions.loading_state"
          className="text-sm text-muted-foreground"
        >
          Loading your requests…
        </p>
      ) : requests && requests.length > 0 ? (
        <IntroductionRequestList
          requests={requests}
          pending={respond.isPending}
          onRespond={(requestId, approve) =>
            respond.mutate({ requestId, approve })
          }
        />
      ) : (
        <EmptyState
          ocid="discovery.introductions.empty_state"
          title="No introduction requests yet"
          description="When you request an introduction, or another party requests one from you, it will appear here for approval."
        />
      )}

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="size-3.5 shrink-0" aria-hidden="true" />
        Private contact details stay hidden until both parties approve.
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

/**
 * Discovery — Find Collaborators. The opt-in directory where communities and
 * members publish skills, interests, needs and partnership opportunities,
 * with recommendations, introduction requests and a clear opt-in control.
 */
export default function DiscoveryCollaboratorsPage() {
  return (
    <DiscoveryShell
      title="Find Collaborators"
      description="An opt-in directory of communities and members with shared goals. Publish what you offer, discover who aligns, and request an introduction — private contact details are shared only when both parties approve."
    >
      <OptInPanel />

      <section
        data-ocid="discovery.directory_section"
        aria-label="Community and opportunity directory"
        className="flex flex-col gap-3"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" aria-hidden="true" />
          <h2 className="font-display text-base font-medium tracking-tight text-foreground">
            Community &amp; opportunity directory
          </h2>
        </div>
        <DiscoveryDirectory />
      </section>

      <RecommendationsSection />

      <IntroductionsSection />
    </DiscoveryShell>
  );
}
