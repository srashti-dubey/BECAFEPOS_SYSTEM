import { StatusBadge } from '@/components/shared/StatusBadge'
import type { StateStatus } from '@/features/states/types'

const TONE_BY_STATUS: Record<StateStatus, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
  'active': 'success',
  'inactive': 'success',
}

const LABEL_BY_STATUS: Record<StateStatus, string> = {
  'active': 'Active',
  'inactive': 'Inactive',
}

export function StateStatusBadge({ status }: { status: StateStatus }) {
  return <StatusBadge tone={TONE_BY_STATUS[status]}>{LABEL_BY_STATUS[status]}</StatusBadge>
}
