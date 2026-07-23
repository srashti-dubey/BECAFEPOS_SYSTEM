---
to: src/features/<%= folder %>/hooks/index.ts
---
export * from './<%= pluralCamel %>Keys'
export * from './use<%= plural %>Query'
export * from './use<%= plural %>ActiveListQuery'
export * from './use<%= singular %>Query'
export * from './use<%= singular %>Mutations'
