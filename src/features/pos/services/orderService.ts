import { orderApi } from '../api/orderApi'
import { orderRepository } from '../repositories/OrderRepository'
import type { Order } from '@/database/appDatabase'

export async function saveOrder(order: Omit<Order, 'synced'>) {
  if (navigator.onLine) {
    try {
      const synced = { ...order, synced: true }
      await orderApi.saveOrder(synced)
      await orderRepository.save(synced)
      return
    } catch {
      console.log('API Failed. Saving Offline.')
    }
  }

  await orderRepository.save({ ...order, synced: false })
}
