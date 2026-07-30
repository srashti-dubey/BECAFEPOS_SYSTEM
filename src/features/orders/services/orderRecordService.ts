import { orderRecordApi } from '../api/orderRecordApi'
import { orderRecordRepository } from '../repositories/OrderRecordRepository'
import type { OrderRecord } from '@/database/appDatabase'

export async function saveOrderRecord(order: Omit<OrderRecord, 'ID' | 'synced'>) {
  const record: OrderRecord = {
    ...order,
    ID: crypto.randomUUID(),
    synced: false,
  }

  if (navigator.onLine) {
    try {
      const synced = { ...record, synced: true, syc_datetime: new Date().toISOString() }
      await orderRecordApi.saveOrderRecord(synced)
      await orderRecordRepository.save(synced)
      return synced
    } catch {
      console.log('API Failed. Saving Order Record Offline.')
    }
  }

  await orderRecordRepository.save(record)
  return record
}

export async function syncPendingOrderRecords() {
  if (!navigator.onLine) return

  const orders = await orderRecordRepository.getPendingOrderRecords()

  if (!orders.length) return

  console.log('Order Record Sync Started')

  for (const order of orders) {
    try {
      const syncedAt = new Date().toISOString()
      await orderRecordApi.saveOrderRecord({ ...order, syc_datetime: syncedAt })
      await orderRecordRepository.markSynced(order.ID, syncedAt)
      console.log(order.ID + ' Synced')
    } catch {
      console.log(order.ID + ' Failed')
    }
  }
}
