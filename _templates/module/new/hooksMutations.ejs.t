---
to: src/features/<%= folder %>/hooks/use<%= singular %>Mutations.ts
---
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { <%= singularCamel %>Service } from '@/features/<%= folder %>/services/<%= singularCamel %>Service'
import { <%= pluralCamel %>Keys } from '@/features/<%= folder %>/hooks/<%= pluralCamel %>Keys'
import { notificationService } from '@/services/notificationService'
import type {
  Create<%= singular %>Input,
  Update<%= singular %>Input,
  <%= singular %>,
  <%= plural %>ListParams,
  <%= plural %>ListResult,
} from '@/features/<%= folder %>/types'

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function useCreate<%= singular %>Mutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: Create<%= singular %>Input) => <%= singularCamel %>Service.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: <%= pluralCamel %>Keys.lists() })
      notificationService.success('<%= singular %> created successfully')
    },
    onError: (error) => {
      notificationService.error(errorMessage(error, 'Unable to create <%= singularCamel %>'))
    },
  })
}

export function useUpdate<%= singular %>Mutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: Update<%= singular %>Input) => <%= singularCamel %>Service.update(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: <%= pluralCamel %>Keys.detail(input.id) })
      const previous<%= singular %> = queryClient.getQueryData<<%= singular %>>(<%= pluralCamel %>Keys.detail(input.id))

      if (previous<%= singular %>) {
        queryClient.setQueryData<<%= singular %>>(<%= pluralCamel %>Keys.detail(input.id), { ...previous<%= singular %>, ...input })
      }

      queryClient.setQueriesData<<%= plural %>ListResult>({ queryKey: <%= pluralCamel %>Keys.lists() }, (current) => {
        if (!current) {
          return current
        }
        return { ...current, data: current.data.map((record) => (record.id === input.id ? { ...record, ...input } : record)) }
      })

      return { previous<%= singular %> }
    },
    onError: (error, input, context) => {
      if (context?.previous<%= singular %>) {
        queryClient.setQueryData(<%= pluralCamel %>Keys.detail(input.id), context.previous<%= singular %>)
      }
      void queryClient.invalidateQueries({ queryKey: <%= pluralCamel %>Keys.lists() })
      notificationService.error(errorMessage(error, 'Unable to update <%= singularCamel %>'))
    },
    onSuccess: (updated<%= singular %>) => {
      queryClient.setQueryData(<%= pluralCamel %>Keys.detail(updated<%= singular %>.id), updated<%= singular %>)
      notificationService.success('<%= singular %> updated successfully')
    },
    onSettled: (_data, _error, input) => {
      void queryClient.invalidateQueries({ queryKey: <%= pluralCamel %>Keys.detail(input.id) })
      void queryClient.invalidateQueries({ queryKey: <%= pluralCamel %>Keys.lists() })
    },
  })
}

export function useDelete<%= singular %>Mutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => <%= singularCamel %>Service.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: <%= pluralCamel %>Keys.lists() })
      notificationService.success('<%= singular %> deleted successfully')
    },
    onError: (error) => {
      notificationService.error(errorMessage(error, 'Unable to delete <%= singularCamel %>'))
    },
  })
}

export function useApprove<%= singular %>Mutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (requestId: number | string) => <%= singularCamel %>Service.approve(requestId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: <%= pluralCamel %>Keys.lists() })
      notificationService.success('Request approved successfully')
    },
    onError: (error) => {
      notificationService.error(errorMessage(error, 'Unable to approve request'))
    },
  })
}

export function useReject<%= singular %>Mutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ requestId, comment }: { requestId: number | string; comment?: string }) =>
      <%= singularCamel %>Service.reject(requestId, comment),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: <%= pluralCamel %>Keys.lists() })
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
function download<%= singular %>Blob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function useExport<%= plural %>Excel() {
  return useMutation({
    mutationFn: async (params: <%= plural %>ListParams) => {
      const blob = await <%= singularCamel %>Service.exportExcel(params)
      download<%= singular %>Blob(blob, '<%= folder %>.xlsx')
    },
    onError: (error) => {
      notificationService.error(errorMessage(error, 'Unable to export <%= pluralCamel %>'))
    },
  })
}
