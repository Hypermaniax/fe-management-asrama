import { apiFetch } from '@/lib/api'

export type Building = {
  id: string
  code: string
  name: string
}

type Envelope<T> = { status: string; data: T }

export async function fetchBuildings() {
  const res = await apiFetch<Envelope<Building[]>>('/buildings')
  return res.data
}
