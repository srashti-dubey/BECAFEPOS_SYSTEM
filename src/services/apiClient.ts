import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { env } from '@/config/env'
import { useAuthStore } from '@/auth/store'
import { usePermissionStore } from '@/auth/permissionStore'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import { ROUTES } from '@/constants/routes'
import {
  appendEncryptedQueryToUrl,
  buildEncryptedRequestBody,
  encryptCustomToken,
  unwrapEncryptedResponse,
} from '@/lib/crypto/customEncrypt'

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean }
type PendingRequest = { resolve: () => void; reject: (error: unknown) => void }

class ApiClient {
  private instance: AxiosInstance
  private isRefreshing = false
  private pendingRequests: PendingRequest[] = []

  constructor() {
    this.instance = axios.create({
      baseURL: env.VITE_API_BASE_URL,
      withCredentials: true,
      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })

    this.instance.interceptors.request.use((config) => {
      const accessToken = useAuthStore.getState().access_token
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`
      }

      if (env.VITE_API_KEY && config.headers) {
        config.headers['x-api-key'] = env.VITE_API_KEY
        config.headers['x-api-token'] = encryptCustomToken(env.VITE_API_KEY)
      }

      this.encryptRequestConfig(config)

      return config
    })

    this.instance.interceptors.response.use(
      (response) => {
        response.data = unwrapEncryptedResponse(response.data)
        return response
      },
      async (error: AxiosError) => {
        if (error.response) {
          error.response.data = unwrapEncryptedResponse(error.response.data)
        }
        return this.handleResponseError(error)
      },
    )
  }

  getInstance() {
    return this.instance
  }

  // Wraps the plain request body into { request_data: <encrypted> } and, for requests with
  // query params, folds them into an encrypted `?request_data=` query string on the URL instead
  // — axios's own params serializer is bypassed by clearing config.params so it can't also
  // append the plaintext query alongside the encrypted one.
  private encryptRequestConfig(config: InternalAxiosRequestConfig) {
    if (config.params !== undefined) {
      config.url = appendEncryptedQueryToUrl(config.url ?? '', config.params)
      config.params = undefined
    }

    if (config.data !== undefined) {
      config.data = buildEncryptedRequestBody(config.data)
    }
  }

  private resolvePendingRequests() {
    this.pendingRequests.forEach(({ resolve }) => resolve())
    this.pendingRequests = []
  }

  private rejectPendingRequests(error: unknown) {
    this.pendingRequests.forEach(({ reject }) => reject(error))
    this.pendingRequests = []
  }

  private forceLogout() {
    useAuthStore.getState().clearAuth()
    usePermissionStore.getState().clear()
    window.location.assign(ROUTES.login)
  }

  private async handleResponseError(error: AxiosError) {
    const originalRequest = error.config as RetryableConfig | undefined

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url === API_ENDPOINTS.login
    ) {
      // A 401 on login just means invalid credentials, not an expired session — there's no
      // token to refresh yet, so let it reject normally and surface to the login form.
      return Promise.reject(error)
    }

    // A 401 on the refresh call itself means the refresh token is invalid/expired — attempting
    // to "refresh" again here would recurse forever. Go straight to logout instead.
    if (originalRequest.url === API_ENDPOINTS.refresh) {
      this.rejectPendingRequests(error)
      this.isRefreshing = false
      this.forceLogout()
      return Promise.reject(error)
    }

    originalRequest._retry = true

    if (this.isRefreshing) {
      // A refresh is already in flight — queue this request instead of starting another one,
      // and retry it once the in-flight refresh resolves (or reject if it fails).
      await new Promise<void>((resolve, reject) => {
        this.pendingRequests.push({ resolve, reject })
      })
      return this.instance(originalRequest)
    }

    this.isRefreshing = true

    try {
      // Lazy/dynamic import, not a top-level one: auth/session.ts's own module chain
      // (session -> authService -> authApi -> services/baseService) leads right back to this
      // file, so a static import here creates a circular dependency — which module "wins" that
      // race (i.e. whether BaseService is defined yet when authApi.ts subclasses it) depends on
      // unrelated load order elsewhere in the app, making it a real but load-order-sensitive
      // crash risk. Deferring the import until it's actually needed (well after the whole
      // module graph has finished its initial synchronous evaluation) sidesteps that entirely.
      const { refreshSession } = await import('@/auth/session')
      await refreshSession()
      this.resolvePendingRequests()
      return this.instance(originalRequest)
    } catch (refreshError) {
      this.rejectPendingRequests(refreshError)
      this.forceLogout()
      return Promise.reject(refreshError)
    } finally {
      this.isRefreshing = false
    }
  }
}

export const apiClient = new ApiClient()
export const api = apiClient.getInstance()
