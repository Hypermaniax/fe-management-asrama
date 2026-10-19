import { Link } from 'react-router'
import { ArrowRight, Vote } from 'lucide-react'

import { DateText } from '@/components/shared/date-text'
import { EmptyState } from '@/components/shared/empty-state'
import { StatusBadge } from '@/components/shared/status-badge'
import { buttonVariants } from '@/components/ui/button'
import type { Election } from '@/features/dashboard/api'
import { cn } from '@/lib/utils'

export function ActiveElectionCard({
  elections,
  to,
}: {
  elections: Election[]
  to: string
}) {
  const election = elections[0]

  if (!election) {
    return (
      <EmptyState
        title="Tidak ada pemilihan aktif"
        description="Pemilihan yang sedang dibuka akan tampil di sini."
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-base border-2 border-border bg-accent-orange text-foreground">
          <Vote className="size-5" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-heading">{election.title}</span>
            <StatusBadge status={election.status} />
          </div>
          <span className="text-xs text-foreground/70">
            <DateText value={election.startAt} /> –{' '}
            <DateText value={election.endAt} />
          </span>
        </div>
      </div>
      <Link
        to={to}
        className={cn(buttonVariants({ size: 'sm' }), 'w-fit')}
      >
        Lihat pemilihan
        <ArrowRight />
      </Link>
    </div>
  )
}
