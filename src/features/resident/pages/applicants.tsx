import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Check, Eye, X } from 'lucide-react'

import { Can } from '@/components/shared/can'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { DataTable, type Column } from '@/components/shared/data-table'
import { DateText } from '@/components/shared/date-text'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import { useBuildings } from '@/features/building/hooks'
import type { Resident } from '@/features/resident/api'
import { RejectResidentDialog } from '@/features/resident/components/reject-resident-dialog'
import { useApproveResident, useResidents } from '@/features/resident/hooks'
import { notifyError, notifySuccess } from '@/lib/notify'
import { useScopeStore } from '@/stores/scope'

export default function ApplicantsPage() {
  const activeBuildingId = useScopeStore((state) => state.activeBuildingId)
  const buildings = useBuildings()
  const [buildingId, setBuildingId] = useState(activeBuildingId ?? '')

  const selectedBuildingId =
    buildingId || buildings.data?.[0]?.id || activeBuildingId || ''

  const { data, isLoading, error, refetch } = useResidents(
    selectedBuildingId || null,
  )
  const approve = useApproveResident()

  const [approveTarget, setApproveTarget] = useState<Resident | null>(null)
  const [rejectTarget, setRejectTarget] = useState<Resident | null>(null)

  const buildingNames = useMemo(() => {
    const map = new Map<string, string>()
    for (const building of buildings.data ?? [])
      map.set(building.id, building.name)
    return map
  }, [buildings.data])

  const applicants = useMemo(
    () =>
      (data ?? []).filter(
        (resident) =>
          resident.status === 'PENDING' || resident.status === 'REJECTED',
      ),
    [data],
  )

  const confirmApprove = () => {
    if (!approveTarget) return
    approve.mutate(
      {
        id: approveTarget.id,
        buildingId: approveTarget.buildingId ?? selectedBuildingId,
      },
      {
        onSuccess: (res) => {
          notifySuccess(res.status, approveTarget.name ?? approveTarget.email)
          setApproveTarget(null)
        },
        onError: (error) => notifyError('Gagal menyetujui', error),
      },
    )
  }

  const columns: Column<Resident>[] = [
    {
      key: 'name',
      header: 'Pendaftar',
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
      key: 'submittedAt',
      header: 'Tanggal submit',
      cell: (row) =>
        row.submittedAt ? (
          <DateText value={row.submittedAt} withTime />
        ) : (
          <span className="text-foreground/60">Belum submit</span>
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
          {row.status === 'PENDING' ? (
            <>
              <Can permission="user.APPROVE">
                <Button
                  type="button"
                  size="icon-sm"
                  aria-label={`Setujui ${row.name ?? row.email}`}
                  onClick={() => setApproveTarget(row)}
                >
                  <Check />
                </Button>
              </Can>
              <Can permission="user.APPROVE">
                <Button
                  type="button"
                  variant="neutral"
                  size="icon-sm"
                  className="text-danger"
                  aria-label={`Tolak ${row.name ?? row.email}`}
                  onClick={() => setRejectTarget(row)}
                >
                  <X />
                </Button>
              </Can>
            </>
          ) : null}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pendaftar"
        description="Calon penghuni yang menunggu review atau telah ditolak."
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
      </div>

      <DataTable
        columns={columns}
        data={applicants}
        getRowId={(row) => row.id}
        pageSize={10}
        isLoading={isLoading}
        error={error ? error.message : undefined}
        onRetry={() => refetch()}
        emptyTitle="Tidak ada pendaftar"
        emptyDescription="Belum ada pendaftar yang menunggu review di gedung ini."
      />

      <ConfirmDialog
        open={Boolean(approveTarget)}
        onOpenChange={(open) => {
          if (!open) setApproveTarget(null)
        }}
        title="Setujui pendaftaran?"
        description={
          approveTarget
            ? `${approveTarget.name ?? approveTarget.email} akan menjadi penghuni aktif dan mendapat role PENGHUNI.`
            : undefined
        }
        confirmLabel="Setujui"
        tone="default"
        loading={approve.isPending}
        onConfirm={confirmApprove}
      />

      <RejectResidentDialog
        open={Boolean(rejectTarget)}
        onOpenChange={(open) => {
          if (!open) setRejectTarget(null)
        }}
        resident={rejectTarget}
      />
    </div>
  )
}
