export const API_ENDPOINTS = {
  login: '/auth/login',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
  myMenuPermissions: '/permissions/me',
  // hygen:endpoints (do not remove — new module endpoints are injected after this line)
  customers: '/customers',
  customer: (id: string) => `/customers/${id}`,
  customersActiveList: '/customers/active/list',
  customersExportExcel: '/customers/export/excel',
  customersApprovalApprove: (requestId: number | string) => `/customers/approvals/${requestId}/approve`,
  customersApprovalReject: (requestId: number | string) => `/customers/approvals/${requestId}/reject`,

  branchesActiveList: '/branches/active/list',

  posProducts: '/products',
  posOrders: '/orders',
  posPayments: '/payments',
  inventory: '/inventory',
} as const
