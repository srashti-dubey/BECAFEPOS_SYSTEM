import { useQuery } from '@tanstack/react-query'
import { branchesApi } from '@/features/branches/api/branchesApi'

const branchesKeys = {
  activeList: () => ['branches', 'active-list'] as const,
}

export function useBranchesActiveListQuery() {
  return useQuery({
    queryKey: branchesKeys.activeList(),
    queryFn: () => branchesApi.activeList(),
  })
}
