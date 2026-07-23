import { setAuthHydrated, useAuthStore } from '@/auth/store'
import { initializeAuthSession } from '@/auth/session'

export async function bootstrapAuth() {
  useAuthStore.setState({ isLoading: true })

  try {
    await initializeAuthSession()
  } catch {
    useAuthStore.getState().clearAuth()
  } finally {
    setAuthHydrated()
  }
}
