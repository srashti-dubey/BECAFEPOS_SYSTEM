import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/auth/store'
import { usePermissionStore } from '@/auth/permissionStore'
import type { MenuPermissionAction } from '@/auth/types'
import { Loader } from '@/components/shared/Loader'
import { ROUTES } from '@/constants/routes'

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const location = useLocation()

  if (!isHydrated) {
    return <Loader fullHeight />
  }

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to={ROUTES.login} state={{ from: `${location.pathname}${location.search}` }} replace />
  )
}

// Identity/display guard only (e.g. "show this Barista-only banner"). With personas that
// span maker/checker approval flows and store/region-scoped access, prefer RoutePermissionGuard
// for anything that gates a real action.
export function RoleGuard({ role, children }: { role: string; children: React.ReactNode }) {
  const userRole = useAuthStore((state) => state.user?.role)

  if (userRole !== role) {
    return <Navigate to={ROUTES.unauthorized} replace />
  }

  return <>{children}</>
}

// Checks GET /permissions/me's action flags directly (see the note on MenuPermissionAction
// in auth/types.ts).
export function RoutePermissionGuard({
  route,
  action,
  children,
}: {
  route: string
  action: MenuPermissionAction
  children: React.ReactNode
}) {
  const hasPermission = usePermissionStore((state) => state.hasRoutePermission(route, action))

  if (!hasPermission) {
    return <Navigate to={ROUTES.unauthorized} replace />
  }

  return <>{children}</>
}
