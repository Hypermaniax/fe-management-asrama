import { useMemo, useState } from 'react'
import { LogOut, Plus } from 'lucide-react'

import { Can } from '@/components/shared/can'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { DataTable, type Column } from '@/components/shared/data-table'
import { DateText } from '@/components/shared/date-text'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import { useBuildings } from '@/features/building/hooks'
import type { Occupancy } from '@/features/occupancy/api'
import { OccupancyFormDialog } from '@/features/occupancy/components/occupancy-form-dialog'
import {
  useCheckoutOccupancy,
  useOccupancies,
} from '@/features/occupancy/hooks'
import { notifyError, notifySuccess } from '@/lib/notify'
import { useScopeStore } from '@/stores/scope'

export default function OccupanciesPage() {
  const activeBuildingId = useScopeStore((state) => state.activeBuildingId)
  const buildings = useBuildings()
  const { data, isLoading, error, refetch } = useOccupancies()
  const checkout = useCheckoutOccupancy()

  const [buildingFilter, setBuildingFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [formOpen, setFormOpen] = useState(false)
  const [target, setTarget] = useState<Occupancy | null>(null)

  const buildingNames = useMemo(() => {
    const map = new Map<string, string>()
    for (const building of buildings.data ?? [])
      map.set(building.id, building.name)
    return map
  }, [buildings.data])

  const rows = useMemo(() => {
    return (data ?? []).filter((occupancy) => {
      if (
        buildingFilter !== 'ALL' &&
        occupancy.room.buildingId !== buildingFilter
      )
        return false
      if (statusFilter !== 'ALL' && occupancy.status !== statusFilter)
        return false
      return true
    })
  }, [data, buildingFilter, statusFilter])

  const confirmCheckout = () => {
    if (!target) return
    checkout.mutate(target.id, {
      onSuccess: (res) => {
        notifySuccess(res.status, target.user.name ?? target.user.email)
        setTarget(null)
      },
      onError: (error) => notifyError('Gagal checkout', error),
    })
  }

  const columns: Column<Occupancy>[] = [
    {
      key: 'resident',
      header: 'Penghuni',
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-heading">
            {row.user.name ?? row.user.email}
          </span>
          <span className="text-xs text-foreground/60">{row.user.email}</span>
        </div>
      ),
    },
    {
      key: 'room',
      header: 'Kamar',
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-heading">Kamar {row.room.number}</span>
          <span className="text-xs text-foreground/60">
            {buildingNames.get(row.room.buildingId) ?? '—'}
          </span>
        </div>
      ),
    },
    {
      key: 'bed',
      header: 'Bed',
      cell: (row) => row.bedLabel ?? '—',
    },
    {
      key: 'start',
      header: 'Mulai',
      cell: (row) => <DateText value={row.startDate} />,
    },
    {
      key: 'end',
      header: 'Selesai',
      cell: (row) =>
        row.endDate ? (
          <DateText value={row.endDate} />
        ) : (
          <span className="text-foreground/60">—</span>
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
      cell: (row) =>
        row.status === 'ACTIVE' ? (
          <Can permission="occupancy.UPDATE">
            <Button
              type="button"
              variant="neutral"
              size="icon-sm"
              aria-label={`Checkout ${row.user.name ?? row.user.email}`}
              onClick={() => setTarget(row)}
            >
              <LogOut />
            </Button>
          </Can>
        ) : null,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Penempatan Kamar"
        description="Riwayat penempatan penghuni beserta checkout."
      >
        <Can permission="occupancy.CREATE">
          <Button type="button" onClick={() => setFormOpen(true)}>
            <Plus />
            Tempatkan penghuni
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
          <NativeSelectOption value="ENDED">Selesai</NativeSelectOption>
        </NativeSelect>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        pageSize={10}
        isLoading={isLoading}
        error={error ? error.message : undefined}
        onRetry={() => refetch()}
        emptyTitle="Belum ada penempatan"
        emptyDescription="Tempatkan penghuni aktif ke kamar untuk memulai masa sewa."
        emptyAction={
          <Can permission="occupancy.CREATE">
            <Button type="button" onClick={() => setFormOpen(true)}>
              <Plus />
              Tempatkan penghuni
            </Button>
          </Can>
        }
      />

      <OccupancyFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        defaultBuildingId={
          buildingFilter !== 'ALL' ? buildingFilter : activeBuildingId
        }
      />

      <ConfirmDialog
        open={Boolean(target)}
        onOpenChange={(open) => {
          if (!open) setTarget(null)
        }}
        title="Checkout penghuni?"
        description={
          target
            ? `Penempatan ${target.user.name ?? target.user.email} di kamar ${target.room.number} akan diakhiri dan slot fasilitas dibebaskan.`
            : undefined
        }
        confirmLabel="Checkout"
        loading={checkout.isPending}
        onConfirm={confirmCheckout}
      />
    </div>
  )
}
