import type { LucideIcon } from 'lucide-react'
import {
  CalendarDays,
  Database,
  LayoutDashboard,
  Network,
  Settings,
  UserCog,
  Users,
  Vote,
  Wallet,
} from 'lucide-react'

export const MENU_ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  master: Database,
  resident: Users,
  finance: Wallet,
  organization: Network,
  event: CalendarDays,
  election: Vote,
  system: Settings,
  me: UserCog,
}
