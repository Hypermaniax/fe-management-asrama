import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createRole,
  deleteRole,
  fetchRoles,
  updateRole,
  type RoleInput,
  type RoleUpdate,
} from '@/features/rbac/api'

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles,
  })
}

function useInvalidateRoles() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['roles'] })
    queryClient.invalidateQueries({ queryKey: ['access'] })
  }
}

export function useCreateRole() {
  const invalidate = useInvalidateRoles()
  return useMutation({
    mutationFn: (input: RoleInput) => createRole(input),
    onSuccess: invalidate,
  })
}

export function useUpdateRole() {
  const invalidate = useInvalidateRoles()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RoleUpdate }) =>
      updateRole(id, input),
    onSuccess: invalidate,
  })
}

export function useDeleteRole() {
  const invalidate = useInvalidateRoles()
  return useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: invalidate,
  })
}
