import { CalendarDays, MapPin } from 'lucide-react'

import { DateText } from '@/components/shared/date-text'
import { EmptyState } from '@/components/shared/empty-state'
import { Badge } from '@/components/ui/badge'
import type { Event } from '@/features/dashboard/api'

export function UpcomingEvents({ events }: { events: Event[] }) {
  if (events.length === 0) {
    return (
      <EmptyState
        title="Belum ada kegiatan terjadwal"
        description="Kegiatan yang akan datang akan muncul di sini."
      />
    )
  }

  return (
    <ul className="flex flex-col divide-y-2 divide-border border-y-2 border-border">
      {events.map((event) => (
        <li key={event.id} className="flex items-start gap-4 py-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-base border-2 border-border bg-accent-teal text-foreground">
            <CalendarDays className="size-5" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate font-heading">{event.title}</span>
              <Badge>{event.category}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground/70">
              <DateText value={event.startAt} withTime />
              {event.location ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {event.location}
                </span>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
