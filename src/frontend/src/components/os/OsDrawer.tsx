import { Link } from "@tanstack/react-router";
import { Home } from "lucide-react";

import OsStatusMarker from "@/components/os/OsStatusMarker";
import { topLevelApps } from "@/components/os/appRegistry";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

/**
 * The mobile slide-in drawer listing every app, opened from the bottom bar.
 * The header stays pinned while the app list scrolls beneath it, so every row
 * (including the last app and Home) stays reachable and tappable. Rows are
 * 44px nav items with a status marker.
 */
export default function OsDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        data-ocid="os.drawer"
        className="os-drawer w-72 gap-0 overflow-hidden p-0"
      >
        <SheetHeader className="os-drawer-header">
          <SheetTitle className="font-display">SOVEREIGN OS</SheetTitle>
        </SheetHeader>
        <div
          data-ocid="os.drawer.scroll"
          className="os-drawer-scroll flex flex-col gap-1 px-4 pt-2"
        >
          <Link
            to="/os"
            data-ocid="os.drawer.home_link"
            onClick={() => onOpenChange(false)}
            className="nav-item os-focus-ring"
            activeProps={{ className: "nav-item nav-item-active" }}
            activeOptions={{ exact: true }}
          >
            <Home className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">Home</span>
          </Link>
          <nav aria-label="All apps" className="flex flex-col gap-1">
            {topLevelApps.map((app) => (
              <Link
                key={app.key}
                to={app.to}
                data-ocid={`os.drawer_link.${app.key}`}
                onClick={() => onOpenChange(false)}
                className="nav-item os-focus-ring"
                activeProps={{ className: "nav-item nav-item-active" }}
              >
                <app.icon className="size-4 shrink-0" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">{app.label}</span>
                <OsStatusMarker status={app.status} />
              </Link>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
