import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { userService } from '@/features/users/services/userService'
import { usersKeys } from '@/features/users/hooks/usersKeys'
import type { UsersListParams } from '@/features/users/types'

export function useUsersQuery(params: UsersListParams) {
  return useQuery({
    queryKey: usersKeys.list(params),
    queryFn: () => userService.list(params),
    placeholderData: keepPreviousData,
  })
}
