import { Link } from "@tanstack/react-router";

import Home from "@/pages/Home";

/**
 * The complete existing $500,000 fundraising one-pager, moved from "/" to
 * "/500k" with all content, sections and functionality preserved unchanged.
 *
 * The slim nameplate links back to the new Deploy Your Own DAO landing page and
 * into the DAO & Economy area.
 */
export default function FundraisingPage() {
  return (
    <div data-ocid="page.fundraising" className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur">
        <nav
          aria-label="Primary"
          className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-6 py-3"
        >
          <Link
            to="/"
            data-ocid="nav.home"
            className="text-stamp text-foreground transition-smooth hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Sovereign
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/dao/participation"
              data-ocid="nav.participation_economy"
              className="hidden rounded-md border border-border px-4 py-2 text-stamp text-foreground transition-smooth hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:inline-block"
            >
              Participation Economy
            </Link>
            <Link
              to="/dao"
              data-ocid="nav.enter_dao"
              className="rounded-md border border-primary px-4 py-2 text-stamp text-primary transition-smooth hover:bg-primary hover:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Enter SOVEREIGN DAO &amp; Economy →
            </Link>
          </div>
        </nav>
      </header>
      <Home />
    </div>
  );
}
