import { Link, Navigate, Outlet } from 'react-router'

import { IslandMark } from '@/components/shared/island-mark'
import { useAuthStore } from '@/stores/auth'

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'

export function AuthLayout() {
  const isAuthenticated = useAuthStore((state) => Boolean(state.token))

  if (isAuthenticated) {
    return <Navigate to="/app" replace />
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden bg-background p-6 text-foreground">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="pattern-grid absolute inset-0" />
        <IslandMark
          className="absolute -bottom-10 -right-8 size-48 opacity-[0.06] sm:size-64"
          decorative
        />
      </div>

      <Link
        to="/"
        className={`relative flex items-center gap-2 rounded-base font-heading text-lg ${focusRing}`}
      >
        <IslandMark className="size-9" decorative />
        Asrama Kepri
      </Link>

      <div className="relative w-full max-w-md rounded-base border-2 border-border bg-background p-6 shadow-shadow">
        <Outlet />
      </div>

      <Link
        to="/"
        className={`relative rounded-base text-sm underline underline-offset-4 ${focusRing}`}
      >
        Kembali ke beranda
      </Link>
    </div>
  )
}
