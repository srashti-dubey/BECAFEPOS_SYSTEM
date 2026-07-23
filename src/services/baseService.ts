import { api } from '@/services/apiClient'
import { loggerService } from '@/services/loggerService'
import { errorHandler } from '@/services/errorHandler'
import { usePermissionStore } from '@/auth/permissionStore'
import type { ResponsePermissions } from '@/auth/types'

// Every endpoint responds with this envelope; BaseService unwraps `.data` once so callers
// (and their generic type params) deal with the actual payload shape directly. `permissions`
// is optional and only unwrapEncryptedResponse-passed-through: most listing endpoints attach
// the caller's own action flags for the menu just hit.
export interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
  permissions?: ResponsePermissions
}

export abstract class BaseService {
  protected async request<T>(config: Parameters<typeof api.request>[0]) {
    try {
      const response = await api.request<ApiEnvelope<T>>(config)
      const { data, permissions } = response.data

      if (permissions) {
        const { menu, ...flags } = permissions
        usePermissionStore.getState().setRoutePermission(menu, flags)
      }

      return data
    } catch (error) {
      loggerService.error('API request failed', error)
      throw errorHandler.handle(error)
    }
  }

  protected async get<T>(url: string, config?: Parameters<typeof api.get>[1]) {
    return this.request<T>({ method: 'GET', url, ...config })
  }

  protected async post<T>(url: string, data?: unknown, config?: Parameters<typeof api.post>[2]) {
    return this.request<T>({ method: 'POST', url, data, ...config })
  }

  protected async put<T>(url: string, data?: unknown, config?: Parameters<typeof api.put>[2]) {
    return this.request<T>({ method: 'PUT', url, data, ...config })
  }

  protected async patch<T>(url: string, data?: unknown, config?: Parameters<typeof api.patch>[2]) {
    return this.request<T>({ method: 'PATCH', url, data, ...config })
  }

  protected async delete<T>(url: string, config?: Parameters<typeof api.delete>[1]) {
    return this.request<T>({ method: 'DELETE', url, ...config })
  }
}
