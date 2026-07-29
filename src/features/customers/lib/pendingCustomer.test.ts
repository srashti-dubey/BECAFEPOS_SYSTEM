import { describe, expect, it } from 'vitest'
import { parsePendingCustomerId } from './pendingCustomer'

describe('parsePendingCustomerId', () => {
  it('extracts the numeric id from a local draft id', () => {
    expect(parsePendingCustomerId('pending-7')).toBe(7)
  })

  it('returns null for a real string id', () => {
    expect(parsePendingCustomerId('cus-1')).toBeNull()
  })

  // Customer.id is typed as `string`, but the API has been observed to return a bare number for
  // it — this must not throw (regression: `id.startsWith is not a function` crashed the whole
  // customers table for every server-backed row).
  it('does not throw when given a non-string id', () => {
    expect(parsePendingCustomerId(1 as unknown as string)).toBeNull()
  })
})
