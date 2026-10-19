import type { Event, Invoice } from '@/features/dashboard/api'

export function monthRange(year: number, month: number) {
  const pad = (value: number) => String(value).padStart(2, '0')
  const lastDay = new Date(year, month, 0).getDate()
  return {
    year,
    month,
    from: `${year}-${pad(month)}-01`,
    to: `${year}-${pad(month)}-${pad(lastDay)}`,
  }
}

export function currentPeriod() {
  const now = new Date()
  return monthRange(now.getFullYear(), now.getMonth() + 1)
}

export function upcomingOnly(events: Event[], limit = 4): Event[] {
  const now = Date.now()
  return events
    .filter((event) => event.status !== 'CANCELLED')
    .filter((event) => new Date(event.startAt).getTime() >= now)
    .sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
    )
    .slice(0, limit)
}

export function outstandingInvoices(items: Invoice[]): Invoice[] {
  return items.filter(
    (invoice) => invoice.status !== 'PAID' && invoice.status !== 'VOID',
  )
}
