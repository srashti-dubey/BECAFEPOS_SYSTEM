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
  list: (params: CustomersListParams) => customersApi.list(params),
  activeList: (params: CustomersListParams) => customersApi.activeList(params),
  getById: (id: string) => customersApi.getById(id),
  create,
  update,
  remove,
  approve,
  reject,
  exportExcel: (params: CustomersListParams) => customersApi.exportExcel(params),
}
