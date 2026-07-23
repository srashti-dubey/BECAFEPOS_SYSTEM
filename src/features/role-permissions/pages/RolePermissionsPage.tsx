import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRoutePermissionGuard } from '@/auth/hooks'
import type { MenuPermissionFlags } from '@/auth/types'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'
import { ErrorState } from '@/components/shared/ErrorState'
import { Loader } from '@/components/shared/Loader'
import { PageHeader } from '@/components/shared/PageHeader'
import { ROUTES } from '@/constants/routes'
import { menuService } from '@/features/menus/services/menuService'
import type { Menu } from '@/features/menus/types'
import {
  PermissionsMatrixTable,
  PermissionsStatTiles,
  RoleSelect,
  countGrantedPermissions,
} from '@/features/role-permissions/components'
import { useExportRolePermissionsExcel, useRolePermissionsQuery, useUpdateRolePermissionsMutation } from '@/features/role-permissions/hooks'
import type { MenuPermissionEntry, PermissionMatrixRow } from '@/features/role-permissions/types'
import { extractNumericId } from '@/features/role-permissions/utils'
import type { Role } from '@/features/roles/types'
import styles from './RolePermissionsPage.module.css'

const EMPTY_FLAGS: MenuPermissionFlags = {
  view: false,
  add: false,
  edit: false,
  delete: false,
  export: false,
  status: false,
  approval: false,
}

function flagsByMenuId(permissions: MenuPermissionEntry[]) {
  const next: Record<number, MenuPermissionFlags> = {}
  permissions.forEach((entry) => {
    next[entry.menu_id] = entry.flags
  })
  return next
}

type RolePermissionsEditorProps = {
  roleId: number
  roleName: string
  menus: Menu[]
  initialPermissions: MenuPermissionEntry[]
  canEdit: boolean
  canExport: boolean
}

// Split out from the page so its local edit-overlay state can be lazily initialized straight
// from the query result — remounted (via `key={roleId}` on the page) whenever the selected role
// or its fetched data changes, instead of syncing query data into state through a useEffect.
function RolePermissionsEditor({ roleId, roleName, menus, initialPermissions, canEdit, canExport }: RolePermissionsEditorProps) {
  const [localFlags, setLocalFlags] = useState<Record<number, MenuPermissionFlags>>(() => flagsByMenuId(initialPermissions))

  const updateMutation = useUpdateRolePermissionsMutation()
  const exportMutation = useExportRolePermissionsExcel()

  const rows: PermissionMatrixRow[] = useMemo(
    () =>
      menus.map((menu) => {
        const menuId = extractNumericId(menu.id)
        return {
          menu_id: menuId,
          menu_name: menu.name,
          menu_route: menu.route,
          flags: localFlags[menuId] ?? EMPTY_FLAGS,
        }
      }),
    [menus, localFlags],
  )

  function handleChange(menuId: number, flags: MenuPermissionFlags) {
    setLocalFlags((current) => ({ ...current, [menuId]: flags }))
  }

  function handleChangeAll(updates: Record<number, MenuPermissionFlags>) {
    setLocalFlags((current) => ({ ...current, ...updates }))
  }

  function handleCancel() {
    setLocalFlags(flagsByMenuId(initialPermissions))
  }

  async function handleSave() {
    await updateMutation.mutateAsync({
      role_id: roleId,
      permissions: rows.map((row) => ({ menu_id: row.menu_id, ...row.flags })),
    })
  }

  function handleExport() {
    exportMutation.mutate({ roleId })
  }

  return (
    <>
      <Card>
        <PermissionsMatrixTable rows={rows} onChange={handleChange} onChangeAll={handleChangeAll} disabled={!canEdit} />

        <div className={styles.footer}>
          <Button variant="secondary" onClick={handleExport} disabled={!canExport} loading={exportMutation.isPending}>
            Export
          </Button>
          <Button variant="secondary" onClick={handleCancel} disabled={updateMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canEdit} loading={updateMutation.isPending}>
            Save Permissions
          </Button>
        </div>
      </Card>

      <PermissionsStatTiles totalMenus={rows.length} permissionsGranted={countGrantedPermissions(rows)} currentRole={roleName} />
    </>
  )
}

export default function RolePermissionsPage() {
  const [selectedRole, setSelectedRole] = useState<Role | undefined>(undefined)

  const canEdit = useRoutePermissionGuard(ROUTES.rolePermissions, 'edit')
  const canExport = useRoutePermissionGuard(ROUTES.rolePermissions, 'export')

  const roleId = selectedRole ? extractNumericId(selectedRole.id) : undefined

  // GET /permissions returns menu_id + flags only, no menu name/route — joined client-side
  // against the existing menus list rather than duplicating menu display data in this feature.
  const menusQuery = useQuery({
    queryKey: ['role-permissions', 'menus'],
    queryFn: () => menuService.list({ page: 1, pageSize: 1000 }),
  })
  const permissionsQuery = useRolePermissionsQuery(roleId)

  const isLoading = menusQuery.isLoading || permissionsQuery.isLoading
  const isError = menusQuery.isError || permissionsQuery.isError

  return (
    <div>
      <PageHeader title="RBAC Permissions" description="Manage permissions for different roles across menu modules." />

      <Card>
        <div className={styles.roleField}>
          <label className={styles.roleLabel} htmlFor="role-permissions-role-select">
            Select Role
          </label>
          <RoleSelect value={selectedRole ? String(selectedRole.id) : ''} onChange={(_roleId, role) => setSelectedRole(role)} />
        </div>
      </Card>

      {!selectedRole ? null : isLoading ? (
        <Loader />
      ) : isError ? (
        <ErrorState description="Unable to load permissions for this role." />
      ) : (
        <RolePermissionsEditor
          key={roleId}
          roleId={roleId as number}
          roleName={selectedRole.name}
          menus={menusQuery.data?.data ?? []}
          initialPermissions={permissionsQuery.data?.permissions ?? []}
          canEdit={canEdit}
          canExport={canExport}
        />
      )}
    </div>
  )
}
