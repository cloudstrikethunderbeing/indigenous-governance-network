import { type Bell, CheckCircle2, Info, Vote } from "lucide-react";

import { sampleNationNotice } from "@/data/sampleNation";

/** One illustrative notification shown in the workspace notifications panel. */
interface OsNotification {
  id: string;
  title: string;
  body: string;
  icon: typeof Bell;
  tone: "info" | "action" | "done";
}

/**
 * Illustrative notifications for the sample workspace. They are clearly
 * labelled sample data and never claim real activity.
 */
const notifications: OsNotification[] = [
  {
    id: "n1",
    title: "A proposal is open for review",
    body: "The community data-control charter is awaiting community review.",
    icon: Vote,
    tone: "action",
  },
  {
    id: "n2",
    title: "Council session scheduled",
    body: "The monthly governance session is on the calendar.",
    icon: Info,
    tone: "info",
  },
  {
    id: "n3",
    title: "Workspace ready",
    body: "Your sample Nation workspace is set up and ready to explore.",
    icon: CheckCircle2,
    tone: "done",
  },
];

const toneClass: Record<OsNotification["tone"], string> = {
  info: "text-muted-foreground",
  action: "text-accent",
  done: "text-success",
};

/**
 * The workspace notifications panel. Every entry is illustrative sample data,
 * disclosed as such, so a visitor never mistakes it for real activity.
 */
export default function OsNotificationsPanel() {
  return (
    <div data-ocid="os.notifications_panel" className="space-y-3">
      <p
        data-ocid="os.notifications_panel.sample_notice"
        className="rounded-md border border-dashed border-accent bg-accent/10 px-3 py-2 text-xs font-medium text-accent-foreground"
      >
        {sampleNationNotice}
      </p>
      <ul data-ocid="os.notifications_panel.list" className="space-y-1">
        {notifications.map((notification) => (
          <li
            key={notification.id}
            data-ocid={`os.notifications_panel.item.${notification.id}`}
            className="flex items-start gap-3 rounded-md border border-border bg-card p-3"
          >
            <notification.icon
              className={`mt-0.5 size-4 shrink-0 ${toneClass[notification.tone]}`}
              aria-hidden="true"
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-foreground">
                {notification.title}
              </span>
              <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                {notification.body}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
