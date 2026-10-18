import { cn, formatRupiah } from '@/lib/utils'

export function CurrencyText({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  return <span className={cn('tabular-nums', className)}>{formatRupiah(value)}</span>
}
