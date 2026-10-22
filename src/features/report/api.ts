import { apiFetch, type ApiEnvelope } from '@/lib/api'

export type ArrearsItem = {
  invoiceId: string
  code: string
  userId: string
  userName: string | null
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

export type ArrearsReport = {
  year: number | null
  month: number | null
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

export type CashBalancesReport = {
  count: number
  totalBalance: number
  items: CashBalanceItem[]
}

export type IncomeExpenseItem = {
  categoryId: string | null
  categoryName: string
  direction: 'IN' | 'OUT'
  total: number
}

export type IncomeExpenseReport = {
  from: string | null
  to: string | null
  income: number
  expense: number
  net: number
  items: IncomeExpenseItem[]
}

export type EventBudgetReport = {
  eventId: string
  title: string
  status: string
  buildingId: string | null
  buildingName: string | null
  budgetAmount: number | null
  realizedAmount: number
  remaining: number | null
  usagePercent: number | null
  expenseCount: number
  overBudget: boolean
}

export type ReportEvent = {
  id: string
  title: string
  status: string
  buildingId: string | null
  budgetAmount: number | null
  startAt: string
}

export type ArrearsQuery = {
  buildingId?: string
  year?: number
  month?: number
}

export type IncomeExpenseQuery = {
  buildingId?: string
  from?: string
  to?: string
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

export async function fetchArrearsReport(params: ArrearsQuery = {}) {
  const res = await apiFetch<ApiEnvelope<ArrearsReport>>(
    `/reports/arrears${buildQuery(params)}`,
  )
  return res.data
}

export async function fetchCashBalancesReport(buildingId?: string) {
  const res = await apiFetch<ApiEnvelope<CashBalancesReport>>(
    `/reports/cash-balances${buildQuery({ buildingId })}`,
  )
  return res.data
}

export async function fetchIncomeExpenseReport(
  params: IncomeExpenseQuery = {},
) {
  const res = await apiFetch<ApiEnvelope<IncomeExpenseReport>>(
    `/reports/income-vs-expense${buildQuery(params)}`,
  )
  return res.data
}

export async function fetchEventBudgetReport(eventId: string) {
  const res = await apiFetch<ApiEnvelope<EventBudgetReport>>(
    `/reports/events/${eventId}/budget`,
  )
  return res.data
}

export async function fetchReportEvents() {
  const res = await apiFetch<ApiEnvelope<ReportEvent[]>>('/events')
  return res.data
}

export function exportArrearsCsv(params: ArrearsQuery = {}) {
  return apiFetch<Blob>(`/reports/arrears/export${buildQuery(params)}`, {
    responseType: 'blob',
  })
}

export function exportIncomeExpenseCsv(params: IncomeExpenseQuery = {}) {
  return apiFetch<Blob>(
    `/reports/income-vs-expense/export${buildQuery(params)}`,
    { responseType: 'blob' },
  )
}
