import { Link } from "@tanstack/react-router";
import { Home, LayoutGrid } from "lucide-react";

import { dockApps } from "@/components/os/appRegistry";

/**
 * The mobile bottom bar: a Home control, the most-used apps and a control that
 * opens the slide-in drawer. Every target is at least 44px.
 */
export default function OsMobileBar({
  onOpenDrawer,
}: {
  onOpenDrawer: () => void;
}) {
  const barApps = dockApps.slice(0, 4);
  return (
    <nav
      aria-label="Mobile navigation"
      data-ocid="os.mobile_bar"
      className="os-bottom-bar fixed inset-x-0 bottom-0 z-40 flex items-center justify-around px-2 py-1.5 md:hidden"
    >
      <Link
        to="/os"
        data-ocid="os.mobile_bar.home_button"
        aria-label="Home — return to the desktop"
        className="os-focus-ring flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-lg px-2 text-foreground"
      >
        <Home className="size-5" aria-hidden="true" />
        <span className="text-[0.6rem] font-medium">Home</span>
      </Link>
      {barApps.map((app) => (
        <Link
          key={app.key}
          to={app.to}
          data-ocid={`os.mobile_bar.item.${app.key}`}
          aria-label={app.label}
          className="os-focus-ring flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-lg px-2 text-foreground"
        >
          <app.icon className="size-5" aria-hidden="true" />
          <span className="max-w-[3.5rem] truncate text-[0.6rem] font-medium">
            {app.label}
          </span>
        </Link>
      ))}
      <button
        type="button"
        data-ocid="os.mobile_bar.drawer_button"
        aria-label="Open all apps"
        onClick={onOpenDrawer}
        className="os-focus-ring flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-lg px-2 text-foreground"
      >
        <LayoutGrid className="size-5" aria-hidden="true" />
        <span className="text-[0.6rem] font-medium">Apps</span>
      </button>
    </nav>
  );
}
