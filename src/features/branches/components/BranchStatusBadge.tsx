import { StatusBadge } from '@/components/shared/StatusBadge'
import type { BranchStatus } from '@/features/branches/types'

const TONE_BY_STATUS: Record<BranchStatus, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
  'active': 'success',
  'inactive': 'danger',
}

const LABEL_BY_STATUS: Record<BranchStatus, string> = {
  'active': 'Active',
  'inactive': 'Inactive',
}

export function BranchStatusBadge({ status }: { status: BranchStatus }) {
  return <StatusBadge tone={TONE_BY_STATUS[status]}>{LABEL_BY_STATUS[status]}</StatusBadge>
}
