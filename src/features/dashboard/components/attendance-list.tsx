import { DateText } from '@/components/shared/date-text'
import { EmptyState } from '@/components/shared/empty-state'
import { StatusBadge } from '@/components/shared/status-badge'
import type { Attendance } from '@/features/dashboard/api'

export function AttendanceList({ items }: { items: Attendance[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="Belum ada catatan absensi"
        description="Kehadiranmu pada sesi kegiatan akan tercatat di sini."
      />
    )
  }

  return (
    <ul className="flex flex-col divide-y-2 divide-border border-y-2 border-border">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-4 py-3">
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-heading">{item.session.title}</span>
            <DateText
              value={item.session.scheduledAt}
              withTime
              className="text-xs text-foreground/70"
            />
          </div>
          <StatusBadge status={item.status} />
        </li>
      ))}
    </ul>
  )
}
