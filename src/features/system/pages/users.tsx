import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { ShieldPlus, Trash2 } from 'lucide-react'

import { Can } from '@/components/shared/can'
import { DataTable, type Column } from '@/components/shared/data-table'
import { DateText } from '@/components/shared/date-text'
import { LoadingButton } from '@/components/shared/loading-button'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import { useBuildings } from '@/features/building/hooks'
import {
  useAllResidents,
  useAssignRole,
  useRevokeRole,
  useUserRoleAssignments,
} from '@/features/system/hooks'
import { cn } from '@/lib/utils'
import { useCan } from '@/lib/rbac'
import { useRoles } from '@/features/rbac/hooks'
import { notifyError, notifySuccess } from '@/lib/notify'

type ManagedUser = {
  id: string
  email: string
  name: string | null
  buildingId: string | null
  status: string
  emailVerified: boolean
  roles: { id: string; roleId: string; buildingId: string | null; assignedAt: string }[]
}

type BuildingOption = {
  id: string
  name: string
}

function RolesDialog({
  user,
  onClose,
  buildings,
}: {
  user: ManagedUser | null
  onClose: () => void
  buildings: BuildingOption[]
}) {
  const canReadRoles = useCan('role.READ')
  const roles = useRoles(canReadRoles)
  const assign = useAssignRole()
  const revoke = useRevokeRole()

  const [roleId, setRoleId] = useState('')
  const [scopeBuildingId, setScopeBuildingId] = useState('')

  if (!user) return null

  const roleNames = new Map(
    (roles.data ?? []).map((role) => [role.id, role.name]),
  )

  const available = (roles.data ?? []).filter(
    (role) =>
      role.isActive && !user.roles.some((item) => item.roleId === role.id),
  )

  const submitAssign = () => {
    if (!roleId) return
    assign.mutate(
      {
        userId: user.id,
        roleId,
        ...(scopeBuildingId ? { buildingId: scopeBuildingId } : {}),
      },
      {
        onSuccess: (res) => {
          notifySuccess(res.status)
          setRoleId('')
          setScopeBuildingId('')
        },
        onError: (error) => notifyError('Gagal memberi role', error),
      },
    )
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Kelola role · {user.name ?? user.email}</DialogTitle>
          <DialogDescription>
            Penugasan di bawah dibaca dari jejak audit; beri atau cabut role
            langsung dari sini.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {user.roles.length === 0 ? (
            <p className="text-sm text-foreground/60">Belum ada role.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {user.roles.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-base border-2 border-border bg-secondary-background p-3"
                >
                  <div className="flex flex-col gap-1">
                    <Badge className="bg-accent-teal text-foreground">
                      {roleNames.get(item.roleId) ?? item.roleId}
                    </Badge>
                    <span className="text-xs text-foreground/60">
                      {item.buildingId
                        ? `Scope: ${buildings.find((option) => option.id === item.buildingId)?.name ?? 'Gedung'} · `
                        : ''}
                      sejak <DateText value={item.assignedAt} />
                    </span>
                  </div>
                  <Can permission="role.UPDATE">
                    <button
                      type="button"
                      aria-label="Cabut role"
                      className={cn(
                        buttonVariants({
                          variant: 'neutral',
                          size: 'icon-sm',
                        }),
                      )}
                      disabled={revoke.isPending}
                      onClick={() =>
                        revoke.mutate(item.id, {
                          onSuccess: (res) => notifySuccess(res.status),
                          onError: (error) =>
                            notifyError('Gagal mencabut role', error),
                        })
                      }
                    >
                      <Trash2 />
                    </button>
                  </Can>
                </div>
              ))}
            </div>
          )}
          <Can permission="role.UPDATE">
            <div className="flex flex-col gap-3 rounded-base border-2 border-border p-3">
              <div className="grid gap-2">
                <Label htmlFor="assign-role">Role baru</Label>
                <NativeSelect
                  id="assign-role"
                  value={roleId}
                  onChange={(event) => setRoleId(event.target.value)}
                >
                  <NativeSelectOption value="">Pilih role</NativeSelectOption>
                  {available.map((role) => (
                    <NativeSelectOption key={role.id} value={role.id}>
                      {role.name}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="assign-scope">Scope (opsional)</Label>
                <NativeSelect
                  id="assign-scope"
                  value={scopeBuildingId}
                  onChange={(event) => setScopeBuildingId(event.target.value)}
                >
                <NativeSelectOption value="">Global</NativeSelectOption>
                {buildings.map((building) => (
                  <NativeSelectOption key={building.id} value={building.id}>
                    {building.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>

              <div>
                <LoadingButton
                  type="button"
                  loading={assign.isPending}
                  disabled={assign.isPending || !roleId}
                  onClick={submitAssign}
                >
                  <ShieldPlus />
                  Beri role
                </LoadingButton>
              </div>
            </div>
          </Can>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function SystemUsersPage() {
  const buildings = useBuildings()
  const assignments = useUserRoleAssignments()

  const buildingIds = useMemo(
    () => (buildings.data ?? []).map((building) => building.id),
    [buildings.data],
  )
  const allResidents = useAllResidents(buildingIds)
  const buildingNames = useMemo(
    () =>
      new Map(
        (buildings.data ?? []).map((building) => [building.id, building.name]),
      ),
    [buildings.data],
  )

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [manager, setManager] = useState<ManagedUser | null>(null)

  const rows = useMemo(() => {
    const value = search.trim().toLowerCase()
    return allResidents.data
      .filter((resident) => {
        if (statusFilter !== 'ALL' && resident.status !== statusFilter) {
          return false
        }
        if (!value) return true
        return (
          resident.email.toLowerCase().includes(value) ||
          (resident.name ?? '').toLowerCase().includes(value)
        )
      })
      .map<ManagedUser>((resident) => ({
        id: resident.id,
        email: resident.email,
        name: resident.name,
        buildingId: resident.buildingId,
        status: resident.status,
        emailVerified: resident.emailVerified,
        roles: (assignments.data?.get(resident.id) ?? []).map((item) => ({
          id: item.id,
          roleId: item.roleId,
          buildingId: item.buildingId,
          assignedAt: item.assignedAt,
        })),
      }))
  }, [allResidents.data, assignments.data, search, statusFilter])

  const columns: Column<ManagedUser>[] = [
    {
      key: 'user',
      header: 'Pengguna',
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <Link
            to={`/app/residents/${row.id}`}
            className="font-heading underline-offset-2 hover:underline"
          >
            {row.name ?? row.email}
          </Link>
          <span className="text-xs text-foreground/60">{row.email}</span>
        </div>
      ),
    },
    {
      key: 'building',
      header: 'Gedung',
      cell: (row) =>
        row.buildingId
          ? (buildingNames.get(row.buildingId) ?? 'Gedung')
          : '—',
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'roles',
      header: 'Role',
      cell: (row) =>
        row.roles.length === 0 ? (
          <span className="text-foreground/50">—</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {row.roles.map((item) => (
              <Badge key={item.id} variant="neutral">
                {item.roleId}
              </Badge>
            ))}
          </div>
        ),
    },
    {
      key: 'actions',
      header: '',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (row) => (
        <Button
          type="button"
          variant="neutral"
          size="sm"
          onClick={() => setManager(row)}
        >
          Kelola role
        </Button>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pengguna"
        description="Daftar pengguna (read-only dari daftar warga per gedung) beserta role dan penugasannya."
      />

      <div className="flex flex-wrap gap-3">
        <NativeSelect
          aria-label="Filter status"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="w-44"
        >
          <NativeSelectOption value="ALL">Semua status</NativeSelectOption>
          <NativeSelectOption value="PENDING">Menunggu</NativeSelectOption>
          <NativeSelectOption value="ACTIVE">Aktif</NativeSelectOption>
          <NativeSelectOption value="REJECTED">Ditolak</NativeSelectOption>
          <NativeSelectOption value="CHECKOUT">Checkout</NativeSelectOption>
        </NativeSelect>

        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari nama, email..."
          aria-label="Cari pengguna"
          className="w-64 bg-secondary-background"
        />
      </div>

      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        pageSize={10}
        isLoading={allResidents.isLoading || assignments.isLoading}
        error={
          (allResidents.error ?? assignments.error)
            ? ((allResidents.error ?? assignments.error) as Error).message
            : undefined
        }
        onRetry={() => {
          allResidents.refetch()
          assignments.refetch()
        }}
        emptyTitle="Belum ada pengguna"
        emptyDescription="Pengguna terdaftar pada gedung akan muncul di sini."
      />

      <RolesDialog
        key={manager?.id ?? 'none'}
        user={manager}
        onClose={() => setManager(null)}
        buildings={buildings.data ?? []}
      />
    </div>
  )
}
