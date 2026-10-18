import { Link, useNavigate } from 'react-router'
import { LogOut, UserRound } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/stores/auth'
import { useScopeStore } from '@/stores/scope'

export function UserMenu() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const clear = useAuthStore((state) => state.clear)
  const resetScope = useScopeStore((state) => state.reset)

  const initial = (user?.email?.[0] ?? '?').toUpperCase()

  const logout = () => {
    clear()
    resetScope()
    navigate('/login', { replace: true })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="neutral"
            size="icon"
            aria-label="Menu akun"
            className="font-heading"
          >
            {initial}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="font-heading text-sm">Akun saya</span>
          <span className="truncate text-xs text-foreground/70">
            {user?.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link to="/app/me/profile" />}>
          <UserRound />
          Profil saya
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut />
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
