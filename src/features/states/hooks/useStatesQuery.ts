import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { stateService } from '@/features/states/services/stateService'
import { statesKeys } from '@/features/states/hooks/statesKeys'
import type { StatesListParams } from '@/features/states/types'

export function useStatesQuery(params: StatesListParams) {
  return useQuery({
    queryKey: statesKeys.list(params),
    queryFn: () => stateService.list(params),
    placeholderData: keepPreviousData,
  })
}
