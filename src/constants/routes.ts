export const ROUTES = {
  home: '/',
  login: '/admin/login',
  logout: '/admin/logout',
  unauthorized: '/unauthorized',
  app: '/admin',

  pos: '/admin/pos',
  posPayment: '/admin/pos/payment',

  customers: '/admin/customers',
  customerDetail: (id: string) => `/admin/customers/${id}`,
} as const
