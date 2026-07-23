import type { SortDirection, WithRecordApproval } from '@/types'

export interface MenuParent {
  id?: number
  name: string
  route: string
}

export interface Menu extends WithRecordApproval {
  id: string
  name: string
  route: string
  parent_id: MenuParent | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateMenuInput {
  name: string
  route: string
  parent_id: number | null
  sort_order: number
  is_active: boolean
}

export interface UpdateMenuInput extends CreateMenuInput {
  id: string
}

export type MenusSortField = 'name' | 'route' | 'sort_order' | 'is_active' | 'created_at'

export interface MenusListParams {
  page: number
  pageSize: number
  search?: string
  sortBy?: MenusSortField
  sortDirection?: SortDirection
}

export interface MenusListResult {
  data: Menu[]
  total: number
}

export interface MenuTreeItem extends Menu {
  children?: MenuTreeItem[]
}

export type MenusTreeResult = MenuTreeItem[]

export interface MenusTreeListParams {
  active_only: boolean
}

export type MenusQueryParams = MenusListParams | MenusTreeListParams
