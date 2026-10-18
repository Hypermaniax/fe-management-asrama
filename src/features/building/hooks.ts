import { useQuery } from '@tanstack/react-query'

import { fetchBuildings } from '@/features/building/api'

export function useBuildings(enabled = true) {
  return useQuery({
    queryKey: ['buildings'],
    queryFn: fetchBuildings,
    enabled,
  })
}
