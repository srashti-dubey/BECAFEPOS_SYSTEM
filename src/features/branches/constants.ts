import type { BranchStatus } from '@/features/branches/types'

export const BRANCH_STATUS_OPTIONS: Array<{ value: BranchStatus; label: string }> = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export function getBranchStatusLabel(value: BranchStatus) {
  return BRANCH_STATUS_OPTIONS.find((option) => option.value === value)?.label ?? value
}

