import { apiFetch, type ApiEnvelope } from '@/lib/api'

export type CashAccountType = 'CASH' | 'BANK'

export type CashAccount = {
  id: string
  buildingId: string
  name: string
  type: CashAccountType
  openingBalance: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type CashAccountInput = {
  buildingId: string
  name: string
  type: CashAccountType
  openingBalance: number
}

export type CashAccountUpdate = {
  name?: string
  type?: CashAccountType
  openingBalance?: number
}

export type CashAccountBalance = {
  cashAccountId: string
  openingBalance: number
  totalIn: number
  totalOut: number
  balance: number
}

export type LedgerDirection = 'IN' | 'OUT'

export type LedgerEntry = {
  id: string
  cashAccountId: string
  direction: LedgerDirection
  amount: number
  categoryId: string | null
  sourceType: string
  sourceId: string | null
  idempotencyKey: string
  occurredAt: string
  description: string
  createdById: string
  createdAt: string
}

export async function fetchCashAccounts() {
  const res = await apiFetch<ApiEnvelope<CashAccount[]>>('/cash-accounts')
  return res.data
}

export function createCashAccount(input: CashAccountInput) {
  return apiFetch<ApiEnvelope<CashAccount>>('/cash-accounts', {
    method: 'POST',
    body: input,
  })
}

export function updateCashAccount(id: string, input: CashAccountUpdate) {
  return apiFetch<ApiEnvelope<CashAccount>>(`/cash-accounts/${id}`, {
    method: 'PATCH',
    body: input,
  })
}

export function deleteCashAccount(id: string) {
  return apiFetch<{ status: string }>(`/cash-accounts/${id}`, {
    method: 'DELETE',
  })
}

export async function fetchCashAccountBalance(id: string) {
  const res = await apiFetch<ApiEnvelope<CashAccountBalance>>(
    `/cash-accounts/${id}/balance`,
  )
  return res.data
}

export async function fetchCashAccountLedger(id: string) {
  const res = await apiFetch<ApiEnvelope<LedgerEntry[]>>(
    `/cash-accounts/${id}/ledger`,
  )
  return res.data
}
