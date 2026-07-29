import { orderRepository } from '../repositories/OrderRepository'
import { orderApi } from '../api/orderApi'
import { paymentRepository } from '../repositories/PaymentRepository'
import { paymentApi } from '../api/paymentApi'

export async function syncPendingOrders() {
  if (!navigator.onLine) return

  const orders = await orderRepository.getPendingOrders()

  if (!orders.length) return

  console.log('Sync Started')

  for (const order of orders) {
    try {
      await orderApi.saveOrder(order)
      await orderRepository.markSynced(order.id!)
      console.log(order.orderNo + ' Synced')
    } catch {
      console.log(order.orderNo + ' Failed')
    }
  }
}

export async function syncPendingPayments() {
  if (!navigator.onLine) return

  const payments = await paymentRepository.getPendingPayments()

  if (!payments.length) return

  console.log('Payment Sync Started')

  for (const payment of payments) {
    try {
      const syncedAt = new Date().toISOString()
      await paymentApi.savePayment({ ...payment, syc_datetime: syncedAt })
      await paymentRepository.markSynced(payment.ID, syncedAt)
      console.log(payment.ID + ' Synced')
    } catch {
      console.log(payment.ID + ' Failed')
    }
  }
}
