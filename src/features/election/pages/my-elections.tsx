import { useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { BarChart3, Vote } from 'lucide-react'

import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Election, ElectionDetail } from '@/features/election/api'
import { ResultsPanel } from '@/features/election/components/result-bars'
import { VoteDialog } from '@/features/election/components/vote-dialog'
import { useElection, useElections } from '@/features/election/hooks'
import { ELECTION_STATUS_LABELS } from '@/features/election/lib'

function ElectionDetailDialog({
  open,
  onOpenChange,
  electionId,
  title,
  description,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  electionId: string | null
  title: (election: ElectionDetail | null) => string
  description: string
  children: (election: ElectionDetail, close: () => void) => ReactNode
}) {
  const query = useElection(open ? (electionId ?? undefined) : undefined)
  const election = query.data
  const close = () => onOpenChange(false)

  const renderBody = () => {
    if (!open || !electionId) return null
    if (query.isLoading) return <EmptyState title="Memuat pemilihan..." />
    if (query.error)
      return (
        <ErrorState
          message={query.error.message}
          onRetry={() => query.refetch()}
        />
      )
    if (!election) return null
    return children(election, close)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{title(election ?? null)}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {renderBody()}

        <Button
          type="button"
          variant="neutral"
          className="self-end"
          onClick={close}
        >
          Tutup
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export default function MyElectionsPage() {
  const elections = useElections({ status: 'OPEN' })
  const [voteTarget, setVoteTarget] = useState<Election | null>(null)
  const [resultsTarget, setResultsTarget] = useState<Election | null>(null)

  const rows = elections.data ?? []

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pemilihan Saya"
        description="Beri suara pada pemilihan yang dibuka dan lihat hasilnya setelah ditutup."
      />

      {elections.error ? (
        <ErrorState
          message={elections.error.message}
          onRetry={() => elections.refetch()}
        />
      ) : rows.length === 0 && !elections.isLoading ? (
        <EmptyState
          title="Belum ada pemilihan aktif"
          description="Saat pengurus membuka pemilihan, kartu pemilihan akan tampil di sini."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map((election) => (
            <div
              key={election.id}
              className="flex flex-col gap-3 rounded-base border-2 border-border bg-secondary-background p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-heading">{election.title}</span>
                  <StatusBadge
                    status={election.status}
                    label={ELECTION_STATUS_LABELS[election.status]}
                  />
                </div>
                <span className="text-sm text-foreground/80">
                  {election.description ?? election.code}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={() => setVoteTarget(election)}>
                  <Vote />
                  Beri suara
                </Button>
                <Button
                  type="button"
                  variant="neutral"
                  onClick={() => setResultsTarget(election)}
                >
                  <BarChart3 />
                  Lihat hasil
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-foreground/60">
        Riwayat dan pemilihan lain dapat dilihat di{' '}
        <Link to="/app/elections" className="underline">
          daftar pemilihan
        </Link>{' '}
        dan{' '}
        <Link to="/app/elections/results" className="underline">
          hasil pemilihan
        </Link>
        .
      </p>

      <ElectionDetailDialog
        key={`vote-${voteTarget?.id ?? 'none'}`}
        open={Boolean(voteTarget)}
        onOpenChange={(open) => {
          if (!open) setVoteTarget(null)
        }}
        electionId={voteTarget?.id ?? null}
        title={(election) => election?.title ?? 'Pemberian suara'}
        description="Satu warga satu suara. Suara tidak dapat dibatalkan setelah dikirim."
      >
        {(election, close) => (
          <VoteDialog open onOpenChange={close} election={election} />
        )}
      </ElectionDetailDialog>

      <ElectionDetailDialog
        key={`results-${resultsTarget?.id ?? 'none'}`}
        open={Boolean(resultsTarget)}
        onOpenChange={(open) => {
          if (!open) setResultsTarget(null)
        }}
        electionId={resultsTarget?.id ?? null}
        title={(election) => election?.title ?? 'Hasil pemilihan'}
        description="Peringkat kandidat berdasarkan suara yang masuk."
      >
        {(election) => <ResultsPanel electionId={election.id} />}
      </ElectionDetailDialog>
    </div>
  )
}
