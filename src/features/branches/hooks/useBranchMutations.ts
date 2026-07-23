import { useMutation, useQueryClient } from '@tanstack/react-query'
import { branchService } from '@/features/branches/services/branchService'
import { branchesKeys } from '@/features/branches/hooks/branchesKeys'
import { notificationService } from '@/services/notificationService'
import type { CreateBranchInput, UpdateBranchInput, Branch, BranchesListResult } from '@/features/branches/types'

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function useCreateBranchMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateBranchInput) => branchService.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: branchesKeys.lists() })
      notificationService.success('Branch created successfully')
    },
    onError: (error) => {
      notificationService.error(errorMessage(error, 'Unable to create branch'))
    },
  })
}

export function useUpdateBranchMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateBranchInput) => branchService.update(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: branchesKeys.detail(input.id) })
      const previousBranch = queryClient.getQueryData<Branch>(branchesKeys.detail(input.id))

      if (previousBranch) {
        queryClient.setQueryData<Branch>(branchesKeys.detail(input.id), { ...previousBranch, ...input })
      }

      queryClient.setQueriesData<BranchesListResult>({ queryKey: branchesKeys.lists() }, (current) => {
        if (!current) {
          return current
        }
        return { ...current, data: current.data.map((record) => (record.id === input.id ? { ...record, ...input } : record)) }
      })

      return { previousBranch }
    },
    onError: (error, input, context) => {
      if (context?.previousBranch) {
        queryClient.setQueryData(branchesKeys.detail(input.id), context.previousBranch)
      }
      void queryClient.invalidateQueries({ queryKey: branchesKeys.lists() })
      notificationService.error(errorMessage(error, 'Unable to update branch'))
    },
    onSuccess: (updatedBranch) => {
      queryClient.setQueryData(branchesKeys.detail(updatedBranch.id), updatedBranch)
      notificationService.success('Branch updated successfully')
    },
    onSettled: (_data, _error, input) => {
      void queryClient.invalidateQueries({ queryKey: branchesKeys.detail(input.id) })
      void queryClient.invalidateQueries({ queryKey: branchesKeys.lists() })
    },
  })
}

export function useDeleteBranchMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => branchService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: branchesKeys.lists() })
      notificationService.success('Branch deleted successfully')
    },
    onError: (error) => {
      notificationService.error(errorMessage(error, 'Unable to delete branch'))
    },
  })
}

export function useApproveBranchMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (requestId: number | string) => branchService.approve(requestId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: branchesKeys.lists() })
      notificationService.success('Request approved successfully')
    },
    onError: (error) => {
      notificationService.error(errorMessage(error, 'Unable to approve request'))
    },
  })
}

export function useRejectBranchMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ requestId, comment }: { requestId: number | string; comment?: string }) =>
      branchService.reject(requestId, comment),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: branchesKeys.lists() })
      notificationService.success('Request rejected successfully')
    },
    onError: (error) => {
      notificationService.error(errorMessage(error, 'Unable to reject request'))
    },
  })
}
