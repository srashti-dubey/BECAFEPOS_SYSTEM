import { useQuery } from '@tanstack/react-query'
import { roleService } from '@/features/roles/services/roleService'
import { rolesKeys } from '@/features/roles/hooks/rolesKeys'

export function useRoleQuery(id: string | undefined) {
  return useQuery({
    queryKey: rolesKeys.detail(id ?? ''),
    queryFn: () => roleService.getById(id as string),
    enabled: Boolean(id),
  })
}
