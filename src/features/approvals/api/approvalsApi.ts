import { BaseService } from '@/services/baseService'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'

export type RejectApprovalInput = {
  requestId: number
  comment?: string
}

class ApprovalsApi extends BaseService {
  approve(requestId: number) {
    return this.post<void>(API_ENDPOINTS.approvalApprove(requestId))
  }

  reject({ requestId, comment }: RejectApprovalInput) {
    return this.post<void>(API_ENDPOINTS.approvalReject(requestId), {
      comment: comment?.trim() || undefined,
    })
  }
}

export const approvalsApi = new ApprovalsApi()
