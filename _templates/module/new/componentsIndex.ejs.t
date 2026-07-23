---
to: src/features/<%= folder %>/components/index.ts
---
<%_ if (hasStatusField) { _%>
export * from './<%= singular %>StatusBadge'
<%_ } _%>
<%_ if (!isDynamicForm) { _%>
export * from './columns'
<%_ } _%>
export * from './<%= singular %>FormModal'
