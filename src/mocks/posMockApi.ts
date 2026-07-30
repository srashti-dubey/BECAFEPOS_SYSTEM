import ordersSeed from './data/orders.json'
import paymentsSeed from './data/payments.json'
import type { Order, Payment } from '@/database/appDatabase'

// Stands in for /orders and /payments until the real backend implements them (neither exists in
// its OpenAPI spec today — see the memory note on this). Persists to localStorage on top of the
// seed JSON so submitted orders/payments survive a page reload, the same "dummy JSON database"
// role dynamicFormsApi.ts's cookie-backed store plays for the demo-forms feature.
const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))

const ORDERS_STORAGE_KEY = 'mock-orders-db'
const PAYMENTS_STORAGE_KEY = 'mock-payments-db'

function readStore<T>(key: string, seed: T[]): T[] {
  const raw = window.localStorage.getItem(key)
  if (!raw) {
    return seed
  }
  try {
    return JSON.parse(raw) as T[]
  } catch {
    return seed
  }
}

function writeStore<T>(key: string, data: T[]) {
  window.localStorage.setItem(key, JSON.stringify(data))
}

export async function mockSaveOrder(order: Order): Promise<Order> {
  await delay(150)

  const orders = readStore<Order>(ORDERS_STORAGE_KEY, ordersSeed as Order[])
  const nextId = orders.reduce((max, existing) => Math.max(max, existing.id ?? 0), 0) + 1
  const saved: Order = { ...order, id: order.id ?? nextId }

  orders.push(saved)
  writeStore(ORDERS_STORAGE_KEY, orders)

  return saved
}

export async function mockSavePayment(payment: Payment): Promise<Payment> {
  await delay(150)

  const payments = readStore<Payment>(PAYMENTS_STORAGE_KEY, paymentsSeed as Payment[])
  payments.push(payment)
  writeStore(PAYMENTS_STORAGE_KEY, payments)

  return payment
}
