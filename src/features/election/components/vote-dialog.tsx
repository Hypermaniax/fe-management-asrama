import { Check, Minus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EmptyState } from '@/components/shared/empty-state'
import type { ElectionDetail } from '@/features/election/api'
import { useCastVote } from '@/features/election/hooks'
import { candidateName, sortCandidates } from '@/features/election/lib'
import { notifyError, notifySuccess } from '@/lib/notify'

export function VoteDialog({
  open,
  onOpenChange,
  election,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  election: ElectionDetail
}) {
  const vote = useCastVote()
  const candidates = sortCandidates(election.candidates)

  const submit = (candidateId: string | null) => {
    vote.mutate(
      { electionId: election.id, input: { candidateId } },
      {
        onSuccess: (res) => {
          notifySuccess('Suara terkirim', res.status)
          onOpenChange(false)
        },
        onError: (error) => {
          const message =
            error instanceof Error ? error.message.toLowerCase() : ''
          notifyError(
            message.includes('sudah') || message.includes('already')
              ? 'Anda sudah memberi suara pada pemilihan ini'
              : 'Gagal memberi suara',
            error,
          )
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{election.title}</DialogTitle>
          <DialogDescription>
            Satu warga satu suara. Suara tidak dapat dibatalkan setelah dikirim.
          </DialogDescription>
        </DialogHeader>

        {candidates.length === 0 ? (
          <EmptyState title="Belum ada kandidat" />
        ) : (
          <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto pr-1">
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                className="rounded-base border-2 border-border bg-secondary-background p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-heading">
                      {candidate.orderNo ? `${candidate.orderNo}. ` : ''}
                      {candidateName(candidate)}
                    </span>
                    <span className="text-xs text-foreground/60">
                      {candidate.user?.email ?? '—'}
                    </span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    disabled={vote.isPending}
                    onClick={() => submit(candidate.id)}
                  >
                    <Check />
                    Pilih
                  </Button>
                </div>
                {candidate.vision ? (
                  <p className="mt-2 text-sm text-foreground/80">
                    Visi: {candidate.vision}
                  </p>
                ) : null}
                {candidate.mission ? (
                  <p className="mt-1 text-sm text-foreground/80">
                    Misi: {candidate.mission}
                  </p>
                ) : null}
              </div>
            ))}

            {election.allowAbstain ? (
              <Button
                type="button"
                variant="neutral"
                disabled={vote.isPending}
                onClick={() => submit(null)}
              >
                <Minus />
                Abstain (tidak memilih)
              </Button>
            ) : null}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="neutral"
            onClick={() => onOpenChange(false)}
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
