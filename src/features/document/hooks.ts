import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createDocumentType,
  fetchDocumentTypes,
  fetchDocuments,
  fetchRequiredDocuments,
  rejectDocument,
  requestDocument,
  uploadDocument,
  verifyDocument,
  type DocumentTypeInput,
} from '@/features/document/api'

export function useDocumentTypes(
  buildingId: string | null | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: ['document-types', buildingId ?? null],
    queryFn: () => fetchDocumentTypes(buildingId as string),
    enabled: enabled && Boolean(buildingId),
  })
}

export function useRequiredDocuments(enabled = true) {
  return useQuery({
    queryKey: ['required-documents'],
    queryFn: fetchRequiredDocuments,
    enabled,
  })
}

export function useDocuments(userId: string | null | undefined) {
  return useQuery({
    queryKey: ['documents', userId ?? null],
    queryFn: () => fetchDocuments(userId as string),
    enabled: Boolean(userId),
  })
}

function useInvalidateDocuments() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['documents'] })
    queryClient.invalidateQueries({ queryKey: ['required-documents'] })
    queryClient.invalidateQueries({ queryKey: ['document-types'] })
  }
}

export function useCreateDocumentType() {
  const invalidate = useInvalidateDocuments()
  return useMutation({
    mutationFn: (input: DocumentTypeInput) => createDocumentType(input),
    onSuccess: invalidate,
  })
}

export function useRequestDocument() {
  const invalidate = useInvalidateDocuments()
  return useMutation({
    mutationFn: ({
      userId,
      documentTypeId,
    }: {
      userId: string
      documentTypeId: string
    }) => requestDocument(userId, documentTypeId),
    onSuccess: invalidate,
  })
}

export function useUploadDocument() {
  const invalidate = useInvalidateDocuments()
  return useMutation({
    mutationFn: ({
      documentTypeId,
      file,
    }: {
      documentTypeId: string
      file: File
    }) => uploadDocument(documentTypeId, file),
    onSuccess: invalidate,
  })
}

export function useVerifyDocument() {
  const invalidate = useInvalidateDocuments()
  return useMutation({
    mutationFn: (id: string) => verifyDocument(id),
    onSuccess: invalidate,
  })
}

export function useRejectDocument() {
  const invalidate = useInvalidateDocuments()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectDocument(id, reason),
    onSuccess: invalidate,
  })
}
