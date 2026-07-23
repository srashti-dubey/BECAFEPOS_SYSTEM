/* eslint-disable react-refresh/only-export-components -- router config file: mixes lazy() component
   refs and JSX with the exported route tree data, it is not meant to be an HMR boundary */
import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, type RouteObject } from 'react-router-dom'
import { LoadingState } from '@/app/LoadingState'
import ErrorBoundary from '@/app/ErrorBoundary'
import { PublicLayout } from '@/layouts/PublicLayout'
import { ProtectedLayout } from '@/layouts/ProtectedLayout'
import { ProtectedRoute } from '@/auth/guards'
import { ROUTES } from '@/constants/routes'
import LoginPage from '@/pages/LoginPage'
import LogoutPage from '@/pages/LogoutPage'

const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const UnauthorizedPage = lazy(() => import('@/pages/UnauthorizedPage'))
// hygen:lazy-imports (do not remove — new module page imports are injected after this line)

// Hand-built POS module — offline-first (Dexie), doesn't fit the CRUD-module generator shape.
const POSPage = lazy(() => import('@/features/pos/pages/POSPage'))
const PaymentPage = lazy(() => import('@/features/pos/pages/PaymentPage'))

const withSuspense = (element: ReactNode) => (
  <Suspense fallback={<LoadingState />}>
    <ErrorBoundary>{element}</ErrorBoundary>
  </Suspense>
)

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to={ROUTES.pos} replace />,
  },
  {
    path: '/admin',
    element: <PublicLayout />,
    children: [
      {
        path: 'login',
        element: withSuspense(<LoginPage />),
      },
      {
        path: 'logout',
        element: withSuspense(<LogoutPage />),
      },
    ],
  },
  {
    path: '/unauthorized',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: withSuspense(<UnauthorizedPage />),
      },
    ],
  },
  {
    path: '/admin',
    element: <ProtectedRoute />,
    children: [
      {
        element: <ProtectedLayout />,
        children: [
          {
            index: true,
            element: <Navigate to={ROUTES.pos} replace />,
          },
          // hygen:feature-routes (do not remove — new module route blocks are injected after this line)
          {
            path: 'pos',
            children: [
              {
                index: true,
                element: withSuspense(<POSPage />),
              },
              {
                path: 'payment',
                element: withSuspense(<PaymentPage />),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: withSuspense(<NotFoundPage />),
  },
]
