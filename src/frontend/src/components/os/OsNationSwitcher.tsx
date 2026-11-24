import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";

import { useMyNations } from "@/hooks/useSovereign";

/**
 * The Nation switcher, offered only to a signed-in user who is an authorized
 * member of more than one Nation. It reads the caller's own Nations from the
 * canister and lets them pick which one the workspace represents. A visitor
 * with no Nations, or with a single Nation, sees nothing.
 */
export default function OsNationSwitcher({
  activeNationId,
  onSelect,
}: {
  activeNationId: bigint;
  onSelect: (nationId: bigint) => void;
}) {
  const { data: nations } = useMyNations();
  const [open, setOpen] = useState(false);

  // Nation switching is offered only when there is a real choice to make.
  if (!nations || nations.length < 2) return null;

  const active = nations.find((nation) => nation.id === activeNationId);

  return (
    <div className="relative">
      <button
        type="button"
        data-ocid="os.nation_switcher.button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="os-focus-ring flex min-h-[44px] items-center gap-2 rounded-full border border-border bg-card py-1 pl-2 pr-3 text-xs font-medium text-foreground transition-smooth hover:border-primary/50"
      >
        <span
          aria-hidden="true"
          className="flex size-6 items-center justify-center rounded-full bg-primary font-mono text-[0.6rem] font-semibold text-primary-foreground"
        >
          {(active?.name ?? "N").slice(0, 2).toUpperCase()}
        </span>
        <span className="max-w-[9rem] truncate">
          {active?.name ?? "Switch Nation"}
        </span>
        <ChevronDown className="size-3.5 shrink-0" aria-hidden="true" />
      </button>

      {open ? (
        <ul
          data-ocid="os.nation_switcher.menu"
          className="absolute right-0 z-40 mt-2 w-64 overflow-hidden rounded-lg border border-border bg-popover shadow-lg"
        >
          {nations.map((nation) => {
            const isActive = nation.id === activeNationId;
            return (
              <li key={nation.id.toString()}>
                <button
                  type="button"
                  data-ocid={`os.nation_switcher.option.${nation.id.toString()}`}
                  onClick={() => {
                    onSelect(nation.id);
                    setOpen(false);
                  }}
                  className="flex min-h-[44px] w-full items-center gap-3 px-3 py-2 text-left transition-smooth hover:bg-muted"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {nation.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {nation.region}
                    </span>
                  </span>
                  {isActive ? (
                    <Check
                      className="size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
