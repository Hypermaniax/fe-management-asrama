import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createRoom,
  deleteRoom,
  fetchRooms,
  updateRoom,
  type RoomInput,
  type RoomUpdate,
} from '@/features/room/api'

export function useRooms(enabled = true) {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: fetchRooms,
    enabled,
  })
}

function useInvalidateRooms() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['rooms'] })
}

export function useCreateRoom() {
  const invalidate = useInvalidateRooms()
  return useMutation({
    mutationFn: (input: RoomInput) => createRoom(input),
    onSuccess: invalidate,
  })
}

export function useUpdateRoom() {
  const invalidate = useInvalidateRooms()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RoomUpdate }) =>
      updateRoom(id, input),
    onSuccess: invalidate,
  })
}

export function useDeleteRoom() {
  const invalidate = useInvalidateRooms()
  return useMutation({
    mutationFn: (id: string) => deleteRoom(id),
    onSuccess: invalidate,
  })
}
