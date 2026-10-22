import { useMemo } from 'react'
import { Link } from 'react-router'

import { PageHeader } from '@/components/shared/page-header'
import { SkeletonTable } from '@/components/shared/skeletons'
import { ErrorState } from '@/components/shared/error-state'
import { StatusBadge } from '@/components/shared/status-badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Menu } from '@/features/rbac/api'
import { useAllMenus } from '@/features/rbac/hooks'

function buildTree(menus: Menu[]): (Menu & { children: Menu[] })[] {
  const byParent = new Map<string, Menu[]>()
  for (const menu of menus) {
    const key = menu.parentId ?? ''
    const list = byParent.get(key) ?? []
    list.push(menu)
    byParent.set(key, list)
  }
  return [...byParent.get('') ?? []]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((root) => ({
      ...root,
      children: [...(byParent.get(root.id) ?? [])].sort(
        (a, b) => a.sortOrder - b.sortOrder,
      ),
    }))
}

export default function MenusPage() {
  const menus = useAllMenus()

  const tree = useMemo(
    () => buildTree(menus.data ?? []),
    [menus.data],
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Menu"
        description="Struktur menu sidebar yang dikirim ke klien; tautan menunjuk ke path menu."
      />

      {menus.isLoading ? <SkeletonTable rows={10} cols={5} /> : null}
      {!menus.isLoading && menus.error ? (
        <ErrorState
          onRetry={() => menus.refetch()}
          message={menus.error.message}
        />
      ) : null}
      {!menus.isLoading && !menus.error ? (
        <div className="overflow-auto rounded-base border-2 border-border bg-secondary-background">
          <Table className="scrollbar">
            <TableHeader>
              <TableRow className="bg-accent-teal hover:bg-accent-teal">
                <TableHead>Nama</TableHead>
                <TableHead>Kode</TableHead>
                <TableHead>Path</TableHead>
                <TableHead>Urutan</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tree.map((root) => (
                <>
                  <TableRow key={root.id} className="bg-secondary-background/60">
                    <TableCell className="font-heading">
                      {root.path !== '#' ? (
                        <Link
                          to={`/app${root.path}`}
                          className="underline-offset-2 hover:underline"
                        >
                          {root.name}
                        </Link>
                      ) : (
                        root.name
                      )}
                    </TableCell>
                    <TableCell className="text-foreground/70">
                      {root.code}
                    </TableCell>
                    <TableCell className="text-foreground/70">
                      {root.path === '#' ? <em>grup</em> : root.path}
                    </TableCell>
                    <TableCell>{root.sortOrder}</TableCell>
                    <TableCell>
                      <StatusBadge
                        status={root.isActive ? 'ACTIVE' : 'INACTIVE'}
                      />
                    </TableCell>
                  </TableRow>
                  {root.children.map((child) => (
                    <TableRow key={child.id}>
                      <TableCell className="pl-8">
                        {child.path !== '#' ? (
                          <Link
                            to={`/app${child.path}`}
                            className="underline-offset-2 hover:underline"
                          >
                            {child.name}
                          </Link>
                        ) : (
                          child.name
                        )}
                      </TableCell>
                      <TableCell className="text-foreground/70">
                        {child.code}
                      </TableCell>
                      <TableCell className="text-foreground/70">
                        {child.path === '#' ? <em>grup</em> : child.path}
                      </TableCell>
                      <TableCell>{child.sortOrder}</TableCell>
                      <TableCell>
                        <StatusBadge
                          status={child.isActive ? 'ACTIVE' : 'INACTIVE'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </div>
  )
}
