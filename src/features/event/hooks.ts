import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  addAttachment,
  addCommittee,
  addSession,
  changeEventStatus,
  createEvent,
  deleteAttachment,
  deleteCommittee,
  deleteEvent,
  deleteSession,
  fetchAttachments,
  fetchCommittees,
  fetchEvent,
  fetchEvents,
  fetchMyAttendance,
  fetchMyCommittees,
  fetchSessionAttendance,
  generateSessions,
  recordEventExpense,
  saveSessionAttendance,
  updateEvent,
  uploadEventAttachment,
  type AttendanceRecordInput,
  type AttachmentInput,
  type CommitteeInput,
  type EventExpenseInput,
  type EventInput,
  type EventQuery,
  type EventStatus,
  type EventUpdate,
  type SessionInput,
} from '@/features/event/api'

export function useEvents(params: EventQuery = {}) {
  return useQuery({
    queryKey: ['events', 'list', params],
    queryFn: () => fetchEvents(params),
  })
}

export function useEvent(id: string | undefined) {
  return useQuery({
    queryKey: ['events', 'detail', id ?? null],
    queryFn: () => fetchEvent(id as string),
    enabled: Boolean(id),
  })
}

export function useSessionAttendance(sessionId: string) {
  return useQuery({
    queryKey: ['events', 'attendance', sessionId],
    queryFn: () => fetchSessionAttendance(sessionId),
    enabled: Boolean(sessionId),
  })
}

export function useEventCommittees(eventId: string) {
  return useQuery({
    queryKey: ['events', 'committees', eventId],
    queryFn: () => fetchCommittees(eventId),
    enabled: Boolean(eventId),
  })
}

export function useEventAttachments(eventId: string) {
  return useQuery({
    queryKey: ['events', 'attachments', eventId],
    queryFn: () => fetchAttachments(eventId),
    enabled: Boolean(eventId),
  })
}

export function useMyCommittees() {
  return useQuery({
    queryKey: ['events', 'me', 'committees'],
    queryFn: fetchMyCommittees,
  })
}

export function useMyAttendance() {
  return useQuery({
    queryKey: ['events', 'me', 'attendance'],
    queryFn: fetchMyAttendance,
  })
}

function useInvalidateEvents() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['events'] })
    queryClient.invalidateQueries({ queryKey: ['reports'] })
  }
}

export function useCreateEvent() {
  const invalidate = useInvalidateEvents()
  return useMutation({
    mutationFn: (input: EventInput) => createEvent(input),
    onSuccess: invalidate,
  })
}

export function useUpdateEvent() {
  const invalidate = useInvalidateEvents()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: EventUpdate }) =>
      updateEvent(id, input),
    onSuccess: invalidate,
  })
}

export function useDeleteEvent() {
  const invalidate = useInvalidateEvents()
  return useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: invalidate,
  })
}

export function useChangeEventStatus() {
  const invalidate = useInvalidateEvents()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: EventStatus }) =>
      changeEventStatus(id, status),
    onSuccess: invalidate,
  })
}

export function useAddSession() {
  const invalidate = useInvalidateEvents()
  return useMutation({
    mutationFn: ({ eventId, input }: { eventId: string; input: SessionInput }) =>
      addSession(eventId, input),
    onSuccess: invalidate,
  })
}

export function useGenerateSessions() {
  const invalidate = useInvalidateEvents()
  return useMutation({
    mutationFn: ({ eventId, dates }: { eventId: string; dates: string[] }) =>
      generateSessions(eventId, dates),
    onSuccess: invalidate,
  })
}

export function useDeleteSession() {
  const invalidate = useInvalidateEvents()
  return useMutation({
    mutationFn: (sessionId: string) => deleteSession(sessionId),
    onSuccess: invalidate,
  })
}

export function useSaveAttendance() {
  const invalidate = useInvalidateEvents()
  return useMutation({
    mutationFn: ({
      sessionId,
      records,
    }: {
      sessionId: string
      records: AttendanceRecordInput[]
    }) => saveSessionAttendance(sessionId, records),
    onSuccess: invalidate,
  })
}

export function useAddCommittee() {
  const invalidate = useInvalidateEvents()
  return useMutation({
    mutationFn: ({
      eventId,
      input,
    }: {
      eventId: string
      input: CommitteeInput
    }) => addCommittee(eventId, input),
    onSuccess: invalidate,
  })
}

export function useDeleteCommittee() {
  const invalidate = useInvalidateEvents()
  return useMutation({
    mutationFn: (committeeId: string) => deleteCommittee(committeeId),
    onSuccess: invalidate,
  })
}

export function useRecordEventExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      eventId,
      input,
    }: {
      eventId: string
      input: EventExpenseInput
    }) => recordEventExpense(eventId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['cash-accounts'] })
      queryClient.invalidateQueries({ queryKey: ['ledger'] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export function useAddAttachment() {
  const invalidate = useInvalidateEvents()
  return useMutation({
    mutationFn: ({
      eventId,
      input,
    }: {
      eventId: string
      input: AttachmentInput
    }) => addAttachment(eventId, input),
    onSuccess: invalidate,
  })
}

export function useDeleteAttachment() {
  const invalidate = useInvalidateEvents()
  return useMutation({
    mutationFn: (attachmentId: string) => deleteAttachment(attachmentId),
    onSuccess: invalidate,
  })
}

export function useUploadEventAttachment() {
  return useMutation({
    mutationFn: (file: File) => uploadEventAttachment(file),
  })
}
