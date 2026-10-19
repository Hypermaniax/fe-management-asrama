import { apiFetch } from '@/lib/api'

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

type Envelope<T> = { status: string; data: T }

export async function fetchRoles() {
  const res = await apiFetch<Envelope<Role[]>>('/rbac/roles')
  return res.data
}

export async function createRole(input: RoleInput) {
  const res = await apiFetch<Envelope<Role>>('/rbac/roles', {
    method: 'POST',
    body: input,
  })
  return res.data
}

export async function updateRole(id: string, input: RoleUpdate) {
  const res = await apiFetch<Envelope<Role>>(`/rbac/roles/${id}`, {
    method: 'PATCH',
    body: input,
  })
  return res.data
}

export async function deleteRole(id: string) {
  await apiFetch<{ status: string }>(`/rbac/roles/${id}`, { method: 'DELETE' })
}
