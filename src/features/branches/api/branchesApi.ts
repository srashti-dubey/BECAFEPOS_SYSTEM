import { BaseService } from '@/services/baseService'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import { toBackendListQuery } from '@/lib/api/listQuery'
import type {
  CreateBranchInput,
  UpdateBranchInput,
  Branch,
  BranchesListParams,
  BranchesListResult,
  BranchTreeItem,
  BranchesTreeListParams,
} from '@/features/branches/types'

// The backend tree can arrive with `branch_name` or a bare `name`, and ids as numbers or
// strings — normalize both so the UI always deals with { id: number, name, children }.
interface BackendBranchTreeNode {
  id: number | string
  branch_name?: string
  name?: string
  children?: BackendBranchTreeNode[]
}

function toBranchTreeItem(node: BackendBranchTreeNode): BranchTreeItem {
  return {
    id: Number(node.id),
    name: node.branch_name ?? node.name ?? String(node.id),
    children: node.children?.map(toBranchTreeItem) ?? [],
  }
}

class BranchesApi extends BaseService {
  list(params: BranchesListParams) {
    const { page, pageSize, search, sortBy, sortDirection, ...extra } = params
    return this.get<BranchesListResult>(API_ENDPOINTS.branches, {
      params: toBackendListQuery({ page, pageSize, search, sortBy, sortDirection }, extra),
    })
  }

  async treeList(params: BranchesTreeListParams) {
    const raw = await this.get<BackendBranchTreeNode[]>(API_ENDPOINTS.branchesTree, { params })
    return raw.map(toBranchTreeItem)
  }

  getById(id: string) {
    return this.get<Branch>(API_ENDPOINTS.branch(id))
  }

  create(input: CreateBranchInput) {
    return this.post<Branch>(API_ENDPOINTS.branches, input)
  }

  update(input: UpdateBranchInput) {
    const { id, ...rest } = input
    return this.put<Branch>(API_ENDPOINTS.branch(id), rest)
  }

  remove(id: string) {
    return this.delete<void>(API_ENDPOINTS.branch(id))
  }

  // The body must always be a real object, not omitted — BaseService only encrypts into
  // request_data when a body is actually passed (see apiClient.ts's encryptRequestConfig), and
  // the backend expects request_data on this endpoint regardless. `comment` defaults to a fixed
  // string rather than being left empty for the same reason.
  approve(requestId: number | string, comment?: string) {
    return this.post<void>(API_ENDPOINTS.branchesApprovalApprove(requestId), {
      comment: comment?.trim() || 'Approved',
    })
  }

  // Wire field is `reason`, not `comment` — matches this endpoint's documented request body,
  // distinct from approve()'s `comment` above.
  reject(requestId: number | string, comment?: string) {
    return this.post<void>(API_ENDPOINTS.branchesApprovalReject(requestId), {
      reason: comment?.trim() || undefined,
    })
  }
}

export const branchesApi = new BranchesApi()
