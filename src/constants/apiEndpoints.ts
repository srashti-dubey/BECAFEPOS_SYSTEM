export const API_ENDPOINTS = {
  login: '/auth/login',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
  myMenuPermissions: '/permissions/me',
  users: '/users',
  user: (id: string) => `/users/${id}`,
  // hygen:endpoints (do not remove — new module endpoints are injected after this line)
  cities: '/cities',
  city: (id: string) => `/cities/${id}`,
  citiesActiveList: '/cities/active/list',
  citiesExportExcel: '/cities/export/excel',
  citiesApprovalApprove: (requestId: number | string) => `/cities/approvals/${requestId}/approve`,
  citiesApprovalReject: (requestId: number | string) => `/cities/approvals/${requestId}/reject`,


  districts: '/districts',
  district: (id: string) => `/districts/${id}`,
  districtsActiveList: '/districts/active/list',
  districtsExportExcel: '/districts/export/excel',
  districtsApprovalApprove: (requestId: number | string) => `/districts/approvals/${requestId}/approve`,
  districtsApprovalReject: (requestId: number | string) => `/districts/approvals/${requestId}/reject`,

  states: '/states',
  state: (id: string) => `/states/${id}`,
  statesActiveList: '/states/active/list',
  statesExportExcel: '/states/export/excel',
  statesApprovalApprove: (requestId: number | string) => `/states/approvals/${requestId}/approve`,
  statesApprovalReject: (requestId: number | string) => `/states/approvals/${requestId}/reject`,

  branches: '/branches',
  branchesTree: '/branches/tree',
  branch: (id: string) => `/branches/${id}`,
  branchesApprovalApprove: (requestId: number | string) => `/branches/approvals/${requestId}/approve`,
  branchesApprovalReject: (requestId: number | string) => `/branches/approvals/${requestId}/reject`,

  menus: '/menus',
  menusTree: '/menus/tree',
  menusActiveList: '/menus/active/list',
  menu: (id: string) => `/menus/${id}`,

  roles: '/roles',
  rolesActiveList: '/roles/active/list',
  role: (id: string) => `/roles/${id}`,

  rolePermissions: '/permissions',
  rolePermissionsExportExcel: '/permissions/export/excel',

  approvalApprove: (requestId: number | string) => `/approvals/${requestId}/approve`,
  approvalReject: (requestId: number | string) => `/approvals/${requestId}/reject`,

  posProducts: '/products',
  posOrders: '/orders',

} as const
