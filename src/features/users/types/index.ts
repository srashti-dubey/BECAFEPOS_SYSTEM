import type { SortDirection, WithRecordApproval } from '@/types'

export type UserStatus = 'active' | 'inactive' | 'pending'

export interface User extends WithRecordApproval {
  id: string
  name: string
  email: string
  phone?: string
  mobile?: string
  // The real backend has no fixed role enum — role comes from the dynamic Roles feature as
  // role_id/role_name (already resolved to display strings by the API mapper).
  role_id?: string
  role_name?: string
  status: UserStatus
  branch_ids?: number[]
  created_at?: string
  updated_at?: string
}

export interface CreateUserInput {
  name: string
  email: string
  password: string
  mobile: string
  role_id: number | null
  status: UserStatus
  branch_ids: number[]
}

export interface UpdateUserInput extends Omit<CreateUserInput, 'password'> {
  id: string
}

export type UsersSortField = 'name' | 'email' | 'role_name' | 'status' | 'created_at'

export interface UsersListParams {
  page: number
  pageSize: number
  search?: string
  status?: UserStatus
  sortBy?: UsersSortField
  sortDirection?: SortDirection
}

export interface UsersListResult {
  data: User[]
  total: number
}
