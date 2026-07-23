import { useMutation, useQueryClient } from '@tanstack/react-query'
import { stateService } from '@/features/states/services/stateService'
import { statesKeys } from '@/features/states/hooks/statesKeys'
import { notificationService } from '@/services/notificationService'
import type {
  CreateStateInput,
  UpdateStateInput,
  State,
  StatesListParams,
  StatesListResult,
} from '@/features/states/types'

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function useCreateStateMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateStateInput) => stateService.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: statesKeys.lists() })
      notificationService.success('State created successfully')
    },
    onError: (error) => {
      notificationService.error(errorMessage(error, 'Unable to create state'))
    },
  })
}

export function useUpdateStateMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateStateInput) => stateService.update(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: statesKeys.detail(input.id) })
      const previousState = queryClient.getQueryData<State>(statesKeys.detail(input.id))

      if (previousState) {
        queryClient.setQueryData<State>(statesKeys.detail(input.id), { ...previousState, ...input })
      }

      queryClient.setQueriesData<StatesListResult>({ queryKey: statesKeys.lists() }, (current) => {
        if (!current) {
          return current
        }
        return { ...current, data: current.data.map((record) => (record.id === input.id ? { ...record, ...input } : record)) }
      })

      return { previousState }
    },
    onError: (error, input, context) => {
      if (context?.previousState) {
        queryClient.setQueryData(statesKeys.detail(input.id), context.previousState)
      }
      void queryClient.invalidateQueries({ queryKey: statesKeys.lists() })
      notificationService.error(errorMessage(error, 'Unable to update state'))
    },
    onSuccess: (updatedState) => {
      queryClient.setQueryData(statesKeys.detail(updatedState.id), updatedState)
      notificationService.success('State updated successfully')
    },
    onSettled: (_data, _error, input) => {
      void queryClient.invalidateQueries({ queryKey: statesKeys.detail(input.id) })
      void queryClient.invalidateQueries({ queryKey: statesKeys.lists() })
    },
  })
}

export function useDeleteStateMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => stateService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: statesKeys.lists() })
      notificationService.success('State deleted successfully')
    },
    onError: (error) => {
      notificationService.error(errorMessage(error, 'Unable to delete state'))
    },
  })
}

export function useApproveStateMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (requestId: number | string) => stateService.approve(requestId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: statesKeys.lists() })
      notificationService.success('Request approved successfully')
    },
    onError: (error) => {
      notificationService.error(errorMessage(error, 'Unable to approve request'))
    },
  })
}

export function useRejectStateMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ requestId, comment }: { requestId: number | string; comment?: string }) =>
      stateService.reject(requestId, comment),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: statesKeys.lists() })
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
function downloadStateBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function useExportStatesExcel() {
  return useMutation({
    mutationFn: async (params: StatesListParams) => {
      const blob = await stateService.exportExcel(params)
      downloadStateBlob(blob, 'states.xlsx')
    },
    onError: (error) => {
      notificationService.error(errorMessage(error, 'Unable to export states'))
    },
  })
}
