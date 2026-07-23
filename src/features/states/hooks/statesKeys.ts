import type { StatesListParams } from '@/features/states/types'

export const statesKeys = {
  all: ['states'] as const,
  lists: () => [...statesKeys.all, 'list'] as const,
  list: (params: StatesListParams) => [...statesKeys.lists(), params] as const,
  activeLists: () => [...statesKeys.all, 'active-list'] as const,
  activeList: (params: StatesListParams) => [...statesKeys.activeLists(), params] as const,
  details: () => [...statesKeys.all, 'detail'] as const,
  detail: (id: string) => [...statesKeys.details(), id] as const,
}
