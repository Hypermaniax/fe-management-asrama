import { useMemo } from 'react'
import { useLocation } from 'react-router'
import { ChevronRight } from 'lucide-react'

import type { MenuNode } from '@/features/auth/api'
import { useAuthStore } from '@/stores/auth'

function titleize(segment: string): string {
  return segment
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function Breadcrumbs() {
  const { pathname } = useLocation()
  const menus = useAuthStore((state) => state.menus)

  const map = useMemo(() => {
    const entries = new Map<string, { name: string; parent?: string }>()
    const walk = (roots: MenuNode[]) => {
      for (const root of roots) {
        if (root.path && root.path !== '#') {
          entries.set(`/app${root.path}`, { name: root.name })
        }
        for (const child of root.children ?? []) {
          if (child.path && child.path !== '#') {
            entries.set(`/app${child.path}`, {
              name: child.name,
              parent: root.name,
            })
          }
        }
      }
    }
    walk(menus)
    return entries
  }, [menus])

  const node = map.get(pathname)

  if (node) {
    return (
      <nav
        aria-label="Breadcrumb"
        className="flex min-w-0 items-center gap-1.5 text-sm"
      >
        {node.parent ? (
          <>
            <span className="hidden opacity-60 sm:inline">{node.parent}</span>
            <ChevronRight className="hidden size-3.5 shrink-0 opacity-50 sm:inline" />
          </>
        ) : null}
        <span className="truncate font-heading">{node.name}</span>
      </nav>
    )
  }

  const segments = pathname.replace(/^\/app\/?/, '').split('/').filter(Boolean)
  const label = segments.map(titleize).join(' / ') || 'Dashboard'

  return (
    <span className="truncate font-heading text-sm opacity-80">
      {label}
    </span>
  )
}
