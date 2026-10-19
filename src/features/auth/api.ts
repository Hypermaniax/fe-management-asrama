import { apiFetch, type ApiEnvelope } from '@/lib/api'

export type AuthUser = {
  id: string
  email: string
}

export type MenuNode = {
  id: string
  code: string
  name: string
  path: string
  icon: string | null
  sortOrder: number
  children: MenuNode[]
}

export type Access = {
  roles: string[]
  permissions: string[]
  buildings: string[]
  isSuperAdmin: boolean
  menus: MenuNode[]
}

export type Session = {
  user: AuthUser
  token: string
}

export function signUp(email: string, password: string) {
  return apiFetch<ApiEnvelope<{ user: AuthUser }>>('/auth/register', {
    method: 'POST',
    body: { email, password },
  })
}

export function signIn(email: string, password: string) {
  return apiFetch<ApiEnvelope<Session>>('/auth/login', {
    method: 'POST',
    body: { email, password },
  })
}

export function requestOtp(email: string) {
  return apiFetch<ApiEnvelope<{ sent: boolean }>>('/auth/request-otp', {
    method: 'POST',
    body: { email },
  })
}

export function verifyOtp(email: string, otp: string) {
  return apiFetch<ApiEnvelope<{ verified: boolean } & Session>>(
    '/auth/verify-otp',
    { method: 'POST', body: { email, otp } },
  )
}

export async function fetchMe() {
  const res = await apiFetch<ApiEnvelope<AuthUser>>('/auth/me')
  return res.data
}

export async function fetchAccess() {
  const res = await apiFetch<ApiEnvelope<Access>>('/rbac/me')
  return res.data
}
