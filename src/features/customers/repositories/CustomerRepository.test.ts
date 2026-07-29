import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Dexie from 'dexie'
import type { CreateCustomerInput } from '@/features/customers/types'

const sampleInput: CreateCustomerInput = {
  name: 'Draft Name',
  mobile: '9876543210',
  email: 'draft@example.com',
  remarks: 'Draft',
  loyalty_points: 5,
  can_notify: 'yes',
  branch_id: 1,
  status: 'active',
}

function deleteDatabase() {
  return new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase('BeCafeDB')
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
    request.onblocked = () => resolve()
  })
}

describe('CustomerRepository (real Dexie/IndexedDB via fake-indexeddb)', () => {
  beforeEach(async () => {
    await deleteDatabase()
    vi.resetModules()
  })

  afterEach(async () => {
    await deleteDatabase()
  })

  it('persists a queued create to the pendingCustomers IndexedDB table', async () => {
    const { customerRepository } = await import('./CustomerRepository')
    const { db } = await import('@/database/appDatabase')
    await db.open()

    await customerRepository.queueCreate(sampleInput)

    const rows = await customerRepository.getPending()
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ operation: 'create', synced: false, data: sampleInput })

    const raw = await db.pendingCustomers.toArray()
    expect(raw).toHaveLength(1)
  })

  it('upserts a second queued update for the same customer instead of duplicating it', async () => {
    const { customerRepository } = await import('./CustomerRepository')
    const { db } = await import('@/database/appDatabase')
    await db.open()

    await customerRepository.queueUpdate('cus-1', sampleInput)
    await customerRepository.queueUpdate('cus-1', { ...sampleInput, name: 'Updated Name' })

    const rows = await customerRepository.getPending()
    expect(rows).toHaveLength(1)
    expect(rows[0].data?.name).toBe('Updated Name')
  })

  it('a queued delete discards a pending update for the same customer', async () => {
    const { customerRepository } = await import('./CustomerRepository')
    const { db } = await import('@/database/appDatabase')
    await db.open()

    await customerRepository.queueUpdate('cus-1', sampleInput)
    await customerRepository.queueDelete('cus-1')

    const rows = await customerRepository.getPending()
    expect(rows).toHaveLength(1)
    expect(rows[0].operation).toBe('delete')
  })

  it('queues an approval decision keyed by requestId, not customerId', async () => {
    const { customerRepository } = await import('./CustomerRepository')
    const { db } = await import('@/database/appDatabase')
    await db.open()

    await customerRepository.queueApprovalDecision(101, 'approve')

    const rows = await customerRepository.getPending()
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ operation: 'approve', requestId: 101, synced: false })
  })

  it('a second decision on the same request supersedes the first instead of queuing both', async () => {
    const { customerRepository } = await import('./CustomerRepository')
    const { db } = await import('@/database/appDatabase')
    await db.open()

    await customerRepository.queueApprovalDecision(101, 'approve')
    await customerRepository.queueApprovalDecision(101, 'reject', 'changed my mind')

    const rows = await customerRepository.getPending()
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ operation: 'reject', requestId: 101, comment: 'changed my mind' })
  })

  it('migrates a pre-existing v13 row (no operation field) to operation: create on upgrade to v14', async () => {
    // Simulates a browser that already has data from before the create/update/delete queue was
    // generalized — the whole point of the v14 .upgrade() migration in appDatabase.ts.
    const legacyDb = new Dexie('BeCafeDB')
    legacyDb.version(13).stores({
      products: 'id,name,category',
      cart: '++id,productId',
      orders: '++id,orderNo,synced',
      pendingCustomers: '++id,synced',
    })
    await legacyDb.open()
    await legacyDb.table('pendingCustomers').add({
      data: sampleInput,
      synced: false,
      createdAt: '2025-01-01T00:00:00.000Z',
    })
    legacyDb.close()

    const { customerRepository } = await import('./CustomerRepository')
    const { db } = await import('@/database/appDatabase')
    await db.open()

    const rows = await customerRepository.getPending()
    expect(rows).toHaveLength(1)
    expect(rows[0].operation).toBe('create')
    expect(rows[0].data).toEqual(sampleInput)
  })
})
