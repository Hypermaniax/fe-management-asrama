import { useMemo, useState } from 'react'
import {
  Check,
  CircleDashed,
  Clock,
  TriangleAlert,
  X,
} from 'lucide-react'

import { CurrencyText } from '@/components/shared/currency-text'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import type { Invoice, InvoiceStatus } from '@/features/invoice/api'
import { useInvoices } from '@/features/invoice/hooks'
import { INVOICE_STATUS_LABELS } from '@/features/invoice/lib'
import { PaymentCellDialog } from '@/features/payment/components/payment-cell-dialog'
import { usePaymentSubmissions } from '@/features/payment/hooks'
import { MONTH_SHORT } from '@/features/payment/lib'
import { useResidents } from '@/features/resident/hooks'
import { cn, formatRupiah } from '@/lib/utils'

type MatrixCell = {
  invoice: Invoice
  totalAmount: number
  paidAmount: number
  outstanding: number
  status: InvoiceStatus
  pending: boolean
}

type MatrixRow = {
  id: string
  name: string
}

const MONTHS = MONTH_SHORT.map((label, index) => ({
  month: index + 1,
  label,
}))

export function PaymentMatrix({
  buildingId,
  year,
  canRecord,
  onRecord,
}: {
  buildingId: string
  year: number
  canRecord: boolean
  onRecord: (prefill: { userId: string; invoiceId?: string }) => void
}) {
  const invoices = useInvoices({ buildingId, year }, Boolean(buildingId))
  const residents = useResidents(buildingId)
  const submissions = usePaymentSubmissions({ status: 'PENDING' })

  const [search, setSearch] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [selected, setSelected] = useState<{
    invoice: Invoice
    residentName: string
  } | null>(null)

  const residentNames = useMemo(() => {
    const map = new Map<string, string>()
    for (const resident of residents.data ?? []) {
      map.set(resident.id, resident.name ?? resident.email)
    }
    return map
  }, [residents.data])

  const pendingInvoiceIds = useMemo(() => {
    const set = new Set<string>()
    for (const submission of submissions.data ?? []) {
      if (submission.status === 'PENDING') set.add(submission.invoiceId)
    }
    return set
  }, [submissions.data])

  const cells = useMemo(() => {
    const grouped = new Map<string, Invoice[]>()
    for (const invoice of invoices.data ?? []) {
      const key = `${invoice.userId}:${invoice.periodMonth}`
      const list = grouped.get(key) ?? []
      list.push(invoice)
      grouped.set(key, list)
    }

    const result = new Map<string, MatrixCell>()
    for (const [key, list] of grouped) {
      const active = list.filter((invoice) => invoice.status !== 'VOID')
      const effective = active.length > 0 ? active : list
      const totalAmount = effective.reduce(
        (sum, invoice) => sum + invoice.totalAmount,
        0,
      )
      const paidAmount = effective.reduce(
        (sum, invoice) => sum + invoice.paidAmount,
        0,
      )
      let status: InvoiceStatus = 'VOID'

      if (active.length > 0) {
        if (totalAmount > 0 && paidAmount >= totalAmount) status = 'PAID'
        else if (paidAmount > 0) status = 'PARTIAL'
        else if (active.some((invoice) => invoice.status === 'OVERDUE')) {
          status = 'OVERDUE'
        } else status = 'ISSUED'
      }

      result.set(key, {
        invoice: active[0] ?? list[0],
        totalAmount,
        paidAmount,
        outstanding:
          status === 'VOID'
            ? 0
            : Math.max(totalAmount - paidAmount, 0),
        status,
        pending: list.some((invoice) => pendingInvoiceIds.has(invoice.id)),
      })
    }
    return result
  }, [invoices.data, pendingInvoiceIds])

  const rows = useMemo(() => {
    const withInvoices = new Set(
      (invoices.data ?? []).map((invoice) => invoice.userId),
    )
    const seen = new Set<string>()
    const result: MatrixRow[] = []

    for (const resident of residents.data ?? []) {
      const include =
        showAll || resident.status === 'ACTIVE' || withInvoices.has(resident.id)
      if (!include || seen.has(resident.id)) continue
      seen.add(resident.id)
      result.push({
        id: resident.id,
        name: resident.name ?? resident.email,
      })
    }

    for (const userId of withInvoices) {
      if (seen.has(userId)) continue
      seen.add(userId)
      result.push({
        id: userId,
        name: residentNames.get(userId) ?? userId,
      })
    }

    const query = search.trim().toLowerCase()
    return result
      .filter((row) => !query || row.name.toLowerCase().includes(query))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [residents.data, invoices.data, residentNames, showAll, search])

  const loading = invoices.isLoading || residents.isLoading
  const error = invoices.error ?? residents.error

  if (!buildingId) {
    return (
      <EmptyState
        title="Pilih gedung"
        description="Rekap pembayaran membutuhkan satu gedung dan satu tahun."
      />
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-10 w-64 border-transparent bg-foreground/10" />
        <Skeleton className="h-64 w-full border-transparent bg-foreground/10" />
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        message={error.message}
        onRetry={() => {
          invoices.refetch()
          residents.refetch()
        }}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari penghuni..."
            aria-label="Cari penghuni"
            className="w-56 bg-secondary-background"
          />
          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={showAll}
              onCheckedChange={setShowAll}
              size="sm"
            />
            Tampilkan semua penghuni
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-foreground/70">
          <span className="flex items-center gap-1">
            <Check className="size-3.5 text-accent-teal" /> Lunas
          </span>
          <span>◐ Sebagian</span>
          <span className="flex items-center gap-1">
            <Clock className="size-3.5 text-accent-orange" /> Menunggu
          </span>
          <span className="flex items-center gap-1">
            <TriangleAlert className="size-3.5 text-danger" /> Tunggakan
          </span>
          <span className="flex items-center gap-1">
            <CircleDashed className="size-3.5" /> Belum bayar
          </span>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="Belum ada penghuni"
          description="Belum ada penghuni atau tagihan pada gedung dan tahun ini."
        />
      ) : (
        <div className="relative max-h-[70vh] overflow-auto rounded-base border-2 border-border">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 z-20">
              <tr>
                <th className="sticky left-0 z-30 min-w-48 border-r-2 border-b-2 border-border bg-accent-teal px-3 py-2 text-left font-heading">
                  Nama
                </th>
                {MONTHS.map(({ month, label }) => (
                  <th
                    key={month}
                    title={`${label} ${year}`}
                    className="min-w-16 border-r-2 border-b-2 border-border bg-accent-teal px-2 py-2 text-center font-heading last:border-r-0"
                  >
                    {label}
                  </th>
                ))}
                <th className="min-w-28 border-b-2 border-l-2 border-border bg-accent-teal px-3 py-2 text-right font-heading">
                  Dibayar
                </th>
                <th className="min-w-28 border-b-2 border-border bg-accent-teal px-3 py-2 text-right font-heading">
                  Tunggakan
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const rowCells = MONTHS.map(({ month }) =>
                  cells.get(`${row.id}:${month}`),
                )
                const rowPaid = rowCells.reduce(
                  (sum, cell) => sum + (cell?.paidAmount ?? 0),
                  0,
                )
                const rowOutstanding = rowCells.reduce(
                  (sum, cell) => sum + (cell?.outstanding ?? 0),
                  0,
                )

                return (
                  <tr key={row.id} className="group">
                    <th
                      scope="row"
                      className="sticky left-0 z-10 border-r-2 border-b-2 border-border bg-background px-3 py-2 text-left font-heading group-hover:bg-secondary-background"
                    >
                      <span className="block max-w-48 truncate" title={row.name}>
                        {row.name}
                      </span>
                    </th>
                    {rowCells.map((cell, index) => (
                      <td
                        key={MONTHS[index].month}
                        className="border-r-2 border-b-2 border-border p-1 text-center"
                      >
                        <MatrixCellView
                          cell={cell}
                          onClick={() => {
                            if (!cell) return
                            setSelected({
                              invoice: cell.invoice,
                              residentName: row.name,
                            })
                          }}
                        />
                      </td>
                    ))}
                    <td className="border-b-2 border-l-2 border-border px-3 py-2 text-right">
                      <CurrencyText value={rowPaid} />
                    </td>
                    <td
                      className={cn(
                        'border-b-2 border-border px-3 py-2 text-right',
                        rowOutstanding > 0 && 'text-danger',
                      )}
                    >
                      <CurrencyText value={rowOutstanding} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-secondary-background font-heading">
                <th className="sticky left-0 z-10 border-r-2 border-border bg-secondary-background px-3 py-2 text-left">
                  Total dibayar
                </th>
                {MONTHS.map(({ month }) => (
                  <td
                    key={month}
                    className="border-r-2 border-border px-2 py-2 text-center text-xs"
                  >
                    {compactAmount(
                      rows.reduce(
                        (sum, row) =>
                          sum + (cells.get(`${row.id}:${month}`)?.paidAmount ?? 0),
                        0,
                      ),
                    )}
                  </td>
                ))}
                <td className="border-l-2 border-border px-3 py-2 text-right">
                  {compactAmount(
                    rows.reduce((sum, row) => {
                      const paid = MONTHS.reduce(
                        (total, { month }) =>
                          total +
                          (cells.get(`${row.id}:${month}`)?.paidAmount ?? 0),
                        0,
                      )
                      return sum + paid
                    }, 0),
                  )}
                </td>
                <td className="border-border px-3 py-2 text-right text-danger">
                  {compactAmount(
                    rows.reduce((sum, row) => {
                      const outstanding = MONTHS.reduce(
                        (total, { month }) =>
                          total +
                          (cells.get(`${row.id}:${month}`)?.outstanding ?? 0),
                        0,
                      )
                      return sum + outstanding
                    }, 0),
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <PaymentCellDialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
        invoice={selected?.invoice ?? null}
        residentName={selected?.residentName}
        canRecord={canRecord}
        onRecord={() => {
          if (!selected) return
          onRecord({
            userId: selected.invoice.userId,
            invoiceId: selected.invoice.id,
          })
        }}
      />
    </div>
  )
}

function MatrixCellView({
  cell,
  onClick,
}: {
  cell: MatrixCell | undefined
  onClick: () => void
}) {
  if (!cell) {
    return <span className="text-foreground/25">—</span>
  }

  const title = `${INVOICE_STATUS_LABELS[cell.status]} · ${formatRupiah(
    cell.totalAmount,
  )} · dibayar ${formatRupiah(cell.paidAmount)}${
    cell.pending ? ' · menunggu verifikasi' : ''
  }`

  let icon = <CircleDashed className="size-4 text-foreground/50" />
  let tone = 'bg-background hover:bg-secondary-background'

  if (cell.pending) {
    icon = <Clock className="size-4 text-accent-orange" />
    tone = 'bg-accent-orange/15 hover:bg-accent-orange/25'
  } else if (cell.status === 'PAID') {
    icon = <Check className="size-4" />
    tone = 'bg-accent-teal hover:bg-accent-teal/80'
  } else if (cell.status === 'PARTIAL') {
    icon = <span className="text-base leading-none">◐</span>
    tone = 'bg-accent-orange/20 hover:bg-accent-orange/30'
  } else if (cell.status === 'OVERDUE') {
    icon = <TriangleAlert className="size-4" />
    tone = 'bg-danger/15 text-danger hover:bg-danger/25'
  } else if (cell.status === 'VOID') {
    icon = <X className="size-4 text-foreground/40" />
    tone = 'bg-foreground/5 hover:bg-foreground/10'
  }

  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={cn(
        'mx-auto flex size-8 items-center justify-center rounded-base border-2 border-transparent transition-colors',
        tone,
      )}
    >
      {icon}
    </button>
  )
}

function compactAmount(value: number) {
  if (value === 0) return '—'
  return new Intl.NumberFormat('id-ID', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}
