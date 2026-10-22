import { apiFetch, type ApiEnvelope } from '@/lib/api'

export type PaymentMethod = 'CASH' | 'TRANSFER' | 'QRIS'

export type PaymentAllocation = {
  id: string
  paymentId: string
  invoiceId: string
  amount: number
  createdAt: string
}

export type Payment = {
  id: string
  code: string
  userId: string
  amount: number
  method: PaymentMethod
  cashAccountId: string
  referenceNo: string | null
  proofFileId: string | null
  idempotencyKey: string
  paidAt: string
  receivedById: string
  note: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  allocations: PaymentAllocation[]
}

export type PaymentInput = {
  userId: string
  amount: number
  method: PaymentMethod
  cashAccountId: string
  referenceNo?: string | null
  proofFileId?: string | null
  idempotencyKey: string
  note?: string | null
  allocations?: { invoiceId: string; amount: number }[]
}

export type PaymentQuery = {
  userId?: string
}

export type SubmissionStatus = 'PENDING' | 'VERIFIED' | 'REJECTED'

export type PaymentSubmissionInvoice = {
  id: string
  code: string
  buildingId: string
  userId: string
  periodYear: number
  periodMonth: number
  dueDate: string
  totalAmount: number
  paidAmount: number
  status: string
}

export type PaymentSubmission = {
  id: string
  code: string
  userId: string
  invoiceId: string
  amount: number
  method: 'TRANSFER' | 'QRIS'
  referenceNo: string | null
  proofFileId: string
  note: string | null
  status: SubmissionStatus
  reviewNote: string | null
  reviewedById: string | null
  reviewedAt: string | null
  paymentId: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  invoice?: PaymentSubmissionInvoice
  user?: { id: string; email: string; name: string | null }
  proofFile?: {
    id: string
    originalName: string
    mimeType: string
    sizeBytes: number
  } | null
}

export type PaymentSubmissionQuery = {
  status?: SubmissionStatus
  userId?: string
}

export type MyPaymentSubmissionInput = {
  invoiceId: string
  amount: number
  method: 'TRANSFER' | 'QRIS'
  proofFileId: string
  referenceNo?: string | null
  note?: string | null
}

function toQueryString(query: Record<string, string | undefined>) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value)
  }
  const value = params.toString()
  return value ? `?${value}` : ''
}

export async function fetchPayments(query: PaymentQuery = {}) {
  const res = await apiFetch<ApiEnvelope<Payment[]>>(
    `/payments${toQueryString({ userId: query.userId })}`,
  )
  return res.data
}

export async function fetchPayment(id: string) {
  const res = await apiFetch<ApiEnvelope<Payment>>(`/payments/${id}`)
  return res.data
}

export function createPayment(input: PaymentInput) {
  return apiFetch<ApiEnvelope<Payment>>('/payments', {
    method: 'POST',
    body: input,
  })
}

export function uploadPaymentProof(file: File) {
  const body = new FormData()
  body.append('file', file)
  return apiFetch<ApiEnvelope<{ id: string }>>('/me/payments/proof', {
    method: 'POST',
    body,
  })
}

export async function fetchPaymentSubmissions(
  query: PaymentSubmissionQuery = {},
) {
  const res = await apiFetch<ApiEnvelope<PaymentSubmission[]>>(
    `/payment-submissions${toQueryString({
      status: query.status,
      userId: query.userId,
    })}`,
  )
  return res.data
}

export function verifyPaymentSubmission(
  id: string,
  input?: { cashAccountId?: string },
) {
  return apiFetch<ApiEnvelope<unknown>>(
    `/payment-submissions/${id}/verify`,
    { method: 'POST', body: input ?? {} },
  )
}

export function rejectPaymentSubmission(id: string, reason: string) {
  return apiFetch<ApiEnvelope<PaymentSubmission>>(
    `/payment-submissions/${id}/reject`,
    { method: 'POST', body: { reason } },
  )
}

export async function fetchMyPaymentSubmissions(
  query: Pick<PaymentSubmissionQuery, 'status'> = {},
) {
  const res = await apiFetch<ApiEnvelope<PaymentSubmission[]>>(
    `/me/payments${toQueryString({ status: query.status })}`,
  )
  return res.data
}

export function createMyPaymentSubmission(input: MyPaymentSubmissionInput) {
  return apiFetch<ApiEnvelope<PaymentSubmission>>('/me/payments', {
    method: 'POST',
    body: input,
  })
}
