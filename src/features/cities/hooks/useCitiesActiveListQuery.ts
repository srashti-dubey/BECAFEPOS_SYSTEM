import { useQuery } from '@tanstack/react-query'
import { cityService } from '@/features/cities/services/cityService'
import { citiesKeys } from '@/features/cities/hooks/citiesKeys'
import type { CitiesListParams } from '@/features/cities/types'

// Infrastructure only — nothing in this module calls this yet. Wire it up when another module
// needs cities as a dropdown/reference-data source (see the generator README's
// "Standard module APIs" section), the same way roles/active/list exists today.
export function useCitiesActiveListQuery(params: CitiesListParams) {
  return useQuery({
    queryKey: citiesKeys.activeList(params),
    queryFn: () => cityService.activeList(params),
  })
}
