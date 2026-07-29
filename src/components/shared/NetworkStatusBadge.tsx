import { StatusBadge } from '@/components/shared/StatusBadge'
import { useNetwork } from '@/hooks'

export function NetworkStatusBadge() {
  const online = useNetwork()

  return <StatusBadge tone={online ? 'success' : 'warning'}>{online ? 'Online' : 'Offline'}</StatusBadge>
}
