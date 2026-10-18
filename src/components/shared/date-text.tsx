import { cn, formatDate, formatDateTime } from '@/lib/utils'

export function DateText({
  value,
  withTime = false,
  className,
}: {
  value: string | number | Date
  withTime?: boolean
  className?: string
}) {
  const date = new Date(value)
  return (
    <time dateTime={date.toISOString()} className={cn('tabular-nums', className)}>
      {withTime ? formatDateTime(value) : formatDate(value)}
    </time>
  )
}
