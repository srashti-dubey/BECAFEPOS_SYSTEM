import { useQuery } from '@tanstack/react-query'
import { stateService } from '@/features/states/services/stateService'
import { statesKeys } from '@/features/states/hooks/statesKeys'
import type { StatesListParams } from '@/features/states/types'

// Infrastructure only — nothing in this module calls this yet. Wire it up when another module
// needs states as a dropdown/reference-data source (see the generator README's
// "Standard module APIs" section), the same way roles/active/list exists today.
export function useStatesActiveListQuery(params: StatesListParams) {
  return useQuery({
    queryKey: statesKeys.activeList(params),
    queryFn: () => stateService.activeList(params),
  })
}
