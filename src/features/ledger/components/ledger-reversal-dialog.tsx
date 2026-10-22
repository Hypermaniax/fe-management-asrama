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
import type { LedgerEntry } from '@/features/ledger/api'
import { useReverseLedgerEntry } from '@/features/ledger/hooks'
import { ledgerSourceLabel } from '@/features/ledger/lib'
import { notifyError, notifySuccess } from '@/lib/notify'
import { formatRupiah } from '@/lib/utils'

export function LedgerReversalDialog({
  open,
  onOpenChange,
  entry,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: LedgerEntry | null
}) {
  const reverse = useReverseLedgerEntry()
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submit = () => {
    if (!entry) return
    const value = reason.trim()
    if (!value) {
      setError('Alasan reversal wajib diisi.')
      return
    }
    if (value.length > 255) {
      setError('Alasan maksimal 255 karakter.')
      return
    }

    reverse.mutate(
      { id: entry.id, reason: value },
      {
        onSuccess: (res) => {
          notifySuccess(res.status, formatRupiah(entry.amount))
          onOpenChange(false)
        },
        onError: (reason) => notifyError('Gagal membalik entri', reason),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Reversal entri buku kas</DialogTitle>
          <DialogDescription>
            {entry
              ? `${ledgerSourceLabel(entry.sourceType)} · ${formatRupiah(
                  entry.amount,
                )} akan dibalik dengan entri baru.`
              : undefined}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <label htmlFor="reversal-reason" className="text-sm font-heading">
            Alasan
          </label>
          <Input
            id="reversal-reason"
            value={reason}
            onChange={(event) => {
              setReason(event.target.value)
              setError(null)
            }}
            placeholder="mis. Salah input nominal"
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
            loading={reverse.isPending}
            disabled={!entry || reverse.isPending}
            onClick={submit}
          >
            Balik entri
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
