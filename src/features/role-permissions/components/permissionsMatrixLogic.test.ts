import { describe, expect, it } from 'vitest'
import type { MenuPermissionFlags } from '@/auth/types'
import type { PermissionMatrixRow } from '@/features/role-permissions/types'
import { allFlagsTrue, applyFlagChange, countGrantedPermissions, toggleAllRows, toggleRow } from './permissionsMatrixLogic'

const FALSE_FLAGS: MenuPermissionFlags = {
  view: false,
  add: false,
  edit: false,
  delete: false,
  export: false,
  status: false,
  approval: false,
}

const TRUE_FLAGS: MenuPermissionFlags = {
  view: true,
  add: true,
  edit: true,
  delete: true,
  export: true,
  status: true,
  approval: true,
}

describe('applyFlagChange', () => {
  it('sets a single flag unrelated to view', () => {
    const result = applyFlagChange(FALSE_FLAGS, 'edit', true)
    expect(result.edit).toBe(true)
    expect(result.view).toBe(false)
  })

  it('clears every flag when view is unchecked, mirroring the backend business rule', () => {
    const result = applyFlagChange({ ...TRUE_FLAGS }, 'view', false)
    expect(result).toEqual(FALSE_FLAGS)
  })

  it('checking view alone does not grant any other action', () => {
    const result = applyFlagChange(FALSE_FLAGS, 'view', true)
    expect(result.view).toBe(true)
    expect(result.edit).toBe(false)
    expect(result.delete).toBe(false)
  })
})

describe('allFlagsTrue', () => {
  it('is true only when every action is granted', () => {
    expect(allFlagsTrue(TRUE_FLAGS)).toBe(true)
    expect(allFlagsTrue({ ...TRUE_FLAGS, approval: false })).toBe(false)
    expect(allFlagsTrue(FALSE_FLAGS)).toBe(false)
  })
})

describe('toggleRow', () => {
  it('grants every action when selecting all', () => {
    expect(toggleRow(true)).toEqual(TRUE_FLAGS)
  })

  it('clears every action when deselecting', () => {
    expect(toggleRow(false)).toEqual(FALSE_FLAGS)
  })
})

describe('toggleAllRows', () => {
  it('applies the same selection to every row regardless of its current state', () => {
    const rows: PermissionMatrixRow[] = [
      { menu_id: 1, menu_name: 'A', menu_route: '/a', flags: FALSE_FLAGS },
      { menu_id: 2, menu_name: 'B', menu_route: '/b', flags: TRUE_FLAGS },
    ]

    const result = toggleAllRows(rows, true)
    expect(result[1]).toEqual(TRUE_FLAGS)
    expect(result[2]).toEqual(TRUE_FLAGS)
  })
})

describe('countGrantedPermissions', () => {
  it('sums true flags across all rows', () => {
    const rows: PermissionMatrixRow[] = [
      { menu_id: 1, menu_name: 'A', menu_route: '/a', flags: FALSE_FLAGS },
      { menu_id: 2, menu_name: 'B', menu_route: '/b', flags: { ...FALSE_FLAGS, view: true, edit: true } },
    ]

    expect(countGrantedPermissions(rows)).toBe(2)
  })
})
