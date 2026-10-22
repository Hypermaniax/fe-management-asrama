import { useMemo } from 'react'

import { DataTable, type Column } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { SkeletonTable } from '@/components/shared/skeletons'
import { ErrorState } from '@/components/shared/error-state'
import { usePermissions } from '@/features/rbac/hooks'

const ACTIONS = ['CREATE', 'READ', 'UPDATE', 'DELETE'] as const

const ACTION_LABEL: Record<string, string> = {
  CREATE: 'Buat',
  READ: 'Lihat',
  UPDATE: 'Ubah',
  DELETE: 'Hapus',
}

function ResourceMatrix({ permissions }: { permissions: { code: string; resource: string; action: string }[] }) {
  const resources = useMemo(
    () => [...new Set(permissions.map((item) => item.resource))].sort(),
    [permissions],
  )
  const byResource = useMemo(() => {
    const map = new Map<string, Map<string, string>>()
    for (const item of permissions) {
      const perAction = map.get(item.resource) ?? new Map()
      perAction.set(item.action, item.code)
      map.set(item.resource, perAction)
    }
    return map
  }, [permissions])

  const columns: Column<string>[] = [
    {
      key: 'resource',
      header: 'Resource',
      cell: (resource) => <span className="font-heading">{resource}</span>,
    },
    ...ACTIONS.map<Column<string>>((action) => ({
      key: action,
      header: ACTION_LABEL[action],
      headClassName: 'text-center',
      className: 'text-center',
      cell: (resource) => {
        const code = byResource.get(resource)?.get(action)
        return code ? (
          <span
            title={code}
            className="inline-flex items-center justify-center size-5 rounded-base border-2 border-border bg-accent-teal text-foreground text-[10px] font-heading"
          >
            ✓
          </span>
        ) : (
          <span className="text-foreground/30">—</span>
        )
      },
    })),
  ]

  return (
    <DataTable
      columns={columns}
      data={resources as string[]}
      getRowId={(resource) => resource}
    />
  )
}

export default function PermissionsPage() {
  const permissions = usePermissions()

  if (permissions.isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Permission"
          description="Daftar permission yang dipakai untuk mengatur role."
        />
        <SkeletonTable rows={8} cols={5} />
      </div>
    )
  }

  if (permissions.error || !permissions.data) {
    return (
      <ErrorState
        onRetry={() => permissions.refetch()}
        message={permissions.error?.message}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Permission"
        description={`${permissions.data.length} permission terdaftar, dikelompokkan per resource dan aksi.`}
      />
      <ResourceMatrix permissions={permissions.data} />
    </div>
  )
}
