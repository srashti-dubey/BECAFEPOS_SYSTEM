import { citiesApi } from '@/features/cities/api/citiesApi'
import type { CreateCityInput, UpdateCityInput, CitiesListParams } from '@/features/cities/types'

export const cityService = {
  list: (params: CitiesListParams) => citiesApi.list(params),
  activeList: (params: CitiesListParams) => citiesApi.activeList(params),
  getById: (id: string) => citiesApi.getById(id),
  create: (input: CreateCityInput) => citiesApi.create(input),
  update: (input: UpdateCityInput) => citiesApi.update(input),
  remove: (id: string) => citiesApi.remove(id),
  approve: (requestId: number | string, comment?: string) => citiesApi.approve(requestId, comment),
  reject: (requestId: number | string, comment?: string) => citiesApi.reject(requestId, comment),
  exportExcel: (params: CitiesListParams) => citiesApi.exportExcel(params),
}
