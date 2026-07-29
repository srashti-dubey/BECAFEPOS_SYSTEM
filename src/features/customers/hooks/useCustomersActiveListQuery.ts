import { useQuery } from '@tanstack/react-query'
import { customerService } from '@/features/customers/services/customerService'
import { customersKeys } from '@/features/customers/hooks/customersKeys'
import type { CustomersListParams } from '@/features/customers/types'

// Infrastructure only — nothing in this module calls this yet. Wire it up when another module
// needs customers as a dropdown/reference-data source (see the generator README's
// "Standard module APIs" section), the same way roles/active/list exists today.
export function useCustomersActiveListQuery(params: CustomersListParams) {
  return useQuery({
    queryKey: customersKeys.activeList(params),
    queryFn: () => customerService.activeList(params),
  })
}
