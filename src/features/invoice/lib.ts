import type { InvoiceStatus, SubmissionStatus } from '@/features/invoice/api'

export const MONTH_ITEMS = [
  { value: '1', label: 'Januari' },
  { value: '2', label: 'Februari' },
  { value: '3', label: 'Maret' },
  { value: '4', label: 'April' },
  { value: '5', label: 'Mei' },
  { value: '6', label: 'Juni' },
  { value: '7', label: 'Juli' },
  { value: '8', label: 'Agustus' },
  { value: '9', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
]

export function yearItems(count = 5) {
  const current = new Date().getFullYear()
  return Array.from({ length: count }, (_, index) => {
    const year = current - index
    return { value: String(year), label: String(year) }
  })
}

const periodFormatter = new Intl.DateTimeFormat('id-ID', {
  month: 'long',
  year: 'numeric',
})

export function formatPeriod(year: number, month: number): string {
  return periodFormatter.format(new Date(year, month - 1, 1))
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  ISSUED: 'Terbit',
  PARTIAL: 'Sebagian',
  PAID: 'Lunas',
  OVERDUE: 'Tunggakan',
  VOID: 'Dibatalkan',
}

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  PENDING: 'Menunggu',
  VERIFIED: 'Terverifikasi',
  REJECTED: 'Ditolak',
}
