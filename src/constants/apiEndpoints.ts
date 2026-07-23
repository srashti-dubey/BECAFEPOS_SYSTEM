export const API_ENDPOINTS = {
  login: '/auth/login',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
  myMenuPermissions: '/permissions/me',
  // hygen:endpoints (do not remove — new module endpoints are injected after this line)

  posProducts: '/products',
  posOrders: '/orders',
} as const
