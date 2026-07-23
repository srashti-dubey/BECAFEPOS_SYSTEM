import type { StateStatus } from '@/features/states/types'

export const STATE_STATUS_OPTIONS: Array<{ value: StateStatus; label: string }> = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export function getStateStatusLabel(value: StateStatus) {
  return STATE_STATUS_OPTIONS.find((option) => option.value === value)?.label ?? value
}

