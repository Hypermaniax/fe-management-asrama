import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Can } from '@/components/shared/can'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { DataTable, type Column } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import type { Building } from '@/features/building/api'
import { BuildingFormDialog } from '@/features/building/components/building-form-dialog'
import { GenderBadge } from '@/features/building/components/gender-badge'
import { useBuildings, useDeleteBuilding } from '@/features/building/hooks'
import { ApiRequestError } from '@/lib/api'

export default function BuildingsPage() {
  const { data, isLoading, error, refetch } = useBuildings()
  const remove = useDeleteBuilding()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Building | null>(null)
  const [target, setTarget] = useState<Building | null>(null)

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (building: Building) => {
    setEditing(building)
    setFormOpen(true)
  }

  const confirmDelete = () => {
    if (!target) return
    remove.mutate(target.id, {
      onSuccess: () => {
        toast.success('Gedung dinonaktifkan', { description: target.name })
        setTarget(null)
      },
      onError: (err) => {
        toast.error('Gagal menonaktifkan', {
          description:
            err instanceof ApiRequestError ? err.message : 'Terjadi kesalahan',
        })
      },
    })
  }

  const columns: Column<Building>[] = [
    {
      key: 'code',
      header: 'Kode',
      className: 'font-heading',
      cell: (row) => row.code,
    },
    { key: 'name', header: 'Nama', cell: (row) => row.name },
    {
      key: 'gender',
      header: 'Gender',
      cell: (row) => <GenderBadge gender={row.gender} />,
    },
    {
      key: 'address',
      header: 'Alamat',
      className: 'max-w-xs truncate text-foreground/80',
      cell: (row) => row.address,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => (
        <StatusBadge status={row.isActive ? 'ACTIVE' : 'INACTIVE'} />
      ),
    },
    {
      key: 'actions',
      header: '',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (row) => (
        <div className="flex justify-end gap-2">
          <Can permission="building.UPDATE">
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
          <Can permission="building.DELETE">
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
        title="Gedung"
        description="Master gedung asrama beserta gender penghuni yang boleh ditempatkan."
      >
        <Can permission="building.CREATE">
          <Button type="button" onClick={openCreate}>
            <Plus />
            Tambah gedung
          </Button>
        </Can>
      </PageHeader>

      <DataTable
        columns={columns}
        data={data ?? []}
        getRowId={(row) => row.id}
        pageSize={10}
        isLoading={isLoading}
        error={error ? error.message : undefined}
        onRetry={() => refetch()}
        emptyTitle="Belum ada gedung"
        emptyDescription="Tambahkan gedung pertama untuk mulai mengelola kamar dan penghuni."
        emptyAction={
          <Can permission="building.CREATE">
            <Button type="button" onClick={openCreate}>
              <Plus />
              Tambah gedung
            </Button>
          </Can>
        }
      />

      <BuildingFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        building={editing}
      />

      <ConfirmDialog
        open={Boolean(target)}
        onOpenChange={(open) => {
          if (!open) setTarget(null)
        }}
        title="Nonaktifkan gedung?"
        description={
          target
            ? `Gedung ${target.name} akan dinonaktifkan dan tidak muncul di daftar aktif.`
            : undefined
        }
        confirmLabel="Nonaktifkan"
        loading={remove.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
