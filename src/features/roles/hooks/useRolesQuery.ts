import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { roleService } from '@/features/roles/services/roleService'
import { rolesKeys } from '@/features/roles/hooks/rolesKeys'
import type { RolesListParams } from '@/features/roles/types'

export function useRolesQuery(params: RolesListParams) {
  return useQuery({
    queryKey: rolesKeys.list(params),
    queryFn: () => roleService.list(params),
    placeholderData: keepPreviousData,
  })
}
