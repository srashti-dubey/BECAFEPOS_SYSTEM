import { branchesApi } from '@/features/branches/api/branchesApi'
import type {
  CreateBranchInput,
  UpdateBranchInput,
  BranchesListParams,
  BranchesTreeListParams,
} from '@/features/branches/types'

export const branchService = {
  list: (params: BranchesListParams) => branchesApi.list(params),
  treeList: (params: BranchesTreeListParams) => branchesApi.treeList(params),
  getById: (id: string) => branchesApi.getById(id),
  create: (input: CreateBranchInput) => branchesApi.create(input),
  update: (input: UpdateBranchInput) => branchesApi.update(input),
  remove: (id: string) => branchesApi.remove(id),
  approve: (requestId: number | string, comment?: string) => branchesApi.approve(requestId, comment),
  reject: (requestId: number | string, comment?: string) => branchesApi.reject(requestId, comment),
}
