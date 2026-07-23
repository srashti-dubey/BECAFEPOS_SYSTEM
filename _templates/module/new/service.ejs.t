---
to: src/features/<%= folder %>/services/<%= singularCamel %>Service.ts
---
import { <%= pluralCamel %>Api } from '@/features/<%= folder %>/api/<%= pluralCamel %>Api'
import type { Create<%= singular %>Input, Update<%= singular %>Input, <%= plural %>ListParams } from '@/features/<%= folder %>/types'

export const <%= singularCamel %>Service = {
  list: (params: <%= plural %>ListParams) => <%= pluralCamel %>Api.list(params),
  activeList: (params: <%= plural %>ListParams) => <%= pluralCamel %>Api.activeList(params),
  getById: (id: string) => <%= pluralCamel %>Api.getById(id),
  create: (input: Create<%= singular %>Input) => <%= pluralCamel %>Api.create(input),
  update: (input: Update<%= singular %>Input) => <%= pluralCamel %>Api.update(input),
  remove: (id: string) => <%= pluralCamel %>Api.remove(id),
  approve: (requestId: number | string, comment?: string) => <%= pluralCamel %>Api.approve(requestId, comment),
  reject: (requestId: number | string, comment?: string) => <%= pluralCamel %>Api.reject(requestId, comment),
  exportExcel: (params: <%= plural %>ListParams) => <%= pluralCamel %>Api.exportExcel(params),
}
