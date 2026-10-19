import { useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'

import { Can } from '@/components/shared/can'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { DataTable, type Column } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import { useBuildings } from '@/features/building/hooks'
import type { Category } from '@/features/category/api'
import { CategoryFormDialog } from '@/features/category/components/category-form-dialog'
import { useDeleteCategory, useCategories } from '@/features/category/hooks'
import { cn } from '@/lib/utils'
import { notifyError, notifySuccess } from '@/lib/notify'

function KindBadge({ kind }: { kind: Category['kind'] }) {
  const income = kind === 'INCOME'
  return (
    <Badge
      className={cn(
        'font-heading tracking-wide uppercase',
        income
          ? 'bg-accent-teal text-foreground'
          : 'bg-accent-orange text-foreground',
      )}
    >
      {income ? 'Pemasukan' : 'Pengeluaran'}
    </Badge>
  )
}

export default function CategoriesPage() {
  const { data, isLoading, error, refetch } = useCategories()
  const buildings = useBuildings()
  const remove = useDeleteCategory()

  const [kindFilter, setKindFilter] = useState('ALL')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [target, setTarget] = useState<Category | null>(null)

  const buildingNames = useMemo(() => {
    const map = new Map<string, string>()
    for (const building of buildings.data ?? []) map.set(building.id, building.name)
    return map
  }, [buildings.data])

  const categories = useMemo(() => {
    if (kindFilter === 'ALL') return data ?? []
    return (data ?? []).filter((category) => category.kind === kindFilter)
  }, [data, kindFilter])

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (category: Category) => {
    setEditing(category)
    setFormOpen(true)
  }

  const confirmDelete = () => {
    if (!target) return
    remove.mutate(target.id, {
      onSuccess: (res) => {
        notifySuccess(res?.status ?? 'Kategori dinonaktifkan', target.name)
        setTarget(null)
      },
      onError: (error) => notifyError('Gagal menonaktifkan', error),
    })
  }

  const columns: Column<Category>[] = [
    {
      key: 'name',
      header: 'Nama',
      className: 'font-heading',
      cell: (row) => row.name,
    },
    {
      key: 'kind',
      header: 'Jenis',
      cell: (row) => <KindBadge kind={row.kind} />,
    },
    {
      key: 'building',
      header: 'Gedung',
      cell: (row) => buildingNames.get(row.buildingId) ?? '—',
    },
    {
      key: 'actions',
      header: '',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (row) => (
        <div className="flex justify-end gap-2">
          <Can permission="category.UPDATE">
            <Button
              type="button"
              variant="neutral"
              size="icon-sm"
              aria-label={`Ubah ${row.name}`}
              onClick={() => openEdit(row)}
            >
              <Pencil />
            </Button>
          </Can>
          <Can permission="category.DELETE">
            <Button
              type="button"
              variant="neutral"
              size="icon-sm"
              aria-label={`Nonaktifkan ${row.name}`}
              onClick={() => setTarget(row)}
            >
              <Trash2 />
            </Button>
          </Can>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Kategori Kas"
        description="Kategori pemasukan dan pengeluaran per gedung."
      >
        <Can permission="category.CREATE">
          <Button type="button" onClick={openCreate}>
            <Plus />
            Tambah kategori
          </Button>
        </Can>
      </PageHeader>

      <div className="flex flex-wrap gap-3">
        <NativeSelect
          aria-label="Filter jenis"
          value={kindFilter}
          onChange={(event) => setKindFilter(event.target.value)}
          className="w-44"
        >
          <NativeSelectOption value="ALL">Semua jenis</NativeSelectOption>
          <NativeSelectOption value="INCOME">Pemasukan</NativeSelectOption>
          <NativeSelectOption value="EXPENSE">Pengeluaran</NativeSelectOption>
        </NativeSelect>
      </div>

      <DataTable
        columns={columns}
        data={categories}
        getRowId={(row) => row.id}
        pageSize={10}
        isLoading={isLoading}
        error={error ? error.message : undefined}
        onRetry={() => refetch()}
        emptyTitle="Belum ada kategori"
        emptyDescription="Tambahkan kategori untuk mencatat pemasukan dan pengeluaran."
        emptyAction={
          <Can permission="category.CREATE">
            <Button type="button" onClick={openCreate}>
              <Plus />
              Tambah kategori
            </Button>
          </Can>
        }
      />

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editing}
      />

      <ConfirmDialog
        open={Boolean(target)}
        onOpenChange={(open) => {
          if (!open) setTarget(null)
        }}
        title="Nonaktifkan kategori?"
        description={
          target
            ? `Kategori ${target.name} akan dinonaktifkan dan tidak dipakai pada transaksi baru.`
            : undefined
        }
        confirmLabel="Nonaktifkan"
        loading={remove.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
