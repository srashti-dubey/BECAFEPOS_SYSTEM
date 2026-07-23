import { statesApi } from '@/features/states/api/statesApi'
import type { CreateStateInput, UpdateStateInput, StatesListParams } from '@/features/states/types'

export const stateService = {
  list: (params: StatesListParams) => statesApi.list(params),
  activeList: (params: StatesListParams) => statesApi.activeList(params),
  getById: (id: string) => statesApi.getById(id),
  create: (input: CreateStateInput) => statesApi.create(input),
  update: (input: UpdateStateInput) => statesApi.update(input),
  remove: (id: string) => statesApi.remove(id),
  approve: (requestId: number | string, comment?: string) => statesApi.approve(requestId, comment),
  reject: (requestId: number | string, comment?: string) => statesApi.reject(requestId, comment),
  exportExcel: (params: StatesListParams) => statesApi.exportExcel(params),
}
