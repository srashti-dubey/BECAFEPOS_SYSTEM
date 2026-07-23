import { useMutation, useQueryClient } from '@tanstack/react-query'
import { rolePermissionService } from '@/features/role-permissions/services/rolePermissionService'
import { rolePermissionsKeys } from '@/features/role-permissions/hooks/rolePermissionsKeys'
import { notificationService } from '@/services/notificationService'
import type { UpdateRolePermissionsInput } from '@/features/role-permissions/types'

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function useUpdateRolePermissionsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateRolePermissionsInput) => rolePermissionService.update(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: rolePermissionsKeys.all })
      notificationService.success('Permissions saved successfully')
    },
    onError: (error) => {
      notificationService.error(errorMessage(error, 'Unable to save permissions'))
    },
  })
}
