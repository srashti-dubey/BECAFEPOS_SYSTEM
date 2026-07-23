import { authApi } from '@/auth/authApi'
import type { LoginPayload } from '@/auth/types'

export const authService = {
  login: (payload: LoginPayload) => authApi.login(payload),
  refresh: (refreshToken: string) => authApi.refresh(refreshToken),
  logout: () => authApi.logout(),
  getMyMenuPermissions: () => authApi.getMyMenuPermissions(),
}
