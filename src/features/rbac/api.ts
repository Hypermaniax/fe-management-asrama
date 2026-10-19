import { apiFetch, type ApiEnvelope } from '@/lib/api'

export type Role = {
  id: string
  code: string
  name: string
  description: string | null
  isSystem: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type RoleInput = {
  code: string
  name: string
  description?: string | null
}

export type RoleUpdate = {
  name?: string
  description?: string | null
  isActive?: boolean
}

export async function fetchRoles() {
  const res = await apiFetch<ApiEnvelope<Role[]>>('/rbac/roles')
  return res.data
}

export function createRole(input: RoleInput) {
  return apiFetch<ApiEnvelope<Role>>('/rbac/roles', {
    method: 'POST',
    body: input,
  })
}

export function updateRole(id: string, input: RoleUpdate) {
  return apiFetch<ApiEnvelope<Role>>(`/rbac/roles/${id}`, {
    method: 'PATCH',
    body: input,
  })
}

export function deleteRole(id: string) {
  return apiFetch<{ status: string }>(`/rbac/roles/${id}`, { method: 'DELETE' })
}
