import { db, type Payment } from '@/database/appDatabase'

class PaymentRepository {
  save(payment: Payment) {
    return db.payments.add(payment)
  }

  getAll() {
    return db.payments.toArray()
  }

  getPendingPayments() {
    return db.payments.filter((payment) => !payment.synced).toArray()
  }

  markSynced(id: string, syncedAt: string) {
    return db.payments.update(id, {
      synced: true,
      syc_datetime: syncedAt,
    })
  }
}

export const paymentRepository = new PaymentRepository()
