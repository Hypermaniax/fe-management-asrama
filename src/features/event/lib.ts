import type {
  AttachmentKind,
  AttendanceStatus,
  EventCategory,
  EventRecurrence,
  EventScope,
  EventStatus,
} from '@/features/event/api'

const jakartaDateTimeFormatter = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'Asia/Jakarta',
})

export const CATEGORY_ITEMS: { value: EventCategory; label: string }[] = [
  { value: 'RUTIN', label: 'Rutin' },
  { value: 'BESAR', label: 'Besar' },
]

export const SCOPE_ITEMS: { value: EventScope; label: string }[] = [
  { value: 'ASRAMA', label: 'Asrama' },
  { value: 'GEDUNG', label: 'Gedung' },
]

export const STATUS_ITEMS: { value: EventStatus; label: string }[] = [
  { value: 'PLANNED', label: 'Rencana' },
  { value: 'ONGOING', label: 'Berlangsung' },
  { value: 'DONE', label: 'Selesai' },
  { value: 'CANCELLED', label: 'Dibatalkan' },
]

export const RECURRENCE_ITEMS: { value: EventRecurrence; label: string }[] = [
  { value: 'NONE', label: 'Sekali' },
  { value: 'WEEKLY', label: 'Mingguan' },
  { value: 'MONTHLY', label: 'Bulanan' },
]

export const ATTACHMENT_KIND_ITEMS: {
  value: AttachmentKind
  label: string
}[] = [
  { value: 'PROPOSAL', label: 'Proposal' },
  { value: 'NOTULEN', label: 'Notulen' },
  { value: 'LPJ', label: 'LPJ' },
  { value: 'FOTO', label: 'Foto' },
  { value: 'OTHER', label: 'Lainnya' },
]

export const ATTENDANCE_STATUS_LABELS: Record<
  AttendanceStatus,
  string
> = {
  HADIR: 'Hadir',
  IZIN: 'Izin',
  TIDAK: 'Tidak hadir',
}

export function dateTimeInput(value: string) {
  const parts = jakartaDateTimeFormatter.formatToParts(new Date(value))
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '00'
  const hour = get('hour') === '24' ? '00' : get('hour')
  return `${get('year')}-${get('month')}-${get('day')}T${hour}:${get('minute')}`
}

export function nowDateTimeInput() {
  return dateTimeInput(new Date().toISOString())
}

export function toIsoDateTime(value: string) {
  return new Date(`${value}:00+07:00`).toISOString()
}

export function todayDateInput() {
  return dateTimeInput(new Date().toISOString()).slice(0, 10)
}

export function toIsoDate(value: string) {
  return new Date(`${value}T00:00:00.000+07:00`).toISOString()
}

export function attachmentKindLabel(kind: AttachmentKind) {
  return (
    ATTACHMENT_KIND_ITEMS.find((item) => item.value === kind)?.label ?? kind
  )
}
