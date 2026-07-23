import { approvalsApi, type RejectApprovalInput } from '@/features/approvals/api/approvalsApi'

export const approvalService = {
  approve: (requestId: number) => approvalsApi.approve(requestId),
  reject: (input: RejectApprovalInput) => approvalsApi.reject(input),
}
