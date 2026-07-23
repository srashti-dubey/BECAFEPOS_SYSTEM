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
import { RoutePermissionGuard } from '@/auth/guards'

const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const UnauthorizedPage = lazy(() => import('@/pages/UnauthorizedPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const TestDynamicProductsPage = lazy(() => import('@/pages/TestDynamicProductsPage'))
const TestDynamicFormsPage = lazy(() => import('@/pages/TestDynamicFormsPage'))
const UserListPage = lazy(() => import('@/features/users/pages/UserListPage'))
const UserViewPage = lazy(() => import('@/features/users/pages/UserViewPage'))
// hygen:lazy-imports (do not remove — new module page imports are injected after this line)
const CityListPage = lazy(() => import('@/features/cities/pages/CityListPage'))
const CityViewPage = lazy(() => import('@/features/cities/pages/CityViewPage'))


const DistrictListPage = lazy(() => import('@/features/districts/pages/DistrictListPage'))
const DistrictViewPage = lazy(() => import('@/features/districts/pages/DistrictViewPage'))

const StateListPage = lazy(() => import('@/features/states/pages/StateListPage'))
const StateViewPage = lazy(() => import('@/features/states/pages/StateViewPage'))

const BranchListPage = lazy(() => import('@/features/branches/pages/BranchListPage'))
const BranchViewPage = lazy(() => import('@/features/branches/pages/BranchViewPage'))

const MenuListPage = lazy(() => import('@/features/menus/pages/MenuListPage'))
const MenuViewPage = lazy(() => import('@/features/menus/pages/MenuViewPage'))

const RoleListPage = lazy(() => import('@/features/roles/pages/RoleListPage'))
const RoleViewPage = lazy(() => import('@/features/roles/pages/RoleViewPage'))

// Hand-built, not hygen-generated — see _templates/module/new/README.md for why.
const RolePermissionsPage = lazy(() => import('@/features/role-permissions/pages/RolePermissionsPage'))

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
    element: <Navigate to={ROUTES.dashboard} replace />,
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
            element: <Navigate to={ROUTES.dashboard} replace />,
          },
          {
            path: 'dashboard',
            element: withSuspense(<DashboardPage />),
          },
          {
            path: 'test-dynamic-products',
            element: withSuspense(<TestDynamicProductsPage />),
          },
          {
            path: 'test-dynamic-forms',
            element: withSuspense(<TestDynamicFormsPage />),
          },
          {
            path: 'users',
            children: [
              {
                index: true,
                element: withSuspense(
                  <RoutePermissionGuard route={ROUTES.users} action="view">
                    <UserListPage />
                  </RoutePermissionGuard>,
                ),
              },
              {
                path: ':id',
                element: withSuspense(
                  <RoutePermissionGuard route={ROUTES.users} action="view">
                    <UserViewPage />
                  </RoutePermissionGuard>,
                ),
              },
            ],
          },
          // hygen:feature-routes (do not remove — new module route blocks are injected after this line)
          {
            path: 'cities',
            children: [
              {
                index: true,
                element: withSuspense(
                  <RoutePermissionGuard route={ROUTES.cities} action="view">
                    <CityListPage />
                  </RoutePermissionGuard>,
                ),
              },
              {
                path: ':id',
                element: withSuspense(
                  <RoutePermissionGuard route={ROUTES.cities} action="view">
                    <CityViewPage />
                  </RoutePermissionGuard>,
                ),
              },
            ],
          },


          {
            path: 'districts',
            children: [
              {
                index: true,
                element: withSuspense(
                  <RoutePermissionGuard route={ROUTES.districts} action="view">
                    <DistrictListPage />
                  </RoutePermissionGuard>,
                ),
              },
              {
                path: ':id',
                element: withSuspense(
                  <RoutePermissionGuard route={ROUTES.districts} action="view">
                    <DistrictViewPage />
                  </RoutePermissionGuard>,
                ),
              },
            ],
          },

          {
            path: 'states',
            children: [
              {
                index: true,
                element: withSuspense(
                  <RoutePermissionGuard route={ROUTES.states} action="view">
                    <StateListPage />
                  </RoutePermissionGuard>,
                ),
              },
              {
                path: ':id',
                element: withSuspense(
                  <RoutePermissionGuard route={ROUTES.states} action="view">
                    <StateViewPage />
                  </RoutePermissionGuard>,
                ),
              },
            ],
          },

          {
            path: 'branches',
            children: [
              {
                index: true,
                element: withSuspense(
                  <RoutePermissionGuard route={ROUTES.branches} action="view">
                    <BranchListPage />
                  </RoutePermissionGuard>,
                ),
              },
              {
                path: ':id',
                element: withSuspense(
                  <RoutePermissionGuard route={ROUTES.branches} action="view">
                    <BranchViewPage />
                  </RoutePermissionGuard>,
                ),
              },
            ],
          },

          {
            path: 'menus',
            children: [
              {
                index: true,
                element: withSuspense(
                  <RoutePermissionGuard route={ROUTES.menus} action="view">
                    <MenuListPage />
                  </RoutePermissionGuard>,
                ),
              },
              {
                path: ':id',
                element: withSuspense(
                  <RoutePermissionGuard route={ROUTES.menus} action="view">
                    <MenuViewPage />
                  </RoutePermissionGuard>,
                ),
              },
            ],
          },

          {
            path: 'roles',
            children: [
              {
                index: true,
                element: withSuspense(
                  <RoutePermissionGuard route={ROUTES.roles} action="view">
                    <RoleListPage />
                  </RoutePermissionGuard>,
                ),
              },
              {
                path: ':id',
                element: withSuspense(
                  <RoutePermissionGuard route={ROUTES.roles} action="view">
                    <RoleViewPage />
                  </RoutePermissionGuard>,
                ),
              },
            ],
          },

          {
            path: 'rbac-permissions',
            element: withSuspense(
              <RoutePermissionGuard route={ROUTES.rolePermissions} action="view">
                <RolePermissionsPage />
              </RoutePermissionGuard>,
            ),
          },

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
