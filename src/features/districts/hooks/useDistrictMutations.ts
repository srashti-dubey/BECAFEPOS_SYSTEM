import { useMutation, useQueryClient } from '@tanstack/react-query'
import { districtService } from '@/features/districts/services/districtService'
import { districtsKeys } from '@/features/districts/hooks/districtsKeys'
import { notificationService } from '@/services/notificationService'
import type {
  CreateDistrictInput,
  UpdateDistrictInput,
  District,
  DistrictsListParams,
  DistrictsListResult,
} from '@/features/districts/types'

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function useCreateDistrictMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateDistrictInput) => districtService.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: districtsKeys.lists() })
      notificationService.success('District created successfully')
    },
    onError: (error) => {
      notificationService.error(errorMessage(error, 'Unable to create district'))
    },
  })
}

export function useUpdateDistrictMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateDistrictInput) => districtService.update(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: districtsKeys.detail(input.id) })
      const previousDistrict = queryClient.getQueryData<District>(districtsKeys.detail(input.id))

      if (previousDistrict) {
        queryClient.setQueryData<District>(districtsKeys.detail(input.id), { ...previousDistrict, ...input })
      }

      queryClient.setQueriesData<DistrictsListResult>({ queryKey: districtsKeys.lists() }, (current) => {
        if (!current) {
          return current
        }
        return { ...current, data: current.data.map((record) => (record.id === input.id ? { ...record, ...input } : record)) }
      })

      return { previousDistrict }
    },
    onError: (error, input, context) => {
      if (context?.previousDistrict) {
        queryClient.setQueryData(districtsKeys.detail(input.id), context.previousDistrict)
      }
      void queryClient.invalidateQueries({ queryKey: districtsKeys.lists() })
      notificationService.error(errorMessage(error, 'Unable to update district'))
    },
    onSuccess: (updatedDistrict) => {
      queryClient.setQueryData(districtsKeys.detail(updatedDistrict.id), updatedDistrict)
      notificationService.success('District updated successfully')
    },
    onSettled: (_data, _error, input) => {
      void queryClient.invalidateQueries({ queryKey: districtsKeys.detail(input.id) })
      void queryClient.invalidateQueries({ queryKey: districtsKeys.lists() })
    },
  })
}

export function useDeleteDistrictMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => districtService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: districtsKeys.lists() })
      notificationService.success('District deleted successfully')
    },
    onError: (error) => {
      notificationService.error(errorMessage(error, 'Unable to delete district'))
    },
  })
}

export function useApproveDistrictMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (requestId: number | string) => districtService.approve(requestId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: districtsKeys.lists() })
      notificationService.success('Request approved successfully')
    },
    onError: (error) => {
      notificationService.error(errorMessage(error, 'Unable to approve request'))
    },
  })
}

export function useRejectDistrictMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ requestId, comment }: { requestId: number | string; comment?: string }) =>
      districtService.reject(requestId, comment),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: districtsKeys.lists() })
      notificationService.success('Request rejected successfully')
    },
    onError: (error) => {
      notificationService.error(errorMessage(error, 'Unable to reject request'))
    },
  })
}

// No shared file-download utility in the repo yet — a plain temporary <a> with an object URL is
// the standard way to trigger a browser download from an in-memory blob (see
// role-permissions/hooks/useExportRolePermissionsExcel.ts for the same pattern).
function downloadDistrictBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function useExportDistrictsExcel() {
  return useMutation({
    mutationFn: async (params: DistrictsListParams) => {
      const blob = await districtService.exportExcel(params)
      downloadDistrictBlob(blob, 'districts.xlsx')
    },
    onError: (error) => {
      notificationService.error(errorMessage(error, 'Unable to export districts'))
    },
  })
}
