import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ScopeState = {
  buildings: string[]
  activeBuildingId: string | null
  setBuildings: (ids: string[]) => void
  setActiveBuilding: (id: string | null) => void
  reset: () => void
}

export const useScopeStore = create<ScopeState>()(
  persist(
    (set, get) => ({
      buildings: [],
      activeBuildingId: null,
      setBuildings: (ids) => {
        const current = get().activeBuildingId
        const next =
          current && ids.includes(current) ? current : (ids[0] ?? null)
        set({ buildings: ids, activeBuildingId: next })
      },
      setActiveBuilding: (id) => set({ activeBuildingId: id }),
      reset: () => set({ buildings: [], activeBuildingId: null }),
    }),
    { name: 'asrama-scope' },
  ),
)
