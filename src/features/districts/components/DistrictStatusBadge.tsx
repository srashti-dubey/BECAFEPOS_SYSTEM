import { StatusBadge } from '@/components/shared/StatusBadge'
import type { DistrictStatus } from '@/features/districts/types'

const TONE_BY_STATUS: Record<DistrictStatus, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
  'active': 'success',
  'inactive': 'success',
}

const LABEL_BY_STATUS: Record<DistrictStatus, string> = {
  'active': 'Active',
  'inactive': 'Inactive',
}

export function DistrictStatusBadge({ status }: { status: DistrictStatus }) {
  return <StatusBadge tone={TONE_BY_STATUS[status]}>{LABEL_BY_STATUS[status]}</StatusBadge>
}
