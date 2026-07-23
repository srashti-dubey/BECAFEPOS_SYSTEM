import { useQuery } from '@tanstack/react-query'
import { branchService } from '@/features/branches/services/branchService'
import { branchesKeys } from '@/features/branches/hooks/branchesKeys'

export function useBranchQuery(id: string | undefined) {
  return useQuery({
    queryKey: branchesKeys.detail(id ?? ''),
    queryFn: () => branchService.getById(id as string),
    enabled: Boolean(id),
  })
}
