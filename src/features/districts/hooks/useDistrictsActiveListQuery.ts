import { useQuery } from '@tanstack/react-query'
import { districtService } from '@/features/districts/services/districtService'
import { districtsKeys } from '@/features/districts/hooks/districtsKeys'
import type { DistrictsListParams } from '@/features/districts/types'

// Infrastructure only — nothing in this module calls this yet. Wire it up when another module
// needs districts as a dropdown/reference-data source (see the generator README's
// "Standard module APIs" section), the same way roles/active/list exists today.
export function useDistrictsActiveListQuery(params: DistrictsListParams) {
  return useQuery({
    queryKey: districtsKeys.activeList(params),
    queryFn: () => districtService.activeList(params),
  })
}
