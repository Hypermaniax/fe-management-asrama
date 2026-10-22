import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createRole,
  deleteRole,
  fetchMenus,
  fetchPermissions,
  fetchRoleMenus,
  fetchRolePermissions,
  fetchRoles,
  setRoleMenus,
  setRolePermissions,
  updateRole,
  type RoleInput,
  type RoleUpdate,
} from '@/features/rbac/api'

export function useRoles(enabled = true) {
  return useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles,
    enabled,
  })
}

export function usePermissions(enabled = true) {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: fetchPermissions,
    enabled,
  })
}

export function useAllMenus(enabled = true) {
  return useQuery({
    queryKey: ['menus'],
    queryFn: fetchMenus,
    enabled,
  })
}

export function useRolePermissions(roleId: string) {
  return useQuery({
    queryKey: ['roles', roleId, 'permissions'],
    queryFn: () => fetchRolePermissions(roleId),
    enabled: Boolean(roleId),
  })
}

export function useRoleMenus(roleId: string) {
  return useQuery({
    queryKey: ['roles', roleId, 'menus'],
    queryFn: () => fetchRoleMenus(roleId),
    enabled: Boolean(roleId),
  })
}

function useInvalidateRoles(roleId?: string) {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['roles'] })
    queryClient.invalidateQueries({ queryKey: ['access'] })
    if (roleId) {
      queryClient.invalidateQueries({ queryKey: ['roles', roleId] })
    }
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

export function useSetRolePermissions(roleId: string) {
  const invalidate = useInvalidateRoles(roleId)
  return useMutation({
    mutationFn: (permissionIds: string[]) =>
      setRolePermissions(roleId, permissionIds),
    onSuccess: invalidate,
  })
}

export function useSetRoleMenus(roleId: string) {
  const invalidate = useInvalidateRoles(roleId)
  return useMutation({
    mutationFn: (menuIds: string[]) => setRoleMenus(roleId, menuIds),
    onSuccess: invalidate,
  })
}
