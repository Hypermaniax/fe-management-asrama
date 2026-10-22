import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  fetchLedger,
  recordLedgerIncome,
  reverseLedgerEntry,
  type LedgerIncomeInput,
  type LedgerQuery,
} from '@/features/ledger/api'

export function useLedger(query: LedgerQuery = {}, enabled = true) {
  return useQuery({
    queryKey: ['ledger', query],
    queryFn: () => fetchLedger(query),
    enabled,
  })
}

function useInvalidateLedger() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['ledger'] })
    queryClient.invalidateQueries({ queryKey: ['cash-accounts'] })
    queryClient.invalidateQueries({ queryKey: ['reports'] })
  }
}

export function useRecordLedgerIncome() {
  const invalidate = useInvalidateLedger()
  return useMutation({
    mutationFn: (input: LedgerIncomeInput) => recordLedgerIncome(input),
    onSuccess: invalidate,
  })
}

export function useReverseLedgerEntry() {
  const invalidate = useInvalidateLedger()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      reverseLedgerEntry(id, reason),
    onSuccess: invalidate,
  })
}
