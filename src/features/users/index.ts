export * from './api'
export * from './components'
export * from './constants'
export * from './hooks'
// No `export * from './pages'` — page components are lazy-loaded by direct path in
// app/routes.tsx; re-exporting them here (transitively through the global features
// barrel) pulls every feature's pages into the main bundle and defeats that code-splitting.
export * from './schemas'
export * from './services'
export * from './types'
