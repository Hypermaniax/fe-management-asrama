import { useMemo, useState } from 'react'

import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { DateText } from '@/components/shared/date-text'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import { ResultsPanel } from '@/features/election/components/result-bars'
import { useElections } from '@/features/election/hooks'
import { ELECTION_STATUS_LABELS } from '@/features/election/lib'

export default function ElectionResultsPage() {
  const elections = useElections()
  const [selectedId, setSelectedId] = useState('')

  const withResults = useMemo(
    () =>
      (elections.data ?? []).filter(
        (election) =>
          election.status === 'CLOSED' || election.status === 'DONE',
      ),
    [elections.data],
  )

  const selected =
    withResults.find((election) => election.id === selectedId) ??
    withResults[0]

  if (elections.isLoading) {
    return <EmptyState title="Memuat pemilihan..." />
  }

  if (elections.error) {
    return (
      <EmptyState
        title="Gagal memuat pemilihan"
        description={elections.error.message}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Hasil Pemilihan"
        description="Peringkat kandidat per pemilihan; hanya tersedia setelah pemilihan ditutup."
      />

      {withResults.length === 0 ? (
        <EmptyState
          title="Belum ada pemilihan yang ditutup"
          description="Hasil akan muncul setelah ada pemilihan yang selesai ditutup."
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="results-election"
              className="text-xs text-foreground/60"
            >
              Pemilihan
            </label>
            <NativeSelect
              id="results-election"
              value={selected?.id ?? ''}
              onChange={(event) => setSelectedId(event.target.value)}
              className="w-72"
            >
              {withResults.map((election) => (
                <NativeSelectOption key={election.id} value={election.id}>
                  {election.title}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          {selected ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="font-heading">{selected.title}</span>
                <span className="text-xs text-foreground/60">
                  {selected.code} · hasil dihitung{' '}
                  <DateText value={selected.endAt} withTime />
                </span>
              </div>
              <StatusBadge
                status={selected.status}
                label={ELECTION_STATUS_LABELS[selected.status]}
              />
            </div>
          ) : null}

          {selected ? <ResultsPanel electionId={selected.id} /> : null}
        </div>
      )}
    </div>
  )
}
