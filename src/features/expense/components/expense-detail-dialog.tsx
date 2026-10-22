import { useState, type ReactNode } from 'react'
import { FileSearch } from 'lucide-react'

import { CurrencyText } from '@/components/shared/currency-text'
import { DateText } from '@/components/shared/date-text'
import { FilePreviewDialog } from '@/components/shared/file-preview-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCashAccounts } from '@/features/cash-account/hooks'
import { useCategories } from '@/features/category/hooks'
import { useExpense } from '@/features/expense/hooks'

export function ExpenseDetailDialog({
  open,
  onOpenChange,
  expenseId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  expenseId: string | null
}) {
  const expense = useExpense(expenseId)
  const categories = useCategories('EXPENSE')
  const accounts = useCashAccounts()
  const [receiptOpen, setReceiptOpen] = useState(false)

  const categoryName = (categories.data ?? []).find(
    (category) => category.id === expense.data?.categoryId,
  )?.name
  const accountName = (accounts.data ?? []).find(
    (account) => account.id === expense.data?.cashAccountId,
  )?.name

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail pengeluaran</DialogTitle>
            <DialogDescription>
              {expense.data?.vendor ?? categoryName ?? 'Pengeluaran kas'}
            </DialogDescription>
          </DialogHeader>

          {expense.isLoading ? (
            <p className="py-8 text-center text-sm text-foreground/70">
              Memuat data…
            </p>
          ) : expense.error ? (
            <p className="py-8 text-center text-sm text-danger">
              {expense.error.message}
            </p>
          ) : expense.data ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Tanggal">
                <DateText value={expense.data.occurredAt} />
              </Info>
              <Info label="Nominal">
                <CurrencyText
                  value={expense.data.amount}
                  className="font-heading text-lg"
                />
              </Info>
              <Info label="Kategori">{categoryName ?? '—'}</Info>
              <Info label="Akun kas">{accountName ?? '—'}</Info>
              <Info label="Vendor">{expense.data.vendor ?? '—'}</Info>
              <Info label="Dicatat">
                <DateText value={expense.data.createdAt} withTime />
              </Info>
              <Info label="Keterangan" className="sm:col-span-2">
                {expense.data.description ?? '—'}
              </Info>
              <Info label="Kunci idempotensi" className="sm:col-span-2">
                <span className="font-mono text-xs">
                  {expense.data.idempotencyKey}
                </span>
              </Info>
            </div>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="neutral"
              onClick={() => setReceiptOpen(true)}
              disabled={!expense.data?.receiptFileId}
            >
              <FileSearch />
              Lihat bukti
            </Button>
            <Button
              type="button"
              variant="neutral"
              onClick={() => onOpenChange(false)}
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FilePreviewDialog
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        fileId={expense.data?.receiptFileId ?? null}
        title="Bukti pengeluaran"
        downloadName="bukti-pengeluaran"
      />
    </>
  )
}

function Info({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <span className="block text-xs uppercase tracking-wide text-foreground/60">
        {label}
      </span>
      <span className="text-sm">{children}</span>
    </div>
  )
}
