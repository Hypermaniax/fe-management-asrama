import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  createCashAccount,
  deleteCashAccount,
  fetchCashAccountBalance,
  fetchCashAccountLedger,
  fetchCashAccounts,
  updateCashAccount,
  type CashAccountBalance,
  type CashAccountInput,
  type CashAccountUpdate,
} from '@/features/cash-account/api'

export function useCashAccounts(enabled = true) {
  return useQuery({
    queryKey: ['cash-accounts'],
    queryFn: fetchCashAccounts,
    enabled,
  })
}

export function useCashAccountBalances(accountIds: string[]) {
  return useQueries({
    queries: accountIds.map((id) => ({
      queryKey: ['cash-accounts', id, 'balance'],
      queryFn: () => fetchCashAccountBalance(id),
    })),
    combine: (results) => {
      const balances = new Map<string, CashAccountBalance>()
      results.forEach((result, index) => {
        if (result.data) balances.set(accountIds[index], result.data)
      })
      return {
        balances,
        loading: results.some((result) => result.isPending),
      }
    },
  })
}

export function useCashAccountLedger(id: string | null) {
  return useQuery({
    queryKey: ['cash-accounts', id, 'ledger'],
    queryFn: () => fetchCashAccountLedger(id as string),
    enabled: Boolean(id),
  })
}

function useInvalidateCashAccounts() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['cash-accounts'] })
    queryClient.invalidateQueries({ queryKey: ['reports'] })
  }
}

export function useCreateCashAccount() {
  const invalidate = useInvalidateCashAccounts()
  return useMutation({
    mutationFn: (input: CashAccountInput) => createCashAccount(input),
    onSuccess: invalidate,
  })
}

export function useUpdateCashAccount() {
  const invalidate = useInvalidateCashAccounts()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CashAccountUpdate }) =>
      updateCashAccount(id, input),
    onSuccess: invalidate,
  })
}

export function useDeleteCashAccount() {
  const invalidate = useInvalidateCashAccounts()
  return useMutation({
    mutationFn: (id: string) => deleteCashAccount(id),
    onSuccess: invalidate,
  })
}
