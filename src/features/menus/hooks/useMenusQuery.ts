import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { menuService } from '@/features/menus/services/menuService'
import { menusKeys } from '@/features/menus/hooks/menusKeys'
import type { MenuTreeItem, MenusListParams, MenusListResult, MenusTreeListParams } from '@/features/menus/types'

export function useMenusQuery(params: MenusListParams) {
  return useQuery<MenusListResult>({
    queryKey: menusKeys.list(params),
    queryFn: () => menuService.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useMenusTreeQuery(params: MenusTreeListParams) {
  return useQuery<MenuTreeItem[]>({
    queryKey: menusKeys.treeList(params),
    queryFn: () => menuService.treeList(params),
    placeholderData: keepPreviousData,
  })
}
