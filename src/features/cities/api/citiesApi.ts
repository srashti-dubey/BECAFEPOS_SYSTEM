import { BaseService } from '@/services/baseService'
import { api } from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import { toBackendListQuery } from '@/lib/api/listQuery'
import type {
  CreateCityInput,
  UpdateCityInput,
  City,
  CitiesListParams,
  CitiesListResult,
} from '@/features/cities/types'

class CitiesApi extends BaseService {
  list(params: CitiesListParams) {
    const { page, pageSize, search, sortBy, sortDirection, ...extra } = params
    return this.get<CitiesListResult>(API_ENDPOINTS.cities, {
      params: toBackendListQuery({ page, pageSize, search, sortBy, sortDirection }, extra),
    })
  }

  // Flat, active-only list for populating dropdowns elsewhere (not used by this module's own
  // list page — that's ListParams-driven pagination via list() above). Infrastructure only until
  // another module needs this one as a reference-data source; see the generator README.
  activeList(params: CitiesListParams) {
    const { page, pageSize, search, sortBy, sortDirection, ...extra } = params
    return this.get<CitiesListResult>(API_ENDPOINTS.citiesActiveList, {
      params: toBackendListQuery({ page, pageSize, search, sortBy, sortDirection }, extra),
    })
  }

  getById(id: string) {
    return this.get<City>(API_ENDPOINTS.city(id))
  }

  create(input: CreateCityInput) {
    return this.post<City>(API_ENDPOINTS.cities, input)
  }

  update(input: UpdateCityInput) {
    const { id, ...rest } = input
    return this.put<City>(API_ENDPOINTS.city(id), rest)
  }

  remove(id: string) {
    return this.delete<void>(API_ENDPOINTS.city(id))
  }

  // The body must always be a real object, not omitted — BaseService only encrypts into
  // request_data when a body is actually passed (see apiClient.ts's encryptRequestConfig), and
  // the backend expects request_data on this endpoint regardless. `comment` defaults to a fixed
  // string rather than being left empty for the same reason.
  approve(requestId: number | string, comment?: string) {
    return this.post<void>(API_ENDPOINTS.citiesApprovalApprove(requestId), {
      comment: comment?.trim() || 'Approved',
    })
  }

  // Wire field is `reason`, not `comment` — matches this endpoint's documented request body,
  // distinct from approve()'s `comment` above.
  reject(requestId: number | string, comment?: string) {
    return this.post<void>(API_ENDPOINTS.citiesApprovalReject(requestId), {
      reason: comment?.trim() || undefined,
    })
  }

  // Bypasses BaseService: request() always does response.data.data, which would break on a
  // binary body — same pattern as role-permissions/api/rolePermissionsApi.ts's exportExcel. The
  // blob still flows through the shared request/response interceptors (query encryption etc.),
  // only the response itself is left alone.
  async exportExcel(params: CitiesListParams) {
    const { page, pageSize, search, sortBy, sortDirection, ...extra } = params
    const response = await api.get<Blob>(API_ENDPOINTS.citiesExportExcel, {
      params: toBackendListQuery({ page, pageSize, search, sortBy, sortDirection }, extra),
      responseType: 'blob',
    })
    return response.data
  }
}

export const citiesApi = new CitiesApi()
