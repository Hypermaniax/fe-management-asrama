import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  activatePeriod,
  createAssignment,
  createPeriod,
  createPosition,
  deletePosition,
  endAssignment,
  fetchAssignments,
  fetchPeriods,
  fetchPositions,
  fetchStructure,
  updatePeriod,
  updatePosition,
  type AssignmentInput,
  type PeriodInput,
  type PositionInput,
  type PositionUpdate,
} from '@/features/organization/api'

export function usePeriods() {
  return useQuery({
    queryKey: ['organization', 'periods'],
    queryFn: fetchPeriods,
  })
}

export function usePositions() {
  return useQuery({
    queryKey: ['organization', 'positions'],
    queryFn: fetchPositions,
  })
}

export function useAssignments(userId: string) {
  return useQuery({
    queryKey: ['organization', 'assignments', userId],
    queryFn: () => fetchAssignments(userId),
    enabled: Boolean(userId),
  })
}

export function useStructure(periodId: string) {
  return useQuery({
    queryKey: ['organization', 'structure', periodId],
    queryFn: () => fetchStructure(periodId),
    enabled: Boolean(periodId),
  })
}

function useInvalidateOrganization() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['organization'] })
  }
}

export function useCreatePeriod() {
  const invalidate = useInvalidateOrganization()
  return useMutation({
    mutationFn: (input: PeriodInput) => createPeriod(input),
    onSuccess: invalidate,
  })
}

export function useUpdatePeriod() {
  const invalidate = useInvalidateOrganization()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<PeriodInput> }) =>
      updatePeriod(id, input),
    onSuccess: invalidate,
  })
}

export function useActivatePeriod() {
  const invalidate = useInvalidateOrganization()
  return useMutation({
    mutationFn: (id: string) => activatePeriod(id),
    onSuccess: invalidate,
  })
}

export function useCreatePosition() {
  const invalidate = useInvalidateOrganization()
  return useMutation({
    mutationFn: (input: PositionInput) => createPosition(input),
    onSuccess: invalidate,
  })
}

export function useUpdatePosition() {
  const invalidate = useInvalidateOrganization()
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: PositionUpdate
    }) => updatePosition(id, input),
    onSuccess: invalidate,
  })
}

export function useDeletePosition() {
  const invalidate = useInvalidateOrganization()
  return useMutation({
    mutationFn: (id: string) => deletePosition(id),
    onSuccess: invalidate,
  })
}

export function useCreateAssignment() {
  const invalidate = useInvalidateOrganization()
  return useMutation({
    mutationFn: (input: AssignmentInput) => createAssignment(input),
    onSuccess: invalidate,
  })
}

export function useEndAssignment() {
  const invalidate = useInvalidateOrganization()
  return useMutation({
    mutationFn: (id: string) => endAssignment(id),
    onSuccess: invalidate,
  })
}
