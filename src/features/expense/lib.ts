export const RECEIPT_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
]

export const RECEIPT_MAX_SIZE_BYTES = 10 * 1024 * 1024

export function todayInputDate() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export function toOccurredAt(date: string) {
  return new Date(`${date}T00:00:00.000Z`).toISOString()
}

export function createExpenseIdempotencyKey() {
  return `exp-${crypto.randomUUID()}`
}
