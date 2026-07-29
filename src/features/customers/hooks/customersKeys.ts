import type { CustomersListParams } from '@/features/customers/types'

export const customersKeys = {
  all: ['customers'] as const,
  lists: () => [...customersKeys.all, 'list'] as const,
  list: (params: CustomersListParams) => [...customersKeys.lists(), params] as const,
  activeLists: () => [...customersKeys.all, 'active-list'] as const,
  activeList: (params: CustomersListParams) => [...customersKeys.activeLists(), params] as const,
  details: () => [...customersKeys.all, 'detail'] as const,
  detail: (id: string) => [...customersKeys.details(), id] as const,
  pendingList: () => [...customersKeys.all, 'pending'] as const,
}
