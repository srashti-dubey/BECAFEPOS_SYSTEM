import { useQuery } from '@tanstack/react-query'
import { userService } from '@/features/users/services/userService'
import { usersKeys } from '@/features/users/hooks/usersKeys'

export function useUserQuery(id: string | undefined) {
  return useQuery({
    queryKey: usersKeys.detail(id ?? ''),
    queryFn: () => userService.getById(id as string),
    enabled: Boolean(id),
  })
}
