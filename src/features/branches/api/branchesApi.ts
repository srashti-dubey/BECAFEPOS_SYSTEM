import { BaseService } from '@/services/baseService'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import type { BranchesActiveListResult } from '@/features/branches/types'

class BranchesApi extends BaseService {
  activeList() {
    return this.get<BranchesActiveListResult>(API_ENDPOINTS.branchesActiveList)
  }
}

export const branchesApi = new BranchesApi()
