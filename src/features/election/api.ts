import type { Building } from '@/features/building/api'
import type { Period } from '@/features/organization/api'
import type { Role } from '@/features/rbac/api'
import { apiFetch, type ApiEnvelope } from '@/lib/api'

export type ElectionStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'OPEN'
  | 'CLOSED'
  | 'DONE'
  | 'CANCELLED'

export type ElectionUser = {
  id: string
  email: string
  name: string | null
  phone: string | null
  buildingId: string | null
  status: string
}

export type Election = {
  id: string
  code: string
  title: string
  description: string | null
  periodId: string | null
  buildingId: string | null
  startAt: string
  endAt: string
  status: ElectionStatus
  allowAbstain: boolean
  createdById: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  period?: Period | null
  building?: Building | null
}

export type EligibleRole = {
  electionId: string
  roleId: string
  role?: Role
}

export type ElectionCandidate = {
  id: string
  electionId: string
  userId: string
  orderNo: number | null
  vision: string | null
  mission: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  user?: ElectionUser
}

export type ElectionDetail = Election & {
  eligibleRoles: EligibleRole[]
  candidates: ElectionCandidate[]
}

export type ElectionResultRow = {
  id: string
  electionId: string
  candidateId: string | null
  votes: number
  percentage: number
  rank: number
  recordedAt: string
  candidate: ElectionCandidate | null
}

export type FinalizeAssignment = {
  id: string
  periodId: string
  positionId: string
  userId: string | null
  buildingId: string | null
  startDate: string
  endDate: string | null
  isActive: boolean
  decreeNumber: string | null
}

export type FinalizeResult = {
  election: Election
  assignment: FinalizeAssignment
}

export type VoteRecord = {
  id: string
  electionId: string
  voterId: string
  candidateId: string | null
  castAt: string
  createdAt: string
}

export type ElectionInput = {
  code: string
  title: string
  description?: string
  periodId?: string
  buildingId?: string
  startAt: string
  endAt: string
  allowAbstain?: boolean
  eligibleRoleIds?: string[]
}

export type ElectionUpdate = {
  code?: string
  title?: string
  description?: string | null
  periodId?: string | null
  buildingId?: string | null
  startAt?: string
  endAt?: string
  allowAbstain?: boolean
}

export type CandidateInput = {
  userId: string
  orderNo?: number
  vision?: string
  mission?: string
}

export type VoteInput = {
  candidateId: string | null
}

export type FinalizeInput = {
  positionId: string
  candidateId?: string
}

export type ElectionQuery = {
  status?: ElectionStatus
}

function buildQuery(params: Record<string, string | undefined>) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (!value) continue
    query.set(key, value)
  }
  const qs = query.toString()
  return qs ? `?${qs}` : ''
}

export async function fetchElections(params: ElectionQuery = {}) {
  const res = await apiFetch<ApiEnvelope<Election[]>>(
    `/elections${buildQuery({ status: params.status })}`,
  )
  return res.data
}

export async function fetchElection(id: string) {
  const res = await apiFetch<ApiEnvelope<ElectionDetail>>(`/elections/${id}`)
  return res.data
}

export function createElection(input: ElectionInput) {
  return apiFetch<ApiEnvelope<Election>>('/elections', {
    method: 'POST',
    body: input,
  })
}

export function updateElection(id: string, input: ElectionUpdate) {
  return apiFetch<ApiEnvelope<Election>>(`/elections/${id}`, {
    method: 'PATCH',
    body: input,
  })
}

export function deleteElection(id: string) {
  return apiFetch<{ status: string }>(`/elections/${id}`, { method: 'DELETE' })
}

export function setEligibleRoles(id: string, roleIds: string[]) {
  return apiFetch<ApiEnvelope<EligibleRole[]>>(
    `/elections/${id}/eligible-roles`,
    { method: 'PUT', body: { roleIds } },
  )
}

export function openElection(id: string) {
  return apiFetch<ApiEnvelope<Election>>(`/elections/${id}/open`, {
    method: 'POST',
  })
}

export function closeElection(id: string) {
  return apiFetch<ApiEnvelope<Election>>(`/elections/${id}/close`, {
    method: 'POST',
  })
}

export function cancelElection(id: string) {
  return apiFetch<ApiEnvelope<Election>>(`/elections/${id}/cancel`, {
    method: 'POST',
  })
}

export async function fetchCandidates(electionId: string) {
  const res = await apiFetch<ApiEnvelope<ElectionCandidate[]>>(
    `/elections/${electionId}/candidates`,
  )
  return res.data
}

export function addCandidate(electionId: string, input: CandidateInput) {
  return apiFetch<ApiEnvelope<ElectionCandidate>>(
    `/elections/${electionId}/candidates`,
    { method: 'POST', body: input },
  )
}

export function deleteCandidate(electionId: string, candidateId: string) {
  return apiFetch<{ status: string }>(
    `/elections/${electionId}/candidates/${candidateId}`,
    { method: 'DELETE' },
  )
}

export function castVote(electionId: string, input: VoteInput) {
  return apiFetch<ApiEnvelope<VoteRecord>>(`/elections/${electionId}/vote`, {
    method: 'POST',
    body: input,
  })
}

export async function fetchElectionResult(electionId: string) {
  const res = await apiFetch<ApiEnvelope<ElectionResultRow[]>>(
    `/elections/${electionId}/result`,
  )
  return res.data
}

export function finalizeElection(electionId: string, input: FinalizeInput) {
  return apiFetch<ApiEnvelope<FinalizeResult>>(
    `/elections/${electionId}/finalize`,
    { method: 'POST', body: input },
  )
}
