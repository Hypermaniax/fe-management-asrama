import { Navigate, Outlet, useLocation } from 'react-router'

import { useAuthStore } from '@/stores/auth'

export function RequireAuth() {
  const token = useAuthStore((state) => state.token)
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <Outlet />
}
