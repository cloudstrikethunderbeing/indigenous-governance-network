import type { SampleEvent } from "@/data/sampleNation";

import {
  buildMonthGrid,
  formatTime,
  parseEventDate,
  weekdayLabels,
} from "@/components/os/calendar/calendarUtils";

/**
 * A month grid of the sample Nation's events. Each day cell is a button so the
 * whole cell is a comfortable tap target; days with events show a compact
 * event chip that opens the event detail.
 */
export default function CalendarMonthView({
  monthDate,
  events,
  today,
  selectedDayKey,
  onSelectDay,
  onSelectEvent,
}: {
  monthDate: Date;
  events: SampleEvent[];
  today: Date;
  selectedDayKey: string | null;
  onSelectDay: (dayKey: string) => void;
  onSelectEvent: (event: SampleEvent) => void;
}) {
  const days = buildMonthGrid(monthDate, events, today);

  return (
    <div data-ocid="os.calendar.month_view" className="space-y-2">
      <div className="grid grid-cols-7 gap-1">
        {weekdayLabels.map((label) => (
          <div
            key={label}
            className="text-stamp py-1 text-center text-muted-foreground"
          >
            {label.slice(0, 1)}
            <span className="sr-only">{label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isSelected = day.key === selectedDayKey;
          const hasEvents = day.events.length > 0;
          return (
            <div
              key={day.key}
              className={[
                "min-h-[64px] rounded-md border p-1 transition-smooth sm:min-h-[92px]",
                day.inMonth
                  ? "border-border bg-card"
                  : "border-transparent bg-muted/40",
                isSelected ? "ring-2 ring-primary" : "",
              ].join(" ")}
            >
              <button
                type="button"
                data-ocid={`os.calendar.day.${day.key}`}
                onClick={() => onSelectDay(day.key)}
                aria-label={`${day.date.toLocaleDateString(undefined, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}${hasEvents ? `, ${day.events.length} event${day.events.length === 1 ? "" : "s"}` : ", no events"}`}
                aria-pressed={isSelected}
                className={[
                  "os-focus-ring flex min-h-[44px] w-full items-center justify-center rounded text-xs font-semibold transition-smooth",
                  day.inMonth ? "text-foreground" : "text-muted-foreground",
                  day.isToday
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted",
                ].join(" ")}
              >
                {day.date.getDate()}
              </button>

              <div className="mt-1 space-y-1">
                {day.events.slice(0, 2).map((event) => {
                  const start = parseEventDate(event.startTime);
                  return (
                    <button
                      key={event.id}
                      type="button"
                      data-ocid={`os.calendar.month_event.${event.id}`}
                      onClick={() => onSelectEvent(event)}
                      className="os-focus-ring block w-full truncate rounded bg-accent/15 px-1 py-0.5 text-left text-[0.65rem] font-medium leading-tight text-accent-foreground transition-smooth hover:bg-accent/25"
                    >
                      <span className="hidden sm:inline">
                        {start ? `${formatTime(start)} ` : ""}
                      </span>
                      {event.title}
                    </button>
                  );
                })}
                {day.events.length > 2 ? (
                  <p className="px-1 text-[0.6rem] font-medium text-muted-foreground">
                    +{day.events.length - 2} more
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
