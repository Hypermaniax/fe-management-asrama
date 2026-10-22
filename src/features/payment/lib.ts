import type { PaymentMethod, SubmissionStatus } from '@/features/payment/api'

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Tunai',
  TRANSFER: 'Transfer',
  QRIS: 'QRIS',
}

export const PAYMENT_SUBMISSION_STATUS_LABELS: Record<
  SubmissionStatus,
  string
> = {
  PENDING: 'Menunggu',
  VERIFIED: 'Terverifikasi',
  REJECTED: 'Ditolak',
}

export const PAYMENT_METHOD_ITEMS = [
  { value: 'CASH', label: 'Tunai' },
  { value: 'TRANSFER', label: 'Transfer' },
  { value: 'QRIS', label: 'QRIS' },
]

export const MY_PAYMENT_METHOD_ITEMS: {
  value: 'TRANSFER' | 'QRIS'
  label: string
}[] = [
  { value: 'TRANSFER', label: 'Transfer' },
  { value: 'QRIS', label: 'QRIS' },
]

export const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
]

export function createIdempotencyKey() {
  return `pay-${crypto.randomUUID()}`
}

export const PROOF_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg']
export const PROOF_MAX_SIZE_BYTES = 10 * 1024 * 1024
