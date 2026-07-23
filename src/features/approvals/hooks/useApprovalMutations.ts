import { useMutation, useQueryClient } from '@tanstack/react-query'
import { approvalService } from '@/features/approvals/services/approvalService'
import { notificationService } from '@/services/notificationService'

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function useApproveRequestMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (requestId: number) => approvalService.approve(requestId),
    onSuccess: () => {
      void queryClient.invalidateQueries()
      notificationService.success('Request approved successfully')
    },
    onError: (error) => {
      notificationService.error(errorMessage(error, 'Unable to approve request'))
    },
  })
}

export function useRejectRequestMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { requestId: number; comment?: string }) => approvalService.reject(input),
    onSuccess: () => {
      void queryClient.invalidateQueries()
      notificationService.success('Request rejected successfully')
    },
    onError: (error) => {
      notificationService.error(errorMessage(error, 'Unable to reject request'))
    },
  })
}
