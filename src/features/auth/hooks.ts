import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'

import { fetchAccess } from '@/features/auth/api'
import { useAuthStore } from '@/stores/auth'
import { useScopeStore } from '@/stores/scope'

export function useAccess() {
  const token = useAuthStore((state) => state.token)
  const setAccess = useAuthStore((state) => state.setAccess)
  const setBuildings = useScopeStore((state) => state.setBuildings)

  const query = useQuery({
    queryKey: ['access', token],
    queryFn: fetchAccess,
    enabled: Boolean(token),
  })

  useEffect(() => {
    if (!query.data) return
    setAccess(query.data)
    setBuildings(query.data.buildings)
  }, [query.data, setAccess, setBuildings])

  return query
}
