import { useMemo, useState } from 'react'
import { FileSearch, Plus } from 'lucide-react'

import { Can } from '@/components/shared/can'
import { CurrencyText } from '@/components/shared/currency-text'
import { DataTable, type Column } from '@/components/shared/data-table'
import { DateText } from '@/components/shared/date-text'
import { EmptyState } from '@/components/shared/empty-state'
import { FilePreviewDialog } from '@/components/shared/file-preview-dialog'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import type { EventDetail } from '@/features/event/api'
import { EventExpenseDialog } from '@/features/event/components/event-expense-dialog'
import { useCashAccounts } from '@/features/cash-account/hooks'
import { useCategories } from '@/features/category/hooks'
import type { Expense } from '@/features/expense/api'
import { useExpenses } from '@/features/expense/hooks'
import { formatRupiah } from '@/lib/utils'

export function BudgetTab({ event }: { event: EventDetail }) {
  const expenses = useExpenses()
  const categories = useCategories('EXPENSE')
  const accounts = useCashAccounts()

  const [formOpen, setFormOpen] = useState(false)
  const [receipt, setReceipt] = useState<Expense | null>(null)

  const rows = useMemo(
    () =>
      (expenses.data ?? [])
        .filter((expense) => expense.eventId === event.id)
        .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)),
    [expenses.data, event.id],
  )

  const categoryNames = useMemo(() => {
    const map = new Map<string, string>()
    for (const category of categories.data ?? []) {
      map.set(category.id, category.name)
    }
    return map
  }, [categories.data])

  const accountNames = useMemo(() => {
    const map = new Map<string, string>()
    for (const account of accounts.data ?? []) {
      map.set(account.id, account.name)
    }
    return map
  }, [accounts.data])

  const budget = event.budgetAmount
  const realized = rows.reduce((total, row) => total + row.amount, 0)
  const remaining = budget === null ? null : budget - realized
  const usage = budget && budget > 0 ? Math.round((realized / budget) * 100) : 0
  const overBudget = budget !== null && realized > budget

  const columns: Column<Expense>[] = [
    {
      key: 'occurredAt',
      header: 'Tanggal',
      cell: (row) => <DateText value={row.occurredAt} />,
    },
    {
      key: 'category',
      header: 'Kategori',
      cell: (row) => categoryNames.get(row.categoryId) ?? '—',
    },
    {
      key: 'description',
      header: 'Keterangan',
      className: 'max-w-xs truncate text-foreground/80',
      cell: (row) => row.description ?? row.vendor ?? '—',
    },
    {
      key: 'account',
      header: 'Sumber kas',
      cell: (row) => accountNames.get(row.cashAccountId) ?? '—',
    },
    {
      key: 'amount',
      header: 'Jumlah',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (row) => (
        <CurrencyText value={row.amount} className="font-heading" />
      ),
    },
    {
      key: 'actions',
      header: '',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (row) => (
        <Button
          type="button"
          variant="neutral"
          size="icon-sm"
          aria-label="Lihat bukti"
          onClick={() => setReceipt(row)}
        >
          <FileSearch />
        </Button>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-base border-2 border-border bg-secondary-background p-4">
          <p className="text-xs text-foreground/60">Anggaran</p>
          <p className="font-heading text-lg">
            {budget === null ? (
              <span className="text-foreground/60">Belum dianggarkan</span>
            ) : (
              formatRupiah(budget)
            )}
          </p>
        </div>
        <div className="rounded-base border-2 border-border bg-secondary-background p-4">
          <p className="text-xs text-foreground/60">Realisasi</p>
          <p className="font-heading text-lg">{formatRupiah(realized)}</p>
        </div>
        <div
          className={`rounded-base border-2 border-border p-4 ${
            overBudget ? 'bg-danger text-main-foreground' : 'bg-secondary-background'
          }`}
        >
          <p className="text-xs opacity-70">Sisa</p>
          <p className="font-heading text-lg">
            {remaining === null ? '—' : formatRupiah(remaining)}
          </p>
        </div>
      </div>

      {budget !== null ? (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs text-foreground/60">
            <span>Pemakaian anggaran</span>
            <span className="tabular-nums">{usage}%</span>
          </div>
          <Progress value={Math.min(usage, 100)} />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-foreground/70">
          {rows.length} pengeluaran tercatat
        </p>
        <Can permission="cash.CREATE">
          <Button type="button" onClick={() => setFormOpen(true)}>
            <Plus />
            Catat pengeluaran
          </Button>
        </Can>
      </div>

      {rows.length === 0 && expenses.isLoading ? (
        <EmptyState title="Memuat pengeluaran..." />
      ) : rows.length === 0 ? (
        <EmptyState
          title="Belum ada pengeluaran"
          description="Pengeluaran yang dicatat untuk kegiatan ini akan muncul di sini."
        />
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          getRowId={(row) => row.id}
          pageSize={10}
          emptyTitle="Belum ada pengeluaran"
        />
      )}

      {formOpen ? (
        <EventExpenseDialog
          open
          onOpenChange={setFormOpen}
          event={event}
        />
      ) : null}

      <FilePreviewDialog
        key={receipt?.receiptFileId ?? 'none'}
        open={Boolean(receipt)}
        onOpenChange={(open) => {
          if (!open) setReceipt(null)
        }}
        fileId={receipt?.receiptFileId ?? null}
        title="Bukti pengeluaran"
        downloadName="bukti-pengeluaran"
      />
    </div>
  )
}
