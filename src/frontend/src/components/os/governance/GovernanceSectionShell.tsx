import type { ReactNode } from "react";

import {
  type GovernanceSectionKey,
  type GovernanceViewKey,
  governanceSections,
  viewsForSection,
} from "@/components/os/governance/governanceSections";

/**
 * The shared Governance section shell: a four-section rail (Our Rules,
 * Decisions, Members, Activity) that switches the section body. It is the only
 * top-level navigation inside Governance — the governance views live inside
 * these four sections and appear as a secondary row of tabs beneath the rail.
 *
 * On mobile the rail becomes a horizontal, scroll-free row of large buttons;
 * on desktop it is a vertical rail beside the section body.
 */
export default function GovernanceSectionShell({
  active,
  onSelect,
  activeView,
  onSelectView,
  children,
}: {
  active: GovernanceSectionKey;
  onSelect: (section: GovernanceSectionKey) => void;
  /** The view currently shown inside the active section. */
  activeView?: GovernanceViewKey;
  /** Switch to another view inside the active section. */
  onSelectView?: (view: GovernanceViewKey) => void;
  children: ReactNode;
}) {
  const sectionViews = viewsForSection(active);
  const showViewTabs = sectionViews.length > 1 && !!onSelectView;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
      <nav
        data-ocid="os.governance.section_rail"
        aria-label="Governance sections"
        className="gov-section-rail -mx-4 flex gap-2 overflow-x-auto px-4 py-2 lg:mx-0 lg:flex-col lg:gap-1.5 lg:overflow-visible lg:rounded-xl lg:border lg:border-border lg:px-2 lg:py-3"
      >
        {governanceSections.map((section) => {
          const isActive = section.key === active;
          return (
            <button
              key={section.key}
              type="button"
              data-ocid={`os.governance.section_tab.${section.key}`}
              aria-current={isActive ? "page" : undefined}
              onClick={() => onSelect(section.key)}
              className={`gov-section-tab os-focus-ring shrink-0 lg:w-full ${
                isActive ? "gov-section-tab-active" : ""
              }`}
            >
              <section.icon className="size-5 shrink-0" aria-hidden="true" />
              <span className="whitespace-nowrap lg:whitespace-normal">
                {section.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div
        data-ocid={`os.governance.section.${active}`}
        className="min-w-0 animate-fade-up"
      >
        {showViewTabs ? (
          <nav
            data-ocid="os.governance.view_rail"
            aria-label="Views in this section"
            className="gov-step-rail mb-4 flex gap-2 overflow-x-auto pb-1"
          >
            {sectionViews.map((view) => {
              const isActive = view.key === activeView;
              return (
                <button
                  key={view.key}
                  type="button"
                  data-ocid={`os.governance.view_tab.${view.key}`}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => onSelectView?.(view.key)}
                  className={`os-focus-ring inline-flex min-h-[44px] shrink-0 items-center rounded-full border px-4 py-2 text-sm font-medium transition-smooth ${
                    isActive
                      ? "border-accent/60 bg-accent/15 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {view.label}
                </button>
              );
            })}
          </nav>
        ) : null}

        {children}
      </div>
    </div>
  );
}
