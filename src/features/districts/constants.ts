import type { DistrictStatus } from '@/features/districts/types'

export const DISTRICT_STATUS_OPTIONS: Array<{ value: DistrictStatus; label: string }> = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export function getDistrictStatusLabel(value: DistrictStatus) {
  return DISTRICT_STATUS_OPTIONS.find((option) => option.value === value)?.label ?? value
}

