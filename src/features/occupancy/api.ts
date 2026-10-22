import type { Resident } from '@/features/resident/api'
import type { Room } from '@/features/room/api'
import { apiFetch, type ApiEnvelope } from '@/lib/api'

export type OccupancyStatus = 'ACTIVE' | 'ENDED'

export type Occupancy = {
  id: string
  userId: string
  roomId: string
  bedLabel: string | null
  monthlyRateSnapshot: number
  startDate: string
  endDate: string | null
  status: OccupancyStatus
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  room: Room
  user: Resident
}

export type OccupancyInput = {
  userId: string
  roomId: string
  bedLabel?: string
}

export async function fetchOccupancies() {
  const res = await apiFetch<ApiEnvelope<Occupancy[]>>('/occupancies')
  return res.data
}

export function createOccupancy(input: OccupancyInput) {
  return apiFetch<ApiEnvelope<Occupancy>>('/occupancies', {
    method: 'POST',
    body: input,
  })
}

export function checkoutOccupancy(id: string) {
  return apiFetch<ApiEnvelope<Occupancy>>(`/occupancies/${id}/checkout`, {
    method: 'POST',
  })
}
