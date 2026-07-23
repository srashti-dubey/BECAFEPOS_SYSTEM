import type { SortDirection, WithRecordApproval } from '@/types'

export type CityStatus = 'active' | 'inactive'

// extends WithRecordApproval: every module's list/get endpoints return maker-checker approval
// metadata on each record now (approval/record_approval_status) — see the module generator
// README's "Approvals" section.
export interface City extends WithRecordApproval {
  id: string
  name: string
  status: CityStatus
  created_at: string
  updated_at: string
}

// The Add/Edit form's actual fields come from the API at runtime (see CityFormModal.tsx)
// rather than from the fields collected at generation time, so the write-side payload shape
// isn't known here — it's whatever the fetched form schema produces.
export type CreateCityInput = Record<string, unknown>

export type UpdateCityInput = Record<string, unknown> & { id: string }

export type CitiesSortField = 'name' | 'status' | 'created_at'

export interface CitiesListParams {
  page: number
  pageSize: number
  search?: string
  status?: CityStatus
  sortBy?: CitiesSortField
  sortDirection?: SortDirection
  /** The backend includes each row's `approval` by default — set false to skip that join for a faster query. */
  include_approval?: boolean
}

export interface CitiesListResult {
  data: City[]
  total: number
  /** New-record creation requests awaiting approval — not yet real city records, so they're kept separate from `data` rather than mixed in with an incomplete id. */
  pendingCreates?: City[]
}
