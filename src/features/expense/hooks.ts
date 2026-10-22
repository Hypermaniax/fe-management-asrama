import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createExpense,
  fetchExpense,
  fetchExpenses,
  uploadExpenseReceipt,
  type ExpenseInput,
} from '@/features/expense/api'

export function useExpenses() {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: fetchExpenses,
  })
}

export function useExpense(id: string | null) {
  return useQuery({
    queryKey: ['expense', id ?? null],
    queryFn: () => fetchExpense(id as string),
    enabled: Boolean(id),
  })
}

function useInvalidateExpenses() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['expenses'] })
    queryClient.invalidateQueries({ queryKey: ['expense'] })
    queryClient.invalidateQueries({ queryKey: ['cash-accounts'] })
    queryClient.invalidateQueries({ queryKey: ['ledger'] })
    queryClient.invalidateQueries({ queryKey: ['reports'] })
  }
}

export function useCreateExpense() {
  const invalidate = useInvalidateExpenses()
  return useMutation({
    mutationFn: (input: ExpenseInput) => createExpense(input),
    onSuccess: invalidate,
  })
}

export function useUploadExpenseReceipt() {
  return useMutation({
    mutationFn: (file: File) => uploadExpenseReceipt(file),
  })
}
