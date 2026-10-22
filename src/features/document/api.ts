import { apiFetch, type ApiEnvelope } from '@/lib/api'

export type DocumentType = {
  id: string
  buildingId: string
  code: string
  name: string
  isRequiredByDefault: boolean
  isActive: boolean
  allowedMimeTypes: string[]
  maxSizeBytes: number
  sortOrder: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type DocumentStatus =
  | 'REQUESTED'
  | 'UPLOADED'
  | 'VERIFIED'
  | 'REJECTED'

export type DocumentFile = {
  id: string
  storageKey: string
  originalName: string
  mimeType: string
  sizeBytes: number
  checksum: string
  uploadedById: string
  createdAt: string
  deletedAt: string | null
}

export type DocumentSubmission = {
  id: string
  userId: string
  documentTypeId: string
  status: DocumentStatus
  fileId: string | null
  requestedById: string | null
  reviewedById: string | null
  reviewedAt: string | null
  rejectionReason: string | null
  note: string | null
  version: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  documentType?: DocumentType
  file?: DocumentFile | null
}

export type RequiredDocument = {
  documentType: DocumentType
  submission: DocumentSubmission | null
}

export type DocumentTypeInput = {
  buildingId: string
  code: string
  name: string
  isRequiredByDefault?: boolean
  allowedMimeTypes: string[]
  maxSizeBytes: number
  sortOrder?: number
}

export function createDocumentType(input: DocumentTypeInput) {
  return apiFetch<ApiEnvelope<DocumentType>>('/documents/types', {
    method: 'POST',
    body: input,
  })
}

export async function fetchDocumentTypes(buildingId: string) {
  const res = await apiFetch<ApiEnvelope<DocumentType[]>>(
    `/documents/types?buildingId=${encodeURIComponent(buildingId)}`,
  )
  return res.data
}

export async function fetchRequiredDocuments() {
  const res = await apiFetch<ApiEnvelope<RequiredDocument[]>>(
    '/documents/required',
  )
  return res.data
}

export async function fetchDocuments(userId: string) {
  const res = await apiFetch<ApiEnvelope<DocumentSubmission[]>>(
    `/documents?userId=${encodeURIComponent(userId)}`,
  )
  return res.data
}

export function requestDocument(userId: string, documentTypeId: string) {
  return apiFetch<ApiEnvelope<DocumentSubmission>>('/documents/request', {
    method: 'POST',
    body: { userId, documentTypeId },
  })
}

export function uploadDocument(documentTypeId: string, file: File) {
  const body = new FormData()
  body.append('documentTypeId', documentTypeId)
  body.append('file', file)

  return apiFetch<ApiEnvelope<DocumentSubmission>>('/documents/upload', {
    method: 'POST',
    body,
  })
}

export function verifyDocument(id: string) {
  return apiFetch<ApiEnvelope<DocumentSubmission>>(
    `/documents/${id}/verify`,
    { method: 'POST' },
  )
}

export function rejectDocument(id: string, reason: string) {
  return apiFetch<ApiEnvelope<DocumentSubmission>>(
    `/documents/${id}/reject`,
    { method: 'POST', body: { reason } },
  )
}
