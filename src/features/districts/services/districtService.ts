import { districtsApi } from '@/features/districts/api/districtsApi'
import type { CreateDistrictInput, UpdateDistrictInput, DistrictsListParams } from '@/features/districts/types'

export const districtService = {
  list: (params: DistrictsListParams) => districtsApi.list(params),
  activeList: (params: DistrictsListParams) => districtsApi.activeList(params),
  getById: (id: string) => districtsApi.getById(id),
  create: (input: CreateDistrictInput) => districtsApi.create(input),
  update: (input: UpdateDistrictInput) => districtsApi.update(input),
  remove: (id: string) => districtsApi.remove(id),
  approve: (requestId: number | string, comment?: string) => districtsApi.approve(requestId, comment),
  reject: (requestId: number | string, comment?: string) => districtsApi.reject(requestId, comment),
  exportExcel: (params: DistrictsListParams) => districtsApi.exportExcel(params),
}
