import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { Access, AuthUser, MenuNode } from '@/features/auth/api'
import { setAuthToken, setUnauthorizedHandler } from '@/lib/api'

type AuthState = {
  user: AuthUser | null
  token: string | null
  roles: string[]
  permissions: string[]
  buildings: string[]
  isSuperAdmin: boolean
  menus: MenuNode[]
  setSession: (session: { user: AuthUser; token: string }) => void
  setAccess: (access: Access) => void
  clear: () => void
}

const initialState = {
  user: null,
  token: null,
  roles: [],
  permissions: [],
  buildings: [],
  isSuperAdmin: false,
  menus: [],
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,
      setSession: ({ user, token }) => {
        setAuthToken(token)
        set({ user, token })
      },
      setAccess: (access) =>
        set({
          roles: access.roles,
          permissions: access.permissions,
          buildings: access.buildings,
          isSuperAdmin: access.isSuperAdmin,
          menus: access.menus,
        }),
      clear: () => {
        setAuthToken(null)
        set({ ...initialState })
      },
    }),
    {
      name: 'asrama-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        roles: state.roles,
        permissions: state.permissions,
        buildings: state.buildings,
        isSuperAdmin: state.isSuperAdmin,
        menus: state.menus,
      }),
      onRehydrateStorage: () => (state) => {
        setAuthToken(state?.token ?? null)
      },
    },
  ),
)

setUnauthorizedHandler(() => {
  useAuthStore.getState().clear()
  if (window.location.pathname !== '/login') {
    window.location.assign('/login')
  }
})
