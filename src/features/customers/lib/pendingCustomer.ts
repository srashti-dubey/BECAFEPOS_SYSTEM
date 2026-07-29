import type { PendingCustomer } from '@/database/appDatabase'
import type { Customer } from '@/features/customers/types'

const PENDING_ID_PREFIX = 'pending-'

// Local-only Dexie drafts have no server id yet, so they're given a synthetic string id in this
// shape purely so they can flow through the same Customer-shaped table/columns as real records.
// Only meaningful for 'create' ops — those always carry `data` (see CustomerRepository.queueCreate).
export function toPendingDisplayCustomer(pending: PendingCustomer): Customer {
  return {
    ...pending.data!,
    id: `${PENDING_ID_PREFIX}${pending.id}`,
    approval: null,
    record_approval_status: null,
    created_at: pending.createdAt,
    updated_at: pending.createdAt,
    isPendingSync: true,
  }
}

// Takes `id: unknown`, not `string` — real customer ids are typed as `string` but the API can
// hand back a bare number for them, and this must not throw when called on one of those.
export function parsePendingCustomerId(id: unknown): number | null {
  const idStr = typeof id === 'string' ? id : String(id)
  if (!idStr.startsWith(PENDING_ID_PREFIX)) {
    return null
  }
  const numericId = Number(idStr.slice(PENDING_ID_PREFIX.length))
  return Number.isFinite(numericId) ? numericId : null
}
