import type { MenuPermissionAction, MenuPermissionFlags } from '@/auth/types'
import type { PermissionMatrixRow } from '@/features/role-permissions/types'

export const PERMISSION_ACTIONS: MenuPermissionAction[] = ['view', 'add', 'edit', 'delete', 'export', 'status', 'approval']

const ALL_FALSE: MenuPermissionFlags = {
  view: false,
  add: false,
  edit: false,
  delete: false,
  export: false,
  status: false,
  approval: false,
}

const ALL_TRUE: MenuPermissionFlags = {
  view: true,
  add: true,
  edit: true,
  delete: true,
  export: true,
  status: true,
  approval: true,
}

// Unchecking `view` clears and disables every other action for that row — mirrors the PUT
// endpoint's documented "if view=false, all other permissions are disabled" rule client-side,
// so the UI doesn't look inconsistent before a save round-trips through it.
export function applyFlagChange(flags: MenuPermissionFlags, action: MenuPermissionAction, value: boolean): MenuPermissionFlags {
  if (action === 'view' && !value) {
    return { ...ALL_FALSE }
  }
  return { ...flags, [action]: value }
}

export function allFlagsTrue(flags: MenuPermissionFlags): boolean {
  return PERMISSION_ACTIONS.every((action) => flags[action])
}

export function toggleRow(selectAll: boolean): MenuPermissionFlags {
  return selectAll ? { ...ALL_TRUE } : { ...ALL_FALSE }
}

export function toggleAllRows(rows: PermissionMatrixRow[], selectAll: boolean): Record<number, MenuPermissionFlags> {
  const result: Record<number, MenuPermissionFlags> = {}
  rows.forEach((row) => {
    result[row.menu_id] = toggleRow(selectAll)
  })
  return result
}

export function countGrantedPermissions(rows: PermissionMatrixRow[]): number {
  return rows.reduce((total, row) => total + PERMISSION_ACTIONS.filter((action) => row.flags[action]).length, 0)
}
