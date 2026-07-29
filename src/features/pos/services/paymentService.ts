import { paymentApi } from '../api/paymentApi'
import { paymentRepository } from '../repositories/PaymentRepository'
import type { Payment } from '@/database/appDatabase'

export async function savePayment(payment: Omit<Payment, 'ID' | 'synced'>) {
  const record: Payment = {
    ...payment,
    ID: crypto.randomUUID(),
    synced: false,
  }

  if (navigator.onLine) {
    try {
      const synced = { ...record, synced: true, syc_datetime: new Date().toISOString() }
      await paymentApi.savePayment(synced)
      await paymentRepository.save(synced)
      return synced
    } catch {
      console.log('API Failed. Saving Payment Offline.')
    }
  }

  await paymentRepository.save(record)
  return record
}
