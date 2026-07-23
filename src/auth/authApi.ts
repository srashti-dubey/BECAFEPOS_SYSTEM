import { BaseService } from '@/services/baseService'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import type { AuthTokens, LoginPayload, MenuPermissionFlags, MyMenuPermissions } from '@/auth/types'

interface BackendMyMenuPermissions {
  role: string
  is_super_admin: boolean
  permissions: Record<string, MenuPermissionFlags>
}

// The backend's routePermissions field is called `permissions` on the wire — renamed here to
// disambiguate from other unrelated "permissions" concepts elsewhere in the app.
function toMyMenuPermissions(raw: BackendMyMenuPermissions): MyMenuPermissions {
  return {
    role: raw.role,
    is_super_admin: raw.is_super_admin,
    routePermissions: raw.permissions,
  }
}

class AuthApi extends BaseService {
  login(payload: LoginPayload) {
    return this.post<AuthTokens>(API_ENDPOINTS.login, payload)
  }

  refresh(refreshToken: string) {
    return this.post<AuthTokens>(API_ENDPOINTS.refresh, { refresh_token: refreshToken })
  }

  logout() {
    return this.post<void>(API_ENDPOINTS.logout)
  }

  async getMyMenuPermissions() {
    const raw = await this.get<BackendMyMenuPermissions>(API_ENDPOINTS.myMenuPermissions)
    return toMyMenuPermissions(raw)
  }
}

export const authApi = new AuthApi()
