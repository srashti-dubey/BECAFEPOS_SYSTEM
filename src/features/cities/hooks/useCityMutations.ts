import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cityService } from '@/features/cities/services/cityService'
import { citiesKeys } from '@/features/cities/hooks/citiesKeys'
import { notificationService } from '@/services/notificationService'
import type {
  CreateCityInput,
  UpdateCityInput,
  City,
  CitiesListParams,
  CitiesListResult,
} from '@/features/cities/types'

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function useCreateCityMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateCityInput) => cityService.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: citiesKeys.lists() })
      notificationService.success('City created successfully')
    },
    onError: (error) => {
      notificationService.error(errorMessage(error, 'Unable to create city'))
    },
  })
}

export function useUpdateCityMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateCityInput) => cityService.update(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: citiesKeys.detail(input.id) })
      const previousCity = queryClient.getQueryData<City>(citiesKeys.detail(input.id))

      if (previousCity) {
        queryClient.setQueryData<City>(citiesKeys.detail(input.id), { ...previousCity, ...input })
      }

      queryClient.setQueriesData<CitiesListResult>({ queryKey: citiesKeys.lists() }, (current) => {
        if (!current) {
          return current
        }
        return { ...current, data: current.data.map((record) => (record.id === input.id ? { ...record, ...input } : record)) }
      })

      return { previousCity }
    },
    onError: (error, input, context) => {
      if (context?.previousCity) {
        queryClient.setQueryData(citiesKeys.detail(input.id), context.previousCity)
      }
      void queryClient.invalidateQueries({ queryKey: citiesKeys.lists() })
      notificationService.error(errorMessage(error, 'Unable to update city'))
    },
    onSuccess: (updatedCity) => {
      queryClient.setQueryData(citiesKeys.detail(updatedCity.id), updatedCity)
      notificationService.success('City updated successfully')
    },
    onSettled: (_data, _error, input) => {
      void queryClient.invalidateQueries({ queryKey: citiesKeys.detail(input.id) })
      void queryClient.invalidateQueries({ queryKey: citiesKeys.lists() })
    },
  })
}

export function useDeleteCityMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => cityService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: citiesKeys.lists() })
      notificationService.success('City deleted successfully')
    },
    onError: (error) => {
      notificationService.error(errorMessage(error, 'Unable to delete city'))
    },
  })
}

export function useApproveCityMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (requestId: number | string) => cityService.approve(requestId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: citiesKeys.lists() })
      notificationService.success('Request approved successfully')
    },
    onError: (error) => {
      notificationService.error(errorMessage(error, 'Unable to approve request'))
    },
  })
}

export function useRejectCityMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ requestId, comment }: { requestId: number | string; comment?: string }) =>
      cityService.reject(requestId, comment),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: citiesKeys.lists() })
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
function downloadCityBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function useExportCitiesExcel() {
  return useMutation({
    mutationFn: async (params: CitiesListParams) => {
      const blob = await cityService.exportExcel(params)
      downloadCityBlob(blob, 'cities.xlsx')
    },
    onError: (error) => {
      notificationService.error(errorMessage(error, 'Unable to export cities'))
    },
  })
}
