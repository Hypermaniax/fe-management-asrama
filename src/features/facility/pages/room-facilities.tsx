import { useMemo, useState } from 'react'
import { Pencil, Plus, Settings2, Trash2 } from 'lucide-react'

import { Can } from '@/components/shared/can'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { DataTable, type Column } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useBuildings } from '@/features/building/hooks'
import type { Facility } from '@/features/facility/api'
import { FacilityFormDialog } from '@/features/facility/components/facility-form-dialog'
import { RoomFacilityDialog } from '@/features/facility/components/room-facility-dialog'
import {
  useDeleteFacility,
  useFacilities,
} from '@/features/facility/hooks'
import { CATEGORY_LABELS, USAGE_LABELS } from '@/features/facility/labels'
import type { Room } from '@/features/room/api'
import { useRooms } from '@/features/room/hooks'
import { notifyError, notifySuccess } from '@/lib/notify'

export default function RoomFacilitiesPage() {
  const facilities = useFacilities('ROOM')
  const rooms = useRooms()
  const buildings = useBuildings()
  const remove = useDeleteFacility()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Facility | null>(null)
  const [target, setTarget] = useState<Facility | null>(null)
  const [roomTarget, setRoomTarget] = useState<Room | null>(null)

  const buildingNames = useMemo(() => {
    const map = new Map<string, string>()
    for (const building of buildings.data ?? []) map.set(building.id, building.name)
    return map
  }, [buildings.data])

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (facility: Facility) => {
    setEditing(facility)
    setFormOpen(true)
  }

  const confirmDelete = () => {
    if (!target) return
    remove.mutate(target.id, {
      onSuccess: (res) => {
        notifySuccess(res?.status ?? 'Fasilitas dinonaktifkan', target.name)
        setTarget(null)
      },
      onError: (error) => notifyError('Gagal menonaktifkan', error),
    })
  }

  const facilityColumns: Column<Facility>[] = [
    {
      key: 'code',
      header: 'Kode',
      className: 'font-heading',
      cell: (row) => row.code,
    },
    { key: 'name', header: 'Nama', cell: (row) => row.name },
    {
      key: 'category',
      header: 'Kategori',
      cell: (row) => CATEGORY_LABELS[row.category],
    },
    {
      key: 'usage',
      header: 'Tipe',
      cell: (row) => (
        <Badge variant="neutral">{USAGE_LABELS[row.usageMode]}</Badge>
      ),
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
          <Can permission="facility.UPDATE">
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
          <Can permission="facility.DELETE">
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

  const roomColumns: Column<Room>[] = [
    {
      key: 'number',
      header: 'Kamar',
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
      cell: (row) => `${row.capacity} orang`,
    },
    {
      key: 'actions',
      header: '',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (row) => (
        <Can permission="facility.UPDATE">
          <Button
            type="button"
            variant="neutral"
            size="sm"
            onClick={() => setRoomTarget(row)}
          >
            <Settings2 />
            Atur fasilitas
          </Button>
        </Can>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Fasilitas Kamar"
        description="Katalog fasilitas kamar dan fasilitas yang terpasang per kamar."
      >
        <Can permission="facility.CREATE">
          <Button type="button" onClick={openCreate}>
            <Plus />
            Tambah fasilitas
          </Button>
        </Can>
      </PageHeader>

      <Tabs defaultValue="katalog">
        <TabsList>
          <TabsTrigger value="katalog">Katalog</TabsTrigger>
          <TabsTrigger value="kamar">Per kamar</TabsTrigger>
        </TabsList>

        <TabsContent value="katalog" className="pt-4">
          <DataTable
            columns={facilityColumns}
            data={facilities.data ?? []}
            getRowId={(row) => row.id}
            pageSize={10}
            isLoading={facilities.isLoading}
            error={facilities.error ? facilities.error.message : undefined}
            onRetry={() => facilities.refetch()}
            emptyTitle="Belum ada fasilitas kamar"
            emptyDescription="Tambahkan fasilitas seperti kasur, lemari, atau meja."
            emptyAction={
              <Can permission="facility.CREATE">
                <Button type="button" onClick={openCreate}>
                  <Plus />
                  Tambah fasilitas
                </Button>
              </Can>
            }
          />
        </TabsContent>

        <TabsContent value="kamar" className="pt-4">
          <DataTable
            columns={roomColumns}
            data={rooms.data ?? []}
            getRowId={(row) => row.id}
            pageSize={10}
            isLoading={rooms.isLoading}
            error={rooms.error ? rooms.error.message : undefined}
            onRetry={() => rooms.refetch()}
            emptyTitle="Belum ada kamar"
            emptyDescription="Tambahkan kamar terlebih dahulu pada menu Kamar."
          />
        </TabsContent>
      </Tabs>

      <FacilityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        facility={editing}
        defaultScope="ROOM"
      />

      <RoomFacilityDialog
        open={Boolean(roomTarget)}
        onOpenChange={(open) => {
          if (!open) setRoomTarget(null)
        }}
        room={roomTarget}
      />

      <ConfirmDialog
        open={Boolean(target)}
        onOpenChange={(open) => {
          if (!open) setTarget(null)
        }}
        title="Nonaktifkan fasilitas?"
        description={
          target
            ? `Fasilitas ${target.name} akan dinonaktifkan dan tidak muncul pada pilihan baru.`
            : undefined
        }
        confirmLabel="Nonaktifkan"
        loading={remove.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
