import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { customerService } from '@/features/customers/services/customerService'
import { customerRepository } from '@/features/customers/repositories/CustomerRepository'
import { customersKeys } from '@/features/customers/hooks/customersKeys'
import { notificationService } from '@/services/notificationService'
import type {
  CreateCustomerInput,
  UpdateCustomerInput,
  Customer,
  CustomersListParams,
  CustomersListResult,
} from '@/features/customers/types'

const OFFLINE_QUEUED_MESSAGE =
  'You are offline. Change saved on this device and will sync automatically once you are back online.'

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

// Writes the freshly-read Dexie snapshot straight into the query cache instead of just
// invalidateQueries() + waiting on a background refetch — the Dexie write behind a 'queued'
// result has already happened by the time this runs, so there's no reason for the pending-sync
// badge/row to lag behind it. Every offline-capable mutation below calls this in onSuccess so the
// list page reflects the change the instant the mutation settles, online or off.
async function refreshPendingCustomers(queryClient: QueryClient) {
  const pending = await customerRepository.getPending()
  queryClient.setQueryData(customersKeys.pendingList(), pending)
}

export function useCreateCustomerMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateCustomerInput) => customerService.create(input),
    onSuccess: async (result) => {
      void queryClient.invalidateQueries({ queryKey: customersKeys.lists() })
      if (result.status === 'queued') {
        await refreshPendingCustomers(queryClient)
        notificationService.info('You are offline. Customer saved on this device and will sync automatically once you are back online.')
      } else {
        notificationService.success('Customer created successfully')
      }
    },
    onError: (error) => {
      notificationService.error(errorMessage(error, 'Unable to create customer'))
    },
  })
}

// Edits a still-unsynced Dexie draft in place. Distinct from useUpdateCustomerMutation, which
// PUTs to the server and only applies to records that already have a real server id.
export function useUpdateLocalCustomerMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ pendingId, data }: { pendingId: number; data: CreateCustomerInput }) =>
      customerRepository.update(pendingId, data),
    onSuccess: async () => {
      await refreshPendingCustomers(queryClient)
      notificationService.success('Customer updated')
    },
    onError: (error) => {
      notificationService.error(errorMessage(error, 'Unable to update customer'))
    },
  })
}

// Removes a still-unsynced Dexie draft. Distinct from useDeleteCustomerMutation, which calls the
// server's DELETE endpoint and only applies to records that already have a real server id.
export function useDeleteLocalCustomerMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (pendingId: number) => customerRepository.remove(pendingId),
    onSuccess: async () => {
      await refreshPendingCustomers(queryClient)
      notificationService.success('Customer removed')
    },
    onError: (error) => {
      notificationService.error(errorMessage(error, 'Unable to delete customer'))
    },
  })
}

export function useUpdateCustomerMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateCustomerInput) => customerService.update(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: customersKeys.detail(input.id) })
      const previousCustomer = queryClient.getQueryData<Customer>(customersKeys.detail(input.id))

      if (previousCustomer) {
        queryClient.setQueryData<Customer>(customersKeys.detail(input.id), { ...previousCustomer, ...input })
      }

      queryClient.setQueriesData<CustomersListResult>({ queryKey: customersKeys.lists() }, (current) => {
        if (!current) {
          return current
        }
        return { ...current, data: current.data.map((record) => (record.id === input.id ? { ...record, ...input } : record)) }
      })

      return { previousCustomer }
    },
    onError: (error, input, context) => {
      if (context?.previousCustomer) {
        queryClient.setQueryData(customersKeys.detail(input.id), context.previousCustomer)
      }
      void queryClient.invalidateQueries({ queryKey: customersKeys.lists() })
      notificationService.error(errorMessage(error, 'Unable to update customer'))
    },
    onSuccess: async (result) => {
      if (result.status === 'queued') {
        await refreshPendingCustomers(queryClient)
        notificationService.info(OFFLINE_QUEUED_MESSAGE)
        return
      }
      queryClient.setQueryData(customersKeys.detail(result.customer.id), result.customer)
      notificationService.success('Customer updated successfully')
    },
    onSettled: (_data, _error, input) => {
      void queryClient.invalidateQueries({ queryKey: customersKeys.detail(input.id) })
      void queryClient.invalidateQueries({ queryKey: customersKeys.lists() })
    },
  })
}

export function useDeleteCustomerMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => customerService.remove(id),
    onSuccess: async (result) => {
      void queryClient.invalidateQueries({ queryKey: customersKeys.lists() })
      if (result.status === 'queued') {
        await refreshPendingCustomers(queryClient)
        notificationService.info(OFFLINE_QUEUED_MESSAGE)
      } else {
        notificationService.success('Customer deleted successfully')
      }
    },
    onError: (error) => {
      notificationService.error(errorMessage(error, 'Unable to delete customer'))
    },
  })
}

export function useApproveCustomerMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (requestId: number | string) => customerService.approve(requestId),
    onSuccess: async (result) => {
      void queryClient.invalidateQueries({ queryKey: customersKeys.lists() })
      if (result.status === 'queued') {
        await refreshPendingCustomers(queryClient)
        notificationService.info(OFFLINE_QUEUED_MESSAGE)
      } else {
        notificationService.success('Request approved successfully')
      }
    },
    onError: (error) => {
      notificationService.error(errorMessage(error, 'Unable to approve request'))
    },
  })
}

export function useRejectCustomerMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ requestId, comment }: { requestId: number | string; comment?: string }) =>
      customerService.reject(requestId, comment),
    onSuccess: async (result) => {
      void queryClient.invalidateQueries({ queryKey: customersKeys.lists() })
      if (result.status === 'queued') {
        await refreshPendingCustomers(queryClient)
        notificationService.info(OFFLINE_QUEUED_MESSAGE)
      } else {
        notificationService.success('Request rejected successfully')
      }
    },
    onError: (error) => {
      notificationService.error(errorMessage(error, 'Unable to reject request'))
    },
  })
}

// No shared file-download utility in the repo yet — a plain temporary <a> with an object URL is
// the standard way to trigger a browser download from an in-memory blob (see
// role-permissions/hooks/useExportRolePermissionsExcel.ts for the same pattern).
function downloadCustomerBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function useExportCustomersExcel() {
  return useMutation({
    mutationFn: async (params: CustomersListParams) => {
      const blob = await customerService.exportExcel(params)
      downloadCustomerBlob(blob, 'customers.xlsx')
    },
    onError: (error) => {
      notificationService.error(errorMessage(error, 'Unable to export customers'))
    },
  })
}
