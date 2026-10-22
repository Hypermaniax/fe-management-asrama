import type { Role } from '@/features/rbac/api'
import { apiFetch, type ApiEnvelope } from '@/lib/api'

export type Period = {
  id: string
  code: string
  name: string
  startDate: string
  endDate: string
  decreeNumber: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type PeriodInput = {
  code: string
  name: string
  startDate: string
  endDate: string
  decreeNumber?: string | null
}

export type Position = {
  id: string
  code: string
  name: string
  level: number | null
  buildingId: string | null
  roleId: string | null
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  role?: Role | null
}

export type PositionInput = {
  code: string
  name: string
  level?: number | null
  buildingId?: string | null
  roleId?: string | null
  description?: string | null
}

export type PositionUpdate = Partial<PositionInput> & { isActive?: boolean }

export type Assignment = {
  id: string
  periodId: string
  positionId: string
  userId: string
  buildingId: string | null
  startDate: string
  endDate: string | null
  isActive: boolean
  decreeNumber: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  position: Position
  period: Period
}

export type AssignmentInput = {
  periodId: string
  positionId: string
  userId: string
  buildingId?: string | null
  startDate: string
  decreeNumber?: string | null
}

export type StructureUser = {
  id: string
  email: string
  name: string | null
  buildingId: string | null
  status: string
}

export type StructureHolder = {
  assignmentId: string
  userId: string
  buildingId: string | null
  startDate: string
  endDate: string | null
  decreeNumber: string | null
  user: StructureUser
}

export type StructurePosition = Position & {
  holders: StructureHolder[]
}

export type Structure = {
  period: Period
  positions: StructurePosition[]
}

export async function fetchPeriods() {
  const res = await apiFetch<ApiEnvelope<Period[]>>('/organization/periods')
  return res.data
}

export function createPeriod(input: PeriodInput) {
  return apiFetch<ApiEnvelope<Period>>('/organization/periods', {
    method: 'POST',
    body: input,
  })
}

export function updatePeriod(id: string, input: Partial<PeriodInput>) {
  return apiFetch<ApiEnvelope<Period>>(`/organization/periods/${id}`, {
    method: 'PATCH',
    body: input,
  })
}

export function activatePeriod(id: string) {
  return apiFetch<ApiEnvelope<Period>>(
    `/organization/periods/${id}/activate`,
    { method: 'POST' },
  )
}

export async function fetchPositions() {
  const res = await apiFetch<ApiEnvelope<Position[]>>(
    '/organization/positions',
  )
  return res.data
}

export function createPosition(input: PositionInput) {
  return apiFetch<ApiEnvelope<Position>>('/organization/positions', {
    method: 'POST',
    body: input,
  })
}

export function updatePosition(id: string, input: PositionUpdate) {
  return apiFetch<ApiEnvelope<Position>>(
    `/organization/positions/${id}`,
    { method: 'PATCH', body: input },
  )
}

export function deletePosition(id: string) {
  return apiFetch<{ status: string }>(`/organization/positions/${id}`, {
    method: 'DELETE',
  })
}

export async function fetchAssignments(userId: string) {
  const params = new URLSearchParams({ userId })
  const res = await apiFetch<ApiEnvelope<Assignment[]>>(
    `/organization/assignments?${params.toString()}`,
  )
  return res.data
}

export function createAssignment(input: AssignmentInput) {
  return apiFetch<ApiEnvelope<Assignment>>('/organization/assignments', {
    method: 'POST',
    body: input,
  })
}

export function endAssignment(id: string) {
  return apiFetch<ApiEnvelope<Assignment>>(
    `/organization/assignments/${id}`,
    { method: 'DELETE' },
  )
}

export async function fetchStructure(periodId: string) {
  const params = new URLSearchParams({ periodId })
  const res = await apiFetch<ApiEnvelope<Structure>>(
    `/organization/structure?${params.toString()}`,
  )
  return res.data
}
