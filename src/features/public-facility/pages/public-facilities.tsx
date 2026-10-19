import { useState } from 'react'
import { Pencil, Plus, Trash2, Users } from 'lucide-react'

import { Can } from '@/components/shared/can'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { DataTable, type Column } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CATEGORY_LABELS, USAGE_LABELS } from '@/features/facility/labels'
import type { PublicFacility } from '@/features/public-facility/api'
import { PublicFacilityFormDialog } from '@/features/public-facility/components/public-facility-form-dialog'
import { PublicFacilitySlotDialog } from '@/features/public-facility/components/public-facility-slot-dialog'
import {
  useDeletePublicFacility,
  usePublicFacilities,
} from '@/features/public-facility/hooks'
import { notifyError, notifySuccess } from '@/lib/notify'

export default function PublicFacilitiesPage() {
  const { data, isLoading, error, refetch } = usePublicFacilities()
  const remove = useDeletePublicFacility()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<PublicFacility | null>(null)
  const [target, setTarget] = useState<PublicFacility | null>(null)
  const [slotTarget, setSlotTarget] = useState<PublicFacility | null>(null)

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (publicFacility: PublicFacility) => {
    setEditing(publicFacility)
    setFormOpen(true)
  }

  const confirmDelete = () => {
    if (!target) return
    remove.mutate(target.id, {
      onSuccess: (res) => {
        notifySuccess(
          res?.status ?? 'Fasilitas umum dinonaktifkan',
          target.facility.name,
        )
        setTarget(null)
      },
      onError: (error) => notifyError('Gagal menonaktifkan', error),
    })
  }

  const columns: Column<PublicFacility>[] = [
    {
      key: 'name',
      header: 'Fasilitas',
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-heading">{row.facility.name}</span>
          <span className="text-xs text-foreground/60">{row.facility.code}</span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Kategori',
      cell: (row) => CATEGORY_LABELS[row.facility.category],
    },
    {
      key: 'type',
      header: 'Tipe',
      cell: (row) => (
        <Badge variant="neutral">{USAGE_LABELS[row.facility.usageMode]}</Badge>
      ),
    },
    { key: 'number', header: 'Nomor', cell: (row) => row.number ?? '—' },
    {
      key: 'capacity',
      header: 'Kapasitas',
      cell: (row) => (row.capacity === null ? '—' : `${row.capacity} orang`),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: '',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (row) => (
        <div className="flex justify-end gap-2">
          {row.facility.usageMode === 'ASSIGNED' ? (
            <Can permission="facility.CREATE">
              <Button
                type="button"
                variant="neutral"
                size="icon-sm"
                aria-label={`Atur slot ${row.facility.name}`}
                onClick={() => setSlotTarget(row)}
              >
                <Users />
              </Button>
            </Can>
          ) : null}
          <Can permission="facility.UPDATE">
            <Button
              type="button"
              variant="neutral"
              size="icon-sm"
              aria-label={`Ubah ${row.facility.name}`}
              onClick={() => openEdit(row)}
            >
              <Pencil />
            </Button>
          </Can>
          <Can permission="facility.DELETE">
            <Button
              type="button"
              variant="neutral"
              size="icon-sm"
              aria-label={`Nonaktifkan ${row.facility.name}`}
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
        title="Fasilitas Umum"
        description="Instance fasilitas umum per gedung beserta penugasan slot."
      >
        <Can permission="facility.CREATE">
          <Button type="button" onClick={openCreate}>
            <Plus />
            Tambah fasilitas umum
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
        emptyTitle="Belum ada fasilitas umum"
        emptyDescription="Tambahkan fasilitas umum seperti kamar mandi, dapur, atau ruang belajar."
        emptyAction={
          <Can permission="facility.CREATE">
            <Button type="button" onClick={openCreate}>
              <Plus />
              Tambah fasilitas umum
            </Button>
          </Can>
        }
      />

      <PublicFacilityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        publicFacility={editing}
      />

      <PublicFacilitySlotDialog
        key={slotTarget?.id ?? 'none'}
        open={Boolean(slotTarget)}
        onOpenChange={(open) => {
          if (!open) setSlotTarget(null)
        }}
        publicFacility={slotTarget}
      />

      <ConfirmDialog
        open={Boolean(target)}
        onOpenChange={(open) => {
          if (!open) setTarget(null)
        }}
        title="Nonaktifkan fasilitas umum?"
        description={
          target
            ? `${target.facility.name}${target.number ? ` ${target.number}` : ''} akan dinonaktifkan.`
            : undefined
        }
        confirmLabel="Nonaktifkan"
        loading={remove.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
