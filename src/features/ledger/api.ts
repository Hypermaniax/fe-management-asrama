import { apiFetch, type ApiEnvelope } from '@/lib/api'
import type { LedgerEntry } from '@/features/cash-account/api'

export type { LedgerEntry }

export type LedgerQuery = {
  cashAccountId?: string
}

export type LedgerIncomeInput = {
  categoryId: string
  amount: number
  idempotencyKey: string
  occurredAt?: string
  cashAccountId?: string
  description?: string | null
}

export async function fetchLedger(query: LedgerQuery = {}) {
  const params = new URLSearchParams()
  if (query.cashAccountId) params.set('cashAccountId', query.cashAccountId)
  const value = params.toString()
  const res = await apiFetch<ApiEnvelope<LedgerEntry[]>>(
    `/ledger${value ? `?${value}` : ''}`,
  )
  return res.data
}

export function recordLedgerIncome(input: LedgerIncomeInput) {
  return apiFetch<ApiEnvelope<LedgerEntry>>('/ledger/income', {
    method: 'POST',
    body: input,
  })
}

export function reverseLedgerEntry(id: string, reason: string) {
  return apiFetch<ApiEnvelope<LedgerEntry>>(`/ledger/${id}/reversal`, {
    method: 'POST',
    body: { reason },
  })
}
