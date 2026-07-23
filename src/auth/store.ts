import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { AuthState, AuthTokens, AuthUser } from '@/auth/types'

interface AuthStore extends AuthState {
  setAuth: (payload: Partial<AuthState>) => void
  setUser: (user: AuthUser | null) => void
  setTokens: (tokens: AuthTokens) => void
  setLoading: (loading: boolean) => void
  clearAuth: () => void
}

const initialState: AuthState = {
  user: null,
  access_token: null,
  refresh_token: null,
  expires_at: null,
  isAuthenticated: false,
  isHydrated: false,
  isLoading: false,
}

// Only the raw tokens persist (to sessionStorage — cleared when the tab/browser closes, unlike
// localStorage). There's no httpOnly cookie backing this flow anymore, so the refresh token is
// what lets a page reload silently restore a session instead of forcing a fresh login.
//
// user/isAuthenticated/isHydrated are deliberately NOT persisted: they're always re-derived
// fresh via initializeAuthSession() on every load (which itself relies on the persisted
// access_token/refresh_token, transparently refreshing through the apiClient interceptor
// if the access token has expired). That's what avoids a stale "authenticated" flash rendering
// before the real check completes — see ProtectedRoute's isHydrated gate.
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,
      setAuth: (payload) => set((state) => ({ ...state, ...payload })),
      setUser: (user) => set({ user }),
      setTokens: (tokens) => set(tokens),
      setLoading: (isLoading) => set({ isLoading }),
      clearAuth: () => set({ ...initialState, isHydrated: true }),
    }),
    {
      name: 'auth-tokens',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        access_token: state.access_token,
        refresh_token: state.refresh_token,
        expires_at: state.expires_at,
      }),
    },
  ),
)

export function setAuthHydrated() {
  useAuthStore.setState({ isHydrated: true })
}
