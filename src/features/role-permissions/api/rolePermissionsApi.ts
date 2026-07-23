import { BaseService } from '@/services/baseService'
import { api } from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import type { MenuPermissionFlags } from '@/auth/types'
import type { RolePermissionsData, UpdateRolePermissionsInput } from '@/features/role-permissions/types'

// GET nests each entry's flags under `permissions`; the PUT payload the docs describe is flat
// on each entry instead. Both shapes are adapted here in one place — if the real backend
// disagrees with either, this is the first place to check.
interface BackendMenuPermissionEntry {
  menu_id: number
  permissions: MenuPermissionFlags
}

interface BackendRolePermissionsData {
  role_id: number
  permissions: BackendMenuPermissionEntry[]
}

function toRolePermissionsData(raw: BackendRolePermissionsData): RolePermissionsData {
  return {
    role_id: raw.role_id,
    permissions: raw.permissions.map((entry) => ({ menu_id: entry.menu_id, flags: entry.permissions })),
  }
}

function toBackendUpdatePayload(input: UpdateRolePermissionsInput) {
  return {
    role_id: input.role_id,
    permissions: input.permissions.map(({ menu_id, ...flags }) => ({ menu_id, ...flags })),
  }
}

class RolePermissionsApi extends BaseService {
  async getForRole(roleId: number, search?: string) {
    const raw = await this.get<BackendRolePermissionsData>(API_ENDPOINTS.rolePermissions, {
      params: { role_id: roleId, ...(search ? { search } : {}) },
    })
    return toRolePermissionsData(raw)
  }

  async update(input: UpdateRolePermissionsInput) {
    const raw = await this.put<BackendRolePermissionsData>(API_ENDPOINTS.rolePermissions, toBackendUpdatePayload(input))
    return toRolePermissionsData(raw)
  }

  // Bypasses BaseService: request() always does response.data.data, which would break on a
  // binary body. The blob still flows through the same global request/response interceptors
  // (they already no-op safely on non-JSON bodies — see isRecord in customEncrypt.ts), so query
  // encryption on role_id/search still happens automatically; only the response is left alone.
  async exportExcel(roleId: number, search?: string) {
    const response = await api.get<Blob>(API_ENDPOINTS.rolePermissionsExportExcel, {
      params: { role_id: roleId, ...(search ? { search } : {}) },
      responseType: 'blob',
    })
    return response.data
  }
}

export const rolePermissionsApi = new RolePermissionsApi()
