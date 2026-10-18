import { Outlet } from 'react-router'

import { AppSidebar } from '@/components/shared/app-sidebar'
import { Topbar } from '@/components/shared/topbar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useAccess } from '@/features/auth/hooks'

export function AppLayout() {
  useAccess()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
