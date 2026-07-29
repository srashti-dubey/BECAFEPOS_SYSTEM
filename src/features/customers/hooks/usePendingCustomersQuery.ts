import { useQuery } from '@tanstack/react-query'
import { customerRepository } from '@/features/customers/repositories/CustomerRepository'
import { customersKeys } from '@/features/customers/hooks/customersKeys'

export function usePendingCustomersQuery() {
  return useQuery({
    queryKey: customersKeys.pendingList(),
    queryFn: () => customerRepository.getPending(),
  })
}
