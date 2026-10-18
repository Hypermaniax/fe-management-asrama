import { Link } from 'react-router'
import { ShieldX } from 'lucide-react'

import { EmptyState } from '@/components/shared/empty-state'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Forbidden() {
  return (
    <div className="flex min-h-[60svh] items-center justify-center">
      <EmptyState
        icon={<ShieldX className="size-5" />}
        title="Akses ditolak"
        description="Kamu tidak punya akses ke halaman ini."
        action={
          <Link to="/app/dashboard" className={cn(buttonVariants())}>
            Kembali ke dashboard
          </Link>
        }
      />
    </div>
  )
}
