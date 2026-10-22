import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createMyPaymentSubmission,
  createPayment,
  fetchMyPaymentSubmissions,
  fetchPayment,
  fetchPayments,
  fetchPaymentSubmissions,
  rejectPaymentSubmission,
  uploadPaymentProof,
  verifyPaymentSubmission,
  type MyPaymentSubmissionInput,
  type PaymentInput,
  type PaymentQuery,
  type PaymentSubmissionQuery,
} from '@/features/payment/api'

export function usePayments(query: PaymentQuery = {}, enabled = true) {
  return useQuery({
    queryKey: ['payments', query],
    queryFn: () => fetchPayments(query),
    enabled,
  })
}

export function usePayment(id: string | null) {
  return useQuery({
    queryKey: ['payment', id ?? null],
    queryFn: () => fetchPayment(id as string),
    enabled: Boolean(id),
  })
}

export function usePaymentSubmissions(
  query: PaymentSubmissionQuery = {},
  enabled = true,
) {
  return useQuery({
    queryKey: ['payment-submissions', query],
    queryFn: () => fetchPaymentSubmissions(query),
    enabled,
  })
}

function useInvalidatePayments() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['payments'] })
    queryClient.invalidateQueries({ queryKey: ['payment'] })
    queryClient.invalidateQueries({ queryKey: ['payment-submissions'] })
    queryClient.invalidateQueries({ queryKey: ['invoices'] })
    queryClient.invalidateQueries({ queryKey: ['invoice'] })
    queryClient.invalidateQueries({ queryKey: ['my-invoices'] })
    queryClient.invalidateQueries({ queryKey: ['my-invoice'] })
    queryClient.invalidateQueries({ queryKey: ['cash-accounts'] })
    queryClient.invalidateQueries({ queryKey: ['reports'] })
  }
}

export function useCreatePayment() {
  const invalidate = useInvalidatePayments()
  return useMutation({
    mutationFn: (input: PaymentInput) => createPayment(input),
    onSuccess: invalidate,
  })
}

export function useUploadPaymentProof() {
  return useMutation({
    mutationFn: (file: File) => uploadPaymentProof(file),
  })
}

export function useVerifyPaymentSubmission() {
  const invalidate = useInvalidatePayments()
  return useMutation({
    mutationFn: ({
      id,
      cashAccountId,
    }: {
      id: string
      cashAccountId?: string
    }) => verifyPaymentSubmission(id, { cashAccountId }),
    onSuccess: invalidate,
  })
}

export function useRejectPaymentSubmission() {
  const invalidate = useInvalidatePayments()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectPaymentSubmission(id, reason),
    onSuccess: invalidate,
  })
}

export function useMyPaymentSubmissions(
  query: Pick<PaymentSubmissionQuery, 'status'> = {},
  enabled = true,
) {
  return useQuery({
    queryKey: ['my-payment-submissions', query],
    queryFn: () => fetchMyPaymentSubmissions(query),
    enabled,
  })
}

export function useCreateMyPaymentSubmission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: MyPaymentSubmissionInput) =>
      createMyPaymentSubmission(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-payment-submissions'] })
      queryClient.invalidateQueries({ queryKey: ['my-invoices'] })
      queryClient.invalidateQueries({ queryKey: ['my-invoice'] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoice'] })
      queryClient.invalidateQueries({ queryKey: ['payment-submissions'] })
    },
  })
}
