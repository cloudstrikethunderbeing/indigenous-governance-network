import { Link } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { topLevelApps } from "@/components/os/appRegistry";

/**
 * The workspace search surface: a search input that filters the registered OS
 * apps by name and description and links straight into the match. It searches
 * the app registry, so it always reflects the apps the workspace actually has.
 */
export default function OsSearchPanel() {
  const [term, setTerm] = useState("");

  const results = useMemo(() => {
    const query = term.trim().toLowerCase();
    if (query.length === 0) return topLevelApps;
    return topLevelApps.filter(
      (app) =>
        app.label.toLowerCase().includes(query) ||
        app.description.toLowerCase().includes(query),
    );
  }, [term]);

  return (
    <div data-ocid="os.search_panel" className="space-y-3">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          data-ocid="os.search_panel.input"
          placeholder="Search apps and documents…"
          aria-label="Search apps and documents"
          className="w-full rounded-lg border border-input bg-card py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        />
      </div>

      {results.length === 0 ? (
        <p
          data-ocid="os.search_panel.empty_state"
          className="rounded-md border border-dashed border-border px-3 py-4 text-center text-sm text-muted-foreground"
        >
          No apps match “{term}”. Try another word.
        </p>
      ) : (
        <ul data-ocid="os.search_panel.results" className="space-y-1">
          {results.map((app) => (
            <li key={app.key}>
              <Link
                to={app.to}
                data-ocid={`os.search_panel.result.${app.key}`}
                className="nav-item os-focus-ring"
              >
                <app.icon className="size-4 shrink-0" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {app.label}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {app.description}
                  </span>
                </span>
                <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
