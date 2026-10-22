import type {
  Election,
  ElectionCandidate,
  ElectionResultRow,
  ElectionStatus,
} from '@/features/election/api'

export const ELECTION_STATUS_LABELS: Record<ElectionStatus, string> = {
  DRAFT: 'Draf',
  SCHEDULED: 'Terjadwal',
  OPEN: 'Dibuka',
  CLOSED: 'Ditutup',
  DONE: 'Selesai',
  CANCELLED: 'Dibatalkan',
}

export const ELECTION_STATUS_ITEMS: {
  value: ElectionStatus
  label: string
}[] = (Object.keys(ELECTION_STATUS_LABELS) as ElectionStatus[]).map(
  (value) => ({ value, label: ELECTION_STATUS_LABELS[value] }),
)

export const RESULT_STATUS = new Set<ElectionStatus>([
  'CLOSED',
  'DONE',
  'CANCELLED',
])

export function canVote(election: Election) {
  return election.status === 'OPEN' && !election.deletedAt
}

export function isResultVisible(election: Election) {
  return RESULT_STATUS.has(election.status)
}

export function candidateName(candidate: ElectionCandidate | null) {
  if (!candidate) return 'Abstain'
  return candidate.user?.name ?? candidate.user?.email ?? 'Kandidat'
}

export function sortResults(rows: ElectionResultRow[]) {
  return [...rows].sort((a, b) => a.rank - b.rank)
}

export function sortCandidates(candidates: ElectionCandidate[]) {
  return [...candidates].sort((a, b) => {
    const left = a.orderNo ?? Number.MAX_SAFE_INTEGER
    const right = b.orderNo ?? Number.MAX_SAFE_INTEGER
    if (left !== right) return left - right
    return a.createdAt.localeCompare(b.createdAt)
  })
}
