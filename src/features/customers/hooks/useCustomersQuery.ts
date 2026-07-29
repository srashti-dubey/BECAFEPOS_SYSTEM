import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { customerService } from '@/features/customers/services/customerService'
import { customersKeys } from '@/features/customers/hooks/customersKeys'
import type { CustomersListParams } from '@/features/customers/types'

export function useCustomersQuery(params: CustomersListParams) {
  return useQuery({
    queryKey: customersKeys.list(params),
    queryFn: () => customerService.list(params),
    placeholderData: keepPreviousData,
  })
}
