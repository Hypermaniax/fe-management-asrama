import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  checkoutOccupancy,
  createOccupancy,
  fetchOccupancies,
  type OccupancyInput,
} from '@/features/occupancy/api'

export function useOccupancies(enabled = true) {
  return useQuery({
    queryKey: ['occupancies'],
    queryFn: fetchOccupancies,
    enabled,
  })
}

function useInvalidateOccupancies() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['occupancies'] })
    queryClient.invalidateQueries({ queryKey: ['residents'] })
    queryClient.invalidateQueries({ queryKey: ['resident'] })
    queryClient.invalidateQueries({ queryKey: ['rooms'] })
    queryClient.invalidateQueries({ queryKey: ['public-facility-assignments'] })
  }
}

export function useCreateOccupancy() {
  const invalidate = useInvalidateOccupancies()
  return useMutation({
    mutationFn: (input: OccupancyInput) => createOccupancy(input),
    onSuccess: invalidate,
  })
}

export function useCheckoutOccupancy() {
  const invalidate = useInvalidateOccupancies()
  return useMutation({
    mutationFn: (id: string) => checkoutOccupancy(id),
    onSuccess: invalidate,
  })
}
