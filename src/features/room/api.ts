import { apiFetch, type ApiEnvelope } from '@/lib/api'

export type RoomStatus = 'ACTIVE' | 'MAINTENANCE'

export type Room = {
  id: string
  buildingId: string
  number: string
  capacity: number
  status: RoomStatus
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type RoomInput = {
  buildingId: string
  number: string
  capacity: number
  status?: RoomStatus
}

export type RoomUpdate = {
  number?: string
  capacity?: number
  status?: RoomStatus
}

export async function fetchRooms() {
  const res = await apiFetch<ApiEnvelope<Room[]>>('/rooms')
  return res.data
}

export function createRoom(input: RoomInput) {
  return apiFetch<ApiEnvelope<Room>>('/rooms', { method: 'POST', body: input })
}

export function updateRoom(id: string, input: RoomUpdate) {
  return apiFetch<ApiEnvelope<Room>>(`/rooms/${id}`, {
    method: 'PATCH',
    body: input,
  })
}

export function deleteRoom(id: string) {
  return apiFetch<{ status: string }>(`/rooms/${id}`, { method: 'DELETE' })
}
