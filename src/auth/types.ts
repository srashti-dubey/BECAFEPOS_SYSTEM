export interface AuthUser {
  id: string
  email: string
  name: string
  // The backend has no fixed role enum for the signed-in user either — this is whatever
  // string the access token's `role` claim carries (e.g. "super_admin").
  role: string
}

// This is the shape GET /permissions/me actually returns — action flags keyed by menu route
// (e.g. '/app/menus'), not an opaque string key. See usePermissionStore's routePermissions.
export type MenuPermissionAction = 'view' | 'add' | 'edit' | 'delete' | 'export' | 'status' | 'approval'

export type MenuPermissionFlags = Record<MenuPermissionAction, boolean>

export interface MyMenuPermissions {
  role: string
  is_super_admin: boolean
  routePermissions: Record<string, MenuPermissionFlags>
}

// The action-flag block most listing endpoints attach to their response envelope for the menu
// just hit (see unwrapEncryptedResponse) — same shape as MyMenuPermissions.routePermissions'
// values, keyed by `menu` instead of being pre-grouped into a map.
export interface ResponsePermissions extends MenuPermissionFlags {
  menu: string
}

export interface AuthState {
  user: AuthUser | null
  access_token: string | null
  refresh_token: string | null
  expires_at: number | null
  isAuthenticated: boolean
  isHydrated: boolean
  isLoading: boolean
}

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_at: number
}
