import { rolesApi } from '@/features/roles/api/rolesApi'
import type { CreateRoleInput, UpdateRoleInput, RolesListParams } from '@/features/roles/types'

export const roleService = {
  list: (params: RolesListParams) => rolesApi.list(params),
  getById: (id: string) => rolesApi.getById(id),
  create: (input: CreateRoleInput) => rolesApi.create(input),
  update: (input: UpdateRoleInput) => rolesApi.update(input),
  remove: (id: string) => rolesApi.remove(id),
}
