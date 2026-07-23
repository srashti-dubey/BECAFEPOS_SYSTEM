import { BaseService } from '@/services/baseService'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import { toBackendListQuery } from '@/lib/api/listQuery'
import type {
  CreateMenuInput,
  Menu,
  MenuTreeItem,
  MenusListParams,
  MenusListResult,
  MenusQueryParams,
  MenusTreeListParams,
  UpdateMenuInput,
} from '@/features/menus/types'

function isTreeListParams(params: MenusQueryParams): params is MenusTreeListParams {
  return 'active_only' in params
}

class MenusApi extends BaseService {
  list(params: MenusQueryParams) {
    const query = isTreeListParams(params) ? params : toBackendListQuery(params as MenusListParams)
    return this.get<MenusListResult>(API_ENDPOINTS.menus, { params: query })
  }
  treeList(params: MenusTreeListParams) {
    return this.get<MenuTreeItem[]>(API_ENDPOINTS.menusTree, { params })
  }
  activeList(params: MenusQueryParams) {
    const query = isTreeListParams(params) ? params : toBackendListQuery(params as MenusListParams)
    return this.get<MenusListResult>(API_ENDPOINTS.menusActiveList, { params: query })
  }

  getById(id: string) {
    return this.get<Menu>(API_ENDPOINTS.menu(id))
  }

  create(input: CreateMenuInput) {
    return this.post<Menu>(API_ENDPOINTS.menus, input)
  }

  update(input: UpdateMenuInput) {
    const { id, ...rest } = input
    return this.put<Menu>(API_ENDPOINTS.menu(id), rest)
  }

  remove(id: string) {
    return this.delete<void>(API_ENDPOINTS.menu(id))
  }
}

export const menusApi = new MenusApi()
