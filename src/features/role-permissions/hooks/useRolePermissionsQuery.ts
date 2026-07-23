import { useQuery } from '@tanstack/react-query'
import { rolePermissionService } from '@/features/role-permissions/services/rolePermissionService'
import { rolePermissionsKeys } from '@/features/role-permissions/hooks/rolePermissionsKeys'

export function useRolePermissionsQuery(roleId: number | undefined, search?: string) {
  return useQuery({
    queryKey: rolePermissionsKeys.forRole(roleId ?? 0, search),
    queryFn: () => rolePermissionService.getForRole(roleId as number, search),
    enabled: Boolean(roleId),
  })
}
