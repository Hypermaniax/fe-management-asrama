import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createFeeRule,
  deleteFeeRule,
  fetchFeeRules,
  type FeeRuleInput,
} from '@/features/fee-rule/api'

export function useFeeRules(enabled = true) {
  return useQuery({
    queryKey: ['fee-rules'],
    queryFn: fetchFeeRules,
    enabled,
  })
}

function useInvalidateFeeRules() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['fee-rules'] })
}

export function useCreateFeeRule() {
  const invalidate = useInvalidateFeeRules()
  return useMutation({
    mutationFn: (input: FeeRuleInput) => createFeeRule(input),
    onSuccess: invalidate,
  })
}

export function useDeleteFeeRule() {
  const invalidate = useInvalidateFeeRules()
  return useMutation({
    mutationFn: (id: string) => deleteFeeRule(id),
    onSuccess: invalidate,
  })
}
