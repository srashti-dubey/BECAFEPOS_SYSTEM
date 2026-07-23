import { useQuery } from '@tanstack/react-query'
import { districtService } from '@/features/districts/services/districtService'
import { districtsKeys } from '@/features/districts/hooks/districtsKeys'

export function useDistrictQuery(id: string | undefined) {
  return useQuery({
    queryKey: districtsKeys.detail(id ?? ''),
    queryFn: () => districtService.getById(id as string),
    enabled: Boolean(id),
  })
}
