import type { CitiesListParams } from '@/features/cities/types'

export const citiesKeys = {
  all: ['cities'] as const,
  lists: () => [...citiesKeys.all, 'list'] as const,
  list: (params: CitiesListParams) => [...citiesKeys.lists(), params] as const,
  activeLists: () => [...citiesKeys.all, 'active-list'] as const,
  activeList: (params: CitiesListParams) => [...citiesKeys.activeLists(), params] as const,
  details: () => [...citiesKeys.all, 'detail'] as const,
  detail: (id: string) => [...citiesKeys.details(), id] as const,
}
