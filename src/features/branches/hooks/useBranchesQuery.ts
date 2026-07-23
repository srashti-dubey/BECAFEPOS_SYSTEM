import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { branchService } from '@/features/branches/services/branchService'
import { branchesKeys } from '@/features/branches/hooks/branchesKeys'
import type { BranchesListParams } from '@/features/branches/types'

export function useBranchesQuery(params: BranchesListParams) {
  return useQuery({
    queryKey: branchesKeys.list(params),
    queryFn: () => branchService.list(params),
    placeholderData: keepPreviousData,
  })
}
