import { apiFetch } from '@/lib/api'

export type Health = { status: string }

export function fetchHealth() {
  return apiFetch<Health>('/health')
}
