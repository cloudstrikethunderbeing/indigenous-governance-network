import { MapPin } from "lucide-react";

import type { SampleEvent } from "@/data/sampleNation";

import {
  formatShortDate,
  formatTimeRange,
  parseEventDate,
  sortEventsByStart,
} from "@/components/os/calendar/calendarUtils";

/**
 * A vertical agenda of the sample Nation's events, grouped by day. Each row is
 * a full-width button that opens the event detail.
 */
export default function CalendarAgendaView({
  events,
  onSelectEvent,
}: {
  events: SampleEvent[];
  onSelectEvent: (event: SampleEvent) => void;
}) {
  const sorted = sortEventsByStart(events);

  if (sorted.length === 0) {
    return (
      <div
        data-ocid="os.calendar.agenda_empty_state"
        className="shell-panel-alt px-4 py-10 text-center"
      >
        <p className="font-display text-base font-medium text-foreground">
          No events scheduled
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          The sample Nation has no upcoming events to show.
        </p>
      </div>
    );
  }

  return (
    <ul data-ocid="os.calendar.agenda_list" className="space-y-3">
      {sorted.map((event) => {
        const start = parseEventDate(event.startTime);
        return (
          <li key={event.id}>
            <button
              type="button"
              data-ocid={`os.calendar.agenda_item.${event.id}`}
              onClick={() => onSelectEvent(event)}
              className="os-focus-ring shell-panel flex w-full min-h-[44px] items-start gap-3 p-4 text-left transition-smooth hover:border-primary/50"
            >
              <div className="flex w-16 shrink-0 flex-col items-center rounded-md bg-muted px-2 py-1.5">
                <span className="text-stamp text-muted-foreground">
                  {start
                    ? start.toLocaleDateString(undefined, { month: "short" })
                    : "—"}
                </span>
                <span className="font-display text-lg font-medium leading-none text-foreground">
                  {start ? start.getDate() : "?"}
                </span>
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <h3 className="font-display text-base font-medium text-foreground">
                  {event.title}
                </h3>
                <p className="text-tabular text-xs text-muted-foreground">
                  {start ? formatShortDate(start) : "Date to be confirmed"} ·{" "}
                  {formatTimeRange(event)}
                </p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{event.location}</span>
                </p>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
