---
to: src/features/<%= folder %>/hooks/use<%= singular %>Query.ts
---
import { useQuery } from '@tanstack/react-query'
import { <%= singularCamel %>Service } from '@/features/<%= folder %>/services/<%= singularCamel %>Service'
import { <%= pluralCamel %>Keys } from '@/features/<%= folder %>/hooks/<%= pluralCamel %>Keys'

export function use<%= singular %>Query(id: string | undefined) {
  return useQuery({
    queryKey: <%= pluralCamel %>Keys.detail(id ?? ''),
    queryFn: () => <%= singularCamel %>Service.getById(id as string),
    enabled: Boolean(id),
  })
}
