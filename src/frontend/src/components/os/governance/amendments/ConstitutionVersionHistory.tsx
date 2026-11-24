import { History, ScrollText } from "lucide-react";

import type { ConstitutionVersion } from "@/backend";
import { formatAuthor } from "@/components/os/discussions/discussionFormat";

/** Convert a backend nanosecond timestamp to a readable date, or null. */
function formatTimestamp(timestamp: bigint): string | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * The constitution version history: every ratified version, newest first, with
 * its amendment summary, the authority that authorized it and its date. The
 * version currently in force is marked, and the note makes clear that a change
 * only takes effect after ratification while the previous version stays in
 * history.
 */
export default function ConstitutionVersionHistory({
  versions,
  isLoading,
  isError,
  onRetry,
}: {
  versions: ConstitutionVersion[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  if (isLoading) {
    return (
      <section
        data-ocid="os.governance.amendments.versions_loading"
        aria-busy="true"
        className="space-y-3"
      >
        {Array.from({ length: 2 }, (_, i) => `version-skeleton-${i}`).map(
          (id) => (
            <div
              key={id}
              className="shell-panel h-24 animate-pulse bg-muted/40"
            />
          ),
        )}
      </section>
    );
  }

  if (isError) {
    return (
      <section
        data-ocid="os.governance.amendments.versions_error"
        role="alert"
        className="shell-panel space-y-3 p-5"
      >
        <p className="font-display text-base font-medium text-foreground">
          The version history could not be loaded.
        </p>
        <p className="text-sm text-muted-foreground">
          Check your connection and try again.
        </p>
        <button
          type="button"
          data-ocid="os.governance.amendments.versions_retry_button"
          onClick={onRetry}
          className="os-focus-ring inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-smooth hover:opacity-90"
        >
          Try again
        </button>
      </section>
    );
  }

  if (versions.length === 0) {
    return (
      <section
        data-ocid="os.governance.amendments.versions_empty_state"
        className="shell-panel space-y-2 p-5"
      >
        <p className="font-display text-base font-medium text-foreground">
          No ratified versions yet
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          When an amendment is ratified, the new version of the constitution
          will be recorded here.
        </p>
      </section>
    );
  }

  const ordered = [...versions].sort((a, b) =>
    a.version < b.version ? 1 : a.version > b.version ? -1 : 0,
  );
  const latestVersion = ordered[0]?.version;

  return (
    <section
      data-ocid="os.governance.amendments.versions"
      aria-label="Constitution version history"
      className="space-y-4"
    >
      <header className="flex items-start gap-3">
        <span className="os-icon-glyph size-10 shrink-0" aria-hidden="true">
          <History className="size-5" />
        </span>
        <div className="min-w-0 space-y-1">
          <p className="text-stamp text-accent">Version history</p>
          <h3 className="font-display text-lg font-medium tracking-tight text-foreground">
            Every version, kept for good
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            A change takes effect only after it is ratified. The previous
            version stays in this history, so the record is never lost.
          </p>
        </div>
      </header>

      <ol className="space-y-3">
        {ordered.map((version, index) => {
          const isCurrent = version.version === latestVersion;
          const ratifiedOn = formatTimestamp(version.timestamp);
          const effectiveOn = formatTimestamp(version.effectiveDate);
          return (
            <li
              key={version.id.toString()}
              data-ocid={`os.governance.amendments.version.${index + 1}`}
              className="shell-panel space-y-2 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="gov-role-chip">
                  <ScrollText className="size-3.5" aria-hidden="true" />
                  Version {version.version.toString()}
                </span>
                {isCurrent ? (
                  <span className="gov-role-chip">In force</span>
                ) : null}
                <span className="text-stamp text-muted-foreground">
                  {ratifiedOn ?? "Date unavailable"}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-foreground">
                {version.producedByAmendment !== undefined
                  ? `Produced by amendment #${version.producedByAmendment.toString()}.`
                  : "The founding version of the constitution."}
              </p>
              <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <div className="min-w-0">
                  <dt className="text-stamp text-muted-foreground">
                    Authorizing authority
                  </dt>
                  <dd className="break-words font-medium text-foreground">
                    {formatAuthor(version.authorizingAuthority)}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-stamp text-muted-foreground">
                    Effective
                  </dt>
                  <dd className="font-medium text-foreground">
                    {effectiveOn ?? "—"}
                  </dd>
                </div>
              </dl>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
