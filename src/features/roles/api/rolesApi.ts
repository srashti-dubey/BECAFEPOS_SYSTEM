import { BaseService } from '@/services/baseService'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import { toBackendListQuery } from '@/lib/api/listQuery'
import type {
  CreateRoleInput,
  UpdateRoleInput,
  Role,
  RolesListParams,
  RolesListResult,
} from '@/features/roles/types'

class RolesApi extends BaseService {
  list(params: RolesListParams) {
    return this.get<RolesListResult>(API_ENDPOINTS.roles, { params: toBackendListQuery(params) })
  }

  getById(id: string) {
    return this.get<Role>(API_ENDPOINTS.role(id))
  }

  create(input: CreateRoleInput) {
    return this.post<Role>(API_ENDPOINTS.roles, input)
  }

  update(input: UpdateRoleInput) {
    const { id, ...rest } = input
    return this.put<Role>(API_ENDPOINTS.role(id), rest)
  }

  remove(id: string) {
    return this.delete<void>(API_ENDPOINTS.role(id))
  }
}

export const rolesApi = new RolesApi()
