import { useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'

import { Can } from '@/components/shared/can'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { DataTable, type Column } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import { useBuildings } from '@/features/building/hooks'
import type { Room } from '@/features/room/api'
import { RoomFormDialog } from '@/features/room/components/room-form-dialog'
import { useDeleteRoom, useRooms } from '@/features/room/hooks'
import { notifyError, notifySuccess } from '@/lib/notify'

export default function RoomsPage() {
  const { data, isLoading, error, refetch } = useRooms()
  const buildings = useBuildings()
  const remove = useDeleteRoom()

  const [buildingFilter, setBuildingFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Room | null>(null)
  const [target, setTarget] = useState<Room | null>(null)

  const buildingNames = useMemo(() => {
    const map = new Map<string, string>()
    for (const building of buildings.data ?? []) map.set(building.id, building.name)
    return map
  }, [buildings.data])

  const rooms = useMemo(() => {
    return (data ?? []).filter((room) => {
      if (buildingFilter !== 'ALL' && room.buildingId !== buildingFilter)
        return false
      if (statusFilter !== 'ALL' && room.status !== statusFilter) return false
      return true
    })
  }, [data, buildingFilter, statusFilter])

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (room: Room) => {
    setEditing(room)
    setFormOpen(true)
  }

  const confirmDelete = () => {
    if (!target) return
    remove.mutate(target.id, {
      onSuccess: (res) => {
        notifySuccess(res?.status ?? 'Kamar dinonaktifkan', target.number)
        setTarget(null)
      },
      onError: (error) => notifyError('Gagal menonaktifkan', error),
    })
  }

  const columns: Column<Room>[] = [
    {
      key: 'number',
      header: 'Nomor',
      className: 'font-heading',
      cell: (row) => row.number,
    },
    {
      key: 'building',
      header: 'Gedung',
      cell: (row) => buildingNames.get(row.buildingId) ?? '—',
    },
    {
      key: 'capacity',
      header: 'Kapasitas',
      cell: (row) => (
        <Badge variant="neutral" className="font-heading">
          {row.capacity} orang
        </Badge>
      ),
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
          <Can permission="room.UPDATE">
            <Button
              type="button"
              variant="neutral"
              size="icon-sm"
              aria-label={`Ubah kamar ${row.number}`}
              onClick={() => openEdit(row)}
            >
              <Pencil />
            </Button>
          </Can>
          <Can permission="room.DELETE">
            <Button
              type="button"
              variant="neutral"
              size="icon-sm"
              aria-label={`Nonaktifkan kamar ${row.number}`}
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
        title="Kamar"
        description="Master kamar per gedung beserta kapasitas dan statusnya."
      >
        <Can permission="room.CREATE">
          <Button type="button" onClick={openCreate}>
            <Plus />
            Tambah kamar
          </Button>
        </Can>
      </PageHeader>

      <div className="flex flex-wrap gap-3">
        <NativeSelect
          aria-label="Filter gedung"
          value={buildingFilter}
          onChange={(event) => setBuildingFilter(event.target.value)}
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
          aria-label="Filter status"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="w-44"
        >
          <NativeSelectOption value="ALL">Semua status</NativeSelectOption>
          <NativeSelectOption value="ACTIVE">Aktif</NativeSelectOption>
          <NativeSelectOption value="MAINTENANCE">Perbaikan</NativeSelectOption>
        </NativeSelect>
      </div>

      <DataTable
        columns={columns}
        data={rooms}
        getRowId={(row) => row.id}
        pageSize={10}
        isLoading={isLoading}
        error={error ? error.message : undefined}
        onRetry={() => refetch()}
        emptyTitle="Belum ada kamar"
        emptyDescription="Tambahkan kamar pada gedung untuk mulai mengelola penghuni."
        emptyAction={
          <Can permission="room.CREATE">
            <Button type="button" onClick={openCreate}>
              <Plus />
              Tambah kamar
            </Button>
          </Can>
        }
      />

      <RoomFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        room={editing}
        defaultBuildingId={
          buildingFilter !== 'ALL' ? buildingFilter : null
        }
      />

      <ConfirmDialog
        open={Boolean(target)}
        onOpenChange={(open) => {
          if (!open) setTarget(null)
        }}
        title="Nonaktifkan kamar?"
        description={
          target
            ? `Kamar ${target.number} akan dinonaktifkan dan tidak bisa ditempati.`
            : undefined
        }
        confirmLabel="Nonaktifkan"
        loading={remove.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
