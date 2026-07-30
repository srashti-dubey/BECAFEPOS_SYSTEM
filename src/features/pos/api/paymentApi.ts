import { BaseService } from '@/services/baseService'
import { mockSavePayment } from '@/mocks/posMockApi'
import type { Payment } from '@/database/appDatabase'

class PaymentApi extends BaseService {
  // Bypasses the real API — the real backend has no /payments endpoint at all (not in its
  // OpenAPI spec; confirmed 2026-07-30). Once that endpoint exists, replace this with
  // `return this.post<Payment>(API_ENDPOINTS.posPayments, payment)`.
  savePayment(payment: Payment) {
    return mockSavePayment(payment)
  }
}

export const paymentApi = new PaymentApi()
