import type { ReactNode } from 'react'

import { CurrencyText } from '@/components/shared/currency-text'
import { DateText } from '@/components/shared/date-text'
import { ErrorState } from '@/components/shared/error-state'
import { StatusBadge } from '@/components/shared/status-badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import type { MyInvoice } from '@/features/invoice/api'
import { useInvoice, useMyInvoice } from '@/features/invoice/hooks'
import {
  formatPeriod,
  INVOICE_STATUS_LABELS,
  SUBMISSION_STATUS_LABELS,
} from '@/features/invoice/lib'
import { cn } from '@/lib/utils'

export function InvoiceDetailDialog({
  open,
  onOpenChange,
  invoiceId,
  self = false,
  residentNames,
  buildingNames,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoiceId: string | null
  self?: boolean
  residentNames?: Map<string, string>
  buildingNames?: Map<string, string>
}) {
  const adminQuery = useInvoice(self ? null : invoiceId)
  const myQuery = useMyInvoice(self ? invoiceId : null)
  const query = self ? myQuery : adminQuery
  const invoice = query.data

  const submissions = self
    ? [...(((invoice as MyInvoice | undefined)?.submissions) ?? [])].sort(
        (a, b) => b.createdAt.localeCompare(a.createdAt),
      )
    : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle>
              {invoice ? invoice.code : 'Rincian tagihan'}
            </DialogTitle>
            {invoice ? (
              <StatusBadge
                status={invoice.status}
                label={INVOICE_STATUS_LABELS[invoice.status]}
              />
            ) : null}
          </div>
          <DialogDescription>
            Rincian tagihan bulanan beserta pembayaran yang tercatat.
          </DialogDescription>
        </DialogHeader>

        {query.isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-20 w-full border-transparent bg-foreground/10" />
            <Skeleton className="h-24 w-full border-transparent bg-foreground/10" />
            <Skeleton className="h-16 w-full border-transparent bg-foreground/10" />
          </div>
        ) : query.error ? (
          <ErrorState
            message={query.error.message}
            onRetry={() => query.refetch()}
          />
        ) : invoice ? (
          <div className="flex max-h-[70vh] flex-col gap-5 overflow-y-auto pr-1">
            <dl className="grid gap-4 sm:grid-cols-2">
              <Info
                label="Penghuni"
                value={
                  residentNames?.get(invoice.userId) ?? invoice.userId
                }
              />
              <Info
                label="Gedung"
                value={
                  buildingNames?.get(invoice.buildingId) ?? invoice.buildingId
                }
              />
              <Info
                label="Periode"
                value={formatPeriod(invoice.periodYear, invoice.periodMonth)}
              />
              <Info
                label="Jatuh tempo"
                value={<DateText value={invoice.dueDate} />}
              />
            </dl>

            <div className="grid gap-3 sm:grid-cols-3">
              <Amount label="Total" value={invoice.totalAmount} />
              <Amount label="Dibayar" value={invoice.paidAmount} />
              <Amount
                label="Sisa"
                value={Math.max(invoice.totalAmount - invoice.paidAmount, 0)}
                emphasis
              />
            </div>

            <section className="flex flex-col gap-2">
              <h3 className="font-heading text-sm">Rincian tagihan</h3>
              <div className="rounded-base border-2 border-border">
                {(invoice.lines ?? []).length > 0 ? (
                  (invoice.lines ?? []).map((line, index) => (
                    <div
                      key={line.id}
                      className={cn(
                        'flex items-start justify-between gap-3 p-3',
                        index > 0 && 'border-t-2 border-border',
                      )}
                    >
                      <div className="flex flex-col">
                        <span>{line.description}</span>
                        <span className="text-xs text-foreground/60">
                          {line.kind}
                        </span>
                      </div>
                      <CurrencyText value={line.amount} />
                    </div>
                  ))
                ) : (
                  <p className="p-3 text-sm text-foreground/60">
                    Tidak ada rincian.
                  </p>
                )}
              </div>
            </section>

            {(invoice.allocations ?? []).length > 0 ? (
              <section className="flex flex-col gap-2">
                <h3 className="font-heading text-sm">Alokasi pembayaran</h3>
                <div className="rounded-base border-2 border-border">
                  {(invoice.allocations ?? []).map((allocation, index) => (
                    <div
                      key={allocation.id}
                      className={cn(
                        'flex items-center justify-between gap-3 p-3',
                        index > 0 && 'border-t-2 border-border',
                      )}
                    >
                      <span className="max-w-48 truncate font-mono text-xs text-foreground/70">
                        {allocation.paymentId}
                      </span>
                      <div className="flex items-center gap-3">
                        <DateText
                          value={allocation.createdAt}
                          className="text-xs text-foreground/60"
                        />
                        <CurrencyText value={allocation.amount} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {submissions.length > 0 ? (
              <section className="flex flex-col gap-2">
                <h3 className="font-heading text-sm">Pengajuan pembayaran</h3>
                <div className="rounded-base border-2 border-border">
                  {submissions.map((submission, index) => (
                    <div
                      key={submission.id}
                      className={cn(
                        'flex flex-wrap items-center justify-between gap-3 p-3',
                        index > 0 && 'border-t-2 border-border',
                      )}
                    >
                      <div className="flex flex-col">
                        <span className="max-w-48 truncate font-mono text-xs text-foreground/70">
                          {submission.code}
                        </span>
                        <DateText
                          value={submission.createdAt}
                          className="text-xs text-foreground/60"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <CurrencyText value={submission.amount} />
                        <StatusBadge
                          status={submission.status}
                          label={SUBMISSION_STATUS_LABELS[submission.status]}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs uppercase tracking-wide text-foreground/60">
        {label}
      </dt>
      <dd className="text-sm">{value}</dd>
    </div>
  )
}

function Amount({
  label,
  value,
  emphasis = false,
}: {
  label: string
  value: number
  emphasis?: boolean
}) {
  return (
    <div className="flex flex-col gap-1 rounded-base border-2 border-border bg-secondary-background p-3">
      <span className="text-xs uppercase tracking-wide text-foreground/60">
        {label}
      </span>
      <CurrencyText
        value={value}
        className={cn('font-heading', emphasis && 'text-lg')}
      />
    </div>
  )
}
