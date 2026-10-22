import type { ReactNode } from 'react'
import { Download } from 'lucide-react'

import { CurrencyText } from '@/components/shared/currency-text'
import { DateText } from '@/components/shared/date-text'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCashAccounts } from '@/features/cash-account/hooks'
import { useInvoices } from '@/features/invoice/hooks'
import { INVOICE_STATUS_LABELS, formatPeriod } from '@/features/invoice/lib'
import type { Payment } from '@/features/payment/api'
import { PAYMENT_METHOD_LABELS } from '@/features/payment/lib'
import { downloadFile } from '@/lib/files'

export function PaymentDetailDialog({
  open,
  onOpenChange,
  payment,
  residentName,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  payment: Payment | null
  residentName?: string
}) {
  const cashAccounts = useCashAccounts()
  const cashAccount = (cashAccounts.data ?? []).find(
    (account) => account.id === payment?.cashAccountId,
  )
  const invoices = useInvoices(
    { buildingId: cashAccount?.buildingId },
    open && Boolean(cashAccount?.buildingId),
  )
  const invoiceMap = new Map(
    (invoices.data ?? []).map((invoice) => [invoice.id, invoice]),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{payment?.code ?? 'Detail pembayaran'}</DialogTitle>
          <DialogDescription>
            {payment
              ? `${residentName ?? payment.userId} · ${PAYMENT_METHOD_LABELS[payment.method]}`
              : undefined}
          </DialogDescription>
        </DialogHeader>

        {payment ? (
          <div className="flex flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Nominal">
                <CurrencyText
                  value={payment.amount}
                  className="font-heading text-lg"
                />
              </Info>
              <Info label="Waktu">
                <DateText value={payment.paidAt} withTime />
              </Info>
              <Info label="Akun kas">
                {cashAccount?.name ?? payment.cashAccountId}
              </Info>
              <Info label="Referensi">
                {payment.referenceNo ?? '—'}
              </Info>
              <Info label="Catatan">{payment.note ?? '—'}</Info>
              <Info label="Kunci idempotensi">
                <span className="block max-w-52 truncate font-mono text-xs">
                  {payment.idempotencyKey}
                </span>
              </Info>
            </div>

            <section className="flex flex-col gap-2">
              <h3 className="text-sm font-heading">Alokasi tagihan</h3>
              <div className="rounded-base border-2 border-border">
                {payment.allocations.length === 0 ? (
                  <p className="p-3 text-sm text-foreground/60">
                    Pembayaran belum dialokasikan ke tagihan.
                  </p>
                ) : (
                  payment.allocations.map((allocation, index) => {
                    const invoice = invoiceMap.get(allocation.invoiceId)
                    return (
                      <div
                        key={allocation.id}
                        className={`flex flex-wrap items-center justify-between gap-3 p-3 ${
                          index > 0 ? 'border-t-2 border-border' : ''
                        }`}
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="font-heading text-sm">
                            {invoice?.code ?? allocation.invoiceId}
                          </span>
                          <span className="flex items-center gap-2 text-xs text-foreground/60">
                            {invoice
                              ? formatPeriod(
                                  invoice.periodYear,
                                  invoice.periodMonth,
                                )
                              : 'Tagihan'}
                            {invoice ? (
                              <StatusBadge
                                status={invoice.status}
                                label={INVOICE_STATUS_LABELS[invoice.status]}
                              />
                            ) : null}
                          </span>
                        </div>
                        <CurrencyText value={allocation.amount} />
                      </div>
                    )
                  })
                )}
              </div>
            </section>

            {payment.proofFileId ? (
              <Button
                type="button"
                variant="neutral"
                onClick={() =>
                  downloadFile(
                    payment.proofFileId as string,
                    `${payment.code}-bukti`,
                  )
                }
              >
                <Download />
                Unduh bukti pembayaran
              </Button>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function Info({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs uppercase tracking-wide text-foreground/60">
        {label}
      </span>
      <span className="text-sm">{children}</span>
    </div>
  )
}
