import type { MenusListParams, MenusTreeListParams } from '@/features/menus/types'

export const menusKeys = {
  all: ['menus'] as const,
  lists: () => [...menusKeys.all, 'list'] as const,
  list: (params: MenusListParams) => [...menusKeys.lists(), params] as const,
  treeLists: () => [...menusKeys.all, 'treeList'] as const,
  treeList: (params: MenusTreeListParams) => [...menusKeys.treeLists(), params] as const,
  details: () => [...menusKeys.all, 'detail'] as const,
  detail: (id: string) => [...menusKeys.details(), id] as const,
}
