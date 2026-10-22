import type { Resident } from '@/features/resident/api'
import { apiFetch, type ApiEnvelope } from '@/lib/api'

export type UserRoleAssignment = {
  id: string
  userId: string
  roleId: string
  buildingId: string | null
  assignedAt: string
}

export type AssignRoleInput = {
  userId: string
  roleId: string
  buildingId?: string
}

export async function assignRole(input: AssignRoleInput) {
  return apiFetch<ApiEnvelope<UserRoleAssignment>>('/rbac/assign', {
    method: 'POST',
    body: input,
  })
}

export function revokeRole(userRoleId: string) {
  return apiFetch<{ status: string }>(`/rbac/user-roles/${userRoleId}`, {
    method: 'DELETE',
  })
}

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE'

export type AuditLog = {
  id: string
  actorId: string
  action: string
  entity: string
  entityId: string
  path: string | null
  before: unknown
  after: unknown
  ip: string | null
  createdAt: string
  actor?: {
    id: string
    email: string
    name: string | null
  } | null
}

export type AuditQuery = {
  entity?: string
  entityId?: string
  actorId?: string
  action?: string
  take?: number
}

function buildQuery(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue
    query.set(key, String(value))
  }
  const qs = query.toString()
  return qs ? `?${qs}` : ''
}

export async function fetchAuditLogs(params: AuditQuery = {}) {
  const res = await apiFetch<ApiEnvelope<AuditLog[]>>(
    `/audit-logs${buildQuery(params)}`,
  )
  return res.data
}

export async function fetchAuditLog(id: string) {
  const res = await apiFetch<ApiEnvelope<AuditLog>>(`/audit-logs/${id}`)
  return res.data
}

// Tidak ada endpoint daftar role per user; penugasan direkonstruksi dari jejak
// audit `userRole` (CREATE menandai assign, DELETE menandai revoke).
export async function deriveUserRoleAssignments() {
  const logs = await fetchAuditLogs({ entity: 'userRole', take: 500 })
  const sorted = [...logs].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  )
  const revoked = new Set<string>()
  const assignments = new Map<string, UserRoleAssignment>()
  for (const log of sorted) {
    if (log.action === 'CREATE') {
      const after = log.after as
        | { userId?: string; roleId?: string; buildingId?: string | null }
        | null
      if (!log.entityId || !after?.userId || !after?.roleId) continue
      assignments.set(log.entityId, {
        id: log.entityId,
        userId: after.userId,
        roleId: after.roleId,
        buildingId: after.buildingId ?? null,
        assignedAt: log.createdAt,
      })
    } else if (log.action === 'DELETE') {
      revoked.add(log.entityId)
    }
  }
  for (const id of revoked) {
    assignments.delete(id)
  }
  const byUser = new Map<string, UserRoleAssignment[]>()
  for (const assignment of assignments.values()) {
    const list = byUser.get(assignment.userId) ?? []
    list.push(assignment)
    byUser.set(assignment.userId, list)
  }
  return byUser
}

export function mergeResidents(lists: Resident[][]) {
  const map = new Map<string, Resident>()
  for (const list of lists) {
    for (const resident of list) {
      map.set(resident.id, resident)
    }
  }
  return [...map.values()].sort((a, b) =>
    (a.name ?? a.email).localeCompare(b.name ?? b.email),
  )
}
