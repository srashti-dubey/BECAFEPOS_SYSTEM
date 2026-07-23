---
to: src/features/<%= folder %>/index.ts
---
export * from './api'
export * from './components'
<%_ if (hasEnumFields) { _%>
export * from './constants'
<%_ } _%>
export * from './hooks'
// No `export * from './pages'` — see the note in features/users/index.ts.
<%_ if (!isDynamicForm) { _%>
export * from './schemas'
<%_ } _%>
export * from './services'
export * from './types'
