import type { Gender } from '@/features/building/api'
import { apiFetch, type ApiEnvelope } from '@/lib/api'

export type ResidentStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'CHECKOUT'

export type Resident = {
  id: string
  email: string
  name: string | null
  phone: string | null
  emailVerified: boolean
  buildingId: string | null
  nationalId: string | null
  gender: Gender | null
  guardianName: string | null
  guardianPhone: string | null
  address: string | null
  status: ResidentStatus
  submittedAt: string | null
  reviewedById: string | null
  reviewedAt: string | null
  rejectionReason: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type ResidentProfileInput = {
  name?: string
  phone?: string
  buildingId?: string
  nationalId?: string
  gender?: Gender
  guardianName?: string
  guardianPhone?: string
  address?: string
}

export type ResidentQuery = {
  buildingId: string
  status?: ResidentStatus
}

export async function fetchResidents({ buildingId, status }: ResidentQuery) {
  const params = new URLSearchParams({ buildingId })
  if (status) params.set('status', status)
  const res = await apiFetch<ApiEnvelope<Resident[]>>(
    `/residents?${params.toString()}`,
  )
  return res.data
}

export async function fetchResident(id: string) {
  const res = await apiFetch<ApiEnvelope<Resident>>(`/residents/${id}`)
  return res.data
}

export function updateResidentProfile(id: string, input: ResidentProfileInput) {
  return apiFetch<ApiEnvelope<Resident>>(`/residents/${id}/profile`, {
    method: 'PATCH',
    body: input,
  })
}

export function submitResident(id: string) {
  return apiFetch<ApiEnvelope<Resident>>(`/residents/${id}/submit`, {
    method: 'POST',
  })
}

export function approveResident(
  id: string,
  input?: { buildingId?: string },
) {
  return apiFetch<ApiEnvelope<Resident>>(`/residents/${id}/approve`, {
    method: 'POST',
    body: input ?? {},
  })
}

export function rejectResident(id: string, reason: string) {
  return apiFetch<ApiEnvelope<Resident>>(`/residents/${id}/reject`, {
    method: 'POST',
    body: { reason },
  })
}

export function checkoutResident(id: string) {
  return apiFetch<ApiEnvelope<Resident>>(`/residents/${id}/checkout`, {
    method: 'POST',
  })
}
