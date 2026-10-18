import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const TONES = {
  orange: 'bg-accent-orange text-foreground',
  cream: 'bg-background text-foreground',
  teal: 'bg-accent-teal text-foreground',
  red: 'bg-danger text-main-foreground',
  ink: 'bg-foreground text-background',
} as const

export type StatusTone = keyof typeof TONES

const STATUS_TONE: Record<string, StatusTone> = {
  PENDING: 'orange',
  ISSUED: 'orange',
  REQUESTED: 'orange',
  PLANNED: 'orange',
  SCHEDULED: 'orange',
  DRAFT: 'ink',

  PARTIAL: 'cream',
  UPLOADED: 'cream',
  ONGOING: 'cream',
  CHECKOUT: 'cream',
  OPEN: 'cream',
  IZIN: 'cream',

  ACTIVE: 'teal',
  PAID: 'teal',
  VERIFIED: 'teal',
  APPROVED: 'teal',
  DONE: 'teal',
  CLOSED: 'teal',
  COMPLETED: 'teal',
  SUCCESS: 'teal',
  HADIR: 'teal',

  OVERDUE: 'red',
  REJECTED: 'red',
  FAILED: 'red',
  EXPIRED: 'red',
  TIDAK: 'red',

  VOID: 'ink',
  INACTIVE: 'ink',
  CANCELLED: 'ink',
  ENDED: 'ink',
  ARCHIVED: 'ink',
  SUSPENDED: 'ink',
}

export function statusTone(status: string): StatusTone {
  return STATUS_TONE[status.toUpperCase()] ?? 'ink'
}

function defaultLabel(status: string): string {
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^\w/, (char) => char.toUpperCase())
}

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: string
  label?: string
  className?: string
}) {
  const tone = statusTone(status)
  return (
    <Badge
      className={cn(
        'gap-1.5 font-heading tracking-wide uppercase',
        TONES[tone],
        className,
      )}
    >
      <span className="size-2 rounded-[2px] bg-current" aria-hidden="true" />
      {label ?? defaultLabel(status)}
    </Badge>
  )
}
