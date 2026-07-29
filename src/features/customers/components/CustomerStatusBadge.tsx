import { StatusBadge } from '@/components/shared/StatusBadge'
import type { CustomerStatus } from '@/features/customers/types'

const TONE_BY_STATUS: Record<CustomerStatus, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
  'active': 'success',
  'inactive': 'success',
}

const LABEL_BY_STATUS: Record<CustomerStatus, string> = {
  'active': 'Active',
  'inactive': 'Inactive',
}

export function CustomerStatusBadge({ status }: { status: CustomerStatus }) {
  return <StatusBadge tone={TONE_BY_STATUS[status]}>{LABEL_BY_STATUS[status]}</StatusBadge>
}
