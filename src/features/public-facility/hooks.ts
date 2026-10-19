import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  assignSlot,
  createPublicFacility,
  deletePublicFacility,
  fetchAssignments,
  fetchPublicFacilities,
  fetchResidentOptions,
  releaseAssignment,
  updatePublicFacility,
  type AssignmentInput,
  type PublicFacilityInput,
  type PublicFacilityUpdate,
} from '@/features/public-facility/api'

export function usePublicFacilities(enabled = true) {
  return useQuery({
    queryKey: ['public-facilities'],
    queryFn: fetchPublicFacilities,
    enabled,
  })
}

export function useAssignments(publicFacilityId?: string | null, enabled = true) {
  return useQuery({
    queryKey: ['public-facility-assignments', publicFacilityId ?? null],
    queryFn: () => fetchAssignments(publicFacilityId as string),
    enabled: enabled && Boolean(publicFacilityId),
  })
}

export function useResidentOptions(buildingId?: string | null, enabled = true) {
  return useQuery({
    queryKey: ['resident-options', buildingId ?? null],
    queryFn: () => fetchResidentOptions(buildingId as string),
    enabled: enabled && Boolean(buildingId),
  })
}

function useInvalidatePublicFacilities() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['public-facilities'] })
    queryClient.invalidateQueries({ queryKey: ['public-facility-assignments'] })
  }
}

export function useCreatePublicFacility() {
  const invalidate = useInvalidatePublicFacilities()
  return useMutation({
    mutationFn: (input: PublicFacilityInput) => createPublicFacility(input),
    onSuccess: invalidate,
  })
}

export function useUpdatePublicFacility() {
  const invalidate = useInvalidatePublicFacilities()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PublicFacilityUpdate }) =>
      updatePublicFacility(id, input),
    onSuccess: invalidate,
  })
}

export function useDeletePublicFacility() {
  const invalidate = useInvalidatePublicFacilities()
  return useMutation({
    mutationFn: (id: string) => deletePublicFacility(id),
    onSuccess: invalidate,
  })
}

export function useAssignSlot() {
  const invalidate = useInvalidatePublicFacilities()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AssignmentInput }) =>
      assignSlot(id, input),
    onSuccess: invalidate,
  })
}

export function useReleaseAssignment() {
  const invalidate = useInvalidatePublicFacilities()
  return useMutation({
    mutationFn: (assignmentId: string) => releaseAssignment(assignmentId),
    onSuccess: invalidate,
  })
}
