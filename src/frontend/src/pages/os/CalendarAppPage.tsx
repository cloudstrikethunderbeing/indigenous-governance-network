import { CalendarDays, ChevronLeft, ChevronRight, List } from "lucide-react";
import { useMemo, useState } from "react";

import OsAppPage from "@/components/os/OsAppPage";
import { useActiveNation } from "@/components/os/attachments/useActiveNation";
import CalendarAgendaView from "@/components/os/calendar/CalendarAgendaView";
import CalendarEventDetail from "@/components/os/calendar/CalendarEventDetail";
import CalendarMonthView from "@/components/os/calendar/CalendarMonthView";
import {
  addMonths,
  dayKey,
  formatMonthLabel,
  formatShortDate,
  formatTimeRange,
  parseEventDate,
  sortEventsByStart,
  startOfMonth,
} from "@/components/os/calendar/calendarUtils";
import { sampleEvents } from "@/data/sampleNation";
import type { SampleEvent } from "@/data/sampleNation";

type CalendarView = "month" | "agenda";

/**
 * The Calendar app: a month grid and an agenda of the sample Nation's events,
 * with a full detail view for a single event.
 */
export default function CalendarAppPage() {
  const today = useMemo(() => new Date(), []);
  const { nationId, readOnly } = useActiveNation();
  const [view, setView] = useState<CalendarView>("month");
  const [monthDate, setMonthDate] = useState(() => startOfMonth(today));
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<SampleEvent | null>(null);

  const upcoming = useMemo(() => sortEventsByStart(sampleEvents), []);

  const selectedDayEvents = useMemo(() => {
    if (!selectedDayKey) return [];
    return upcoming.filter((event) => {
      const start = parseEventDate(event.startTime);
      return start ? dayKey(start) === selectedDayKey : false;
    });
  }, [selectedDayKey, upcoming]);

  const selectedDayDate = useMemo(() => {
    if (!selectedDayKey) return null;
    const match = upcoming.find((event) => {
      const start = parseEventDate(event.startTime);
      return start ? dayKey(start) === selectedDayKey : false;
    });
    return match ? parseEventDate(match.startTime) : null;
  }, [selectedDayKey, upcoming]);

  return (
    <OsAppPage appKey="calendar">
      {selectedEvent ? (
        <CalendarEventDetail
          event={selectedEvent}
          nation={nationId}
          readOnly={readOnly}
          onBack={() => setSelectedEvent(null)}
        />
      ) : (
        <div className="space-y-4">
          <header className="space-y-2">
            <p className="text-stamp text-accent">Calendar</p>
            <h2 className="font-display text-2xl font-medium tracking-tight text-foreground">
              Upcoming events
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Meetings, gatherings and community events for the Nation. Open an
              event to read its full description and location.
            </p>
            <div className="rule-accent" />
          </header>

          <div
            role="tablist"
            aria-label="Calendar view"
            className="inline-flex rounded-lg border border-border bg-muted p-1"
          >
            <button
              type="button"
              role="tab"
              data-ocid="os.calendar.month_tab"
              aria-selected={view === "month"}
              onClick={() => setView("month")}
              className={[
                "os-focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-md px-4 text-sm font-medium transition-smooth",
                view === "month"
                  ? "bg-card text-foreground shadow-subtle"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              Month
            </button>
            <button
              type="button"
              role="tab"
              data-ocid="os.calendar.agenda_tab"
              aria-selected={view === "agenda"}
              onClick={() => setView("agenda")}
              className={[
                "os-focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-md px-4 text-sm font-medium transition-smooth",
                view === "agenda"
                  ? "bg-card text-foreground shadow-subtle"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              <List className="h-4 w-4" aria-hidden="true" />
              Agenda
            </button>
          </div>

          {view === "month" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  data-ocid="os.calendar.prev_month_button"
                  onClick={() =>
                    setMonthDate((current) => addMonths(current, -1))
                  }
                  aria-label="Previous month"
                  className="os-focus-ring inline-flex h-11 w-11 items-center justify-center rounded-md border border-border bg-card text-foreground transition-smooth hover:bg-muted"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <p
                  data-ocid="os.calendar.month_label"
                  className="font-display text-lg font-medium text-foreground"
                >
                  {formatMonthLabel(monthDate)}
                </p>
                <button
                  type="button"
                  data-ocid="os.calendar.next_month_button"
                  onClick={() =>
                    setMonthDate((current) => addMonths(current, 1))
                  }
                  aria-label="Next month"
                  className="os-focus-ring inline-flex h-11 w-11 items-center justify-center rounded-md border border-border bg-card text-foreground transition-smooth hover:bg-muted"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <CalendarMonthView
                monthDate={monthDate}
                events={upcoming}
                today={today}
                selectedDayKey={selectedDayKey}
                onSelectDay={(key) =>
                  setSelectedDayKey((current) => (current === key ? null : key))
                }
                onSelectEvent={setSelectedEvent}
              />

              {selectedDayKey ? (
                <section
                  data-ocid="os.calendar.day_panel"
                  className="shell-panel-alt space-y-3 p-4"
                >
                  <h3 className="font-display text-base font-medium text-foreground">
                    {selectedDayDate
                      ? formatShortDate(selectedDayDate)
                      : "Selected day"}
                  </h3>
                  {selectedDayEvents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No events on this day.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {selectedDayEvents.map((event) => (
                        <li key={event.id}>
                          <button
                            type="button"
                            data-ocid={`os.calendar.day_event.${event.id}`}
                            onClick={() => setSelectedEvent(event)}
                            className="os-focus-ring flex w-full min-h-[44px] flex-col items-start gap-0.5 rounded-md border border-border bg-card px-3 py-2 text-left transition-smooth hover:border-primary/50"
                          >
                            <span className="text-sm font-medium text-foreground">
                              {event.title}
                            </span>
                            <span className="text-tabular text-xs text-muted-foreground">
                              {formatTimeRange(event)} · {event.location}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ) : null}
            </div>
          ) : (
            <CalendarAgendaView
              events={upcoming}
              onSelectEvent={setSelectedEvent}
            />
          )}
        </div>
      )}
    </OsAppPage>
  );
}
