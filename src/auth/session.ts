import { authService } from '@/auth/authService'
import { decodeAccessToken } from '@/auth/jwt'
import { useAuthStore } from '@/auth/store'
import { usePermissionStore } from '@/auth/permissionStore'
import type { AuthTokens, AuthUser, LoginPayload } from '@/auth/types'

function applyTokens(tokens: AuthTokens) {
  useAuthStore.getState().setTokens(tokens)
}

// The backend has no /profile endpoint — the login/refresh response's access_token is a JWT
// carrying the signed-in user's identity, so the profile is read from its claims directly
// instead of a separate network round-trip.
function applyProfileFromToken(accessToken: string) {
  const claims = decodeAccessToken(accessToken)
  const user: AuthUser = {
    id: String(claims.userId),
    email: claims.email,
    // The token has no display-name claim — fall back to the email's local part.
    name: claims.email.split('@')[0],
    role: claims.role,
  }
  useAuthStore.getState().setUser(user)
  return user
}

export async function login(payload: LoginPayload) {
  useAuthStore.getState().setLoading(true)

  try {
    const tokens = await authService.login(payload)
    applyTokens(tokens)
    applyProfileFromToken(tokens.access_token)
    await getMyMenuPermissions()
    useAuthStore.getState().setAuth({ isAuthenticated: true, isLoading: false })
    return tokens
  } catch (error) {
    useAuthStore.getState().setLoading(false)
    throw error
  }
}

export async function refreshSession() {
  const refreshToken = useAuthStore.getState().refresh_token

  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  const tokens = await authService.refresh(refreshToken)
  applyTokens(tokens)
  applyProfileFromToken(tokens.access_token)
  return tokens
}

export async function getMyMenuPermissions() {
  const { is_super_admin, routePermissions } = await authService.getMyMenuPermissions()
  usePermissionStore.getState().setRoutePermissions(routePermissions, is_super_admin)
  return { is_super_admin, routePermissions }
}

export async function logout() {
  try {
    await authService.logout()
  } finally {
    useAuthStore.getState().clearAuth()
    usePermissionStore.getState().clear()
  }
}

// Called on every app load. Relies on the persisted access_token/refresh_token (sessionStorage).
// The profile is decoded locally from the persisted access_token — if it has expired, decoding
// still succeeds (claims are still readable), and the getMyMenuPermissions() call right after
// transparently refreshes-and-retries via the apiClient interceptor using the persisted refresh
// token, so this doesn't need to explicitly call refreshSession() itself first.
export async function initializeAuthSession() {
  const { access_token, refresh_token } = useAuthStore.getState()

  if (!access_token || !refresh_token) {
    throw new Error('No session to restore')
  }

  try {
    applyProfileFromToken(access_token)
    await getMyMenuPermissions()
    useAuthStore.getState().setAuth({ isAuthenticated: true, isLoading: false })
  } catch (error) {
    useAuthStore.getState().clearAuth()
    usePermissionStore.getState().clear()
    throw error
  }
}
