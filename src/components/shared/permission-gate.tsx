import type { ReactNode } from 'react'

import { Forbidden } from '@/components/shared/forbidden'
import { useCan } from '@/lib/rbac'

export function PermissionGate({
  permission,
  children,
  fallback,
}: {
  permission: string
  children: ReactNode
  fallback?: ReactNode
}) {
  const allowed = useCan(permission)

  if (allowed) {
    return <>{children}</>
  }

  return <>{fallback ?? <Forbidden />}</>
}
