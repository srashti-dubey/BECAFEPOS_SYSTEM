import type { CustomerStatus } from '@/features/customers/types'

export const CUSTOMER_STATUS_OPTIONS: Array<{ value: CustomerStatus; label: string }> = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export function getCustomerStatusLabel(value: CustomerStatus) {
  return CUSTOMER_STATUS_OPTIONS.find((option) => option.value === value)?.label ?? value
}

