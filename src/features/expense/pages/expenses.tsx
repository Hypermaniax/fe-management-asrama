import { useMemo, useState } from 'react'
import { Eye, FileSearch, Plus } from 'lucide-react'

import { Can } from '@/components/shared/can'
import { CurrencyText } from '@/components/shared/currency-text'
import { DataTable, type Column } from '@/components/shared/data-table'
import { DateText } from '@/components/shared/date-text'
import { FilePreviewDialog } from '@/components/shared/file-preview-dialog'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import { useBuildings } from '@/features/building/hooks'
import { useCashAccounts } from '@/features/cash-account/hooks'
import { useCategories } from '@/features/category/hooks'
import type { Expense } from '@/features/expense/api'
import { ExpenseDetailDialog } from '@/features/expense/components/expense-detail-dialog'
import { ExpenseFormDialog } from '@/features/expense/components/expense-form-dialog'
import { useExpenses } from '@/features/expense/hooks'

export default function ExpensesPage() {
  const expenses = useExpenses()
  const categories = useCategories('EXPENSE')
  const accounts = useCashAccounts()
  const buildings = useBuildings()

  const [buildingFilter, setBuildingFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [receipt, setReceipt] = useState<Expense | null>(null)

  const categoryNames = useMemo(() => {
    const map = new Map<string, string>()
    for (const category of categories.data ?? []) {
      map.set(category.id, category.name)
    }
    return map
  }, [categories.data])

  const accountMap = useMemo(() => {
    const map = new Map<string, { name: string; buildingId: string }>()
    for (const account of accounts.data ?? []) {
      map.set(account.id, {
        name: account.name,
        buildingId: account.buildingId,
      })
    }
    return map
  }, [accounts.data])

  const rows = useMemo(() => {
    const value = search.trim().toLowerCase()
    return (expenses.data ?? []).filter((expense) => {
      const account = accountMap.get(expense.cashAccountId)
      if (buildingFilter !== 'ALL' && account?.buildingId !== buildingFilter) {
        return false
      }
      if (categoryFilter !== 'ALL' && expense.categoryId !== categoryFilter) {
        return false
      }
      if (!value) return true
      return (
        (expense.vendor ?? '').toLowerCase().includes(value) ||
        (expense.description ?? '').toLowerCase().includes(value) ||
        (account?.name ?? '').toLowerCase().includes(value)
      )
    })
  }, [expenses.data, accountMap, buildingFilter, categoryFilter, search])

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
      key: 'amount',
      header: 'Jumlah',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (row) => (
        <CurrencyText value={row.amount} className="font-heading" />
      ),
    },
    {
      key: 'vendor',
      header: 'Vendor',
      cell: (row) => row.vendor ?? '—',
    },
    {
      key: 'account',
      header: 'Sumber kas',
      cell: (row) => accountMap.get(row.cashAccountId)?.name ?? '—',
    },
    {
      key: 'description',
      header: 'Keterangan',
      className: 'max-w-xs truncate text-foreground/80',
      cell: (row) => row.description ?? '—',
    },
    {
      key: 'actions',
      header: '',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (row) => (
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="neutral"
            size="icon-sm"
            aria-label="Lihat bukti"
            onClick={() => setReceipt(row)}
          >
            <FileSearch />
          </Button>
          <Button
            type="button"
            variant="neutral"
            size="icon-sm"
            aria-label="Detail pengeluaran"
            onClick={() => setDetailId(row.id)}
          >
            <Eye />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pengeluaran"
        description="Catat kas keluar beserta kategori, akun kas, dan buktinya."
      >
        <Can permission="cash.CREATE">
          <Button type="button" onClick={() => setFormOpen(true)}>
            <Plus />
            Catat pengeluaran
          </Button>
        </Can>
      </PageHeader>

      <div className="flex flex-wrap gap-3">
        <NativeSelect
          aria-label="Filter gedung"
          value={buildingFilter}
          onChange={(event) => {
            setBuildingFilter(event.target.value)
            setCategoryFilter('ALL')
          }}
          className="w-48"
        >
          <NativeSelectOption value="ALL">Semua gedung</NativeSelectOption>
          {(buildings.data ?? []).map((building) => (
            <NativeSelectOption key={building.id} value={building.id}>
              {building.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <NativeSelect
          aria-label="Filter kategori"
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="w-48"
        >
          <NativeSelectOption value="ALL">Semua kategori</NativeSelectOption>
          {(categories.data ?? [])
            .filter(
              (category) =>
                buildingFilter === 'ALL' ||
                category.buildingId === buildingFilter,
            )
            .map((category) => (
              <NativeSelectOption key={category.id} value={category.id}>
                {category.name}
              </NativeSelectOption>
            ))}
        </NativeSelect>

        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari vendor, keterangan, akun..."
          aria-label="Cari pengeluaran"
          className="w-64 bg-secondary-background"
        />
      </div>

      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        pageSize={10}
        isLoading={expenses.isLoading}
        error={expenses.error ? expenses.error.message : undefined}
        onRetry={() => expenses.refetch()}
        emptyTitle="Belum ada pengeluaran"
        emptyDescription="Pengeluaran kas yang dicatat akan muncul di sini."
      />

      {formOpen ? (
        <ExpenseFormDialog open onOpenChange={setFormOpen} />
      ) : null}

      {detailId ? (
        <ExpenseDetailDialog
          key={detailId}
          open
          onOpenChange={(open) => {
            if (!open) setDetailId(null)
          }}
          expenseId={detailId}
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
