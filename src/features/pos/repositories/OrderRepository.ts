import { db, type Order } from '@/database/appDatabase'

class OrderRepository {
  save(order: Order) {
    return db.orders.add(order)
  }

  getAll() {
    return db.orders.toArray()
  }

  getPendingOrders() {
    return db.orders.filter((order) => !order.synced).toArray()
  }

  markSynced(id: number) {
    return db.orders.update(id, {
      synced: true,
    })
  }
}

export const orderRepository = new OrderRepository()
