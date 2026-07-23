import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { districtService } from '@/features/districts/services/districtService'
import { districtsKeys } from '@/features/districts/hooks/districtsKeys'
import type { DistrictsListParams } from '@/features/districts/types'

export function useDistrictsQuery(params: DistrictsListParams) {
  return useQuery({
    queryKey: districtsKeys.list(params),
    queryFn: () => districtService.list(params),
    placeholderData: keepPreviousData,
  })
}
