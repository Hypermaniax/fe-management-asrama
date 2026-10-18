import type { ReactNode } from 'react'

import { useAuthStore } from '@/stores/auth'

export function Can({
  permission,
  children,
  fallback = null,
}: {
  permission: string
  children: ReactNode
  fallback?: ReactNode
}) {
  const isSuperAdmin = useAuthStore((state) => state.isSuperAdmin)
  const permissions = useAuthStore((state) => state.permissions)

  const allowed = isSuperAdmin || permissions.includes(permission)

  return <>{allowed ? children : fallback}</>
}
