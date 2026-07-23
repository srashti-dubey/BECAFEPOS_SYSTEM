---
to: src/app/routes.tsx
inject: true
after: hygen:feature-routes
skip_if: "path: '<%= folder %>'"
---
          {
            path: '<%= folder %>',
            children: [
              {
                index: true,
                element: withSuspense(
                  <RoutePermissionGuard route={ROUTES.<%= pluralCamel %>} action="view">
                    <<%= singular %>ListPage />
                  </RoutePermissionGuard>,
                ),
              },
              {
                path: ':id',
                element: withSuspense(
                  <RoutePermissionGuard route={ROUTES.<%= pluralCamel %>} action="view">
                    <<%= singular %>ViewPage />
                  </RoutePermissionGuard>,
                ),
              },
            ],
          },
