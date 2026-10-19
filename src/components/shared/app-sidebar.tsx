import { useMemo } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { ChevronRight, CircleDot } from 'lucide-react'

import { IslandMark } from '@/components/shared/island-mark'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import type { MenuNode } from '@/features/auth/api'
import { MENU_ICONS } from '@/lib/menu-icons'
import { filterMenu } from '@/lib/rbac'
import { useAuthStore } from '@/stores/auth'

function isPathActive(pathname: string, path: string): boolean {
  const to = `/app${path}`
  return pathname === to || pathname.startsWith(`${to}/`)
}

function SidebarLink({ item }: { item: MenuNode }) {
  const { pathname } = useLocation()
  const Icon = MENU_ICONS[item.code] ?? CircleDot

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isPathActive(pathname, item.path)}
        tooltip={item.name}
        render={<NavLink to={`/app${item.path}`} />}
      >
        <Icon />
        <span>{item.name}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function SidebarGroupItem({ item }: { item: MenuNode }) {
  const { pathname } = useLocation()
  const Icon = MENU_ICONS[item.code] ?? CircleDot
  const children = item.children ?? []
  const active = children.some((child) => isPathActive(pathname, child.path))

  return (
    <SidebarMenuItem>
      <Collapsible defaultOpen={active} className="group/collapsible">
        <CollapsibleTrigger
          render={<SidebarMenuButton isActive={active} />}
        >
          <Icon />
          <span>{item.name}</span>
          <ChevronRight className="ml-auto transition-transform duration-150 group-data-[open]/collapsible:rotate-90" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {children.map((child) => (
              <SidebarMenuSubItem key={child.id}>
                <SidebarMenuSubButton
                  render={<NavLink to={`/app${child.path}`} />}
                  isActive={isPathActive(pathname, child.path)}
                >
                  <span>{child.name}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  )
}

export function AppSidebar({ loading = false }: { loading?: boolean }) {
  const menus = useAuthStore((state) => state.menus)
  const items = useMemo(() => filterMenu(menus), [menus])

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link to="/app/dashboard" />}
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <IslandMark className="size-8" decorative />
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-heading">Asrama Kepri</span>
                <span className="truncate text-xs text-foreground/70">
                  Yogyakarta
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {loading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <SidebarMenuItem key={index}>
                      <SidebarMenuSkeleton showIcon />
                    </SidebarMenuItem>
                  ))
                : items.map((item) =>
                    (item.children ?? []).length > 0 ? (
                      <SidebarGroupItem key={item.id} item={item} />
                    ) : (
                      <SidebarLink key={item.id} item={item} />
                    ),
                  )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
