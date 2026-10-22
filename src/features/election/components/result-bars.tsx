import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { StatusBadge } from '@/components/shared/status-badge'
import { Progress } from '@/components/ui/progress'
import type { ElectionResultRow } from '@/features/election/api'
import { useElectionResult } from '@/features/election/hooks'
import { candidateName, sortResults } from '@/features/election/lib'
import { cn } from '@/lib/utils'

export function ResultBars({
  rows,
  className,
}: {
  rows: ElectionResultRow[]
  className?: string
}) {
  const sorted = sortResults(rows)
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {sorted.map((row) => (
        <div key={row.id} className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-2">
              <span className="font-heading">
                {row.rank}. {candidateName(row.candidate)}
              </span>
              {row.rank === 1 && row.votes > 0 && row.candidateId ? (
                <StatusBadge status="DONE" label="Pemenang" />
              ) : null}
            </span>
            <span className="tabular-nums text-foreground/70">
              {row.votes} suara · {row.percentage}%
            </span>
          </div>
          <Progress
            value={row.percentage}
            className={row.candidateId ? undefined : 'opacity-50'}
          />
        </div>
      ))}
    </div>
  )
}

export function ResultsPanel({ electionId }: { electionId: string }) {
  const result = useElectionResult(electionId)

  if (result.isLoading) {
    return <EmptyState title="Memuat hasil..." />
  }

  if (result.error) {
    return (
      <ErrorState
        message={result.error.message}
        onRetry={() => result.refetch()}
      />
    )
  }

  const rows = result.data ?? []
  if (rows.length === 0) {
    return (
      <EmptyState
        title="Belum ada hasil"
        description="Hasil akan tersedia setelah pemilihan ditutup."
      />
    )
  }

  return <ResultBars rows={rows} />
}
