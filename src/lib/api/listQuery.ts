/**
 * Maps this app's internal camelCase list-query params (page/pageSize/sortBy/sortDirection)
 * to the real backend's snake_case query contract (page/limit/sort_by/sort_order, ASC/DESC).
 * Used by every listing endpoint's API layer right before the request leaves the app —
 * everything upstream (hooks, list pages) keeps using the internal camelCase shape.
 */
import type { SortDirection } from '@/types'

export interface BaseListParams {
  page: number
  pageSize: number
  search?: string
  sortBy?: string
  sortDirection?: SortDirection
}

export interface BackendListQuery {
  page: number
  limit: number
  search?: string
  sort_by?: string
  sort_order?: 'ASC' | 'DESC'
  [key: string]: unknown
}

export function toBackendListQuery<TExtra extends Record<string, unknown> = Record<string, never>>(
  params: BaseListParams,
  extra?: TExtra,
): BackendListQuery {
  return {
    page: params.page,
    limit: params.pageSize,
    ...(params.search ? { search: params.search } : {}),
    ...(params.sortBy ? { sort_by: params.sortBy } : {}),
    ...(params.sortDirection ? { sort_order: params.sortDirection === 'desc' ? 'DESC' : 'ASC' } : {}),
    ...extra,
  }
}
