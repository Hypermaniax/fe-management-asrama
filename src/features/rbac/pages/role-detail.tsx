import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'

import { LoadingButton } from '@/components/shared/loading-button'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { SkeletonTable } from '@/components/shared/skeletons'
import { Checkbox } from '@/components/ui/checkbox'
import { ErrorState } from '@/components/shared/error-state'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  useAllMenus,
  usePermissions,
  useRoleMenus,
  useRolePermissions,
  useRoles,
  useSetRoleMenus,
  useSetRolePermissions,
} from '@/features/rbac/hooks'
import { useCan } from '@/lib/rbac'
import { notifyError, notifySuccess } from '@/lib/notify'

const ACTIONS = ['CREATE', 'READ', 'UPDATE', 'DELETE'] as const

function PermissionEditor({ roleId }: { roleId: string }) {
  const permissions = usePermissions()
  const current = useRolePermissions(roleId)
  const save = useSetRolePermissions(roleId)
  const canEdit = useCan('role.UPDATE')
  const [q, setQ] = useState('')
  const [overrides, setOverrides] = useState<Record<string, boolean>>({})

  const initial = useMemo(() => current.data ?? [], [current.data])

  const rows = useMemo(() => {
    const list = permissions.data ?? []
    const filtered = q.trim()
      ? list.filter(
          (item) =>
            item.resource.includes(q.trim().toLowerCase()) ||
            item.action.includes(q.trim().toLowerCase()),
        )
      : list
    return [...new Set(filtered.map((item) => item.resource))]
      .sort()
      .map((resource) => ({
        resource,
        cells: ACTIONS.map((action) =>
          filtered.find(
            (item) => item.resource === resource && item.action === action,
          ),
        ),
      }))
  }, [permissions.data, q])

  const dirty = canEdit && Object.keys(overrides).length > 0

  const checked = (id: string) =>
    overrides[id] ?? initial.includes(id)

  const toggle = (id: string, value: boolean) => {
    setOverrides((prev) => ({ ...prev, [id]: value }))
  }

  const selected = useMemo(() => {
    const allPermissions = permissions.data ?? []
    const granted = initial.slice()
    for (const permission of allPermissions) {
      if (overrides[permission.id] === true && !granted.includes(permission.id)) {
        granted.push(permission.id)
      }
      if (overrides[permission.id] === false) {
        const index = granted.indexOf(permission.id)
        if (index >= 0) granted.splice(index, 1)
      }
    }
    return granted
  }, [permissions.data, initial, overrides])

  if (permissions.isLoading || current.isLoading) {
    return <SkeletonTable rows={10} cols={5} />
  }
  if (permissions.error || current.error) {
    return (
      <ErrorState
        onRetry={() => {
          void permissions.refetch()
          void current.refetch()
        }}
        message={(permissions.error ?? current.error)?.message}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Cari resource/action…"
          aria-label="Cari permission"
          className="w-56 bg-secondary-background"
        />
        {dirty ? (
          <LoadingButton
            type="button"
            loading={save.isPending}
            onClick={() =>
              save.mutate(selected, {
                onSuccess: () => {
                  setOverrides({})
                  notifySuccess('Permission role disimpan')
                },
                onError: (error) =>
                  notifyError('Gagal menyimpan permission', error),
              })
            }
          >
            Simpan permission
          </LoadingButton>
        ) : null}
      </div>

      <div className="overflow-auto rounded-base border-2 border-border bg-secondary-background">
        <Table className="scrollbar">
          <TableHeader>
            <TableRow className="bg-accent-teal hover:bg-accent-teal">
              <TableHead>Resource</TableHead>
              {ACTIONS.map((action) => (
                <TableHead key={action} className="text-center">
                  {action}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.resource}>
                <TableCell className="font-heading">{row.resource}</TableCell>
                {row.cells.map((cell, index) => (
                  <TableCell key={index} className="text-center">
                    {cell ? (
                      <Checkbox
                        aria-label={cell.code}
                        checked={checked(cell.id)}
                        onCheckedChange={(value) =>
                          toggle(cell.id, value === true)
                        }
                        disabled={!canEdit}
                        className="justify-self-center"
                      />
                    ) : (
                      <span className="text-foreground/30">—</span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function MenuEditor({ roleId }: { roleId: string }) {
  const menus = useAllMenus()
  const current = useRoleMenus(roleId)
  const save = useSetRoleMenus(roleId)
  const canEdit = useCan('role.UPDATE')
  const [overrides, setOverrides] = useState<Record<string, boolean>>({})

  const initial = useMemo(() => current.data ?? [], [current.data])

  const tree = useMemo(() => {
    const list = menus.data ?? []
    const byParent = new Map<string, typeof list>()
    for (const menu of list) {
      const key = menu.parentId ?? ''
      const entries = byParent.get(key) ?? []
      entries.push(menu)
      byParent.set(key, entries)
    }
    return [...(byParent.get('') ?? [])]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((root) => ({
        root,
        children: [...(byParent.get(root.id) ?? [])].sort(
          (a, b) => a.sortOrder - b.sortOrder,
        ),
      }))
  }, [menus.data])

  const dirty = canEdit && Object.keys(overrides).length > 0

  const checked = (id: string) => overrides[id] ?? initial.includes(id)

  const selected = useMemo(() => {
    const all = (menus.data ?? []).map((menu) => menu.id)
    const granted = initial.filter((id) => all.includes(id))
    for (const id of all) {
      if (overrides[id] === true && !granted.includes(id)) {
        granted.push(id)
      }
      if (overrides[id] === false) {
        const index = granted.indexOf(id)
        if (index >= 0) granted.splice(index, 1)
      }
    }
    return granted
  }, [menus.data, initial, overrides])

  const toggle = (id: string, value: boolean) => {
    setOverrides((prev) => ({ ...prev, [id]: value }))
  }

  if (menus.isLoading || current.isLoading) {
    return <SkeletonTable rows={10} cols={3} />
  }
  if (menus.error || current.error) {
    return (
      <ErrorState
        onRetry={() => {
          void menus.refetch()
          void current.refetch()
        }}
        message={(menus.error ?? current.error)?.message}
      />
    )
  }

  const itemRow = (menu: (typeof tree)[number]['root'], nested?: boolean) => (
    <div
      key={menu.id}
      className={
        nested
          ? 'flex items-center gap-3 pl-8'
          : 'flex items-center gap-3 font-heading'
      }
    >
      {canEdit ? (
        <Checkbox
          aria-label={menu.name}
          checked={checked(menu.id)}
          onCheckedChange={(value) => toggle(menu.id, value === true)}
        />
      ) : (
        <span
          className={checked(menu.id) ? 'text-foreground' : 'text-foreground/30'}
        >
          {checked(menu.id) ? '✓' : '—'}
        </span>
      )}
      <span className="flex-1">{menu.name}</span>
      <code className="font-mono text-xs text-foreground/60">
        {menu.path === '#' ? 'grup' : menu.path}
      </code>
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        {dirty ? (
          <LoadingButton
            type="button"
            loading={save.isPending}
            onClick={() =>
              save.mutate(selected, {
                onSuccess: () => {
                  setOverrides({})
                  notifySuccess('Menu role disimpan')
                },
                onError: (error) =>
                  notifyError('Gagal menyimpan menu', error),
              })
            }
          >
            Simpan menu
          </LoadingButton>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 rounded-base border-2 border-border bg-secondary-background p-4">
        {tree.map(({ root, children }) => (
          <div key={root.id} className="flex flex-col gap-2">
            {itemRow(root)}
            {children.map((child) => itemRow(child, true))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function RoleDetailPage() {
  const { id = '' } = useParams()
  const roles = useRoles()
  const role = roles.data?.find((item) => item.id === id)

  if (roles.isLoading) {
    return <SkeletonTable rows={6} cols={4} />
  }
  if (roles.error) {
    return (
      <ErrorState onRetry={() => roles.refetch()} message={roles.error.message} />
    )
  }
  if (!role) {
    return (
      <ErrorState message="Role tidak ditemukan; kembali ke daftar role." />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Role · ${role.code}`}
        description={`Tetapkan permission dan menu untuk ${role.name}.`}
      >
        <Link
          to="/app/system/roles"
          className="inline-flex items-center gap-2 rounded-base border-2 border-border bg-secondary-background px-4 py-2 text-sm font-base shadow-shadow transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none active:translate-x-boxShadowX active:translate-y-boxShadowY active:shadow-none"
        >
          <ArrowLeft />
          Daftar role
        </Link>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={role.isActive ? 'ACTIVE' : 'INACTIVE'} />
        {role.isSystem ? (
          <StatusBadge status="SYSTEM" />
        ) : null}
      </div>

      <Tabs defaultValue="permissions">
        <TabsList>
          <TabsTrigger value="permissions">Permission</TabsTrigger>
          <TabsTrigger value="menus">Menu</TabsTrigger>
        </TabsList>
        <TabsContent value="permissions" className="pt-4">
          <PermissionEditor roleId={id} />
        </TabsContent>
        <TabsContent value="menus" className="pt-4">
          <MenuEditor roleId={id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
