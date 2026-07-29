import type { SortDirection, WithRecordApproval } from '@/types'

export type CustomerStatus = 'active' | 'inactive'

// extends WithRecordApproval: every module's list/get endpoints return maker-checker approval
// metadata on each record now (approval/record_approval_status) — see the module generator
// README's "Approvals" section.
export interface Customer extends WithRecordApproval {
  id: string
  name: string
  mobile: string
  email: string
  remarks: string
  loyalty_points: number
  can_notify: string
  branch_id: number | null
  status: CustomerStatus
  created_at: string
  updated_at: string
  // Set only on client-side display rows representing an unsynced local create or update (see
  // pendingCustomer.ts) — never present on data that actually came from the API.
  isPendingSync?: boolean
  // Set only when a delete for this customer is queued locally, awaiting connectivity.
  isPendingDelete?: boolean
  // Set only when an approve/reject decision on this customer's approval request is queued
  // locally, awaiting connectivity — the decision has been made but not yet sent to the server.
  isPendingApprovalSync?: boolean
}

export interface CreateCustomerInput {
  name: string
  mobile: string
  email: string
  remarks: string
  loyalty_points: number
  can_notify: string
  branch_id: number | null
  status: CustomerStatus
}

export interface UpdateCustomerInput extends CreateCustomerInput {
  id: string
}

// customerService.create/update/remove() resolve 'queued' when the device is offline (or the
// request couldn't reach the server) — the change was saved locally and will be pushed by
// customerSyncService once connectivity returns, rather than reflecting a real server response.
export type CreateCustomerResult = { status: 'created'; customer: Customer } | { status: 'queued' }
export type UpdateCustomerResult = { status: 'updated'; customer: Customer } | { status: 'queued' }
export type RemoveCustomerResult = { status: 'removed' } | { status: 'queued' }
export type ApproveCustomerResult = { status: 'approved' } | { status: 'queued' }
export type RejectCustomerResult = { status: 'rejected' } | { status: 'queued' }

export type CustomersSortField = 'name' | 'mobile' | 'email' | 'remarks' | 'loyalty_points' | 'can_notify' | 'branch_id' | 'status' | 'created_at'

export interface CustomersListParams {
  page: number
  pageSize: number
  search?: string
  status?: CustomerStatus
  sortBy?: CustomersSortField
  sortDirection?: SortDirection
  /** The backend includes each row's `approval` by default — set false to skip that join for a faster query. */
  include_approval?: boolean
}

export interface CustomersListResult {
  data: Customer[]
  total: number
  /** New-record creation requests awaiting approval — not yet real customer records, so they're kept separate from `data` rather than mixed in with an incomplete id. */
  pendingCreates?: Customer[]
}
