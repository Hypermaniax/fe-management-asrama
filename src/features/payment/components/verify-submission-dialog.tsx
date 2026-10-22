import { useState, type ReactNode } from 'react'
import { FileSearch } from 'lucide-react'

import { CurrencyText } from '@/components/shared/currency-text'
import { LoadingButton } from '@/components/shared/loading-button'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CashAccountSelect } from '@/features/cash-account/components/cash-account-select'
import { formatPeriod } from '@/features/invoice/lib'
import type { PaymentSubmission } from '@/features/payment/api'
import { PaymentProofDialog } from '@/features/payment/components/payment-proof-dialog'
import { useVerifyPaymentSubmission } from '@/features/payment/hooks'
import { PAYMENT_METHOD_LABELS } from '@/features/payment/lib'
import { notifyError, notifySuccess } from '@/lib/notify'

export function VerifySubmissionDialog({
  open,
  onOpenChange,
  submission,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  submission: PaymentSubmission | null
}) {
  const verify = useVerifyPaymentSubmission()
  const [cashAccountId, setCashAccountId] = useState('')
  const [proofOpen, setProofOpen] = useState(false)

  const submit = () => {
    if (!submission) return
    verify.mutate(
      {
        id: submission.id,
        cashAccountId: cashAccountId || undefined,
      },
      {
        onSuccess: (res) => {
          notifySuccess(
            res.status,
            submission.invoice?.code ?? submission.code,
          )
          onOpenChange(false)
        },
        onError: (error) => notifyError('Gagal memverifikasi pembayaran', error),
      },
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Verifikasi pembayaran</DialogTitle>
            <DialogDescription>
              Periksa bukti dan nominal sebelum menyetujui pengajuan.
            </DialogDescription>
          </DialogHeader>

          {submission ? (
            <div className="flex flex-col gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Info label="Warga">
                  {submission.user?.name ?? submission.user?.email ?? submission.userId}
                </Info>
                <Info label="Tagihan">
                  {submission.invoice?.code ?? submission.invoiceId}
                </Info>
                <Info label="Periode">
                  {submission.invoice
                    ? formatPeriod(
                        submission.invoice.periodYear,
                        submission.invoice.periodMonth,
                      )
                    : '—'}
                </Info>
                <Info label="Metode">
                  {PAYMENT_METHOD_LABELS[submission.method]}
                </Info>
                <Info label="Nominal">
                  <CurrencyText
                    value={submission.amount}
                    className="font-heading text-lg"
                  />
                </Info>
                <Info label="Referensi">
                  {submission.referenceNo ?? '—'}
                </Info>
                <Info label="Catatan">{submission.note ?? '—'}</Info>
              </div>

              <Button
                type="button"
                variant="neutral"
                onClick={() => setProofOpen(true)}
              >
                <FileSearch />
                Lihat bukti pembayaran
              </Button>

              <div className="flex flex-col gap-2 border-t-2 border-border pt-4">
                <span className="text-sm font-heading">Akun kas</span>
                <CashAccountSelect
                  buildingId={submission.invoice?.buildingId}
                  value={cashAccountId}
                  onValueChange={setCashAccountId}
                  placeholder="Akun kas default gedung"
                />
                <p className="text-xs text-foreground/60">
                  Kosongkan untuk memakai akun kas default gedung.
                </p>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="neutral"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <LoadingButton
              type="button"
              loading={verify.isPending}
              disabled={!submission || verify.isPending}
              onClick={submit}
            >
              Verifikasi
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PaymentProofDialog
        key={submission?.proofFileId ?? 'none'}
        open={proofOpen}
        onOpenChange={setProofOpen}
        fileId={submission?.proofFileId ?? null}
        title={`Bukti ${submission?.code ?? ''}`}
      />
    </>
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
