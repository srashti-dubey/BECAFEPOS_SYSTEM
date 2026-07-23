import type { SortDirection, WithRecordApproval } from '@/types'

export interface Role extends WithRecordApproval {
  id: string
  name: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateRoleInput {
  name: string
  description: string
  is_active: boolean
}

export interface UpdateRoleInput extends CreateRoleInput {
  id: string
}

export type RolesSortField = 'name' | 'description' | 'is_active' | 'created_at'

export interface RolesListParams {
  page: number
  pageSize: number
  search?: string
  sortBy?: RolesSortField
  sortDirection?: SortDirection
}

export interface RolesListResult {
  data: Role[]
  total: number
}
