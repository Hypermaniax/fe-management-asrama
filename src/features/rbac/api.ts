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

export type Permission = {
  id: string
  code: string
  resource: string
  action: string
  description: string | null
}

export type Menu = {
  id: string
  parentId: string | null
  code: string
  name: string
  path: string
  icon: string | null
  sortOrder: number
  isActive: boolean
}

export async function fetchPermissions() {
  const res = await apiFetch<ApiEnvelope<Permission[]>>('/rbac/permissions')
  return res.data
}

export async function fetchMenus() {
  const res = await apiFetch<ApiEnvelope<Menu[]>>('/rbac/menus')
  return res.data
}

async function listRoleIds(id: string, kind: 'permissions' | 'menus') {
  const res = await apiFetch<
    ApiEnvelope<{ roleId: string; permissionIds?: string[]; menuIds?: string[] }>
  >(`/rbac/roles/${id}/${kind}`)
  const ids =
    kind === 'permissions' ? res.data.permissionIds : res.data.menuIds
  if (!ids) throw new Error('Unexpected response')
  return ids
}

export function fetchRolePermissions(id: string) {
  return listRoleIds(id, 'permissions')
}

export function fetchRoleMenus(id: string) {
  return listRoleIds(id, 'menus')
}

export function setRolePermissions(id: string, permissionIds: string[]) {
  return apiFetch<ApiEnvelope<{ roleId: string; count: number }>>(
    `/rbac/roles/${id}/permissions`,
    { method: 'PUT', body: { permissionIds } },
  )
}

export function setRoleMenus(id: string, menuIds: string[]) {
  return apiFetch<ApiEnvelope<{ roleId: string; count: number }>>(
    `/rbac/roles/${id}/menus`,
    { method: 'PUT', body: { menuIds } },
  )
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
