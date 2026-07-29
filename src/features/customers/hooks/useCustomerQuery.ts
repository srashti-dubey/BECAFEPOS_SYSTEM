import { useQuery } from '@tanstack/react-query'
import { customerService } from '@/features/customers/services/customerService'
import { customersKeys } from '@/features/customers/hooks/customersKeys'

export function useCustomerQuery(id: string | undefined) {
  return useQuery({
    queryKey: customersKeys.detail(id ?? ''),
    queryFn: () => customerService.getById(id as string),
    enabled: Boolean(id),
  })
}
