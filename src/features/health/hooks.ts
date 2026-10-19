import { useQuery } from '@tanstack/react-query'

import { fetchHealth } from '@/features/health/api'

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    refetchInterval: 30_000,
    retry: false,
    staleTime: 15_000,
  })
}
