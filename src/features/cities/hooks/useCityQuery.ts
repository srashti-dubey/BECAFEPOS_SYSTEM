import { useQuery } from '@tanstack/react-query'
import { cityService } from '@/features/cities/services/cityService'
import { citiesKeys } from '@/features/cities/hooks/citiesKeys'

export function useCityQuery(id: string | undefined) {
  return useQuery({
    queryKey: citiesKeys.detail(id ?? ''),
    queryFn: () => cityService.getById(id as string),
    enabled: Boolean(id),
  })
}
