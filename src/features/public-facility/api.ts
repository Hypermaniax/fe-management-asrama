import { apiFetch, type ApiEnvelope } from '@/lib/api'
import type { Facility } from '@/features/facility/api'

export type PublicFacilityStatus = 'ACTIVE' | 'MAINTENANCE'

export type PublicFacility = {
  id: string
  buildingId: string
  facilityId: string
  number: string | null
  capacity: number | null
  status: PublicFacilityStatus
  note: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  facility: Facility
}

export type PublicFacilityInput = {
  buildingId: string
  facilityId: string
  number?: string
  capacity?: number
  note?: string
}

export type PublicFacilityUpdate = {
  number?: string
  capacity?: number
  status?: PublicFacilityStatus
  note?: string
}

export type AssignmentUser = {
  id: string
  email: string
  name: string | null
  status: string
}

export type PublicFacilityAssignment = {
  id: string
  publicFacilityId: string
  userId: string
  facilityId: string
  slotLabel: string
  assignedAt: string
  createdAt: string
  deletedAt: string | null
  user: AssignmentUser
}

export type AssignmentInput = {
  userId: string
  slotLabel: string
}

export async function fetchPublicFacilities() {
  const res = await apiFetch<ApiEnvelope<PublicFacility[]>>(
    '/public-facilities',
  )
  return res.data
}

export function createPublicFacility(input: PublicFacilityInput) {
  return apiFetch<ApiEnvelope<PublicFacility>>('/public-facilities', {
    method: 'POST',
    body: input,
  })
}

export function updatePublicFacility(id: string, input: PublicFacilityUpdate) {
  return apiFetch<ApiEnvelope<PublicFacility>>(`/public-facilities/${id}`, {
    method: 'PATCH',
    body: input,
  })
}

export function deletePublicFacility(id: string) {
  return apiFetch<{ status: string }>(`/public-facilities/${id}`, {
    method: 'DELETE',
  })
}

export function assignSlot(id: string, input: AssignmentInput) {
  return apiFetch<ApiEnvelope<PublicFacilityAssignment>>(
    `/public-facilities/${id}/assign`,
    { method: 'POST', body: input },
  )
}

export async function fetchAssignments(id: string) {
  const res = await apiFetch<ApiEnvelope<PublicFacilityAssignment[]>>(
    `/public-facilities/${id}/assignments`,
  )
  return res.data
}

export function releaseAssignment(assignmentId: string) {
  return apiFetch<{ status: string }>(
    `/public-facilities/assignments/${assignmentId}`,
    { method: 'DELETE' },
  )
}
