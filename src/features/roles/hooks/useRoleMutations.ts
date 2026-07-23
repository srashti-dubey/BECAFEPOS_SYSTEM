import { useMutation, useQueryClient } from '@tanstack/react-query'
import { roleService } from '@/features/roles/services/roleService'
import { rolesKeys } from '@/features/roles/hooks/rolesKeys'
import { notificationService } from '@/services/notificationService'
import type { CreateRoleInput, UpdateRoleInput, Role, RolesListResult } from '@/features/roles/types'

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function useCreateRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateRoleInput) => roleService.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: rolesKeys.lists() })
      notificationService.success('Role created successfully')
    },
    onError: (error) => {
      notificationService.error(errorMessage(error, 'Unable to create role'))
    },
  })
}

export function useUpdateRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateRoleInput) => roleService.update(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: rolesKeys.detail(input.id) })
      const previousRole = queryClient.getQueryData<Role>(rolesKeys.detail(input.id))

      if (previousRole) {
        queryClient.setQueryData<Role>(rolesKeys.detail(input.id), { ...previousRole, ...input })
      }

      queryClient.setQueriesData<RolesListResult>({ queryKey: rolesKeys.lists() }, (current) => {
        if (!current) {
          return current
        }
        return { ...current, data: current.data.map((record) => (record.id === input.id ? { ...record, ...input } : record)) }
      })

      return { previousRole }
    },
    onError: (error, input, context) => {
      if (context?.previousRole) {
        queryClient.setQueryData(rolesKeys.detail(input.id), context.previousRole)
      }
      void queryClient.invalidateQueries({ queryKey: rolesKeys.lists() })
      notificationService.error(errorMessage(error, 'Unable to update role'))
    },
    onSuccess: (updatedRole) => {
      queryClient.setQueryData(rolesKeys.detail(updatedRole.id), updatedRole)
      notificationService.success('Role updated successfully')
    },
    onSettled: (_data, _error, input) => {
      void queryClient.invalidateQueries({ queryKey: rolesKeys.detail(input.id) })
      void queryClient.invalidateQueries({ queryKey: rolesKeys.lists() })
    },
  })
}

export function useDeleteRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => roleService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: rolesKeys.lists() })
      notificationService.success('Role deleted successfully')
    },
    onError: (error) => {
      notificationService.error(errorMessage(error, 'Unable to delete role'))
    },
  })
}
