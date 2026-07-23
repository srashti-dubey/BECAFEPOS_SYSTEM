import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { initializeAuthSession, login, logout } from '@/auth/service'
import { useAuthStore } from '@/auth/store'
import { usePermissionStore } from '@/auth/permissionStore'
import type { LoginPayload, MenuPermissionAction } from '@/auth/types'

export function useAuth() {
  const auth = useAuthStore()

  return {
    ...auth,
    login: (payload: LoginPayload) => login(payload),
    logout: () => logout(),
    initialize: () => initializeAuthSession(),
  }
}

export function useRequireAuth() {
  const navigate = useNavigate()
  const auth = useAuthStore()

  useEffect(() => {
    if (!auth.isHydrated) {
      return
    }

    if (!auth.isAuthenticated) {
      navigate('/auth/login', { replace: true })
    }
  }, [auth.isAuthenticated, auth.isHydrated, navigate])

  return auth
}

// Checks GET /permissions/me's route-keyed action flags directly (see the note on
// MenuPermissionAction in auth/types.ts). Use this for pages gated by live backend-driven
// permissions.
export function useRoutePermissionGuard(route: string, action: MenuPermissionAction) {
  return usePermissionStore((state) => state.hasRoutePermission(route, action))
}

// Identity/display check only — see the note on RoleGuard in guards.tsx.
export function useRoleGuard(role: string) {
  const user = useAuthStore((state) => state.user)

  return user?.role === role
}
