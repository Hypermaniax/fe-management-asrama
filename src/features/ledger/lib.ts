const jakartaDateFormatter = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'Asia/Jakarta',
})

export const LEDGER_SOURCE_LABELS: Record<string, string> = {
  PAYMENT: 'Pembayaran',
  EXPENSE: 'Pengeluaran',
  ADJUSTMENT: 'Pemasukan manual',
  TRANSFER: 'Transfer',
  OPENING: 'Saldo awal',
  REVERSAL: 'Reversal',
}

export function ledgerSourceLabel(sourceType: string) {
  return (
    LEDGER_SOURCE_LABELS[sourceType] ??
    sourceType
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/^\w/, (char) => char.toUpperCase())
  )
}

export function createLedgerIdempotencyKey() {
  return `inc-${crypto.randomUUID()}`
}

export function todayInputDate() {
  return jakartaDateFormatter.format(new Date())
}

export function toOccurredAt(date: string) {
  return new Date(`${date}T00:00:00.000Z`).toISOString()
}

export function entryDate(occurredAt: string) {
  return jakartaDateFormatter.format(new Date(occurredAt))
}
