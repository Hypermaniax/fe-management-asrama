import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createBuilding,
  deleteBuilding,
  fetchBuildings,
  updateBuilding,
  type BuildingInput,
  type BuildingUpdate,
} from '@/features/building/api'

export function useBuildings(enabled = true) {
  return useQuery({
    queryKey: ['buildings'],
    queryFn: fetchBuildings,
    enabled,
  })
}

function useInvalidateBuildings() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['buildings'] })
    queryClient.invalidateQueries({ queryKey: ['access'] })
  }
}

export function useCreateBuilding() {
  const invalidate = useInvalidateBuildings()
  return useMutation({
    mutationFn: (input: BuildingInput) => createBuilding(input),
    onSuccess: invalidate,
  })
}

export function useUpdateBuilding() {
  const invalidate = useInvalidateBuildings()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: BuildingUpdate }) =>
      updateBuilding(id, input),
    onSuccess: invalidate,
  })
}

export function useDeleteBuilding() {
  const invalidate = useInvalidateBuildings()
  return useMutation({
    mutationFn: (id: string) => deleteBuilding(id),
    onSuccess: invalidate,
  })
}
