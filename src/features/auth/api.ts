import { apiFetch } from '@/lib/api'

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

type Envelope<T> = { status: string; data: T }

export async function signUp(email: string, password: string) {
  const res = await apiFetch<Envelope<{ user: AuthUser }>>('/auth/register', {
    method: 'POST',
    body: { email, password },
  })
  return res.data
}

export async function signIn(email: string, password: string) {
  const res = await apiFetch<Envelope<Session>>('/auth/login', {
    method: 'POST',
    body: { email, password },
  })
  return res.data
}

export async function requestOtp(email: string) {
  const res = await apiFetch<Envelope<{ sent: boolean }>>('/auth/request-otp', {
    method: 'POST',
    body: { email },
  })
  return res.data
}

export async function verifyOtp(email: string, otp: string) {
  const res = await apiFetch<Envelope<{ verified: boolean } & Session>>(
    '/auth/verify-otp',
    { method: 'POST', body: { email, otp } },
  )
  return res.data
}

export async function fetchMe() {
  const res = await apiFetch<Envelope<AuthUser>>('/auth/me')
  return res.data
}

export async function fetchAccess() {
  const res = await apiFetch<Envelope<Access>>('/rbac/me')
  return res.data
}
