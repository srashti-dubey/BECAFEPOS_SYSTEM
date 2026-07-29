import { useMutation, useQueryClient } from '@tanstack/react-query'
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

export function useCreateCustomerMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateCustomerInput) => customerService.create(input),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: customersKeys.lists() })
      if (result.status === 'queued') {
        void queryClient.invalidateQueries({ queryKey: customersKeys.pendingList() })
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
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: customersKeys.pendingList() })
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
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: customersKeys.pendingList() })
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
    onSuccess: (result) => {
      if (result.status === 'queued') {
        void queryClient.invalidateQueries({ queryKey: customersKeys.pendingList() })
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
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: customersKeys.lists() })
      if (result.status === 'queued') {
        void queryClient.invalidateQueries({ queryKey: customersKeys.pendingList() })
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
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: customersKeys.lists() })
      if (result.status === 'queued') {
        void queryClient.invalidateQueries({ queryKey: customersKeys.pendingList() })
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
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: customersKeys.lists() })
      if (result.status === 'queued') {
        void queryClient.invalidateQueries({ queryKey: customersKeys.pendingList() })
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
