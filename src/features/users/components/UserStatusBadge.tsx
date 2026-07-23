import { StatusBadge } from '@/components/shared/StatusBadge'
import type { UserStatus } from '@/features/users/types'

const TONE_BY_STATUS: Record<UserStatus, 'success' | 'neutral' | 'warning'> = {
  active: 'success',
  inactive: 'neutral',
  pending: 'warning',
}

const LABEL_BY_STATUS: Record<UserStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
}

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return <StatusBadge tone={TONE_BY_STATUS[status]}>{LABEL_BY_STATUS[status]}</StatusBadge>
}
