import { create } from 'zustand'
import type { MenuPermissionAction, MenuPermissionFlags } from '@/auth/types'

interface PermissionStore {
  // GET /permissions/me's actual shape — action flags keyed by menu route, plus a super-admin
  // bypass.
  routePermissions: Record<string, MenuPermissionFlags>
  isSuperAdmin: boolean
  setRoutePermissions: (routePermissions: Record<string, MenuPermissionFlags>, isSuperAdmin: boolean) => void
  // Merges a single route's flags in rather than replacing the whole map — used to keep
  // routePermissions fresh from the per-request `permissions` block listing APIs return,
  // without wiping out what GET /permissions/me already populated for other routes.
  setRoutePermission: (menu: string, flags: MenuPermissionFlags) => void
  hasRoutePermission: (route: string, action: MenuPermissionAction) => boolean
  clear: () => void
}

export const usePermissionStore = create<PermissionStore>((set, get) => ({
  routePermissions: {},
  isSuperAdmin: false,
  setRoutePermissions: (routePermissions, isSuperAdmin) => set({ routePermissions, isSuperAdmin }),
  setRoutePermission: (menu, flags) =>
    set((state) => ({ routePermissions: { ...state.routePermissions, [menu]: flags } })),
  hasRoutePermission: (route, action) => get().isSuperAdmin || Boolean(get().routePermissions[route]?.[action]),
  clear: () => set({ routePermissions: {}, isSuperAdmin: false }),
}))
