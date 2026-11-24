import { Search } from "lucide-react";
import { useState } from "react";

import { DirectoryEntryKind } from "@/backend";
import EmptyState from "@/components/discovery/EmptyState";
import { useSearchDirectory } from "@/hooks/useDiscovery";

const KIND_LABEL: Record<DirectoryEntryKind, string> = {
  community: "Community",
  opportunity: "Opportunity",
};

/**
 * The opt-in directory where communities and members publish skills,
 * interests, project needs and partnership opportunities. Search is performed
 * against stored backend data.
 */
export default function DiscoveryDirectory() {
  const [term, setTerm] = useState("");
  const [kind, setKind] = useState<DirectoryEntryKind | null>(null);
  const { data: entries, isLoading } = useSearchDirectory(term, kind);

  return (
    <section
      data-ocid="discovery.directory"
      aria-label="Collaborator directory"
      className="flex flex-col gap-3"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            data-ocid="discovery.directory.search_input"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search skills, interests or needs…"
            aria-label="Search the collaborator directory"
            className="w-full rounded-full border border-input bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            data-ocid="discovery.directory.filter.all_tab"
            aria-pressed={kind === null}
            onClick={() => setKind(null)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-smooth focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
              kind === null
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-foreground hover:bg-muted"
            }`}
          >
            All
          </button>
          {Object.values(DirectoryEntryKind).map((value) => (
            <button
              key={value}
              type="button"
              data-ocid={`discovery.directory.filter.${value}_tab`}
              aria-pressed={kind === value}
              onClick={() => setKind(value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-smooth focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                kind === value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-foreground hover:bg-muted"
              }`}
            >
              {KIND_LABEL[value]}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p
          data-ocid="discovery.directory.loading_state"
          className="text-sm text-muted-foreground"
        >
          Searching the directory…
        </p>
      ) : entries && entries.length > 0 ? (
        <ul
          data-ocid="discovery.directory.list"
          className="network-panel divide-y divide-border"
        >
          {entries.map((entry, index) => (
            <li
              key={`${entry.kind}-${entry.referenceId.toString()}`}
              data-ocid={`discovery.directory_row.${index}`}
              className="flex flex-col gap-1 px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <span className="network-chip">{KIND_LABEL[entry.kind]}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                  {entry.title}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {entry.description}
              </p>
              {entry.tags.length > 0 ? (
                <ul className="flex flex-wrap gap-1.5">
                  {entry.tags.map((tag) => (
                    <li key={tag} className="network-chip">
                      {tag}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          ocid="discovery.directory.empty_state"
          title="No published profiles yet"
          description="Be the first to publish your community's skills, interests and needs so others can find you."
        />
      )}
    </section>
  );
}
