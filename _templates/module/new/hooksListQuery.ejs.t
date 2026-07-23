---
to: src/features/<%= folder %>/hooks/use<%= plural %>Query.ts
---
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { <%= singularCamel %>Service } from '@/features/<%= folder %>/services/<%= singularCamel %>Service'
import { <%= pluralCamel %>Keys } from '@/features/<%= folder %>/hooks/<%= pluralCamel %>Keys'
import type { <%= plural %>ListParams } from '@/features/<%= folder %>/types'

export function use<%= plural %>Query(params: <%= plural %>ListParams) {
  return useQuery({
    queryKey: <%= pluralCamel %>Keys.list(params),
    queryFn: () => <%= singularCamel %>Service.list(params),
    placeholderData: keepPreviousData,
  })
}
