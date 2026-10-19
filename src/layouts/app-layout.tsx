import { Outlet } from 'react-router'

import { ErrorState } from '@/components/shared/error-state'
import { AppSidebar } from '@/components/shared/app-sidebar'
import { Topbar } from '@/components/shared/topbar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useAccess } from '@/features/auth/hooks'
import { ApiRequestError } from '@/lib/api'

export function AppLayout() {
  const { isPending, error, refetch } = useAccess()
  const unauthorized =
    error instanceof ApiRequestError && error.httpStatus === 401

  return (
    <SidebarProvider>
      <AppSidebar loading={isPending} />
      <SidebarInset className="bg-background">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6">
          <div className="w-full">
            {unauthorized ? null : error ? (
              <ErrorState
                message={error instanceof Error ? error.message : undefined}
                onRetry={() => refetch()}
              />
            ) : (
              <Outlet />
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
