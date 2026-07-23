import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/features/users/services/userService'
import { usersKeys } from '@/features/users/hooks/usersKeys'
import { notificationService } from '@/services/notificationService'
import type { CreateUserInput, UpdateUserInput, User, UsersListResult } from '@/features/users/types'

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateUserInput) => userService.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
      notificationService.success('User created successfully')
    },
    onError: (error) => {
      notificationService.error(errorMessage(error, 'Unable to create user'))
    },
  })
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateUserInput) => userService.update(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: usersKeys.detail(input.id) })
      const previousUser = queryClient.getQueryData<User>(usersKeys.detail(input.id))
      // input.role_id is the numeric id being submitted; User.role_id is the already-resolved
      // display string. There's no client-side lookup to resolve a number against, so role_id/
      // role_name are left untouched here and corrected by the onSettled refetch below.
      const { role_id: _roleId, ...optimisticFields } = input

      if (previousUser) {
        queryClient.setQueryData<User>(usersKeys.detail(input.id), { ...previousUser, ...optimisticFields })
      }

      queryClient.setQueriesData<UsersListResult>({ queryKey: usersKeys.lists() }, (current) => {
        if (!current) {
          return current
        }
        return {
          ...current,
          data: current.data.map((user) => (user.id === input.id ? { ...user, ...optimisticFields } : user)),
        }
      })

      return { previousUser }
    },
    onError: (error, input, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(usersKeys.detail(input.id), context.previousUser)
      }
      void queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
      notificationService.error(errorMessage(error, 'Unable to update user'))
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(usersKeys.detail(updatedUser.id), updatedUser)
      notificationService.success('User updated successfully')
    },
    onSettled: (_data, _error, input) => {
      void queryClient.invalidateQueries({ queryKey: usersKeys.detail(input.id) })
      void queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
    },
  })
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => userService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
      notificationService.success('User deleted successfully')
    },
    onError: (error) => {
      notificationService.error(errorMessage(error, 'Unable to delete user'))
    },
  })
}
