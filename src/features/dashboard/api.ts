import { apiFetch, type ApiEnvelope } from '@/lib/api'

export type ArrearsItem = {
  invoiceId: string
  code: string
  userId: string
  userName: string
  buildingId: string
  buildingName: string
  periodYear: number
  periodMonth: number
  dueDate: string
  totalAmount: number
  paidAmount: number
  outstanding: number
  status: string
}

export type ArrearsResponse = {
  year: number
  month: number
  count: number
  totalOutstanding: number
  items: ArrearsItem[]
}

export type CashBalanceItem = {
  cashAccountId: string
  name: string
  type: 'CASH' | 'BANK'
  buildingId: string
  buildingName: string
  openingBalance: number
  totalIn: number
  totalOut: number
  balance: number
}

export type CashBalancesResponse = {
  count: number
  totalBalance: number
  items: CashBalanceItem[]
}

export type IncomeVsExpenseItem = {
  categoryId: string
  categoryName: string
  direction: 'IN' | 'OUT'
  total: number
}

export type IncomeVsExpense = {
  from: string | null
  to: string | null
  income: number
  expense: number
  net: number
  items: IncomeVsExpenseItem[]
}

export type EventCategory = 'RUTIN' | 'BESAR'
export type EventScope = 'ASRAMA' | 'GEDUNG'
export type EventStatus = 'PLANNED' | 'ONGOING' | 'DONE' | 'CANCELLED'

export type Event = {
  id: string
  title: string
  description: string | null
  category: EventCategory
  isAdHoc: boolean
  scope: EventScope
  buildingId: string | null
  startAt: string
  endAt: string | null
  location: string | null
  budgetAmount: number | null
  status: EventStatus
  isPublic: boolean
  recurrence: string
  createdById: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type ElectionStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'OPEN'
  | 'CLOSED'
  | 'DONE'
  | 'CANCELLED'

export type Election = {
  id: string
  code: string
  title: string
  description: string | null
  periodId: string | null
  buildingId: string | null
  startAt: string
  endAt: string
  status: ElectionStatus
  allowAbstain: boolean
  createdById: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type AttendanceStatus = 'HADIR' | 'IZIN' | 'TIDAK'

export type Attendance = {
  id: string
  sessionId: string
  userId: string
  status: AttendanceStatus
  checkedInAt: string | null
  note: string | null
  session: {
    id: string
    eventId: string
    title: string
    scheduledAt: string
    location: string | null
  }
}

export type InvoiceStatus = 'ISSUED' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'VOID'

export type Invoice = {
  id: string
  code: string
  buildingId: string
  userId: string
  periodYear: number
  periodMonth: number
  dueDate: string
  baseAmount: number
  discountAmount: number
  totalAmount: number
  paidAmount: number
  status: InvoiceStatus
}

export type PaymentMethod = 'CASH' | 'TRANSFER' | 'QRIS'

export type Payment = {
  id: string
  code: string
  userId: string
  amount: number
  method: PaymentMethod
  paidAt: string
  note: string | null
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

export async function fetchArrears(params: {
  buildingId?: string
  year: number
  month: number
}) {
  const res = await apiFetch<ApiEnvelope<ArrearsResponse>>(
    `/reports/arrears${buildQuery(params)}`,
  )
  return res.data
}

export async function fetchCashBalances(buildingId?: string) {
  const res = await apiFetch<ApiEnvelope<CashBalancesResponse>>(
    `/reports/cash-balances${buildQuery({ buildingId })}`,
  )
  return res.data
}

export async function fetchIncomeVsExpense(params: {
  buildingId?: string
  from: string
  to: string
}) {
  const res = await apiFetch<ApiEnvelope<IncomeVsExpense>>(
    `/reports/income-vs-expense${buildQuery(params)}`,
  )
  return res.data
}

export async function fetchEvents() {
  const res = await apiFetch<ApiEnvelope<Event[]>>('/events')
  return res.data
}

export async function fetchElections(status?: ElectionStatus) {
  const res = await apiFetch<ApiEnvelope<Election[]>>(
    `/elections${buildQuery({ status })}`,
  )
  return res.data
}

export async function fetchMyAttendance() {
  const res = await apiFetch<ApiEnvelope<Attendance[]>>('/events/me/attendance')
  return res.data
}

export async function fetchMyInvoices() {
  const res = await apiFetch<ApiEnvelope<Invoice[]>>('/invoices')
  return res.data
}

export async function fetchMyPayments(userId: string) {
  const res = await apiFetch<ApiEnvelope<Payment[]>>(
    `/payments${buildQuery({ userId })}`,
  )
  return res.data
}
