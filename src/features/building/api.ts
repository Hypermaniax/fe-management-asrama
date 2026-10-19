import { apiFetch } from '@/lib/api'

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

type Envelope<T> = { status: string; data: T }

export async function fetchBuildings() {
  const res = await apiFetch<Envelope<Building[]>>('/buildings')
  return res.data
}

export async function createBuilding(input: BuildingInput) {
  const res = await apiFetch<Envelope<Building>>('/buildings', {
    method: 'POST',
    body: input,
  })
  return res.data
}

export async function updateBuilding(id: string, input: BuildingUpdate) {
  const res = await apiFetch<Envelope<Building>>(`/buildings/${id}`, {
    method: 'PATCH',
    body: input,
  })
  return res.data
}

export async function deleteBuilding(id: string) {
  await apiFetch<{ status: string }>(`/buildings/${id}`, { method: 'DELETE' })
}
