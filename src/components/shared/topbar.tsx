import { ApiStatus } from '@/components/shared/api-status'
import { Breadcrumbs } from '@/components/shared/breadcrumbs'
import { BuildingPicker } from '@/components/shared/building-picker'
import { UserMenu } from '@/components/shared/user-menu'
import { SidebarTrigger } from '@/components/ui/sidebar'

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b-2 border-border bg-main px-4 text-main-foreground">
      <SidebarTrigger variant="neutral" className="size-8" />
      <Breadcrumbs />
      <div className="ml-auto flex items-center gap-2">
        <ApiStatus />
        <BuildingPicker />
        <UserMenu />
      </div>
    </header>
  )
}
