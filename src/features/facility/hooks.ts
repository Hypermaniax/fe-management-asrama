import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createFacility,
  deleteFacility,
  fetchFacilities,
  fetchRoomFacilities,
  setRoomFacilities,
  updateFacility,
  type FacilityInput,
  type FacilityScope,
  type FacilityUpdate,
  type RoomFacilityItem,
} from '@/features/facility/api'

export function useFacilities(scope?: FacilityScope, enabled = true) {
  return useQuery({
    queryKey: ['facilities', scope ?? null],
    queryFn: () => fetchFacilities(scope),
    enabled,
  })
}

export function useRoomFacilities(roomId?: string | null, enabled = true) {
  return useQuery({
    queryKey: ['room-facilities', roomId ?? null],
    queryFn: () => fetchRoomFacilities(roomId as string),
    enabled: enabled && Boolean(roomId),
  })
}

function useInvalidateFacilities() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['facilities'] })
    queryClient.invalidateQueries({ queryKey: ['room-facilities'] })
  }
}

export function useCreateFacility() {
  const invalidate = useInvalidateFacilities()
  return useMutation({
    mutationFn: (input: FacilityInput) => createFacility(input),
    onSuccess: invalidate,
  })
}

export function useUpdateFacility() {
  const invalidate = useInvalidateFacilities()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: FacilityUpdate }) =>
      updateFacility(id, input),
    onSuccess: invalidate,
  })
}

export function useDeleteFacility() {
  const invalidate = useInvalidateFacilities()
  return useMutation({
    mutationFn: (id: string) => deleteFacility(id),
    onSuccess: invalidate,
  })
}

export function useSetRoomFacilities() {
  const invalidate = useInvalidateFacilities()
  return useMutation({
    mutationFn: ({
      roomId,
      items,
    }: {
      roomId: string
      items: RoomFacilityItem[]
    }) => setRoomFacilities(roomId, items),
    onSuccess: invalidate,
  })
}
