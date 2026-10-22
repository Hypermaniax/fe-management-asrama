import { apiFetch, type ApiEnvelope } from '@/lib/api'

export type InvoiceStatus = 'ISSUED' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'VOID'

export type InvoiceLine = {
  id: string
  invoiceId: string
  kind: string
  description: string
  amount: number
  createdAt: string
}

export type InvoiceAllocation = {
  id: string
  paymentId: string
  invoiceId: string
  amount: number
  createdAt: string
}

export type Invoice = {
  id: string
  code: string
  buildingId: string
  userId: string
  occupancyId: string | null
  periodYear: number
  periodMonth: number
  dueDate: string
  baseAmount: number
  discountAmount: number
  totalAmount: number
  paidAmount: number
  status: InvoiceStatus
  createdById: string
  issuedAt: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  lines?: InvoiceLine[]
  allocations?: InvoiceAllocation[]
}

export type SubmissionStatus = 'PENDING' | 'VERIFIED' | 'REJECTED'

export type InvoiceSubmissionSummary = {
  id: string
  code: string
  status: SubmissionStatus
  amount: number
  createdAt: string
}

export type MyInvoice = Invoice & {
  submissions?: InvoiceSubmissionSummary[]
}

export type InvoiceQuery = {
  buildingId?: string
  status?: InvoiceStatus
  year?: number
  month?: number
}

export type MyInvoiceQuery = Omit<InvoiceQuery, 'buildingId'>

export type GenerateInvoiceInput = {
  buildingId: string
  year: number
  month: number
}

function toQueryString(query: InvoiceQuery | MyInvoiceQuery) {
  const params = new URLSearchParams()
  if ('buildingId' in query && query.buildingId) {
    params.set('buildingId', query.buildingId)
  }
  if (query.status) params.set('status', query.status)
  if (query.year) params.set('year', String(query.year))
  if (query.month) params.set('month', String(query.month))
  const value = params.toString()
  return value ? `?${value}` : ''
}

export async function fetchInvoices(query: InvoiceQuery = {}) {
  const res = await apiFetch<ApiEnvelope<Invoice[]>>(
    `/invoices${toQueryString(query)}`,
  )
  return res.data
}

export async function fetchInvoice(id: string) {
  const res = await apiFetch<ApiEnvelope<Invoice>>(`/invoices/${id}`)
  return res.data
}

export function generateInvoices(input: GenerateInvoiceInput) {
  return apiFetch<ApiEnvelope<Invoice[]>>('/invoices/generate', {
    method: 'POST',
    body: input,
  })
}

export function voidInvoice(id: string) {
  return apiFetch<ApiEnvelope<Invoice>>(`/invoices/${id}/void`, {
    method: 'POST',
  })
}

export async function fetchMyInvoices(query: MyInvoiceQuery = {}) {
  const res = await apiFetch<ApiEnvelope<MyInvoice[]>>(
    `/me/invoices${toQueryString(query)}`,
  )
  return res.data
}

export async function fetchMyInvoice(id: string) {
  const res = await apiFetch<ApiEnvelope<MyInvoice>>(`/me/invoices/${id}`)
  return res.data
}
