import { customersApi } from '@/features/customers/api/customersApi'
import { customerRepository } from '@/features/customers/repositories/CustomerRepository'
import type { ApiError } from '@/services/errorHandler'
import type {
  CreateCustomerInput,
  CreateCustomerResult,
  UpdateCustomerInput,
  UpdateCustomerResult,
  RemoveCustomerResult,
  ApproveCustomerResult,
  RejectCustomerResult,
  CustomersListParams,
  CustomersListResult,
  Customer,
} from '@/features/customers/types'

// navigator.onLine only reflects whether the network interface is up, not whether the server was
// actually reachable — it won't have changed between the pre-check below and this catch just
// because one request failed. The reliable signal is on the error itself: BaseService/errorHandler
// marks `isNetworkError` when no response was ever received (DNS/connection failure, unreachable
// backend, timeout). A response that did come back (validation, 4xx/5xx) is a real failure and
// must propagate instead of being silently queued.
function isConnectivityFailure(error: unknown) {
  return !navigator.onLine || (error as ApiError | undefined)?.isNetworkError === true
}

// Applies the same search/status/sort/pagination the real /customers list endpoint would, but
// client-side against the offline cache (see refreshOfflineCustomersCache) — the closest offline
// parity with how POS's static product catalog behaves, since the customer list has no static
// equivalent to ship.
function listFromCache(all: Customer[], params: CustomersListParams): CustomersListResult {
  let filtered = all

  if (params.status) {
    filtered = filtered.filter((customer) => customer.status === params.status)
  }

  if (params.search) {
    const query = params.search.trim().toLowerCase()
    filtered = filtered.filter(
      (customer) =>
        customer.name.toLowerCase().includes(query) ||
        customer.mobile.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.remarks.toLowerCase().includes(query),
    )
  }

  if (params.sortBy) {
    const sortBy = params.sortBy
    const direction = params.sortDirection === 'desc' ? -1 : 1
    filtered = [...filtered].sort((a, b) => {
      const left = a[sortBy]
      const right = b[sortBy]
      if (left == null || right == null) {
        return 0
      }
      if (typeof left === 'number' && typeof right === 'number') {
        return (left - right) * direction
      }
      return String(left).localeCompare(String(right)) * direction
    })
  }

  const start = (params.page - 1) * params.pageSize
  return {
    data: filtered.slice(start, start + params.pageSize),
    total: filtered.length,
  }
}

async function list(params: CustomersListParams): Promise<CustomersListResult> {
  if (navigator.onLine) {
    try {
      return await customersApi.list(params)
    } catch (error) {
      if (!isConnectivityFailure(error)) {
        throw error
      }
    }
  }

  const cached = await customerRepository.getCachedCustomerList()
  return listFromCache(cached, params)
}

// Refreshes the offline read-cache with every active customer, looping through pages of the real
// (already-verified-working) list endpoint rather than the separate, unverified /active/list
// endpoint. Best-effort: silently gives up on failure (offline, or a real server error) — the
// cache just stays at whatever it last successfully held, same as any other cache miss.
export async function refreshOfflineCustomersCache(): Promise<void> {
  if (!navigator.onLine) {
    return
  }

  try {
    const pageSize = 200
    let all: Customer[] = []

    for (let page = 1; ; page += 1) {
      const result = await customersApi.list({ page, pageSize, sortBy: 'name', sortDirection: 'asc' })
      all = all.concat(result.data)
      if (result.data.length < pageSize || all.length >= result.total) {
        break
      }
    }

    await customerRepository.cacheCustomerList(all)
  } catch {
    // Best-effort — leave the existing cache (if any) untouched.
  }
}

// Online-first: only queues locally when the device is actually offline, or the request itself
// fails to reach the server. Server-side rejections (validation, etc.) are left to propagate as
// normal mutation errors instead of being silently queued.
async function create(input: CreateCustomerInput): Promise<CreateCustomerResult> {
  if (navigator.onLine) {
    try {
      const customer = await customersApi.create(input)
      return { status: 'created', customer }
    } catch (error) {
      if (!isConnectivityFailure(error)) {
        throw error
      }
    }
  }

  await customerRepository.queueCreate(input)
  return { status: 'queued' }
}

async function update(input: UpdateCustomerInput): Promise<UpdateCustomerResult> {
  const { id, ...data } = input

  if (navigator.onLine) {
    try {
      const customer = await customersApi.update(input)
      return { status: 'updated', customer }
    } catch (error) {
      if (!isConnectivityFailure(error)) {
        throw error
      }
    }
  }

  await customerRepository.queueUpdate(id, data)
  return { status: 'queued' }
}

async function remove(id: string): Promise<RemoveCustomerResult> {
  if (navigator.onLine) {
    try {
      await customersApi.remove(id)
      return { status: 'removed' }
    } catch (error) {
      if (!isConnectivityFailure(error)) {
        throw error
      }
    }
  }

  await customerRepository.queueDelete(id)
  return { status: 'queued' }
}

async function approve(requestId: number | string, comment?: string): Promise<ApproveCustomerResult> {
  if (navigator.onLine) {
    try {
      await customersApi.approve(requestId, comment)
      return { status: 'approved' }
    } catch (error) {
      if (!isConnectivityFailure(error)) {
        throw error
      }
    }
  }

  await customerRepository.queueApprovalDecision(Number(requestId), 'approve', comment)
  return { status: 'queued' }
}

async function reject(requestId: number | string, comment?: string): Promise<RejectCustomerResult> {
  if (navigator.onLine) {
    try {
      await customersApi.reject(requestId, comment)
      return { status: 'rejected' }
    } catch (error) {
      if (!isConnectivityFailure(error)) {
        throw error
      }
    }
  }

  await customerRepository.queueApprovalDecision(Number(requestId), 'reject', comment)
  return { status: 'queued' }
}

export const customerService = {
  list,
  activeList: (params: CustomersListParams) => customersApi.activeList(params),
  getById: (id: string) => customersApi.getById(id),
  create,
  update,
  remove,
  approve,
  reject,
  exportExcel: (params: CustomersListParams) => customersApi.exportExcel(params),
}
