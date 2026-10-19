import { CurrencyText } from '@/components/shared/currency-text'
import { DateText } from '@/components/shared/date-text'
import { EmptyState } from '@/components/shared/empty-state'
import { StatusBadge } from '@/components/shared/status-badge'
import type { Invoice } from '@/features/dashboard/api'

export function MyInvoices({ items }: { items: Invoice[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="Belum ada tagihan"
        description="Tagihan yang belum lunas akan muncul di sini."
      />
    )
  }

  return (
    <ul className="flex flex-col divide-y-2 divide-border border-y-2 border-border">
      {items.map((invoice) => (
        <li key={invoice.id} className="flex items-center gap-4 py-3">
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-heading">{invoice.code}</span>
            <span className="text-xs text-foreground/70">
              Periode {invoice.periodMonth}/{invoice.periodYear}
            </span>
          </div>
          <DateText
            value={invoice.dueDate}
            className="hidden text-xs text-foreground/70 sm:block"
          />
          <div className="flex shrink-0 items-center gap-3">
            <CurrencyText
              value={invoice.totalAmount - invoice.paidAmount}
              className="font-heading text-sm"
            />
            <StatusBadge status={invoice.status} />
          </div>
        </li>
      ))}
    </ul>
  )
}
