---
to: src/features/<%= folder %>/api/<%= pluralCamel %>Api.ts
---
import { BaseService } from '@/services/baseService'
import { api } from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import { toBackendListQuery } from '@/lib/api/listQuery'
import type {
  Create<%= singular %>Input,
  Update<%= singular %>Input,
  <%= singular %>,
  <%= plural %>ListParams,
  <%= plural %>ListResult,
} from '@/features/<%= folder %>/types'

class <%= plural %>Api extends BaseService {
  // toBackendListQuery maps this app's internal camelCase list params (page/pageSize/sortBy/
  // sortDirection) to the backend's real query contract (page/limit/sort_by/sort_order); any
  // other params (status, include_approval, ...) pass through unchanged via `extra`.
  list(params: <%= plural %>ListParams) {
    const { page, pageSize, search, sortBy, sortDirection, ...extra } = params
    return this.get<<%= plural %>ListResult>(API_ENDPOINTS.<%= pluralCamel %>, {
      params: toBackendListQuery({ page, pageSize, search, sortBy, sortDirection }, extra),
    })
  }

  // Flat, active-only list for populating dropdowns elsewhere (not used by this module's own
  // list page — that's ListParams-driven pagination via list() above). Infrastructure only until
  // another module needs this one as a reference-data source; see the generator README.
  activeList(params: <%= plural %>ListParams) {
    const { page, pageSize, search, sortBy, sortDirection, ...extra } = params
    return this.get<<%= plural %>ListResult>(API_ENDPOINTS.<%= pluralCamel %>ActiveList, {
      params: toBackendListQuery({ page, pageSize, search, sortBy, sortDirection }, extra),
    })
  }

  getById(id: string) {
    return this.get<<%= singular %>>(API_ENDPOINTS.<%= singularCamel %>(id))
  }

  create(input: Create<%= singular %>Input) {
    return this.post<<%= singular %>>(API_ENDPOINTS.<%= pluralCamel %>, input)
  }

  update(input: Update<%= singular %>Input) {
    const { id, ...rest } = input
    return this.put<<%= singular %>>(API_ENDPOINTS.<%= singularCamel %>(id), rest)
  }

  remove(id: string) {
    return this.delete<void>(API_ENDPOINTS.<%= singularCamel %>(id))
  }

  // The body must always be a real object, not omitted — BaseService only encrypts into
  // request_data when a body is actually passed (see apiClient.ts's encryptRequestConfig), and
  // the backend expects request_data on this endpoint regardless. `comment` defaults to a fixed
  // string rather than being left empty for the same reason.
  approve(requestId: number | string, comment?: string) {
    return this.post<void>(API_ENDPOINTS.<%= pluralCamel %>ApprovalApprove(requestId), {
      comment: comment?.trim() || 'Approved',
    })
  }

  // Wire field is `reason`, not `comment` — matches this endpoint's documented request body,
  // distinct from approve()'s `comment` above.
  reject(requestId: number | string, comment?: string) {
    return this.post<void>(API_ENDPOINTS.<%= pluralCamel %>ApprovalReject(requestId), {
      reason: comment?.trim() || undefined,
    })
  }

  // Bypasses BaseService: request() always does response.data.data, which would break on a
  // binary body — same pattern as role-permissions/api/rolePermissionsApi.ts's exportExcel. The
  // blob still flows through the shared request/response interceptors (query encryption etc.),
  // only the response itself is left alone.
  async exportExcel(params: <%= plural %>ListParams) {
    const { page, pageSize, search, sortBy, sortDirection, ...extra } = params
    const response = await api.get<Blob>(API_ENDPOINTS.<%= pluralCamel %>ExportExcel, {
      params: toBackendListQuery({ page, pageSize, search, sortBy, sortDirection }, extra),
      responseType: 'blob',
    })
    return response.data
  }
}

export const <%= pluralCamel %>Api = new <%= plural %>Api()
