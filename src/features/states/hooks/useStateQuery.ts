import { useQuery } from '@tanstack/react-query'
import { stateService } from '@/features/states/services/stateService'
import { statesKeys } from '@/features/states/hooks/statesKeys'

export function useStateQuery(id: string | undefined) {
  return useQuery({
    queryKey: statesKeys.detail(id ?? ''),
    queryFn: () => stateService.getById(id as string),
    enabled: Boolean(id),
  })
}
