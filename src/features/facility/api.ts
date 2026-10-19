import { apiFetch, type ApiEnvelope } from '@/lib/api'

export type FacilityScope = 'ROOM' | 'PUBLIC'
export type FacilityUsage = 'ASSIGNED' | 'SHARED'
export type FacilityCategory =
  | 'FURNITURE'
  | 'SANITARY'
  | 'APPLIANCE'
  | 'OTHER'

export type Facility = {
  id: string
  code: string
  name: string
  scope: FacilityScope
  usageMode: FacilityUsage
  category: FacilityCategory
  isActive: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type FacilityInput = {
  code: string
  name: string
  scope: FacilityScope
  usageMode: FacilityUsage
  category: FacilityCategory
}

export type FacilityUpdate = {
  name?: string
  category?: FacilityCategory
  isActive?: boolean
}

export type RoomFacility = {
  id: string
  roomId: string
  facilityId: string
  quantity: number
  note: string | null
  facility: Facility
}

export type RoomFacilityItem = {
  facilityId: string
  quantity: number
  note?: string
}

export async function fetchFacilities(scope?: FacilityScope) {
  const query = scope ? `?scope=${scope}` : ''
  const res = await apiFetch<ApiEnvelope<Facility[]>>(`/facilities${query}`)
  return res.data
}

export function createFacility(input: FacilityInput) {
  return apiFetch<ApiEnvelope<Facility>>('/facilities', {
    method: 'POST',
    body: input,
  })
}

export function updateFacility(id: string, input: FacilityUpdate) {
  return apiFetch<ApiEnvelope<Facility>>(`/facilities/${id}`, {
    method: 'PATCH',
    body: input,
  })
}

export function deleteFacility(id: string) {
  return apiFetch<{ status: string }>(`/facilities/${id}`, { method: 'DELETE' })
}

export async function fetchRoomFacilities(roomId: string) {
  const res = await apiFetch<ApiEnvelope<RoomFacility[]>>(
    `/facilities/rooms/${roomId}`,
  )
  return res.data
}

export function setRoomFacilities(roomId: string, items: RoomFacilityItem[]) {
  return apiFetch<ApiEnvelope<RoomFacility[]>>(`/facilities/rooms/${roomId}`, {
    method: 'PUT',
    body: { items },
  })
}
