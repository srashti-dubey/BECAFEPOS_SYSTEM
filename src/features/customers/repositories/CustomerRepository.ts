import { db, type PendingCustomer } from '@/database/appDatabase'

class CustomerRepository {
  getAll() {
    return db.pendingCustomers.toArray()
  }

  getPending() {
    return db.pendingCustomers.filter((customer) => !customer.synced).toArray()
  }

  markSynced(id: number) {
    return db.pendingCustomers.update(id, {
      synced: true,
    })
  }

  // Edits the payload of an op still sitting in the queue (e.g. a not-yet-synced create draft,
  // or refining an update before it's had a chance to sync) — identified by its local Dexie id.
  update(id: number, data: PendingCustomer['data']) {
    return db.pendingCustomers.update(id, { data })
  }

  // Discards a queued op before it ever reaches the server, by its local Dexie id.
  remove(id: number) {
    return db.pendingCustomers.delete(id)
  }

  queueCreate(data: NonNullable<PendingCustomer['data']>) {
    return db.pendingCustomers.add({
      operation: 'create',
      data,
      synced: false,
      createdAt: new Date().toISOString(),
    })
  }

  // Upserts: a customer edited twice while offline should sync as one PUT with the latest data,
  // not two — so an existing unsynced 'update' for this customerId is overwritten in place
  // rather than queuing a second op.
  async queueUpdate(customerId: string, data: NonNullable<PendingCustomer['data']>) {
    const existing = await this.findPendingOp(customerId, 'update')

    if (existing) {
      await db.pendingCustomers.update(existing.id!, { data })
      return
    }

    await db.pendingCustomers.add({
      operation: 'update',
      customerId,
      data,
      synced: false,
      createdAt: new Date().toISOString(),
    })
  }

  // A delete supersedes any not-yet-synced edit to the same customer — the edit would just be
  // thrown away by the server anyway, so it's dropped here rather than synced first.
  async queueDelete(customerId: string) {
    const existingUpdate = await this.findPendingOp(customerId, 'update')
    if (existingUpdate) {
      await db.pendingCustomers.delete(existingUpdate.id!)
    }

    await db.pendingCustomers.add({
      operation: 'delete',
      customerId,
      synced: false,
      createdAt: new Date().toISOString(),
    })
  }

  // A second decision on the same request supersedes the first (e.g. approve queued, then
  // reversed to reject before ever syncing) — only the latest outcome should apply, so any
  // existing queued 'approve' or 'reject' for this requestId is discarded before adding the new
  // one, same upsert-by-replace shape as queueUpdate/queueDelete above.
  async queueApprovalDecision(requestId: number, operation: 'approve' | 'reject', comment?: string) {
    const existing = await db.pendingCustomers
      .where('requestId')
      .equals(requestId)
      .filter((record) => !record.synced && (record.operation === 'approve' || record.operation === 'reject'))
      .first()

    if (existing) {
      await db.pendingCustomers.delete(existing.id!)
    }

    await db.pendingCustomers.add({
      operation,
      requestId,
      comment,
      synced: false,
      createdAt: new Date().toISOString(),
    })
  }

  private findPendingOp(customerId: string, operation: PendingCustomer['operation']) {
    return db.pendingCustomers
      .where('customerId')
      .equals(customerId)
      .filter((record) => !record.synced && record.operation === operation)
      .first()
  }
}

export const customerRepository = new CustomerRepository()
