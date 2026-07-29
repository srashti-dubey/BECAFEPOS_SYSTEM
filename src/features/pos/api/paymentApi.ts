import { BaseService } from '@/services/baseService'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import type { Payment } from '@/database/appDatabase'

class PaymentApi extends BaseService {
  savePayment(payment: Payment) {
    return this.post<Payment>(API_ENDPOINTS.posPayments, payment)
  }
}

export const paymentApi = new PaymentApi()
