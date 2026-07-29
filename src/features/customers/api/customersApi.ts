import { BaseService } from '@/services/baseService'
import { api } from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import { toBackendListQuery } from '@/lib/api/listQuery'
import type {
  CreateCustomerInput,
  UpdateCustomerInput,
  Customer,
  CustomersListParams,
  CustomersListResult,
} from '@/features/customers/types'

class CustomersApi extends BaseService {
  // toBackendListQuery maps this app's internal camelCase list params (page/pageSize/sortBy/
  // sortDirection) to the backend's real query contract (page/limit/sort_by/sort_order); any
  // other params (status, include_approval, ...) pass through unchanged via `extra`.
  list(params: CustomersListParams) {
    const { page, pageSize, search, sortBy, sortDirection, ...extra } = params
    return this.get<CustomersListResult>(API_ENDPOINTS.customers, {
      params: toBackendListQuery({ page, pageSize, search, sortBy, sortDirection }, extra),
    })
  }

  // Flat, active-only list for populating dropdowns elsewhere (not used by this module's own
  // list page — that's ListParams-driven pagination via list() above). Infrastructure only until
  // another module needs this one as a reference-data source; see the generator README.
  activeList(params: CustomersListParams) {
    const { page, pageSize, search, sortBy, sortDirection, ...extra } = params
    return this.get<CustomersListResult>(API_ENDPOINTS.customersActiveList, {
      params: toBackendListQuery({ page, pageSize, search, sortBy, sortDirection }, extra),
    })
  }

  getById(id: string) {
    return this.get<Customer>(API_ENDPOINTS.customer(id))
  }

  create(input: CreateCustomerInput) {
    return this.post<Customer>(API_ENDPOINTS.customers, input)
  }

  update(input: UpdateCustomerInput) {
    const { id, ...rest } = input
    return this.put<Customer>(API_ENDPOINTS.customer(id), rest)
  }

  remove(id: string) {
    return this.delete<void>(API_ENDPOINTS.customer(id))
  }

  // The body must always be a real object, not omitted — BaseService only encrypts into
  // request_data when a body is actually passed (see apiClient.ts's encryptRequestConfig), and
  // the backend expects request_data on this endpoint regardless. `comment` defaults to a fixed
  // string rather than being left empty for the same reason.
  approve(requestId: number | string, comment?: string) {
    return this.post<void>(API_ENDPOINTS.customersApprovalApprove(requestId), {
      comment: comment?.trim() || 'Approved',
    })
  }

  // Wire field is `reason`, not `comment` — matches this endpoint's documented request body,
  // distinct from approve()'s `comment` above.
  reject(requestId: number | string, comment?: string) {
    return this.post<void>(API_ENDPOINTS.customersApprovalReject(requestId), {
      reason: comment?.trim() || undefined,
    })
  }

  // Bypasses BaseService: request() always does response.data.data, which would break on a
  // binary body — same pattern as role-permissions/api/rolePermissionsApi.ts's exportExcel. The
  // blob still flows through the shared request/response interceptors (query encryption etc.),
  // only the response itself is left alone.
  async exportExcel(params: CustomersListParams) {
    const { page, pageSize, search, sortBy, sortDirection, ...extra } = params
    const response = await api.get<Blob>(API_ENDPOINTS.customersExportExcel, {
      params: toBackendListQuery({ page, pageSize, search, sortBy, sortDirection }, extra),
      responseType: 'blob',
    })
    return response.data
  }
}

export const customersApi = new CustomersApi()
