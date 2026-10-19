import { apiFetch, type ApiEnvelope } from '@/lib/api'

export type Gender = 'MALE' | 'FEMALE'

export type Building = {
  id: string
  code: string
  name: string
  gender: Gender
  address: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type BuildingInput = {
  code: string
  name: string
  gender: Gender
  address: string
}

export type BuildingUpdate = {
  name?: string
  gender?: Gender
  address?: string
  isActive?: boolean
}

export async function fetchBuildings() {
  const res = await apiFetch<ApiEnvelope<Building[]>>('/buildings')
  return res.data
}

export function createBuilding(input: BuildingInput) {
  return apiFetch<ApiEnvelope<Building>>('/buildings', {
    method: 'POST',
    body: input,
  })
}

export function updateBuilding(id: string, input: BuildingUpdate) {
  return apiFetch<ApiEnvelope<Building>>(`/buildings/${id}`, {
    method: 'PATCH',
    body: input,
  })
}

export function deleteBuilding(id: string) {
  return apiFetch<{ status: string }>(`/buildings/${id}`, { method: 'DELETE' })
}
