import 'fake-indexeddb/auto'
import { AxiosError } from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { CreateCustomerInput } from '@/features/customers/types'
import { errorHandler } from '@/services/errorHandler'

const sampleInput: CreateCustomerInput = {
  name: 'Probe Name',
  mobile: '9999999999',
  email: 'probe@example.com',
  remarks: 'probe',
  loyalty_points: 1,
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

function setOnline(value: boolean) {
  Object.defineProperty(navigator, 'onLine', { value, configurable: true })
}

// customersApi.create/update/remove go through BaseService -> axios -> the real network stack.
// Mocked here purely so "online" attempts don't actually try to hit a server from this test —
// the point is to prove the *branching* (online vs offline) and the *Dexie write* are correct,
// not to test the HTTP layer itself (that's exercised by the real backend, out of reach here).
vi.mock('@/features/customers/api/customersApi', () => ({
  customersApi: {
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    approve: vi.fn(),
    reject: vi.fn(),
  },
}))

describe('customerService offline branching (real Dexie/IndexedDB via fake-indexeddb)', () => {
  beforeEach(async () => {
    await deleteDatabase()
    vi.resetModules()
    vi.clearAllMocks()
    setOnline(true)
  })

  afterEach(async () => {
    await deleteDatabase()
    setOnline(true)
  })

  it('while offline, create() never calls the API and instead writes a row to Dexie', async () => {
    setOnline(false)

    const { customerService } = await import('./customerService')
    const { customersApi } = await import('@/features/customers/api/customersApi')
    const { db } = await import('@/database/appDatabase')
    await db.open()

    const result = await customerService.create(sampleInput)

    expect(result).toEqual({ status: 'queued' })
    expect(customersApi.create).not.toHaveBeenCalled()

    const rows = await db.pendingCustomers.toArray()
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ operation: 'create', synced: false, data: sampleInput })
  })

  // Regression test: navigator.onLine reflects the network interface's own state, not server
  // reachability. It stays true when the interface is up but the request never gets a response
  // (backend down, DNS failure, timeout) — that must still queue to Dexie, not rethrow.
  it('while navigator.onLine is true but the request never reaches the server, create() still queues to Dexie', async () => {
    setOnline(true)

    const { customerService } = await import('./customerService')
    const { customersApi } = await import('@/features/customers/api/customersApi')
    const { db } = await import('@/database/appDatabase')
    await db.open()

    const networkError = errorHandler.handle(new AxiosError('Network Error', 'ERR_NETWORK'))
    vi.mocked(customersApi.create).mockRejectedValue(networkError)

    const result = await customerService.create(sampleInput)

    expect(result).toEqual({ status: 'queued' })

    const rows = await db.pendingCustomers.toArray()
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ operation: 'create', synced: false, data: sampleInput })
  })

  it('while navigator.onLine is true and the server responds with a rejection, create() rethrows instead of queuing', async () => {
    setOnline(true)

    const { customerService } = await import('./customerService')
    const { customersApi } = await import('@/features/customers/api/customersApi')
    const { db } = await import('@/database/appDatabase')
    await db.open()

    const serverError = new Error('Validation failed')
    vi.mocked(customersApi.create).mockRejectedValue(serverError)

    await expect(customerService.create(sampleInput)).rejects.toThrow('Validation failed')

    const rows = await db.pendingCustomers.toArray()
    expect(rows).toHaveLength(0)
  })

  it('while online, create() calls the API and writes nothing to Dexie', async () => {
    setOnline(true)

    const { customerService } = await import('./customerService')
    const { customersApi } = await import('@/features/customers/api/customersApi')
    const { db } = await import('@/database/appDatabase')
    await db.open()

    vi.mocked(customersApi.create).mockResolvedValue({ id: 'cus-1', ...sampleInput } as never)

    const result = await customerService.create(sampleInput)

    expect(result.status).toBe('created')
    expect(customersApi.create).toHaveBeenCalledTimes(1)

    const rows = await db.pendingCustomers.toArray()
    expect(rows).toHaveLength(0)
  })

  it('while offline, update() and remove() also queue to Dexie instead of calling the API', async () => {
    setOnline(false)

    const { customerService } = await import('./customerService')
    const { customersApi } = await import('@/features/customers/api/customersApi')
    const { db } = await import('@/database/appDatabase')
    await db.open()

    const updateResult = await customerService.update({ id: 'cus-1', ...sampleInput })
    const removeResult = await customerService.remove('cus-2')

    expect(updateResult).toEqual({ status: 'queued' })
    expect(removeResult).toEqual({ status: 'queued' })
    expect(customersApi.update).not.toHaveBeenCalled()
    expect(customersApi.remove).not.toHaveBeenCalled()

    const rows = await db.pendingCustomers.toArray()
    expect(rows).toHaveLength(2)
    expect(rows.map((r) => r.operation).sort()).toEqual(['delete', 'update'])
  })

  it('while offline, approve() and reject() queue to Dexie by requestId instead of calling the API', async () => {
    setOnline(false)

    const { customerService } = await import('./customerService')
    const { customersApi } = await import('@/features/customers/api/customersApi')
    const { db } = await import('@/database/appDatabase')
    await db.open()

    const approveResult = await customerService.approve(101)
    const rejectResult = await customerService.reject(102, 'not eligible')

    expect(approveResult).toEqual({ status: 'queued' })
    expect(rejectResult).toEqual({ status: 'queued' })
    expect(customersApi.approve).not.toHaveBeenCalled()
    expect(customersApi.reject).not.toHaveBeenCalled()

    const rows = await db.pendingCustomers.toArray()
    expect(rows).toHaveLength(2)
    expect(rows).toContainEqual(expect.objectContaining({ operation: 'approve', requestId: 101 }))
    expect(rows).toContainEqual(expect.objectContaining({ operation: 'reject', requestId: 102, comment: 'not eligible' }))
  })

  it('while online, approve() calls the API and writes nothing to Dexie', async () => {
    setOnline(true)

    const { customerService } = await import('./customerService')
    const { customersApi } = await import('@/features/customers/api/customersApi')
    const { db } = await import('@/database/appDatabase')
    await db.open()

    vi.mocked(customersApi.approve).mockResolvedValue(undefined as never)

    const result = await customerService.approve(101)

    expect(result).toEqual({ status: 'approved' })
    expect(customersApi.approve).toHaveBeenCalledTimes(1)

    const rows = await db.pendingCustomers.toArray()
    expect(rows).toHaveLength(0)
  })
})
