import { apiFetch, type ApiEnvelope } from '@/lib/api'

export type Expense = {
  id: string
  cashAccountId: string
  categoryId: string
  amount: number
  occurredAt: string
  vendor: string | null
  description: string | null
  receiptFileId: string
  eventId: string | null
  createdById: string
  idempotencyKey: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type ExpenseInput = {
  categoryId: string
  amount: number
  occurredAt: string
  receiptFileId: string
  cashAccountId: string
  vendor?: string | null
  description?: string | null
  eventId?: string | null
  idempotencyKey: string
}

export async function fetchExpenses() {
  const res = await apiFetch<ApiEnvelope<Expense[]>>('/expenses')
  return res.data
}

export async function fetchExpense(id: string) {
  const res = await apiFetch<ApiEnvelope<Expense>>(`/expenses/${id}`)
  return res.data
}

export function createExpense(input: ExpenseInput) {
  return apiFetch<ApiEnvelope<Expense>>('/expenses', {
    method: 'POST',
    body: input,
  })
}

export function uploadExpenseReceipt(file: File) {
  const body = new FormData()
  body.append('file', file)
  return apiFetch<ApiEnvelope<{ id: string }>>('/me/payments/proof', {
    method: 'POST',
    body,
  })
}
