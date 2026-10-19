import { apiFetch, type ApiEnvelope } from '@/lib/api'

export type FeeRule = {
  id: string
  buildingId: string
  dueDayOfMonth: number
  defaultMonthlyRate: number
  effectiveFrom: string
  createdAt: string
  deletedAt: string | null
}

export type FeeRuleInput = {
  buildingId: string
  dueDayOfMonth: number
  defaultMonthlyRate: number
  effectiveFrom: string
}

export async function fetchFeeRules() {
  const res = await apiFetch<ApiEnvelope<FeeRule[]>>('/fee-rules')
  return res.data
}

export function createFeeRule(input: FeeRuleInput) {
  return apiFetch<ApiEnvelope<FeeRule>>('/fee-rules', {
    method: 'POST',
    body: input,
  })
}

export function deleteFeeRule(id: string) {
  return apiFetch<{ status: string }>(`/fee-rules/${id}`, { method: 'DELETE' })
}
