import { menusApi } from '@/features/menus/api/menusApi'
import type { CreateMenuInput, MenuTreeItem, UpdateMenuInput, MenusListParams, MenusListResult, MenusTreeListParams } from '@/features/menus/types'

export const menuService = {
  list: (params: MenusListParams): Promise<MenusListResult> => menusApi.list(params),
  treeList: (params: MenusTreeListParams): Promise<MenuTreeItem[]> => menusApi.treeList(params),
  getById: (id: string) => menusApi.getById(id),
  create: (input: CreateMenuInput) => menusApi.create(input),
  update: (input: UpdateMenuInput) => menusApi.update(input),
  remove: (id: string) => menusApi.remove(id),
}
