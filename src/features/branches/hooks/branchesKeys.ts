import type { BranchesListParams, BranchesTreeListParams } from '@/features/branches/types'

export const branchesKeys = {
  all: ['branches'] as const,
  lists: () => [...branchesKeys.all, 'list'] as const,
  list: (params: BranchesListParams) => [...branchesKeys.lists(), params] as const,
  treeLists: () => [...branchesKeys.all, 'treeList'] as const,
  treeList: (params: BranchesTreeListParams) => [...branchesKeys.treeLists(), params] as const,
  details: () => [...branchesKeys.all, 'detail'] as const,
  detail: (id: string) => [...branchesKeys.details(), id] as const,
}
