import { Download } from 'lucide-react'

import { CurrencyText } from '@/components/shared/currency-text'
import { DateText } from '@/components/shared/date-text'
import { ErrorState } from '@/components/shared/error-state'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useCashAccounts } from '@/features/cash-account/hooks'
import type { Invoice } from '@/features/invoice/api'
import {
  formatPeriod,
  INVOICE_STATUS_LABELS,
} from '@/features/invoice/lib'
import {
  usePaymentSubmissions,
  usePayments,
} from '@/features/payment/hooks'
import { PAYMENT_METHOD_LABELS } from '@/features/payment/lib'
import { downloadFile } from '@/lib/files'
import { formatRupiah } from '@/lib/utils'

export function PaymentCellDialog({
  open,
  onOpenChange,
  invoice,
  residentName,
  canRecord,
  onRecord,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: Invoice | null
  residentName?: string
  canRecord: boolean
  onRecord: () => void
}) {
  const payments = usePayments(
    { userId: invoice?.userId },
    open && Boolean(invoice),
  )
  const submissions = usePaymentSubmissions(
    { status: 'PENDING', userId: invoice?.userId },
    open && Boolean(invoice),
  )
  const cashAccounts = useCashAccounts()

  const cashAccountNames = new Map(
    (cashAccounts.data ?? []).map((account) => [account.id, account.name]),
  )

  const related = (payments.data ?? []).filter((payment) =>
    payment.allocations.some(
      (allocation) => allocation.invoiceId === invoice?.id,
    ),
  )

  const pending = (submissions.data ?? []).filter(
    (submission) => submission.invoiceId === invoice?.id,
  )

  const outstanding = invoice
    ? Math.max(invoice.totalAmount - invoice.paidAmount, 0)
    : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle>{invoice?.code ?? 'Detail pembayaran'}</DialogTitle>
            {invoice ? (
              <StatusBadge
                status={invoice.status}
                label={INVOICE_STATUS_LABELS[invoice.status]}
              />
            ) : null}
          </div>
          <DialogDescription>
            {invoice
              ? `${residentName ?? invoice.userId} · ${formatPeriod(
                  invoice.periodYear,
                  invoice.periodMonth,
                )}`
              : undefined}
          </DialogDescription>
        </DialogHeader>

        {invoice ? (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3">
              <Amount label="Total" value={invoice.totalAmount} />
              <Amount label="Dibayar" value={invoice.paidAmount} />
              <Amount label="Sisa" value={outstanding} emphasis />
            </div>

            {pending.length > 0 ? (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-base border-2 border-accent-orange bg-accent-orange/10 p-3 text-sm">
                <span>
                  Menunggu verifikasi pengajuan{' '}
                  <span className="font-mono text-xs">
                    {pending[0].code}
                  </span>
                </span>
                <CurrencyText value={pending[0].amount} />
              </div>
            ) : null}

            <section className="flex flex-col gap-2">
              <h3 className="text-sm font-heading">Pembayaran tercatat</h3>
              {payments.isLoading ? (
                <Skeleton className="h-20 w-full border-transparent bg-foreground/10" />
              ) : payments.error ? (
                <ErrorState
                  message={payments.error.message}
                  onRetry={() => payments.refetch()}
                />
              ) : related.length === 0 ? (
                <p className="rounded-base border-2 border-border p-3 text-sm text-foreground/60">
                  Belum ada pembayaran untuk tagihan ini.
                </p>
              ) : (
                <div className="rounded-base border-2 border-border">
                  {related.map((payment, index) => (
                    <div
                      key={payment.id}
                      className={`flex flex-wrap items-center justify-between gap-3 p-3 ${
                        index > 0 ? 'border-t-2 border-border' : ''
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-heading text-sm">
                          {payment.code}
                        </span>
                        <span className="text-xs text-foreground/60">
                          {PAYMENT_METHOD_LABELS[payment.method]} ·{' '}
                          {cashAccountNames.get(payment.cashAccountId) ?? '—'} ·{' '}
                          <DateText value={payment.paidAt} />
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CurrencyText value={payment.amount} />
                        {payment.proofFileId ? (
                          <Button
                            type="button"
                            variant="neutral"
                            size="icon-sm"
                            aria-label={`Unduh bukti ${payment.code}`}
                            onClick={() =>
                              downloadFile(
                                payment.proofFileId as string,
                                `${payment.code}-bukti`,
                              )
                            }
                          >
                            <Download />
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="rounded-base border-2 border-border bg-secondary-background p-3 text-sm text-foreground/70">
              Total pembayaran untuk tagihan ini:{' '}
              <CurrencyText
                value={related.reduce(
                  (sum, payment) =>
                    sum +
                    payment.allocations
                      .filter(
                        (allocation) => allocation.invoiceId === invoice.id,
                      )
                      .reduce((total, allocation) => total + allocation.amount, 0),
                  0,
                )}
                className="font-heading"
              />
            </div>
          </div>
        ) : null}

        <DialogFooter>
          {invoice && outstanding > 0 && canRecord && pending.length === 0 ? (
            <Button
              type="button"
              onClick={() => {
                onRecord()
                onOpenChange(false)
              }}
            >
              Catat pembayaran ({formatRupiah(outstanding)})
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
        className={emphasis ? 'font-heading text-lg' : 'font-heading'}
      />
    </div>
  )
}
