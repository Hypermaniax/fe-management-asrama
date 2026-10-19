import { CurrencyText } from '@/components/shared/currency-text'
import { DateText } from '@/components/shared/date-text'
import { EmptyState } from '@/components/shared/empty-state'
import { StatusBadge } from '@/components/shared/status-badge'
import type { ArrearsItem } from '@/features/dashboard/api'

export function ArrearsList({ items }: { items: ArrearsItem[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="Belum ada tunggakan"
        description="Semua tagihan periode ini sudah lunas."
      />
    )
  }

  return (
    <ul className="flex flex-col divide-y-2 divide-border border-y-2 border-border">
      {items.map((item) => (
        <li key={item.invoiceId} className="flex items-center gap-4 py-3">
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-heading">{item.userName}</span>
            <span className="truncate text-xs text-foreground/70">
              {item.code} · {item.periodMonth}/{item.periodYear} ·{' '}
              {item.buildingName}
            </span>
          </div>
          <DateText
            value={item.dueDate}
            className="hidden text-xs text-foreground/70 sm:block"
          />
          <div className="flex shrink-0 items-center gap-3">
            <CurrencyText
              value={item.outstanding}
              className="font-heading text-sm"
            />
            <StatusBadge status={item.status} />
          </div>
        </li>
      ))}
    </ul>
  )
}
