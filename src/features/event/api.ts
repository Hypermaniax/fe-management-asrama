import type { Building } from '@/features/building/api'
import type { DocumentFile } from '@/features/document/api'
import type { ExpenseInput } from '@/features/expense/api'
import { apiFetch, type ApiEnvelope } from '@/lib/api'

export type EventCategory = 'RUTIN' | 'BESAR'
export type EventScope = 'ASRAMA' | 'GEDUNG'
export type EventStatus = 'PLANNED' | 'ONGOING' | 'DONE' | 'CANCELLED'
export type EventRecurrence = 'NONE' | 'WEEKLY' | 'MONTHLY'
export type AttendanceStatus = 'HADIR' | 'IZIN' | 'TIDAK'
export type AttachmentKind = 'PROPOSAL' | 'NOTULEN' | 'LPJ' | 'FOTO' | 'OTHER'

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
  recurrence: EventRecurrence
  createdById: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  building?: Building | null
}

export type EventSession = {
  id: string
  eventId: string
  title: string | null
  scheduledAt: string
  startAt: string | null
  endAt: string | null
  location: string | null
  note: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type EventUser = {
  id: string
  email: string
  name: string | null
  phone: string | null
  buildingId: string | null
  status: string
}

export type EventCommittee = {
  id: string
  eventId: string
  userId: string
  eventRole: string
  positionId: string | null
  createdAt: string
  deletedAt: string | null
  user?: EventUser
  position?: {
    id: string
    code: string
    name: string
  } | null
  event?: Event
}

export type EventAttendance = {
  id: string
  sessionId: string
  userId: string
  status: AttendanceStatus
  checkedInAt: string | null
  note: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  user?: EventUser
  session?: EventSession & { event?: Event }
}

export type MyCommittee = EventCommittee & { event: Event }

export type MyAttendance = EventAttendance & {
  session: EventSession & { event: Event }
}

export type EventAttachment = {
  id: string
  eventId: string
  fileId: string
  kind: AttachmentKind
  note: string | null
  createdAt: string
  deletedAt: string | null
  file?: DocumentFile
}

export type AttendanceSummary = Record<AttendanceStatus, number>

export type EventDetail = Event & {
  sessions: EventSession[]
  committees: EventCommittee[]
  attachments: EventAttachment[]
  attendanceSummary: AttendanceSummary
}

export type EventInput = {
  title: string
  description?: string
  category?: EventCategory
  isAdHoc?: boolean
  scope?: EventScope
  buildingId?: string
  startAt: string
  endAt?: string
  location?: string
  budgetAmount?: number
  isPublic?: boolean
  recurrence?: EventRecurrence
}

export type EventUpdate = {
  title?: string
  description?: string | null
  category?: EventCategory
  isAdHoc?: boolean
  scope?: EventScope
  buildingId?: string | null
  startAt?: string
  endAt?: string | null
  location?: string | null
  budgetAmount?: number | null
  isPublic?: boolean
  recurrence?: EventRecurrence
}

export type EventQuery = {
  status?: EventStatus
  category?: EventCategory
}

export type SessionInput = {
  title?: string
  scheduledAt: string
  startAt?: string
  endAt?: string
  location?: string
  note?: string
}

export type CommitteeInput = {
  userId: string
  eventRole: string
  positionId?: string
}

export type AttendanceRecordInput = {
  userId: string
  status: AttendanceStatus
  checkedInAt?: string
  note?: string
}

export type AttachmentInput = {
  fileId: string
  kind: AttachmentKind
  note?: string
}

export type EventExpenseInput = ExpenseInput

function buildQuery(params: Record<string, string | undefined>) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (!value) continue
    query.set(key, value)
  }
  const qs = query.toString()
  return qs ? `?${qs}` : ''
}

export async function fetchEvents(params: EventQuery = {}) {
  const res = await apiFetch<ApiEnvelope<Event[]>>(
    `/events${buildQuery(params)}`,
  )
  return res.data
}

export async function fetchEvent(id: string) {
  const res = await apiFetch<ApiEnvelope<EventDetail>>(`/events/${id}`)
  return res.data
}

export function createEvent(input: EventInput) {
  return apiFetch<ApiEnvelope<Event>>('/events', {
    method: 'POST',
    body: input,
  })
}

export function updateEvent(id: string, input: EventUpdate) {
  return apiFetch<ApiEnvelope<Event>>(`/events/${id}`, {
    method: 'PATCH',
    body: input,
  })
}

export function deleteEvent(id: string) {
  return apiFetch<{ status: string }>(`/events/${id}`, { method: 'DELETE' })
}

export function changeEventStatus(id: string, status: EventStatus) {
  return apiFetch<ApiEnvelope<Event>>(`/events/${id}/status`, {
    method: 'POST',
    body: { status },
  })
}

export function addSession(eventId: string, input: SessionInput) {
  return apiFetch<ApiEnvelope<EventSession>>(`/events/${eventId}/sessions`, {
    method: 'POST',
    body: input,
  })
}

export function generateSessions(eventId: string, dates: string[]) {
  return apiFetch<ApiEnvelope<EventSession[]>>(
    `/events/${eventId}/sessions/generate`,
    { method: 'POST', body: { dates } },
  )
}

export function deleteSession(sessionId: string) {
  return apiFetch<{ status: string }>(`/events/sessions/${sessionId}`, {
    method: 'DELETE',
  })
}

export async function fetchSessionAttendance(sessionId: string) {
  const res = await apiFetch<ApiEnvelope<EventAttendance[]>>(
    `/events/sessions/${sessionId}/attendance`,
  )
  return res.data
}

export function saveSessionAttendance(
  sessionId: string,
  records: AttendanceRecordInput[],
) {
  return apiFetch<ApiEnvelope<EventAttendance[]>>(
    `/events/sessions/${sessionId}/attendance`,
    { method: 'PUT', body: { records } },
  )
}

export async function fetchCommittees(eventId: string) {
  const res = await apiFetch<ApiEnvelope<EventCommittee[]>>(
    `/events/${eventId}/committees`,
  )
  return res.data
}

export function addCommittee(eventId: string, input: CommitteeInput) {
  return apiFetch<ApiEnvelope<EventCommittee>>(
    `/events/${eventId}/committees`,
    { method: 'POST', body: input },
  )
}

export function deleteCommittee(committeeId: string) {
  return apiFetch<{ status: string }>(
    `/events/committees/${committeeId}`,
    { method: 'DELETE' },
  )
}

export function recordEventExpense(eventId: string, input: EventExpenseInput) {
  return apiFetch<ApiEnvelope<unknown>>(`/events/${eventId}/expenses`, {
    method: 'POST',
    body: input,
  })
}

export async function fetchAttachments(eventId: string) {
  const res = await apiFetch<ApiEnvelope<EventAttachment[]>>(
    `/events/${eventId}/attachments`,
  )
  return res.data
}

export function addAttachment(eventId: string, input: AttachmentInput) {
  return apiFetch<ApiEnvelope<EventAttachment>>(
    `/events/${eventId}/attachments`,
    { method: 'POST', body: input },
  )
}

export function deleteAttachment(attachmentId: string) {
  return apiFetch<{ status: string }>(
    `/events/attachments/${attachmentId}`,
    { method: 'DELETE' },
  )
}

export async function fetchMyCommittees() {
  const res = await apiFetch<ApiEnvelope<MyCommittee[]>>(
    '/events/me/committees',
  )
  return res.data
}

export async function fetchMyAttendance() {
  const res = await apiFetch<ApiEnvelope<MyAttendance[]>>(
    '/events/me/attendance',
  )
  return res.data
}

export function uploadEventAttachment(file: File) {
  const body = new FormData()
  body.append('file', file)
  return apiFetch<ApiEnvelope<{ id: string }>>('/me/payments/proof', {
    method: 'POST',
    body,
  })
}
