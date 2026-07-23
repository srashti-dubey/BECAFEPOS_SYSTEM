import type { DistrictsListParams } from '@/features/districts/types'

export const districtsKeys = {
  all: ['districts'] as const,
  lists: () => [...districtsKeys.all, 'list'] as const,
  list: (params: DistrictsListParams) => [...districtsKeys.lists(), params] as const,
  activeLists: () => [...districtsKeys.all, 'active-list'] as const,
  activeList: (params: DistrictsListParams) => [...districtsKeys.activeLists(), params] as const,
  details: () => [...districtsKeys.all, 'detail'] as const,
  detail: (id: string) => [...districtsKeys.details(), id] as const,
}
