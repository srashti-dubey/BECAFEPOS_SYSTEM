import { db, type OrderRecord } from '@/database/appDatabase'

class OrderRecordRepository {
  save(order: OrderRecord) {
    return db.orderRecords.add(order)
  }

  getAll() {
    return db.orderRecords.toArray()
  }

  getPendingOrderRecords() {
    return db.orderRecords.filter((order) => !order.synced).toArray()
  }

  markSynced(id: string, syncedAt: string) {
    return db.orderRecords.update(id, {
      synced: true,
      syc_datetime: syncedAt,
    })
  }
}

export const orderRecordRepository = new OrderRecordRepository()
