import { rolePermissionsApi } from '@/features/role-permissions/api/rolePermissionsApi'
import type { UpdateRolePermissionsInput } from '@/features/role-permissions/types'

export const rolePermissionService = {
  getForRole: (roleId: number, search?: string) => rolePermissionsApi.getForRole(roleId, search),
  update: (input: UpdateRolePermissionsInput) => rolePermissionsApi.update(input),
  exportExcel: (roleId: number, search?: string) => rolePermissionsApi.exportExcel(roleId, search),
}
