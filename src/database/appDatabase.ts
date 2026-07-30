import Dexie, { type Table } from 'dexie'
import type { CreateCustomerInput } from '@/features/customers/types'

export interface Product {
  id: number
  name: string
  category: string
  price: number
  image: string
}

export interface CartItem {
  id?: number
  productId: number
  qty: number
  price: number
}

export interface Order {
  id?: number
  orderNo: string
  items: CartItem[]
  total: number
  synced: boolean
}

// Column names match the backend Payment table's real wire fields exactly (PascalCase/
// underscore mix as given), not this app's usual camelCase convention — see customersApi.ts's
// note on `create()`/`update()` for why field names are kept verbatim rather than translated.
export interface Payment {
  ID: string // GUID, generated client-side via crypto.randomUUID() at creation time.
  PaymentModeID: number
  AmountPaid: number
  Ack_Received: boolean
  Cashier_UserID: string
  SGSTValue: number
  CGSTValue: number
  Comments?: string
  CustomerID?: string
  OrderID: string
  RefundID?: string
  PaymentInfo_JSON?: string
  transaction_id?: string
  CreatedDate: string
  CreatedBy: string
  UpdatedDate?: string
  UpdatedBy?: string
  // Set locally when this record is pushed to the server — not part of the backend payload sent
  // in the sync request itself, purely a local record of when the sync succeeded.
  syc_datetime?: string
  synced: boolean
}

// Column names match the backend InventoryGlobal table's real wire fields exactly, same
// verbatim-naming rationale as Payment above.
export interface InventoryGlobal {
  ID: string // GUID, generated client-side via crypto.randomUUID() at creation time.
  SupplierID: string
  Product_SKU_ID: string
  Quantity: number
  ExpiryDate?: string
  SentTo_MaterialRequestByROID?: string
  transaction_id?: string
  CreatedDate: string
  CreatedBy: string
  UpdatedDate?: string
  UpdatedBy?: string
  // Set locally when this record is pushed to the server — see Payment.syc_datetime above.
  syc_datetime?: string
  synced: boolean
}

// The backend's real Order header/metadata record — deliberately named `OrderRecord`, not
// `Order`, to avoid colliding with the existing `Order` interface above (the simple local
// cart-items-and-total record the POS checkout flow already queues offline). The two are
// separate local tables syncing to the same `/orders` endpoint; column names here match the
// backend's real wire fields verbatim, same rationale as Payment/InventoryGlobal above.
export interface OrderRecord {
  ID: string // GUID, generated client-side via crypto.randomUUID() at creation time.
  ROID: string
  CustomerID?: string
  PaymentID?: string
  CashierID: string
  PreparerID?: string
  AppliedOfferID?: string
  IsReturned: boolean
  ReturnedReason?: string
  transaction_id?: string
  CreatedDate: string
  CreatedBy: string
  UpdatedDate?: string
  UpdatedBy?: string
  // Set locally when this record is pushed to the server — see Payment.syc_datetime above.
  syc_datetime?: string
  synced: boolean
}

export type PendingCustomerOperation = 'create' | 'update' | 'delete' | 'approve' | 'reject'

export interface PendingCustomer {
  id?: number
  operation: PendingCustomerOperation
  // Set for 'update'/'delete' — the real server id of an already-synced customer. Absent for
  // 'create', which has no server id until it syncs.
  customerId?: string
  // Set for 'create'/'update'. Absent for 'delete'/'approve'/'reject', which need no payload.
  data?: CreateCustomerInput
  // Set for 'approve'/'reject' — the approval request id being actioned (distinct from
  // customerId: the same customer can go through several approval requests over time).
  requestId?: number
  // Set for 'reject' (optional reason) — never meaningful for the other operations.
  comment?: string
  synced: boolean
  createdAt: string
}

export async function getProduct(id: number) {
  return db.products.get(id)
}

class AppDatabase extends Dexie {
  products!: Table<Product, number>
  cart!: Table<CartItem, number>
  orders!: Table<Order, number>
  pendingCustomers!: Table<PendingCustomer, number>
  payments!: Table<Payment, string>
  inventory!: Table<InventoryGlobal, string>
  orderRecords!: Table<OrderRecord, string>

  constructor() {
    super('BeCafeDB')

    this.version(12).stores({
      products: 'id,name,category',
      cart: '++id,productId',
      orders: '++id,orderNo,synced',
    })

    this.version(13).stores({
      pendingCustomers: '++id,synced',
    })

    // Generalizes the queue from "create-only drafts" to create/update/delete operations against
    // customers; existing rows from v13 predate the `operation` field, so they're backfilled as
    // 'create' (the only operation that existed then).
    this.version(14)
      .stores({
        pendingCustomers: '++id,synced,operation,customerId',
      })
      .upgrade(async (tx) => {
        await tx
          .table('pendingCustomers')
          .toCollection()
          .modify((record: Partial<PendingCustomer>) => {
            if (!record.operation) {
              record.operation = 'create'
            }
          })
      })

    // Adds 'approve'/'reject' to the same outbox (see PendingCustomerOperation) so acting on an
    // approval request while offline queues the same way create/update/delete already do.
    // requestId gets its own index (like customerId) so a second decision on the same request can
    // be looked up and superseded rather than queuing two conflicting outcomes. No migration
    // needed: existing rows simply have no requestId, which is fine since only 'approve'/'reject'
    // rows ever set it.
    this.version(15).stores({
      pendingCustomers: '++id,synced,operation,customerId,requestId',
    })

    // `payments` is a full local record store (client-generated GUID as primary key), not an
    // outbox of ops — a payment is created once at checkout and never edited locally, the same
    // shape as `orders` above (synced flag on the record itself) rather than pendingCustomers'
    // create/update/delete queue.
    this.version(16).stores({
      payments: 'ID,synced,OrderID,CustomerID',
    })

    // `inventory` follows the same create-once, synced-flag-on-record shape as `payments` above
    // (confirmed: InventoryGlobal rows aren't edited locally after creation).
    this.version(17).stores({
      inventory: 'ID,synced,SupplierID,Product_SKU_ID',
    })

    // `orderRecords` — same create-once, synced-flag-on-record shape as `payments`/`inventory`
    // (confirmed: IsReturned/ReturnedReason are set at creation time, not edited in later — a
    // return is a separate flow/table if one gets built). Distinct from the pre-existing `orders`
    // table, which stores the local cart/checkout draft, not this backend Order header record.
    this.version(18).stores({
      orderRecords: 'ID,synced,ROID,CustomerID,PaymentID',
    })

    // Standard Dexie multi-tab recipe: if another tab is mid-upgrade to a newer schema, our open
    // connection here would otherwise block it indefinitely (IndexedDB serializes upgrades across
    // tabs). Closing lets that upgrade proceed; this tab picks up the new schema on next reload.
    this.on('versionchange', () => {
      this.close()
      console.warn('BeCafeDB: closed because another tab upgraded the schema. Reload this tab to continue.')
    })

    // Fires when *this* tab's own open() is the one being blocked by another tab still holding an
    // older version open — without this, writes here would hang forever with no visible error.
    this.on('blocked', () => {
      console.error('BeCafeDB: open blocked by another tab still holding an older version open. Close other tabs of this app and reload.')
    })

    this.open().catch((error) => {
      console.error('Dexie open error:', error)
    })
  }
}

export const db = new AppDatabase()