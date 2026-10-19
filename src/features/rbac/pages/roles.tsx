import { useState } from 'react'
import { Lock, Pencil, Plus, Trash2 } from 'lucide-react'

import { Can } from '@/components/shared/can'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { DataTable, type Column } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Role } from '@/features/rbac/api'
import { RoleFormDialog } from '@/features/rbac/components/role-form-dialog'
import { useDeleteRole, useRoles } from '@/features/rbac/hooks'
import { notifyError, notifySuccess } from '@/lib/notify'

export default function RolesPage() {
  const { data, isLoading, error, refetch } = useRoles()
  const remove = useDeleteRole()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Role | null>(null)
  const [target, setTarget] = useState<Role | null>(null)

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (role: Role) => {
    setEditing(role)
    setFormOpen(true)
  }

  const confirmDelete = () => {
    if (!target) return
    remove.mutate(target.id, {
      onSuccess: (res) => {
        notifySuccess(res?.status ?? 'Role dinonaktifkan', target.name)
        setTarget(null)
      },
      onError: (error) => notifyError('Gagal menonaktifkan', error),
    })
  }

  const columns: Column<Role>[] = [
    {
      key: 'code',
      header: 'Kode',
      className: 'font-heading',
      cell: (row) => row.code,
    },
    { key: 'name', header: 'Nama', cell: (row) => row.name },
    {
      key: 'description',
      header: 'Deskripsi',
      className: 'max-w-xs truncate text-foreground/80',
      cell: (row) => row.description ?? '—',
    },
    {
      key: 'system',
      header: 'Tipe',
      cell: (row) =>
        row.isSystem ? (
          <Badge className="gap-1 bg-foreground text-background font-heading uppercase">
            <Lock className="size-3" />
            Sistem
          </Badge>
        ) : (
          <span className="text-foreground/60">Kustom</span>
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
          <Can permission="role.UPDATE">
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
          {row.isSystem ? null : (
            <Can permission="role.DELETE">
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
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Role"
        description="Kelola role, lalu tetapkan permission dan menu yang melekat padanya."
      >
        <Can permission="role.CREATE">
          <Button type="button" onClick={openCreate}>
            <Plus />
            Tambah role
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
        emptyTitle="Belum ada role"
        emptyDescription="Role default di-seed oleh backend. Tambahkan role kustom bila perlu."
        emptyAction={
          <Can permission="role.CREATE">
            <Button type="button" onClick={openCreate}>
              <Plus />
              Tambah role
            </Button>
          </Can>
        }
      />

      <RoleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        role={editing}
      />

      <ConfirmDialog
        open={Boolean(target)}
        onOpenChange={(open) => {
          if (!open) setTarget(null)
        }}
        title="Nonaktifkan role?"
        description={
          target
            ? `Role ${target.name} akan dinonaktifkan dan tidak menghasilkan akses.`
            : undefined
        }
        confirmLabel="Nonaktifkan"
        loading={remove.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
