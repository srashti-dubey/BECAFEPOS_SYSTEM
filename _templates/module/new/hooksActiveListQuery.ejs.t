---
to: src/features/<%= folder %>/hooks/use<%= plural %>ActiveListQuery.ts
---
import { useQuery } from '@tanstack/react-query'
import { <%= singularCamel %>Service } from '@/features/<%= folder %>/services/<%= singularCamel %>Service'
import { <%= pluralCamel %>Keys } from '@/features/<%= folder %>/hooks/<%= pluralCamel %>Keys'
import type { <%= plural %>ListParams } from '@/features/<%= folder %>/types'

// Infrastructure only — nothing in this module calls this yet. Wire it up when another module
// needs <%= pluralCamel %> as a dropdown/reference-data source (see the generator README's
// "Standard module APIs" section), the same way roles/active/list exists today.
export function use<%= plural %>ActiveListQuery(params: <%= plural %>ListParams) {
  return useQuery({
    queryKey: <%= pluralCamel %>Keys.activeList(params),
    queryFn: () => <%= singularCamel %>Service.activeList(params),
  })
}
