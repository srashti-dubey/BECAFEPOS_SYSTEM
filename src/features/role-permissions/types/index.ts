import type { MenuPermissionFlags } from '@/auth/types'

export interface MenuPermissionEntry {
  menu_id: number
  flags: MenuPermissionFlags
}

export interface RolePermissionsData {
  role_id: number
  permissions: MenuPermissionEntry[]
}

export interface UpdateRolePermissionsInput {
  role_id: number
  permissions: Array<{ menu_id: number } & Partial<MenuPermissionFlags>>
}

// One row of the matrix table: a menu joined with its current permission flags for the
// selected role (all-false if the role has no entry yet for that menu).
export interface PermissionMatrixRow {
  menu_id: number
  menu_name: string
  menu_route: string
  flags: MenuPermissionFlags
}
