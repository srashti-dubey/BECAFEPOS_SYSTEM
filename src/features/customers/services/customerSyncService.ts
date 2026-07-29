import { customerRepository } from '@/features/customers/repositories/CustomerRepository'
import { customersApi } from '@/features/customers/api/customersApi'
import type { PendingCustomer } from '@/database/appDatabase'

export interface CustomerSyncResult {
  synced: number
  failed: number
}

async function syncOne(pending: PendingCustomer) {
  switch (pending.operation) {
    case 'create':
      await customersApi.create(pending.data!)
      return
    case 'update':
      await customersApi.update({ id: pending.customerId!, ...pending.data! })
      return
    case 'delete':
      await customersApi.remove(pending.customerId!)
      return
    case 'approve':
      await customersApi.approve(pending.requestId!, pending.comment)
      return
    case 'reject':
      await customersApi.reject(pending.requestId!, pending.comment)
      return
  }
}

export async function syncPendingCustomers(): Promise<CustomerSyncResult> {
  if (!navigator.onLine) {
    return { synced: 0, failed: 0 }
  }

  const pending = await customerRepository.getPending()

  let synced = 0
  let failed = 0

  for (const item of pending) {
    try {
      await syncOne(item)
      await customerRepository.markSynced(item.id!)
      synced += 1
    } catch (error) {
      failed += 1
      console.error(`${item.operation} failed to sync for ${item.customerId ?? item.requestId ?? item.data?.name}:`, error)
    }
  }

  return { synced, failed }
}
