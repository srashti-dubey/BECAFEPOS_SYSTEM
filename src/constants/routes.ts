export const ROUTES = {
  home: '/',
  login: '/admin/login',
  logout: '/admin/logout',
  unauthorized: '/unauthorized',
  app: '/admin',
  dashboard: '/admin/dashboard',
  users: '/admin/users',
  userDetail: (id: string) => `/admin/users/${id}`,
  // hygen:routes (do not remove — new module routes are injected after this line)
  cities: '/admin/cities',
  cityDetail: (id: string) => `/admin/cities/${id}`,


  districts: '/admin/districts',
  districtDetail: (id: string) => `/admin/districts/${id}`,

  states: '/admin/states',
  stateDetail: (id: string) => `/admin/states/${id}`,

  branches: '/admin/branches',
  branchDetail: (id: string) => `/admin/branches/${id}`,

  menus: '/admin/menus',
  menuDetail: (id: string) => `/admin/menus/${id}`,

  roles: '/admin/roles',
  roleDetail: (id: string) => `/admin/roles/${id}`,

  // Hand-built page (not hygen-generated — see the module generator README for why this
  // doesn't fit the CRUD-module shape). Gated by RoutePermissionGuard, not PermissionGuard —
  // this string must exactly match the real backend's configured Menu.route for this page
  // (confirmed via a real GET /permissions/me response), not just the app's own URL structure,
  // since it's used as the lookup key into the route-permission map, not just for navigation.
  rolePermissions: '/admin/rbac-permissions',

  // Dynamic form engine test pages
  testDynamicProducts: '/admin/test-dynamic-products',
  testDynamicForms: '/admin/test-dynamic-forms',

  pos: '/admin/pos',
  posPayment: '/admin/pos/payment',

} as const
