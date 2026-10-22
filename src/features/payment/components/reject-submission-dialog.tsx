import { useState } from 'react'

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
import { Input } from '@/components/ui/input'
import type { PaymentSubmission } from '@/features/payment/api'
import { useRejectPaymentSubmission } from '@/features/payment/hooks'
import { notifyError, notifySuccess } from '@/lib/notify'

export function RejectSubmissionDialog({
  open,
  onOpenChange,
  submission,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  submission: PaymentSubmission | null
}) {
  const reject = useRejectPaymentSubmission()
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submit = () => {
    if (!submission) return
    const value = reason.trim()
    if (!value) {
      setError('Alasan penolakan wajib diisi.')
      return
    }
    if (value.length > 255) {
      setError('Alasan maksimal 255 karakter.')
      return
    }

    reject.mutate(
      { id: submission.id, reason: value },
      {
        onSuccess: (res) => {
          notifySuccess(res.status, submission.invoice?.code ?? submission.code)
          onOpenChange(false)
        },
        onError: (reason) => notifyError('Gagal menolak pengajuan', reason),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tolak pengajuan pembayaran</DialogTitle>
          <DialogDescription>
            {submission
              ? `Pengajuan ${submission.code} untuk tagihan ${
                  submission.invoice?.code ?? submission.invoiceId
                } akan ditolak. Warga dapat mengajukan ulang.`
              : undefined}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <label htmlFor="reject-reason" className="text-sm font-heading">
            Alasan
          </label>
          <Input
            id="reject-reason"
            value={reason}
            onChange={(event) => {
              setReason(event.target.value)
              setError(null)
            }}
            placeholder="mis. Bukti buram, mohon unggah ulang"
            maxLength={255}
          />
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <p className="text-xs text-foreground/60">
            {reason.trim().length}/255 karakter
          </p>
        </div>

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
            loading={reject.isPending}
            disabled={!submission || reject.isPending}
            onClick={submit}
          >
            Tolak pengajuan
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
