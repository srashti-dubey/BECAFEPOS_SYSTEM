import { useQuery } from '@tanstack/react-query'
import { branchService } from '@/features/branches/services/branchService'
import { branchesKeys } from '@/features/branches/hooks/branchesKeys'
import type { BranchTreeItem, BranchesTreeListParams } from '@/features/branches/types'

export function useBranchesTreeQuery(params: BranchesTreeListParams) {
  return useQuery<BranchTreeItem[]>({
    queryKey: branchesKeys.treeList(params),
    queryFn: () => branchService.treeList(params),
  })
}
