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
import type { Position } from '@/features/organization/api'
import { PositionFormDialog } from '@/features/organization/components/position-form-dialog'
import {
  useDeletePosition,
  usePositions,
} from '@/features/organization/hooks'
import { useRoles } from '@/features/rbac/hooks'
import { notifyError, notifySuccess } from '@/lib/notify'
import { useCan } from '@/lib/rbac'

export default function PositionsPage() {
  const positions = usePositions()
  const buildings = useBuildings()
  const canReadRoles = useCan('role.READ')
  const roles = useRoles(canReadRoles)
  const remove = useDeletePosition()

  const [scopeFilter, setScopeFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ACTIVE')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Position | null>(null)
  const [target, setTarget] = useState<Position | null>(null)

  const buildingNames = useMemo(() => {
    const map = new Map<string, string>()
    for (const building of buildings.data ?? []) {
      map.set(building.id, building.name)
    }
    return map
  }, [buildings.data])

  const roleNames = useMemo(() => {
    const map = new Map<string, string>()
    for (const role of roles.data ?? []) map.set(role.id, role.name)
    return map
  }, [roles.data])

  const rows = useMemo(() => {
    return (positions.data ?? []).filter((position) => {
      if (scopeFilter !== 'ALL') {
        const key = position.buildingId ?? 'ASRAMA'
        if (key !== scopeFilter) return false
      }
      if (statusFilter === 'ACTIVE' && !position.isActive) return false
      if (statusFilter === 'INACTIVE' && position.isActive) return false
      return true
    })
  }, [positions.data, scopeFilter, statusFilter])

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (position: Position) => {
    setEditing(position)
    setFormOpen(true)
  }

  const confirmDelete = () => {
    if (!target) return
    remove.mutate(target.id, {
      onSuccess: (res) => {
        notifySuccess(res?.status ?? 'Jabatan dinonaktifkan', target.name)
        setTarget(null)
      },
      onError: (error) => notifyError('Gagal menonaktifkan', error),
    })
  }

  const columns: Column<Position>[] = [
    {
      key: 'code',
      header: 'Kode',
      cell: (row) => <span className="font-heading">{row.code}</span>,
    },
    {
      key: 'name',
      header: 'Nama',
      cell: (row) => row.name,
    },
    {
      key: 'level',
      header: 'Level',
      cell: (row) => (row.level === null ? '—' : row.level),
    },
    {
      key: 'scope',
      header: 'Scope',
      cell: (row) =>
        row.buildingId
          ? (buildingNames.get(row.buildingId) ?? '—')
          : 'Asrama',
    },
    {
      key: 'role',
      header: 'Role',
      cell: (row) =>
        row.role?.name ??
        (row.roleId ? (roleNames.get(row.roleId) ?? '—') : '—'),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) =>
        row.isActive ? (
          <Badge className="bg-accent-teal text-foreground">Aktif</Badge>
        ) : (
          <Badge variant="neutral">Nonaktif</Badge>
        ),
    },
    {
      key: 'actions',
      header: '',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (row) => (
        <div className="flex justify-end gap-2">
          <Can permission="position.UPDATE">
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
          {row.isActive ? (
            <Can permission="position.DELETE">
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
          ) : null}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Jabatan"
        description="Daftar jabatan asrama dan gedung beserta role terkait."
      >
        <Can permission="position.CREATE">
          <Button type="button" onClick={openCreate}>
            <Plus />
            Tambah jabatan
          </Button>
        </Can>
      </PageHeader>

      <div className="flex flex-wrap gap-3">
        <NativeSelect
          aria-label="Filter scope"
          value={scopeFilter}
          onChange={(event) => setScopeFilter(event.target.value)}
          className="w-48"
        >
          <NativeSelectOption value="ALL">Semua scope</NativeSelectOption>
          <NativeSelectOption value="ASRAMA">Asrama</NativeSelectOption>
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
          <NativeSelectOption value="ACTIVE">Aktif</NativeSelectOption>
          <NativeSelectOption value="INACTIVE">Nonaktif</NativeSelectOption>
          <NativeSelectOption value="ALL">Semua status</NativeSelectOption>
        </NativeSelect>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        pageSize={10}
        isLoading={positions.isLoading}
        error={positions.error ? positions.error.message : undefined}
        onRetry={() => positions.refetch()}
        emptyTitle="Belum ada jabatan"
        emptyDescription="Tambahkan jabatan untuk menyusun kepengurusan."
        emptyAction={
          <Can permission="position.CREATE">
            <Button type="button" onClick={openCreate}>
              <Plus />
              Tambah jabatan
            </Button>
          </Can>
        }
      />

      {formOpen ? (
        <PositionFormDialog
          key={editing?.id ?? 'new'}
          open
          onOpenChange={(open) => {
            setFormOpen(open)
            if (!open) setEditing(null)
          }}
          position={editing}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(target)}
        onOpenChange={(open) => {
          if (!open) setTarget(null)
        }}
        title="Nonaktifkan jabatan?"
        description={
          target
            ? `Jabatan ${target.name} akan dinonaktifkan dan tidak tersedia untuk penugasan baru.`
            : undefined
        }
        confirmLabel="Nonaktifkan"
        loading={remove.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
