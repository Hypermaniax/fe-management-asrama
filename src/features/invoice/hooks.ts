import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  fetchInvoice,
  fetchInvoices,
  fetchMyInvoice,
  fetchMyInvoices,
  generateInvoices,
  voidInvoice,
  type GenerateInvoiceInput,
  type InvoiceQuery,
  type MyInvoiceQuery,
} from '@/features/invoice/api'

export function useInvoices(query: InvoiceQuery, enabled = true) {
  return useQuery({
    queryKey: ['invoices', query],
    queryFn: () => fetchInvoices(query),
    enabled,
  })
}

export function useInvoice(id: string | null) {
  return useQuery({
    queryKey: ['invoice', id ?? null],
    queryFn: () => fetchInvoice(id as string),
    enabled: Boolean(id),
  })
}

export function useMyInvoices(query: MyInvoiceQuery) {
  return useQuery({
    queryKey: ['my-invoices', query],
    queryFn: () => fetchMyInvoices(query),
  })
}

export function useMyInvoice(id: string | null) {
  return useQuery({
    queryKey: ['my-invoice', id ?? null],
    queryFn: () => fetchMyInvoice(id as string),
    enabled: Boolean(id),
  })
}

function useInvalidateInvoices() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['invoices'] })
    queryClient.invalidateQueries({ queryKey: ['invoice'] })
    queryClient.invalidateQueries({ queryKey: ['my-invoices'] })
    queryClient.invalidateQueries({ queryKey: ['my-invoice'] })
    queryClient.invalidateQueries({ queryKey: ['reports'] })
  }
}

export function useGenerateInvoices() {
  const invalidate = useInvalidateInvoices()
  return useMutation({
    mutationFn: (input: GenerateInvoiceInput) => generateInvoices(input),
    onSuccess: invalidate,
  })
}

export function useVoidInvoice() {
  const invalidate = useInvalidateInvoices()
  return useMutation({
    mutationFn: (id: string) => voidInvoice(id),
    onSuccess: invalidate,
  })
}
