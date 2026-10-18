import type { MenuNode } from '@/features/auth/api'
import { useAuthStore } from '@/stores/auth'

export function can(
  permissions: string[],
  isSuperAdmin: boolean,
  permission: string,
): boolean {
  return isSuperAdmin || permissions.includes(permission)
}

export function useCan(permission: string): boolean {
  const isSuperAdmin = useAuthStore((state) => state.isSuperAdmin)
  const permissions = useAuthStore((state) => state.permissions)
  return can(permissions, isSuperAdmin, permission)
}

export function filterMenu(items: MenuNode[]): MenuNode[] {
  return items.flatMap((item) => {
    const children = filterMenu(item.children ?? [])
    if ((!item.path || item.path === '#') && children.length === 0) {
      return []
    }
    return [{ ...item, children }]
  })
}
