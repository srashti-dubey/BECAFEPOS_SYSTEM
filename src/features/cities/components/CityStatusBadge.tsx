import { StatusBadge } from '@/components/shared/StatusBadge'
import type { CityStatus } from '@/features/cities/types'

const TONE_BY_STATUS: Record<CityStatus, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
  'active': 'success',
  'inactive': 'success',
}

const LABEL_BY_STATUS: Record<CityStatus, string> = {
  'active': 'Active',
  'inactive': 'Inactive',
}

export function CityStatusBadge({ status }: { status: CityStatus }) {
  return <StatusBadge tone={TONE_BY_STATUS[status]}>{LABEL_BY_STATUS[status]}</StatusBadge>
}
