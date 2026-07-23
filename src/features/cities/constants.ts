import type { CityStatus } from '@/features/cities/types'

export const CITY_STATUS_OPTIONS: Array<{ value: CityStatus; label: string }> = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export function getCityStatusLabel(value: CityStatus) {
  return CITY_STATUS_OPTIONS.find((option) => option.value === value)?.label ?? value
}

