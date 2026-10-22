import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  approveResident,
  checkoutResident,
  fetchResident,
  fetchResidents,
  rejectResident,
  submitResident,
  updateResidentProfile,
  type ResidentProfileInput,
  type ResidentStatus,
} from '@/features/resident/api'

export function useResidents(
  buildingId: string | null | undefined,
  status?: ResidentStatus,
) {
  return useQuery({
    queryKey: ['residents', buildingId ?? null, status ?? 'ALL'],
    queryFn: () => fetchResidents({ buildingId: buildingId as string, status }),
    enabled: Boolean(buildingId),
  })
}

export function useResidentNames(buildingIds: string[]) {
  return useQueries({
    queries: buildingIds.map((buildingId) => ({
      queryKey: ['residents', buildingId, 'ALL'],
      queryFn: () => fetchResidents({ buildingId }),
    })),
    combine: (results) => {
      const names = new Map<string, string>()
      for (const result of results) {
        for (const resident of result.data ?? []) {
          names.set(resident.id, resident.name ?? resident.email)
        }
      }
      return names
    },
  })
}

export function useResidentDirectory(buildingIds: string[]) {
  return useQueries({
    queries: buildingIds.map((buildingId) => ({
      queryKey: ['residents', buildingId, 'ALL'],
      queryFn: () => fetchResidents({ buildingId }),
    })),
    combine: (results) => {
      const map = new Map<
        string,
        {
          id: string
          name: string
          email: string
          buildingId: string | null
        }
      >()
      for (const result of results) {
        for (const resident of result.data ?? []) {
          map.set(resident.id, {
            id: resident.id,
            name: resident.name ?? resident.email,
            email: resident.email,
            buildingId: resident.buildingId,
          })
        }
      }
      return [...map.values()].sort((a, b) => a.name.localeCompare(b.name))
    },
  })
}

export function useResident(id: string | undefined) {
  return useQuery({
    queryKey: ['resident', id ?? null],
    queryFn: () => fetchResident(id as string),
    enabled: Boolean(id),
  })
}

function useInvalidateResidents() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['residents'] })
    queryClient.invalidateQueries({ queryKey: ['resident'] })
    queryClient.invalidateQueries({ queryKey: ['occupancies'] })
    queryClient.invalidateQueries({ queryKey: ['access'] })
  }
}

export function useUpdateResidentProfile() {
  const invalidate = useInvalidateResidents()
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: ResidentProfileInput
    }) => updateResidentProfile(id, input),
    onSuccess: invalidate,
  })
}

export function useSubmitResident() {
  const invalidate = useInvalidateResidents()
  return useMutation({
    mutationFn: (id: string) => submitResident(id),
    onSuccess: invalidate,
  })
}

export function useApproveResident() {
  const invalidate = useInvalidateResidents()
  return useMutation({
    mutationFn: ({
      id,
      buildingId,
    }: {
      id: string
      buildingId?: string
    }) => approveResident(id, buildingId ? { buildingId } : undefined),
    onSuccess: invalidate,
  })
}

export function useRejectResident() {
  const invalidate = useInvalidateResidents()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectResident(id, reason),
    onSuccess: invalidate,
  })
}

export function useCheckoutResident() {
  const invalidate = useInvalidateResidents()
  return useMutation({
    mutationFn: (id: string) => checkoutResident(id),
    onSuccess: invalidate,
  })
}
