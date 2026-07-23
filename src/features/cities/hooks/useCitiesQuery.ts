import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { cityService } from '@/features/cities/services/cityService'
import { citiesKeys } from '@/features/cities/hooks/citiesKeys'
import type { CitiesListParams } from '@/features/cities/types'

export function useCitiesQuery(params: CitiesListParams) {
  return useQuery({
    queryKey: citiesKeys.list(params),
    queryFn: () => cityService.list(params),
    placeholderData: keepPreviousData,
  })
}
