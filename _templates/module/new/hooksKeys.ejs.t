---
to: src/features/<%= folder %>/hooks/<%= pluralCamel %>Keys.ts
---
import type { <%= plural %>ListParams } from '@/features/<%= folder %>/types'

export const <%= pluralCamel %>Keys = {
  all: ['<%= pluralCamel %>'] as const,
  lists: () => [...<%= pluralCamel %>Keys.all, 'list'] as const,
  list: (params: <%= plural %>ListParams) => [...<%= pluralCamel %>Keys.lists(), params] as const,
  activeLists: () => [...<%= pluralCamel %>Keys.all, 'active-list'] as const,
  activeList: (params: <%= plural %>ListParams) => [...<%= pluralCamel %>Keys.activeLists(), params] as const,
  details: () => [...<%= pluralCamel %>Keys.all, 'detail'] as const,
  detail: (id: string) => [...<%= pluralCamel %>Keys.details(), id] as const,
}
