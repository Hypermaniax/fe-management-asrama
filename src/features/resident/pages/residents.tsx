import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Eye, LogOut, Pencil } from 'lucide-react'

import { Can } from '@/components/shared/can'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { DataTable, type Column } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import { useBuildings } from '@/features/building/hooks'
import { useOccupancies } from '@/features/occupancy/hooks'
import type { Resident } from '@/features/resident/api'
import { ResidentFormDialog } from '@/features/resident/components/resident-form-dialog'
import {
  useCheckoutResident,
  useResidents,
} from '@/features/resident/hooks'
import { useCan } from '@/lib/rbac'
import { notifyError, notifySuccess } from '@/lib/notify'
import { useScopeStore } from '@/stores/scope'

export default function ResidentsPage() {
  const activeBuildingId = useScopeStore((state) => state.activeBuildingId)
  const canOccupancy = useCan('occupancy.READ')
  const buildings = useBuildings()
  const [buildingId, setBuildingId] = useState(activeBuildingId ?? '')

  const selectedBuildingId =
    buildingId || buildings.data?.[0]?.id || activeBuildingId || ''

  const { data, isLoading, error, refetch } = useResidents(
    selectedBuildingId || null,
  )
  const occupancies = useOccupancies(canOccupancy)
  const checkout = useCheckoutResident()

  const [statusFilter, setStatusFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Resident | null>(null)
  const [target, setTarget] = useState<Resident | null>(null)

  const buildingNames = useMemo(() => {
    const map = new Map<string, string>()
    for (const building of buildings.data ?? [])
      map.set(building.id, building.name)
    return map
  }, [buildings.data])

  const roomByUser = useMemo(() => {
    const map = new Map<string, string>()
    for (const occupancy of occupancies.data ?? []) {
      if (occupancy.status === 'ACTIVE') {
        map.set(occupancy.userId, occupancy.room.number)
      }
    }
    return map
  }, [occupancies.data])

  const rows = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return (data ?? [])
      .filter(
        (resident) =>
          resident.status === 'ACTIVE' || resident.status === 'CHECKOUT',
      )
      .filter((resident) =>
        statusFilter === 'ALL' ? true : resident.status === statusFilter,
      )
      .filter((resident) => {
        if (!keyword) return true
        return (
          (resident.name ?? '').toLowerCase().includes(keyword) ||
          resident.email.toLowerCase().includes(keyword)
        )
      })
  }, [data, statusFilter, search])

  const confirmCheckout = () => {
    if (!target) return
    checkout.mutate(target.id, {
      onSuccess: (res) => {
        notifySuccess(res.status, target.name ?? target.email)
        setTarget(null)
      },
      onError: (error) => notifyError('Gagal checkout', error),
    })
  }

  const columns: Column<Resident>[] = [
    {
      key: 'name',
      header: 'Penghuni',
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-heading">{row.name ?? '—'}</span>
          <span className="text-xs text-foreground/60">{row.email}</span>
        </div>
      ),
    },
    {
      key: 'building',
      header: 'Gedung',
      cell: (row) =>
        row.buildingId ? (buildingNames.get(row.buildingId) ?? '—') : '—',
    },
    {
      key: 'room',
      header: 'Kamar',
      cell: (row) => roomByUser.get(row.id) ?? '—',
    },
    {
      key: 'contact',
      header: 'Kontak',
      cell: (row) => row.phone ?? '—',
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
          <Link
            to={`/app/residents/${row.id}`}
            className={buttonVariants({
              variant: 'neutral',
              size: 'icon-sm',
            })}
            aria-label={`Lihat ${row.name ?? row.email}`}
          >
            <Eye />
          </Link>
          <Can permission="user.UPDATE">
            <Button
              type="button"
              variant="neutral"
              size="icon-sm"
              aria-label={`Ubah ${row.name ?? row.email}`}
              onClick={() => {
                setEditing(row)
                setFormOpen(true)
              }}
            >
              <Pencil />
            </Button>
          </Can>
          {row.status === 'ACTIVE' ? (
            <Can permission="user.UPDATE">
              <Button
                type="button"
                variant="neutral"
                size="icon-sm"
                aria-label={`Checkout ${row.name ?? row.email}`}
                onClick={() => setTarget(row)}
              >
                <LogOut />
              </Button>
            </Can>
          ) : null}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Data Penghuni"
        description="Penghuni aktif dan yang sudah checkout beserta kontaknya."
      />

      <div className="flex flex-wrap gap-3">
        <NativeSelect
          aria-label="Filter gedung"
          value={selectedBuildingId}
          onChange={(event) => setBuildingId(event.target.value)}
          className="w-48"
        >
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
          <NativeSelectOption value="CHECKOUT">Checkout</NativeSelectOption>
        </NativeSelect>

        <Input
          aria-label="Cari penghuni"
          placeholder="Cari nama atau email"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full sm:w-64"
        />
      </div>

      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        pageSize={10}
        isLoading={isLoading}
        error={error ? error.message : undefined}
        onRetry={() => refetch()}
        emptyTitle="Belum ada penghuni"
        emptyDescription="Setujui pendaftar untuk menjadikannya penghuni aktif."
      />

      <ResidentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        resident={editing}
      />

      <ConfirmDialog
        open={Boolean(target)}
        onOpenChange={(open) => {
          if (!open) setTarget(null)
        }}
        title="Checkout penghuni?"
        description={
          target
            ? `${target.name ?? target.email} akan berstatus CHECKOUT.`
            : undefined
        }
        confirmLabel="Checkout"
        loading={checkout.isPending}
        onConfirm={confirmCheckout}
      />
    </div>
  )
}
