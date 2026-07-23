import { BaseService } from '@/services/baseService'
import { api } from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import { toBackendListQuery } from '@/lib/api/listQuery'
import type {
  CreateDistrictInput,
  UpdateDistrictInput,
  District,
  DistrictsListParams,
  DistrictsListResult,
} from '@/features/districts/types'

class DistrictsApi extends BaseService {
  list(params: DistrictsListParams) {
    const { page, pageSize, search, sortBy, sortDirection, ...extra } = params
    return this.get<DistrictsListResult>(API_ENDPOINTS.districts, {
      params: toBackendListQuery({ page, pageSize, search, sortBy, sortDirection }, extra),
    })
  }

  // Flat, active-only list for populating dropdowns elsewhere (not used by this module's own
  // list page — that's ListParams-driven pagination via list() above). Infrastructure only until
  // another module needs this one as a reference-data source; see the generator README.
  activeList(params: DistrictsListParams) {
    const { page, pageSize, search, sortBy, sortDirection, ...extra } = params
    return this.get<DistrictsListResult>(API_ENDPOINTS.districtsActiveList, {
      params: toBackendListQuery({ page, pageSize, search, sortBy, sortDirection }, extra),
    })
  }

  getById(id: string) {
    return this.get<District>(API_ENDPOINTS.district(id))
  }

  create(input: CreateDistrictInput) {
    return this.post<District>(API_ENDPOINTS.districts, input)
  }

  update(input: UpdateDistrictInput) {
    const { id, ...rest } = input
    return this.put<District>(API_ENDPOINTS.district(id), rest)
  }

  remove(id: string) {
    return this.delete<void>(API_ENDPOINTS.district(id))
  }

  // The body must always be a real object, not omitted — BaseService only encrypts into
  // request_data when a body is actually passed (see apiClient.ts's encryptRequestConfig), and
  // the backend expects request_data on this endpoint regardless. `comment` defaults to a fixed
  // string rather than being left empty for the same reason.
  approve(requestId: number | string, comment?: string) {
    return this.post<void>(API_ENDPOINTS.districtsApprovalApprove(requestId), {
      comment: comment?.trim() || 'Approved',
    })
  }

  // Wire field is `reason`, not `comment` — matches this endpoint's documented request body,
  // distinct from approve()'s `comment` above.
  reject(requestId: number | string, comment?: string) {
    return this.post<void>(API_ENDPOINTS.districtsApprovalReject(requestId), {
      reason: comment?.trim() || undefined,
    })
  }

  // Bypasses BaseService: request() always does response.data.data, which would break on a
  // binary body — same pattern as role-permissions/api/rolePermissionsApi.ts's exportExcel. The
  // blob still flows through the shared request/response interceptors (query encryption etc.),
  // only the response itself is left alone.
  async exportExcel(params: DistrictsListParams) {
    const { page, pageSize, search, sortBy, sortDirection, ...extra } = params
    const response = await api.get<Blob>(API_ENDPOINTS.districtsExportExcel, {
      params: toBackendListQuery({ page, pageSize, search, sortBy, sortDirection }, extra),
      responseType: 'blob',
    })
    return response.data
  }
}

export const districtsApi = new DistrictsApi()
