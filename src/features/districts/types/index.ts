import type { SortDirection, WithRecordApproval } from '@/types'

export type DistrictStatus = 'active' | 'inactive'

// extends WithRecordApproval: every module's list/get endpoints return maker-checker approval
// metadata on each record now (approval/record_approval_status) — see the module generator
// README's "Approvals" section.
export interface District extends WithRecordApproval {
  id: string
  district_name: string
  status: DistrictStatus
  created_at: string
  updated_at: string
}

// The Add/Edit form's actual fields come from the API at runtime (see DistrictFormModal.tsx)
// rather than from the fields collected at generation time, so the write-side payload shape
// isn't known here — it's whatever the fetched form schema produces.
export type CreateDistrictInput = Record<string, unknown>

export type UpdateDistrictInput = Record<string, unknown> & { id: string }

export type DistrictsSortField = 'district_name' | 'status' | 'created_at'

export interface DistrictsListParams {
  page: number
  pageSize: number
  search?: string
  status?: DistrictStatus
  sortBy?: DistrictsSortField
  sortDirection?: SortDirection
  /** The backend includes each row's `approval` by default — set false to skip that join for a faster query. */
  include_approval?: boolean
}

export interface DistrictsListResult {
  data: District[]
  total: number
  /** New-record creation requests awaiting approval — not yet real district records, so they're kept separate from `data` rather than mixed in with an incomplete id. */
  pendingCreates?: District[]
}
