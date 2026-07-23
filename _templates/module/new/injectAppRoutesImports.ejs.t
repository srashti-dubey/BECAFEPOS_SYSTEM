---
to: src/app/routes.tsx
inject: true
after: hygen:lazy-imports
skip_if: features/<%= folder %>/pages/<%= singular %>ListPage
---
const <%= singular %>ListPage = lazy(() => import('@/features/<%= folder %>/pages/<%= singular %>ListPage'))
const <%= singular %>ViewPage = lazy(() => import('@/features/<%= folder %>/pages/<%= singular %>ViewPage'))
