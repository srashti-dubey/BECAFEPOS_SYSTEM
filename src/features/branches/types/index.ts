import type { SortDirection, WithRecordApproval } from '@/types'

export type BranchStatus = 'active' | 'inactive'

export interface Branch extends WithRecordApproval {
  id: string
  parent_id: string | null
  branch_name: string
  branch_code: string
  country: string
  state: string
  city: string
  locality: string
  address: string
  contact_no: string
  status: BranchStatus
  created_at: string
  updated_at: string
}

// Add/Edit uses the dynamic form engine (formId "branch-form") — its fields are fetched from
// the API at runtime, not known here, so these stay loose rather than mirroring `Branch`.
export type CreateBranchInput = Record<string, unknown>
export type UpdateBranchInput = Record<string, unknown> & { id: string }

export type BranchesSortField = 'branch_name' | 'branch_code' | 'address' | 'status' | 'created_at'

export interface BranchesListParams {
  page: number
  pageSize: number
  search?: string
  status?: BranchStatus
  sortBy?: BranchesSortField
  sortDirection?: SortDirection
}

export interface BranchesListResult {
  data: Branch[]
  total: number
}

// Node shape for the /branches/tree endpoint. `id` is numeric so it can be sent back
// directly in a user's branch_ids payload.
export interface BranchTreeItem {
  id: number
  name: string
  children?: BranchTreeItem[]
}

export interface BranchesTreeListParams {
  active_only: boolean
}
