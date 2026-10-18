import { useLocation } from 'react-router'

import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import type { MenuNode } from '@/features/auth/api'
import { filterMenu } from '@/lib/rbac'
import { useAuthStore } from '@/stores/auth'

function findName(menus: MenuNode[], pathname: string): string | null {
  for (const menu of menus) {
    if (menu.path && menu.path !== '#' && `/app${menu.path}` === pathname) {
      return menu.name
    }
    const child = findName(menu.children ?? [], pathname)
    if (child) return child
  }
  return null
}

export default function AppPlaceholderPage() {
  const { pathname } = useLocation()
  const menus = useAuthStore((state) => state.menus)
  const title = findName(filterMenu(menus), pathname) ?? 'Halaman'

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={title}
        description="Halaman ini dibangun pada fase berikutnya."
      />
      <EmptyState
        title="Segera hadir"
        description={`Modul ${title} belum diimplementasikan.`}
      />
    </div>
  )
}
