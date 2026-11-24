import { ArrowLeft, CalendarDays, Clock, MapPin } from "lucide-react";

import RecordAttachments from "@/components/os/attachments/RecordAttachments";
import { calendarEventTarget } from "@/components/os/attachments/attachmentTargets";
import { sampleAttachmentsFor } from "@/components/os/attachments/sampleAttachments";
import type { SampleEvent } from "@/data/sampleNation";

import {
  formatLongDate,
  formatTimeRange,
  parseEventDate,
} from "@/components/os/calendar/calendarUtils";

/**
 * The full detail view for a single calendar event: title, date, time, full
 * description and location, with a back action to the calendar. The event can
 * reference the Nation's stored files through the shared attachments surface.
 */
export default function CalendarEventDetail({
  event,
  nation,
  readOnly,
  onBack,
}: {
  event: SampleEvent;
  nation: bigint;
  readOnly: boolean;
  onBack: () => void;
}) {
  const start = parseEventDate(event.startTime);
  const target = calendarEventTarget(BigInt(event.id));

  return (
    <div data-ocid="os.calendar.event_detail" className="space-y-4">
      <button
        type="button"
        data-ocid="os.calendar.detail_back_button"
        onClick={onBack}
        className="os-focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-md px-2 text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to calendar
      </button>

      <article className="shell-panel space-y-4 p-5">
        <header className="space-y-2">
          <p className="text-stamp text-accent">Event</p>
          <h2 className="font-display text-2xl font-medium tracking-tight text-foreground">
            {event.title}
          </h2>
          <div className="rule-accent" />
        </header>

        <dl className="space-y-3">
          <div className="flex items-start gap-3">
            <CalendarDays
              className="mt-0.5 h-4 w-4 shrink-0 text-accent"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <dt className="text-stamp text-muted-foreground">Date</dt>
              <dd className="text-sm text-foreground">
                {start ? formatLongDate(start) : "Date to be confirmed"}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock
              className="mt-0.5 h-4 w-4 shrink-0 text-accent"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <dt className="text-stamp text-muted-foreground">Time</dt>
              <dd className="text-tabular text-sm text-foreground">
                {formatTimeRange(event)}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin
              className="mt-0.5 h-4 w-4 shrink-0 text-accent"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <dt className="text-stamp text-muted-foreground">Location</dt>
              <dd className="break-words text-sm text-foreground">
                {event.location}
              </dd>
            </div>
          </div>
        </dl>

        <div className="space-y-1 border-t border-border pt-4">
          <p className="text-stamp text-muted-foreground">Description</p>
          <p className="text-sm leading-relaxed text-foreground">
            {event.description}
          </p>
        </div>

        <RecordAttachments
          nation={nation}
          target={target}
          readOnly={readOnly}
          sampleAttachments={sampleAttachmentsFor(target)}
        />
      </article>
    </div>
  );
}
