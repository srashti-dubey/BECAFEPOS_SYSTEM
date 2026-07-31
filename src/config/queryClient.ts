import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30,
      // React Query's default 'online' mode pauses queryFn until the browser is back online —
      // it never even runs while offline. Offline-capable features (e.g. customers) branch on
      // navigator.onLine and fall back to Dexie themselves (see customerService.ts), so that
      // pause just blocks their own offline handling from ever executing. Features with no
      // offline path simply fail fast instead (via apiClient's timeout/network error), which
      // surfaces as a normal error toast rather than a mutation stuck pending forever.
      networkMode: 'always',
    },
    mutations: {
      retry: 0,
      networkMode: 'always',
    },
  },
})
