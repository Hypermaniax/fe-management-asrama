import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  assignRole,
  deriveUserRoleAssignments,
  fetchAuditLog,
  fetchAuditLogs,
  mergeResidents,
  revokeRole,
  type AssignRoleInput,
  type AuditQuery,
} from '@/features/system/api'
import {
  fetchResidents,
  type Resident,
} from '@/features/resident/api'

export function useAllResidents(buildingIds: string[]) {
  return useQueries({
    queries: buildingIds.map((buildingId) => ({
      queryKey: ['residents', buildingId, 'system'],
      queryFn: () => fetchResidents({ buildingId }),
    })),
    combine: (results) => ({
      isLoading: results.some((result) => result.isLoading),
      error: results.find((result) => result.error)?.error ?? null,
      refetch: () => {
        for (const result of results) {
          void result.refetch()
        }
      },
      data: mergeResidents(
        results
          .map((result) => result.data)
          .filter((list): list is Resident[] => Boolean(list)),
      ),
    }),
  })
}

export function useUserRoleAssignments(enabled = true) {
  return useQuery({
    queryKey: ['system', 'user-roles'],
    queryFn: deriveUserRoleAssignments,
    enabled,
  })
}

function useInvalidateSystem() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['system'] })
  }
}

export function useAssignRole() {
  const invalidate = useInvalidateSystem()
  return useMutation({
    mutationFn: (input: AssignRoleInput) => assignRole(input),
    onSuccess: invalidate,
  })
}

export function useRevokeRole() {
  const invalidate = useInvalidateSystem()
  return useMutation({
    mutationFn: (userRoleId: string) => revokeRole(userRoleId),
    onSuccess: invalidate,
  })
}

export function useAuditLogs(params: AuditQuery = {}) {
  return useQuery({
    queryKey: ['system', 'audit', params],
    queryFn: () => fetchAuditLogs(params),
  })
}

export function useAuditLog(id: string | null) {
  return useQuery({
    queryKey: ['system', 'audit-detail', id ?? null],
    queryFn: () => fetchAuditLog(id as string),
    enabled: Boolean(id),
  })
}
